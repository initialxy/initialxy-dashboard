const ROOT = process.env.NODE_ENV === "development"
  ? "http://localhost:8000/"
  : "/";

export function getConfigEndpoint(): string {
  return ROOT + "c";
}