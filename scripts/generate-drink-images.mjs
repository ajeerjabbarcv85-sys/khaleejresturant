import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirs = [path.join(root, "public", "images", "products"), path.join(root, "images", "products")];
const creditsPath = path.join(root, "data", "product-image-credits.json");

const style = [
  "Premium studio beverage photography for a cohesive restaurant drinks catalogue.",
  "One single drink as the main subject, centered, elegant transparent glass or suitable drinkware.",
  "Soft natural shadows, soft directional studio lighting from upper left, pastel colour-coordinated seamless background.",
  "Fresh fruits and ingredients arranged naturally around the drink, realistic condensation, ice cubes, liquid texture and reflections.",
  "Editorial food photography, modern premium cafe aesthetic, photorealistic, sharp focus, clean minimal composition.",
  "No text, no logo, no watermark, no price label, no people, no restaurant interior, no kitchen, no cars, no screenshots, no cartoon, no illustration.",
].join(" ");

const drinks = {
  "tea": "A natural light amber cup of Indian tea in an elegant glass cup, warm minimal beige background, subtle steam.",
  "coffee": "A dark rich coffee with realistic crema in an elegant cup, roasted coffee beans scattered naturally, warm coffee-toned background.",
  "black-tea": "A clear dark amber black tea in an elegant transparent glass cup, minimal warm cream background, soft reflections.",
  "lime-tea": "A refreshing light lime tea in a clear glass, fresh lime slice garnish, soft green and yellow pastel background.",
  "mint-tea": "A fresh green mint tea in a clear glass, vibrant mint leaves garnish, clean minimal sage green background.",
  "ginger-tea": "A golden ginger tea in a clear glass, fresh ginger slices and root pieces nearby, warm golden pastel background.",
  "orange": "Fresh bright orange juice in a clear glass, ripe oranges and orange slices around the glass, soft orange studio background.",
  "pineapple": "Fresh golden pineapple juice in a clear glass, pineapple pieces and a small pineapple wedge nearby, tropical yellow background.",
  "grape": "Deep purple grape juice in a clear glass, fresh purple and green grapes arranged naturally, matching soft purple background.",
  "mosambi": "Natural pale yellow-green sweet lime mosambi juice in a clear glass, cut mosambi fruit and slices, light citrus pastel background.",
  "watermelon": "Vibrant pink-red watermelon juice in a clear glass, fresh watermelon slices and small cubes, pink-red pastel background.",
  "anar": "Deep ruby-red pomegranate juice in a clear glass, pomegranate seeds and a cut pomegranate, red and pink studio background.",
  "apple": "Light golden-green apple juice in a clear glass, fresh green and red apples and apple slices, soft green pastel background.",
  "chikku": "Creamy pale beige chikku sapodilla milkshake in a clear glass, fresh chikku sapodilla fruit halves nearby, warm brown and beige background.",
  "mango": "Bright orange-yellow mango juice in a clear glass, ripe mangoes and fresh mango slices, warm yellow pastel background.",
  "papaya": "Creamy orange-pink papaya juice in a clear glass, ripe papaya slices and cubes, soft orange-pink background.",
  "shamam": "Natural pale orange melon based drink in a clear glass, fresh melon slices and cubes, soft peach pastel background.",
  "avocado": "Creamy pale green avocado drink in a clear glass, fresh avocado halves and a pit nearby, soft green pastel background.",
  "fresh-lime": "Clear refreshing fresh lime juice in a clear glass, lime slices and whole limes, light green pastel background, visible ice and condensation.",
  "mint-lime": "Light green mint and lime drink in a clear glass, fresh mint leaves and lime slices, mint-green pastel background.",
  "lime-soda": "Transparent sparkling lime soda in a clear tall glass with visible bubbles, lime slices and ice cubes, pale green background.",
  "pineapple-lime": "Pineapple and lime mixed drink in a clear glass, pineapple wedge and lime slices garnish, tropical yellow-green background.",
  "grape-lime": "Purple grape and lime drink in a clear glass, fresh grapes and lime slices, coordinated purple and green pastel background.",
  "orange-lime": "Orange and lime mixed drink in a clear glass, orange slices and lime slices, coordinated citrus yellow-green background.",
  "blue-lime": "Bright blue refreshing lime drink in a clear glass with ice cubes, lime slices, cool blue pastel background, realistic condensation.",
  "chilli-sarbath": "Authentic Indian chilli lime sarbath in a clear glass, green chilli, lime slices and ice, subtle green toned pastel background.",
  "kulki-sarbath": "Authentic Kerala kulki nannari herbal sarbath, deep amber brown refreshing drink in a clear glass with ice and lime, warm beige-green pastel background, herbal roots nearby.",
  "malabar-sarbath": "Authentic Malabar rose syrup sarbath, layered rose pink and creamy white drink in a clear glass with ice and a scoop of ice cream, soft pink pastel background, rose petals nearby.",
};

const drinkNames = {
  "tea": "Tea",
  "coffee": "Coffee",
  "black-tea": "Black Tea",
  "lime-tea": "Lime Tea",
  "mint-tea": "Mint Tea",
  "ginger-tea": "Ginger Tea",
  "orange": "Orange",
  "pineapple": "Pineapple",
  "grape": "Grape",
  "mosambi": "Mosambi",
  "watermelon": "Watermelon",
  "anar": "Anar",
  "apple": "Apple",
  "chikku": "Chikku",
  "mango": "Mango",
  "papaya": "Papaya",
  "shamam": "Shamam",
  "avocado": "Avocado",
  "fresh-lime": "Fresh Lime",
  "mint-lime": "Mint Lime",
  "lime-soda": "Lime Soda",
  "pineapple-lime": "Pineapple Lime",
  "grape-lime": "Grape Lime",
  "orange-lime": "Orange Lime",
  "blue-lime": "Blue Lime",
  "chilli-sarbath": "Chilli Sarbath",
  "kulki-sarbath": "Kulki Sarbath",
  "malabar-sarbath": "Malabar Sarbath",
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const hordeHeaders = {
  apikey: process.env.AI_HORDE_KEY || "0000000000",
  "Client-Agent": "KhaleejMenuSetup:1.0:hello@kaleejrestaurant.com",
  "Content-Type": "application/json",
};

async function pollinations(prompt, seed) {
  const token = process.env.POLLINATIONS_TOKEN;
  const params = new URLSearchParams({
    width: "960",
    height: "720",
    seed: String(seed),
    nologo: "true",
    private: "true",
    enhance: "false",
    negative_prompt: "text, letters, words, logo, watermark, people, hands, kitchen, restaurant interior, car, screenshot, illustration, cartoon, blurry, low quality, generic drink, extra glasses",
  });
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { headers });
      if (response.status === 401 || response.status === 402) throw new Error(`pollinations ${response.status}`);
      if (!response.ok) throw new Error(`pollinations ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const metadata = await sharp(buffer).metadata();
      if (!metadata.width || !metadata.height || metadata.width < 400 || metadata.height < 300) {
        throw new Error(`invalid image ${metadata.width}x${metadata.height}`);
      }
      return buffer;
    } catch (error) {
      if (/401|402/.test(error.message) || attempt === 2) throw error;
      await sleep(4000 * (attempt + 1));
    }
  }
}

async function aiHorde(prompt, seed) {
  const submitted = await fetch("https://aihorde.net/api/v2/generate/async", {
    method: "POST",
    headers: hordeHeaders,
    body: JSON.stringify({
      prompt,
      nsfw: false,
      params: {
        width: 512,
        height: 512,
        steps: 24,
        seed: String(seed),
        negative_prompt: "text, letters, words, logo, watermark, people, hands, kitchen, restaurant interior, car, screenshot, illustration, cartoon, blurry, low quality, generic drink, extra glasses",
      },
    }),
  });
  if (!submitted.ok) throw new Error(`horde submit ${submitted.status}: ${(await submitted.text()).slice(0, 300)}`);
  const { id } = await submitted.json();
  if (!id) throw new Error("horde submit missing id");

  for (let attempt = 0; attempt < 60; attempt++) {
    const checkResponse = await fetch(`https://aihorde.net/api/v2/generate/check/${id}`, { headers: hordeHeaders });
    if (!checkResponse.ok) throw new Error(`horde check ${checkResponse.status}`);
    const check = await checkResponse.json();
    if (check.done) {
      const statusResponse = await fetch(`https://aihorde.net/api/v2/generate/status/${id}`, { headers: hordeHeaders });
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

async function generate(prompt, seed) {
  try {
    return await pollinations(prompt, seed);
  } catch (error) {
    console.warn(`  fallback to AI Horde (${error.message})`);
    return aiHorde(prompt, seed);
  }
}

async function save(slug, buffer) {
  const image = await sharp(buffer)
    .rotate()
    .resize(960, 720, { fit: "cover", position: "attention" })
    .jpeg({ quality: 92, progressive: true, mozjpeg: true })
    .toBuffer();

  for (const dir of outputDirs) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${slug}.jpg`), image);
  }
}

const force = process.argv.includes("--force");
const requested = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
const slugs = Object.keys(drinks).filter((slug) => !requested.length || requested.includes(slug));
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : [];
const byFile = new Map(credits.map((entry) => [entry.file, entry]));
const failures = [];

for (const [index, slug] of slugs.entries()) {
  const target = path.join(outputDirs[0], `${slug}.jpg`);
  if (!force && fs.existsSync(target)) {
    console.log(`SKIP ${slug}.jpg`);
    continue;
  }
  const seed = 8200 + Object.keys(drinks).indexOf(slug) * 211;
  const name = drinkNames[slug];
  const prompt = `${style} Exact product name: ${name}. Accurately depict one ${name} only, using this product-specific description: ${drinks[slug]}. Do not render the product name as text in the image.`;
  try {
    const buffer = await generate(prompt, seed);
    await save(slug, buffer);
    byFile.set(`/images/products/${slug}.jpg`, {
      file: `/images/products/${slug}.jpg`,
      title: `${drinkNames[slug]} premium studio drink photography`,
      source: "Generated for Khaleej Restaurant menu",
      author: "Khaleej Restaurant",
      license: "Generated for Khaleej Restaurant",
    });
    console.log(`OK   ${slug}.jpg`);
  } catch (error) {
    failures.push(`${slug}: ${error.message}`);
    console.error(`FAIL ${slug}: ${error.message}`);
  }
  if (index < slugs.length - 1) await sleep(12000);
}

const mergedMap = new Map();
for (const entry of credits) {
  if (entry && typeof entry === "object" && !Array.isArray(entry) && typeof entry.file === "string") mergedMap.set(entry.file, entry);
}
for (const [file, entry] of byFile) {
  if (typeof file === "string") mergedMap.set(file, entry);
}
const merged = [...mergedMap.values()];
fs.writeFileSync(creditsPath, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`\nDone: ${slugs.length - failures.length}/${slugs.length} drink images.`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
