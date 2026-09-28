import { lstat, readFile, realpath } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const HOST = "127.0.0.1";
const PORT = 8182;
const REQUIRED_FILES = ["index.html", "css/style.min.css", "js/script.min.js", "pwa/service-worker.js"];
const SERVICE_WORKER_PATH = "/pwa/service-worker.js";

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

function isInsideDist(filePath) {
  const relativePath = path.relative(DIST_DIR, filePath);
  return relativePath && relativePath !== ".." && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
}

function getRequestPathname(requestUrl) {
  if (!requestUrl?.startsWith("/")) return null;

  try {
    return decodeURIComponent(requestUrl.split(/[?#]/, 1)[0]);
  } catch {
    return null;
  }
}

function getSegments(pathname) {
  const segments = pathname === "/" ? ["index.html"] : pathname.slice(1).split("/");
  if (segments.some((segment) => !segment || segment.startsWith(".") || /[\\:\0-\x1f\x7f]/.test(segment))) {
    return null;
  }
  return segments;
}

function send(res, method, statusCode, contentType, body, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end(method === "HEAD" ? undefined : body);
}

function sendStatus(res, method, statusCode, headers) {
  send(res, method, statusCode, "text/plain; charset=utf-8", `${statusCode} ${http.STATUS_CODES[statusCode]}\n`, headers);
}

async function readDistFile(segments) {
  const filePath = path.resolve(DIST_DIR, ...segments);
  if (!isInsideDist(filePath)) return null;

  try {
    const actualPath = await realpath(filePath);
    if (!isInsideDist(actualPath) || !(await lstat(actualPath)).isFile()) return null;
    return await readFile(actualPath);
  } catch (error) {
    if (["ENOENT", "ENOTDIR", "EISDIR"].includes(error.code)) return null;
    throw error;
  }
}

async function assertPackage() {
  try {
    if (!(await lstat(DIST_DIR)).isDirectory()) throw new Error("missing dist directory");
    for (const file of REQUIRED_FILES) {
      if (!(await readDistFile(file.split("/")))) throw new Error(`missing dist/${file}`);
    }
  } catch {
    throw new Error("Production package is unavailable. Run npm run build first.");
  }
}

async function handleRequest(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendStatus(res, req.method, 405, { Allow: "GET, HEAD" });
    return;
  }

  const pathname = getRequestPathname(req.url);
  const segments = pathname === null ? null : getSegments(pathname);
  if (!segments) {
    sendStatus(res, req.method, 400);
    return;
  }

  const contentType = CONTENT_TYPES.get(path.extname(segments.at(-1)).toLowerCase());
  if (!contentType) {
    sendStatus(res, req.method, 404);
    return;
  }

  const body = await readDistFile(segments);
  if (body === null) {
    sendStatus(res, req.method, 404);
    return;
  }

  send(res, req.method, 200, contentType, body, pathname === SERVICE_WORKER_PATH ? { "Service-Worker-Allowed": "/" } : {});
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

async function main() {
  await assertPackage();

  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error(`[preview] Failed to serve request (${error.code ?? "unexpected error"}).`);
      if (res.headersSent) res.destroy();
      else sendStatus(res, req.method, 500);
    });
  });

  try {
    await listen(server);
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      throw new Error(`Port ${PORT} on ${HOST} is already in use. Stop the process using it and run npm run preview again.`);
    }
    throw new Error(`Failed to start preview server (${error.code ?? "unexpected error"}).`);
  }

  let stopping = false;
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      if (stopping) return;
      stopping = true;
      server.close(() => console.log("[preview] Stopped."));
      server.closeAllConnections();
    });
  }

  console.log(`[preview] Serving generated dist/ at http://${HOST}:${PORT}/`);
  console.log("[preview] Press Ctrl+C to stop.");
}

main().catch((error) => {
  console.error(`[preview] ${error.message}`);
  process.exitCode = 1;
});
