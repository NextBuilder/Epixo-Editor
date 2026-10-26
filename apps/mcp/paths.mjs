import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const editorDir = path.resolve(here, "..", "editor");
export const runtimeDir = path.resolve(here, "..", "..", "runtime");
