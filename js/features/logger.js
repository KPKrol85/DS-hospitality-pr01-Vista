const isDebugMode = new URLSearchParams(window.location.search).get("debug") === "1";

const noop = () => {};

export const debug = isDebugMode ? (...args) => console.debug(...args) : noop;
export const info = isDebugMode ? (...args) => console.info(...args) : noop;
export const warn = isDebugMode ? (...args) => console.warn(...args) : noop;
export const error = isDebugMode ? (...args) => console.error(...args) : noop;
