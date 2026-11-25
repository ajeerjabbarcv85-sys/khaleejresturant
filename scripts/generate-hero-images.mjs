import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirs = [path.join(root, "public", "images", "hero"), path.join(root, "images", "hero")];
const creditsPath = path.join(root, "data", "image-credits.json");

const style = [
  "Classy luxury fine-dining editorial food photography for a premium restaurant hero banner.",
  "One dish as the main subject, centered, elegant fine-dining plating on a dark marble table, soft cinematic directional lighting, deep charcoal, emerald and warm gold palette, subtle warm bokeh in the background, shallow depth of field, refined reflections, minimal polished props, photorealistic, sharp focus.",
  "No text, no logo, no watermark, no people, no hands, no restaurant interior, no kitchen, no car, no screenshot, no cartoon, no illustration, no rustic styling, no casual home cooking look.",
].join(" ");

const heroes = {
  "hero-1": {
    name: "Al Faham Mandhi",
    detail: "Fragrant basmati rice with grilled Al Faham chicken, saffron and raisins, meticulously plated on a matte black fine-dining plate with a thin gold rim, deep emerald and charcoal background with warm bokeh.",
  },
  "hero-2": {
    name: "Tandoori Platter",
    detail: "An elegant tandoori platter with clay-red tandoori chicken, tikka pieces, malai kebab and naan, artfully arranged on a dark slate board with gold accents, deep charcoal background with subtle warm light.",
  },
  "hero-3": {
    name: "Fish Pollichathu",
    detail: "Fish Pollichathu wrapped in banana leaf, carefully opened to reveal spiced fish, plated on a matte black fine-dining plate with a thin gold rim, deep emerald and charcoal background with soft golden reflections.",
  },
};

const headers = {
  apikey: process.env.AI_HORDE_KEY || "0000000000",
  "Client-Agent": "KhaleejMenuSetup:1.0:hello@kaleejrestaurant.com",
  "Content-Type": "application/json",
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function generate(prompt, seed) {
  const submitted = await fetch("https://aihorde.net/api/v2/generate/async", {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt,
      nsfw: false,
      params: {
        width: 512,
        height: 512,
        steps: 24,
        seed: String(seed),
        negative_prompt: "text, letters, words, logo, watermark, people, hands, kitchen, restaurant interior, car, screenshot, illustration, cartoon, blurry, low quality, rustic, casual, home cooking, duplicated food, extra plates",
      },
    }),
  });
  if (!submitted.ok) throw new Error(`horde submit ${submitted.status}: ${(await submitted.text()).slice(0, 300)}`);
  const { id } = await submitted.json();
  if (!id) throw new Error("horde submit missing id");

  for (let attempt = 0; attempt < 60; attempt++) {
    const checkResponse = await fetch(`https://aihorde.net/api/v2/generate/check/${id}`, { headers });
    if (!checkResponse.ok) throw new Error(`horde check ${checkResponse.status}`);
    const check = await checkResponse.json();
    if (check.done) {
      const statusResponse = await fetch(`https://aihorde.net/api/v2/generate/status/${id}`, { headers });
      if (!statusResponse.ok) throw new Error(`horde status ${statusResponse.status}`);
      const status = await statusResponse.json();
      const imageUrl = status.generations?.[0]?.img;
      if (!imageUrl) throw new Error(status.message || "horde returned no image");
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) throw new Error(`horde download ${imageResponse.status}`);
      return Buffer.from(await imageResponse.arrayBuffer());
    }
    await sleep(3000);
  }
  throw new Error("horde timeout");
}

async function save(name, buffer) {
  const image = await sharp(buffer)
    .rotate()
    .resize(1600, 1000, { fit: "cover", position: "attention", kernel: "lanczos3" })
    .sharpen()
    .jpeg({ quality: 92, progressive: true, mozjpeg: true })
    .toBuffer();

  for (const dir of outputDirs) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${name}.jpg`), image);
  }
}

const force = process.argv.includes("--force");
const requested = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
const names = Object.keys(heroes).filter((name) => !requested.length || requested.includes(name));
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : [];
const byFile = new Map(credits.map((entry) => [entry.file, entry]));
const failures = [];

for (const [index, name] of names.entries()) {
  const target = path.join(outputDirs[0], `${name}.jpg`);
  if (!force && fs.existsSync(target)) {
    console.log(`SKIP ${name}.jpg`);
    continue;
  }
  const dish = heroes[name];
  const prompt = `${style} Exact dish: ${dish.name}. ${dish.detail} Do not render the dish name as text.`;
  try {
    await save(name, await generate(prompt, 14300 + index * 311));
    byFile.set(`/images/hero/${name}.jpg`, {
      file: `/images/hero/${name}.jpg`,
      title: `${dish.name} hero photography`,
      source: "Generated for Khaleej Restaurant hero banner",
      author: "Khaleej Restaurant",
      license: "Generated for Khaleej Restaurant",
    });
    console.log(`OK   ${name}.jpg  <-  ${dish.name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
  if (index < names.length - 1) await sleep(12000);
}

const mergedMap = new Map();
for (const entry of credits) {
  if (entry && typeof entry === "object" && !Array.isArray(entry) && typeof entry.file === "string") mergedMap.set(entry.file, entry);
}
for (const [file, entry] of byFile) {
  if (typeof file === "string") mergedMap.set(file, entry);
}
fs.writeFileSync(creditsPath, `${JSON.stringify([...mergedMap.values()], null, 2)}\n`);
console.log(`\nDone: ${names.length - failures.length}/${names.length} hero images.`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
