const ROOT = process.env.NODE_ENV === "development"
  ? "http://localhost:8000/"
  : "/";

export function getConfigEndpoint(): string {
  return ROOT + "c";
}

export function getStocksEndpoint(): string {
  return ROOT + "s";
}

export function getTasksEndpoint(): string {
  return ROOT + "t";
}

export function isEditPath(): boolean {
  return window.location.pathname.match(/\/e($|[/?#].*)/) != null;
}