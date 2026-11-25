import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of ["index.html", "style.css", "script.js"]) await cp(path.join(root, name), path.join(output, name));
await cp(path.join(root, "images"), path.join(output, "images"), { recursive: true });
console.log("Static website built in dist/");
