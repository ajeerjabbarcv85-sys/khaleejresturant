import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public", "images");
const api = "https://commons.wikimedia.org/w/api.php";
const headers = {
  "User-Agent": "KaleejWebsiteImageSetup/1.0 (restaurant website assets; contact: hello@kaleejrestaurant.com)",
};

const dish = (name, title, query) => ({ folder: "dishes", name, title, query, width: 1000, height: 780 });
const category = (name, title, query) => ({ folder: "categories", name, title, query, width: 1000, height: 780 });
const gallery = (name, title, query) => ({ folder: "gallery", name, title, query, width: 900, height: 1100 });
const hero = (name, title, query) => ({ folder: "hero", name, title, query, width: 1800, height: 1100 });
const about = (name, title, query) => ({ folder: "about", name, title, query, width: 1000, height: 1250 });

const assets = [
  dish("malabar-breakfast-thali", "Appam and Egg curry.jpg", "appam egg curry"),
  dish("flaky-butter-croissant", "Croissants au beurre (18953292873).jpg", "butter croissant"),
  dish("banana-pepper-dosa", "Masala Dosa in Banana Leaf with Chutney.jpg", "masala dosa"),
  dish("kaleej-peri-peri-wings", "3 Chicken Wings, PERi-Salted Chips, Corn on the Cob - Nando's.jpg", "peri peri chicken wings"),
  dish("crispy-calamari", "Fried Calamari Rings.jpg", "fried calamari"),
  dish("tandoori-paneer-tikka", "Tandoori Paneer Tikka.jpg", "tandoori paneer tikka"),
  dish("burrata-heirloom-tomato", "Burrata, Rocket and Tomatoes salad in Brisbane, Australia, 2026.jpg", "burrata tomato salad"),
  dish("watermelon-feta-salad", "Watermelon & Feta Salad.jpg", "watermelon feta salad"),
  dish("kale-citrus-crunch", "Kale & Grapefruit Salad with Toasted Almonds and Parmesan (8421983361).jpg", "kale grapefruit salad"),
  dish("creamy-tomato-basil", "Tomato Basil Soup.jpg", "tomato basil soup"),
  dish("kerala-pepper-chicken-soup", "Chicken Soup with Carrot and Fresh Coriander.jpg", "chicken soup coriander"),
  dish("roasted-pumpkin-soup", "Soup made of pumpkin.jpg", "pumpkin soup"),
  dish("meen-pollichathu", "Fish cooked in banana leaf.JPG", "fish banana leaf Kerala"),
  dish("butter-garlic-prawns", "Prawns in garlic butter - Taupo, New Zealand.jpg", "garlic butter prawns"),
  dish("grilled-sea-bass", "Grilled Seabass fish 23 January 2025 Filipinas2.jpg", "grilled seabass"),
  dish("kaleej-signature-grill", "Grilled chicken breast, Santo Domingo, La Palma.jpg", "grilled chicken breast"),
  dish("mangalorean-chicken-ghee-roast", "Chicken Ghee Roast.jpg", "chicken ghee roast"),
  dish("slow-braised-lamb-shank", "Braised lamb shank with a potato rösti.jpg", "braised lamb shank"),
  dish("kaleej-royal-biriyani", "Chicken Dum Biryani 03.jpg", "chicken dum biryani"),
  dish("thalassery-dum-biriyani", "Thalassery biriyani -1.jpg", "Thalassery biryani"),
  dish("paneer-tikka-biriyani", "Paneer Biriyani 02.jpg", "paneer biryani"),
  dish("chilli-garlic-noodles", "Chili Garlic Noodles and Chili Chicken.jpg", "chili garlic noodles"),
  dish("kerala-vegetable-fried-rice", "Kerala vegetable fried rice.jpg", "Kerala vegetable fried rice"),
  dish("lemon-coriander-rice", "Lemon Rice in Kerala.jpg", "lemon rice"),
  dish("paneer-butter-masala", "Paneer butter masala 3.jpg", "paneer butter masala"),
  dish("kadai-vegetable", "Kadai Paneer (15913018051).jpg", "kadai paneer"),
  dish("mushroom-pepper-fry", "Ghee Pepper Mushroom Fry.jpg", "pepper mushroom fry"),
  dish("molten-chocolate-cake", "Chocolate lava cake.jpg", "chocolate lava cake"),
  dish("kaleej-tiramisu", "Tiramisu dessert.jpg", "tiramisu"),
  dish("coconut-payasam", "Coconut milk and badam payasam kheer India Sweets 2011.jpg", "coconut payasam"),
  dish("signature-filter-coffee", "South Indian Filter Kaapi aka Coffee 04.jpg", "South Indian filter coffee"),
  dish("passion-fruit-cooler", "2022-12-17 20 04 12 A glass of passion fruit lemonade at the Applebee's along U.S. Route 1 (Brunswick Pike) in Lawrence Township, Mercer County, New Jersey.jpg", "passion fruit lemonade"),
  dish("cold-brew-tonic", "Maple Cream Cold Brew - Trading Post Coffee Roasters 2026-07-16.jpg", "cold brew coffee"),

  category("breakfast", "Idli and Medu Vada.JPG", "idli medu vada"),
  category("hot-starters", "Mixed Tandoori Platter - Palms Food Court AUD12.50 (3087384627).jpg", "tandoori starter platter"),
  category("salads", "Tomato salad with burrata, Limburg.jpg", "tomato salad"),
  category("soups", "Traditional Vegetable Soup from Argentina.jpg", "vegetable soup"),
  category("seafood", "Platter of grilled fish and seafood, Puerto Espíndola, La Palma.jpg", "grilled seafood platter"),
  category("poultry-meat", "Pesto Chicken and Grilled Zucchini.jpg", "grilled chicken dish"),
  category("meals-biriyani", "Dum Biryani Plate.jpg", "dum biryani"),
  category("rice-noodles", "Stir-fried rice noodles in Nanchang (20190619175008).jpg", "stir fried rice noodles"),
  category("vegetarian-dishes", "Shahi Paneer & Butter Naan.jpg", "paneer curry"),
  category("desserts", "Piece of chocolate cake on a white plate decorated with chocolate sauce.jpg", "chocolate cake dessert"),
  category("beverages", "Filter Coffee from Saravana Bhavan.jpg", "filter coffee"),

  gallery("gallery-1", "Mughlai Platter.jpg", "Indian food platter"),
  gallery("gallery-2", "Chicken Tikka Masala on White Plate with Spoon.jpg", "chicken tikka masala plate"),
  gallery("gallery-3", "Afghani Malai Chicken Tikka.jpg", "chicken tikka dish"),
  gallery("gallery-4", "Hyderabadi Chicken biriyani.jpg", "chicken biryani plate"),
  gallery("gallery-5", "Tandoori platter (8523839336).jpg", "tandoori platter"),
  gallery("gallery-6", "Fish Curry (965863650).jpg", "fish curry dish"),
  gallery("gallery-7", "A full plate chilli paneer in Kolkata, West Bengal.jpg", "chilli paneer plate"),
  gallery("gallery-8", "Chocolate lava cake.jpg", "chocolate lava cake dessert"),

  hero("hero-1", "Butter Chicken & Naan.jpg", "butter chicken naan plate"),
  hero("hero-2", "Chicken Mandhi.jpg", "chicken mandhi plate"),
  hero("hero-3", "Spicy Anda Curry.jpg", "spicy Indian curry"),

  about("about-1", "Chef-Final Portrait-14.jpg", "chef portrait"),
  about("about-2", "Chef Priyam Chatterjee.jpg", "Indian chef portrait"),
];

const stripHtml = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function apiGet(params) {
  const url = `${api}?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

function getInfo(page) {
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  return {
    title: page.title.replace(/^File:/, ""),
    page: info.descriptionurl,
    url: info.thumburl || info.url,
    artist: stripHtml(meta.Artist?.value),
    license: stripHtml(meta.LicenseShortName?.value),
  };
}

async function resolve(asset) {
  const exact = await apiGet({
    action: "query",
    titles: `File:${asset.title}`,
    redirects: "1",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: String(Math.max(asset.width, asset.height) * 2),
  });
  const exactPage = Object.values(exact.query?.pages ?? {})[0];
  const info = getInfo(exactPage);
  if (info && /\.(jpe?g|png|webp)$/i.test(info.title)) return info;

  const search = await apiGet({
    action: "query",
    generator: "search",
    gsrsearch: asset.query,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: String(Math.max(asset.width, asset.height) * 2),
  });
  const pages = Object.values(search.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  for (const page of pages) {
    const candidate = getInfo(page);
    if (candidate && /\.(jpe?g|png|webp)$/i.test(candidate.title) && !/logo|map|diagram|robot|porcelain/i.test(candidate.title)) {
      return candidate;
    }
  }
  throw new Error(`No image found for ${asset.name}`);
}

async function download(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Download ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (error) {
      if (attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }
}

async function main() {
  const credits = [];
  const failures = [];
  const concurrency = 2;
  let cursor = 0;

  async function worker() {
    while (cursor < assets.length) {
      const asset = assets[cursor++];
      try {
        const info = await resolve(asset);
        const buffer = await download(info.url);
        const output = path.join(root, asset.folder, `${asset.name}.jpg`);
        fs.mkdirSync(path.dirname(output), { recursive: true });
        await sharp(buffer)
          .resize(asset.width, asset.height, { fit: "cover", position: "attention" })
          .jpeg({ quality: 84, progressive: true, mozjpeg: true })
          .toFile(output);
        credits.push({
          file: `/images/${asset.folder}/${asset.name}.jpg`,
          title: info.title,
          source: info.page,
          author: info.artist,
          license: info.license,
        });
        console.log(`OK   ${asset.folder}/${asset.name}.jpg  <-  ${info.title}`);
      } catch (error) {
        failures.push(`${asset.name}: ${error.message}`);
        console.error(`FAIL ${asset.name}: ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  const creditsPath = path.join(process.cwd(), "data", "image-credits.json");
  fs.writeFileSync(creditsPath, `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`\nDone: ${credits.length} images, ${failures.length} failures, credits -> ${creditsPath}`);
  if (failures.length) process.exitCode = 1;
}

main();
