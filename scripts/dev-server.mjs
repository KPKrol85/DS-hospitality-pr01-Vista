import { readFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "127.0.0.1";
const PORT = 8181;
const RELOAD_DEBOUNCE_MS = 150;

// Development-only routes. The client tag is added to HTML responses in memory, never to source files.
const RELOAD_EVENTS_PATH = "/__vista-dev/reload";
const RELOAD_CLIENT_PATH = "/__vista-dev/reload.js";
const RELOAD_CLIENT_TAG = `<script src="${RELOAD_CLIENT_PATH}"></script>`;
const RELOAD_CLIENT = `new EventSource("${RELOAD_EVENTS_PATH}").addEventListener("reload", () => location.reload());\n`;

// Source-mode public surface: root pages, root web files, and these directories.
const PUBLIC_DIRS = new Set(["assets", "css", "js"]);
const PUBLIC_ROOT_FILES = new Set(["robots.txt", "site.webmanifest", "sitemap.xml"]);

const CONTENT_TYPES = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

const reloadClients = new Set();
const pendingChanges = new Set();
let reloadTimer;

function getContentType(fileName) {
  return CONTENT_TYPES.get(path.extname(fileName).toLowerCase());
}

// Segments are rejected when they could leave the root or reach dotfiles (.git, .env, ...).
function isPublicFile(segments) {
  if (segments.some((segment) => !segment || segment.startsWith(".") || /[\\:\0]/.test(segment))) {
    return false;
  }

  const fileName = segments.at(-1);
  if (!getContentType(fileName)) {
    return false;
  }

  if (segments.length === 1) {
    return fileName.endsWith(".html") || PUBLIC_ROOT_FILES.has(fileName);
  }

  return PUBLIC_DIRS.has(segments[0]);
}

// Prunes the watcher to the public surface, so node_modules/, dist/, .git/, and tooling stay unwatched.
function isOutsidePublicTree(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  if (!relativePath) {
    return false;
  }

  const segments = relativePath.split(path.sep);
  if (segments.some((segment) => segment.startsWith("."))) {
    return true;
  }

  return segments.length === 1 ? !PUBLIC_DIRS.has(segments[0]) && !isPublicFile(segments) : !PUBLIC_DIRS.has(segments[0]);
}

function getRequestPathname(requestUrl) {
  if (!requestUrl?.startsWith("/")) {
    return null;
  }

  try {
    return decodeURIComponent(requestUrl.split(/[?#]/, 1)[0]);
  } catch {
    return null;
  }
}

function injectReloadClient(html) {
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd === -1) {
    return `${html}\n${RELOAD_CLIENT_TAG}\n`;
  }

  return `${html.slice(0, bodyEnd)}${RELOAD_CLIENT_TAG}\n  ${html.slice(bodyEnd)}`;
}

function send(res, statusCode, contentType, body, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end(body);
}

function sendStatus(res, statusCode, headers) {
  send(res, statusCode, "text/plain; charset=utf-8", `${statusCode} ${http.STATUS_CODES[statusCode]}\n`, headers);
}

function openReloadStream(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.flushHeaders();
  reloadClients.add(res);
  res.on("close", () => reloadClients.delete(res));
}

async function handleRequest(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendStatus(res, 405, { Allow: "GET, HEAD" });
    return;
  }

  const pathname = getRequestPathname(req.url);
  if (pathname === null) {
    sendStatus(res, 400);
    return;
  }

  if (pathname === RELOAD_EVENTS_PATH) {
    openReloadStream(res);
    return;
  }

  if (pathname === RELOAD_CLIENT_PATH) {
    send(res, 200, "text/javascript; charset=utf-8", RELOAD_CLIENT);
    return;
  }

  const segments = pathname === "/" ? ["index.html"] : pathname.slice(1).split("/");
  if (!isPublicFile(segments)) {
    sendStatus(res, 404);
    return;
  }

  let body;
  try {
    body = await readFile(path.join(ROOT_DIR, ...segments));
  } catch (error) {
    if (["ENOENT", "ENOTDIR", "EISDIR"].includes(error.code)) {
      sendStatus(res, 404);
      return;
    }
    throw error;
  }

  const fileName = segments.at(-1);
  if (fileName.endsWith(".html")) {
    body = injectReloadClient(body.toString("utf8"));
  }

  send(res, 200, getContentType(fileName), body);
}

function scheduleReload(relativePath) {
  pendingChanges.add(relativePath);
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    const changes = [...pendingChanges];
    pendingChanges.clear();

    for (const client of reloadClients) {
      client.write("event: reload\ndata: reload\n\n");
    }

    const label = changes.length === 1 ? changes[0] : `${changes.length} files`;
    console.log(`[dev] Reload: ${label} (${reloadClients.size} client(s))`);
  }, RELOAD_DEBOUNCE_MS);
}

async function startWatcher() {
  const watcher = chokidar.watch(ROOT_DIR, {
    ignoreInitial: true,
    ignored: isOutsidePublicTree,
  });

  watcher.on("all", (event, filePath) => {
    if (event !== "add" && event !== "change" && event !== "unlink") {
      return;
    }

    const segments = path.relative(ROOT_DIR, filePath).split(path.sep);
    if (isPublicFile(segments)) {
      scheduleReload(segments.join("/"));
    }
  });

  watcher.on("error", (error) => {
    console.error(`[dev] Watcher error: ${error.message}`);
  });

  await new Promise((resolve) => watcher.once("ready", resolve));
  return watcher;
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, HOST, () => {
      server.off("error", reject);
      resolve();
    });
  });
}

async function stop(server, watcher) {
  clearTimeout(reloadTimer);
  for (const client of reloadClients) {
    client.end();
  }

  await watcher.close();
  await new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  });

  console.log("[dev] Stopped.");
}

async function main() {
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error(`[dev] Failed to serve ${req.url}: ${error.message}`);
      if (res.headersSent) {
        res.destroy();
      } else {
        sendStatus(res, 500);
      }
    });
  });

  try {
    await listen(server);
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      throw new Error(`Port ${PORT} on ${HOST} is already in use. Stop the process using it and run npm run dev again.`);
    }
    throw error;
  }

  const watcher = await startWatcher();

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      stop(server, watcher).catch((error) => {
        console.error(`[dev] Shutdown failed: ${error.message}`);
        process.exitCode = 1;
      });
    });
  }

  console.log(`[dev] Vista source server running at http://${HOST}:${PORT}/`);
  console.log("[dev] Live reload is watching root pages, css/, js/, and assets/. Press Ctrl+C to stop.");
}

main().catch((error) => {
  console.error(`[dev] ${error.message}`);
  process.exitCode = 1;
});
