import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "images", "products");
const outputDir = path.join(root, "public", "images", "products");

fs.mkdirSync(outputDir, { recursive: true });
const files = fs.readdirSync(sourceDir).filter((file) => /\.jpe?g$/i.test(file));
let count = 0;

for (const file of files) {
  const slug = file.replace(/\.jpe?g$/i, "");
  const input = path.join(sourceDir, file);
  const output = path.join(outputDir, `${slug}.jpg`);
  await sharp(input)
    .rotate()
    .resize(700, 700, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90, progressive: true, mozjpeg: true })
    .toFile(output);
  count += 1;
}

console.log(`Prepared ${count} raw product images -> ${outputDir}`);
