import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productDir = path.join(root, "images", "products");
const creditsPath = path.join(root, "data", "product-image-credits.json");
const readme = fs.readFileSync(path.join(root, "images", "README.txt"), "utf8");
const slugs = [...readme.matchAll(/^- ([a-z0-9-]+)\.jpg$/gm)].map((match) => match[1]);
const api = "https://commons.wikimedia.org/w/api.php";
const headers = { "User-Agent": "KhaleejWebsiteImageSetup/1.0 (restaurant menu images; contact: hello@kaleejrestaurant.com)" };

const exactTitles = {
  "afghani": "FOOD Mushawa.jpg",
  "afghani-mandhi": "Afghani Malai Chicken Tikka.jpg",
  "al-faham-normal": "Chicken Al-Faham.jpg",
  "beef-fry": "Kerala Beef Fry.jpg",
  "beef-kondattam": "Beef Kondattam.jpg",
  "beef-pepper-fry": "Beef Steak in Black Pepper Sauce.jpg",
  "blue-lime": "Blue Lagoon at the Mandarin Oriental, Washington DC.jpg",
  "broast-chicken": "Chicken Broast.JPG",
  "broast-mandhi": "Broasted-chicken-01.jpg",
  "chicken-clear-soup": "Clear chicken soup (11968429276).jpg",
  "chicken-kurma": "Chicken Kurma (15888944296).jpg",
  "chicken-mandhi": "Chicken Mandhi.jpg",
  "chicken-noodles": "Noodles stir-fried with chicken - Bangkok - 2017-07-19 (002).jpg",
  "chicken-nuggets": "Chicken nuggets on a plate.jpg",
  "chilli-sarbath": "Variyali Sharbat.JPG",
  "cream-of-chicken": "Cream of Chicken Soup.jpg",
  "dragon-chicken": "Dragon Chicken.jpg",
  "fish-molly": "Fish Molly.jpg",
  "fish-roast": "Kerala backwater food varities.jpg",
  "fresh-lime": "Lime juice.jpg",
  "grape": "Glass of grape juice.jpeg",
  "grape-lime": "A Minty Grape Cold Drink.jpg",
  "hot-and-sour-soup-veg": "Mmm... hot and sour soup (7218396478).jpg",
  "honey-chilli": "Honey Chilli Chicken.jpg",
  "honey-chilli-mandhi": "Honey Chilli Potatoes.JPG",
  "kanthari": "Kanthari Chicken.jpg",
  "kanthari-mandhi": "Noolporotta and Kanthari Chicken.jpg",
  "kadai-paneer": "Kadai Paneer (15913018051).jpg",
  "kadai-veg": "Kadhai Vegetable.jpg",
  "kulki-sarbath": "Nannari sarbath.jpg",
  "lemon-coriander-chicken": "Lemon Chilli Coriander Soup - The Asian Curry House, Bangalore - Karnataka - PXL2005.jpg",
  "lemon-coriander-veg": "Peas soup.jpg",
  "lime-soda": "Lime soda.jpg",
  "lime-tea": "Butterfly-pea flower tea 3.jpg",
  "malabar-sarbath": "Rooh Afza milkshake with watermelon pieces.jpg",
  "masala-shawarma": "Shawarma-sandwich-01.jpg",
  "mushroom-pepper-fry": "Ghee Pepper Mushroom Fry.jpg",
  "orange": "Orange juice in a glass.jpg",
  "orange-lime": "A glass of orange juice (2015-10-10).JPG",
  "paneer-65": "Paneer 65.jpg",
  "paneer-butter-masala": "Paneer butter masala 3.jpg",
  "papaya": "Mixture of fruit juices.jpg",
  "patiala-chicken": "Chicken Patiala.JPG",
  "pepper-beef": "Steak with five pepper sauce.jpg",
  "peri-peri": "Peri-Peri Chicken dish.jpg",
  "peri-peri-mandhi": "Peri Peri Chicken Al Faham Biryani.jpg",
  "pineapple": "A glass of pineapple juice.jpg",
  "pineapple-lime": "Pineapple Juice fruits-465832.jpg",
  "pop-corn-chicken": "Chicken Popcorn.jpg",
  "prawns-65": "Prawn 65.JPG",
  "prawns-fry": "Prawns in garlic butter - Taupo, New Zealand.jpg",
  "prawns-kizhi": "Malabar Prawn Curry.jpg",
  "prawns-roast": "Prawn Fry.JPG",
  "russian-salad": "Russian Olivier salad.jpg",
  "schezwan-chicken": "Chicken Schezwan Indian style.JPG",
  "schezwan-egg": "Schezwan Egg Fried Rice with raitha 04.jpg",
  "schezwan-veg": "Schewan Rice-Diu-DSC004.jpg",
  "shamam": "Sucus Vaccinium mixta.jpg",
  "shawaya-mandhi": "Chicken Shawaya Plate IMG20260613230730.jpg",
  "squid-dry-fry": "Deep-fried squid with garlic.jpg",
  "squid-kizhi": "Squid curry (Bondaas Sukka).jpg",
  "squid-masala": "Squids masala (8115871281).jpg",
  "squid-roast": "Squid Ghee Roast.jpg",
  "sweetcorn-veg-soup": "Amy's lentil vegetable soup.jpg",
  "tandoori-chicken": "Tandoori Chicken.jpg",
  "tandoori-platter": "Mixed Tandoori Platter - Palms Food Court AUD12.50 (3087384627).jpg",
  "tongri-kebab": "Murg tangri kebab.jpg",
  "veg-clear-soup": "-2022-02-01 Bowl of spring vegetable soup, Trimingham, Norfolk.JPG",
  "watermelon": "Watermelon juice in a glass.jpg",
  "mango": "Glass of Mango Juice.jpg",
  "apple": "Apple juice glass.jpg",
  "avocado": "Ovacado juice in a drinking glass.jpg",
  "coffee": "South Indian Filter Kaapi aka Coffee 04.jpg",
  "malai-kebab": "Reshmi Kabab.JPG",
  "anar": "Pomegranate juice in glass with ice cubes -kolkata.jpg",
  "chikku": "Mix juice 001.jpg",
  "mosambi": "Mosambi juice at Udupi Upahar, Wilson Garden, Bangalore (2025-09-19).jpg",
  "mughlai-chicken": "Mughlai Platter.jpg",
  "cream-of-veg": "Vegan Cream of Cauliflower soup (8426310335).jpg",
  "hot-and-sour-soup-chicken": "Hot n Sour Chicken Soup.jpg",
  "shanghai-fried-rice": "Vegetable Fried Rice.jpg",
  "banen-fried-rice": "Vegetable Fried Rice 5998.JPG",
  "beef-dry-fry": "Traditional Beef Ularthiyathu.JPG",
  "egg-fried-rice": "Egg Fried Rice.jpg",
  "dry-fruit-salad-with-ice-cream": "Mysore Special Fruit Salad With Ice Cream.jpg",
  "mint-lime": "Zombiecocktail.jpg",
  "chilli-mushroom": "Mushroom Manchurian dry.jpg",
  "french-fries": "French Fries.JPG",
  "black-tea": "Cup of black tea.JPG",
  "al-faham-mandhi": "Al-Faham Chicken and Kuboos 2021.jpg",
  "beef-mandhi": "Kaithi biriyani beef.jpg",
  "fish-pollichathu": "Karimeen Pollichathu.jpg",
  "cucumber-salad": "Cucumber lettuce tomato and onion salad.jpg",
  "ginger-beef": "Ginger beef stir fry.jpg",
  "gobi-65": "Gobi 65 (cauliflower fry).jpg",
  "khaleej-special-porotta": "Kerala Porotta 05.jpg",
  "mushroom-65": "Mushroom 65 at Mayuri, JP Nagar, Bangalore (2025-09-20).jpg",
  "paneer-chilli": "A full plate chilli paneer in Kolkata, West Bengal.jpg",
  "chicken-65": "Lemon rice and Chicken 65.jpg",
  "punjabi-chicken": "Butter Chicken & Naan.jpg",
  "rumali-roll": "Spicy Chicken Shawarma Roll.jpg",
  "schezwan-mix-2": "Schezwan fried rice.jpg",
};

const queries = {
  "afghani": "Afghani chicken kebab Indian",
  "al-faham-normal": "Al Faham chicken",
  "anar": "pomegranate fruit",
  "banen-fried-rice": "Vegetable Fried Rice 5998.JPG",
  "beef-dry-fry": "Kerala beef fry",
  "beef-kondattam": "beef kondattam Indian",
  "black-tea": "black tea cup",
  "broast-chicken": "broasted chicken pieces",
  "chikku": "sapodilla fruit",
  "chilli-sarbath": "chilli lime drink India",
  "kulki-sarbath": "sarbath drink Kerala",
  "malabar-sarbath": "Malabar sarbath drink",
  "mosambi": "mosambi juice",
  "peri-peri": "peri peri chicken",
  "shamam": "mixed fruit drink India",
  "tea": "tea cup India",
  "khaleej-special-porotta": "Kerala porotta",
  "fish-fingers": "fried fish fingers",
  "french-fries": "french fries",
  "tandoori-platter": "tandoori platter",
  "shawarma-roll": "chicken shawarma wrap",
  "shawarma-plate": "chicken shawarma plate",
  "rumali-roll": "rumali roti wrap",
  "rumali-plate": "rumali roti",
  "dry-fruit-salad": "dry fruit salad",
  "dry-fruit-salad-with-ice-cream": "fruit salad with ice cream",
  "fruit-salad-with-ice-cream": "fruit salad with ice cream",
  "hot-and-sour-soup-chicken": "Clear chicken soup (11968429276).jpg",
  "hot-and-sour-soup-veg": "hot and sour vegetable soup",
  "lemon-coriander-chicken": "lemon coriander soup chicken",
  "lemon-coriander-veg": "lemon coriander soup vegetable",
  "schezwan-mix-2": "Schezwan fried rice",
  "singapore-fried-rice": "Singapore fried rice",
  "shanghai-fried-rice": "Vegetable Fried Rice.jpg",
  "triple-fried-rice": "triple fried rice",
  "tikka-masala": "chicken tikka masala",
  "paneer-65": "paneer 65",
  "gobi-65": "gobi 65 cauliflower",
  "mushroom-65": "mushroom 65",
  "gobi-manchurian": "gobi Manchurian",
  "chilli-gobi": "chilli gobi cauliflower",
  "paneer-chilli": "chilli paneer",
  "chilli-mushroom": "chilli mushroom",
  "mushroom-masala": "mushroom masala curry",
  "veg-kurma": "vegetable kurma",
  "kadai-mushroom": "kadai mushroom",
  "cream-of-mushroom": "cream of mushroom soup",
  "cream-of-tomato": "cream of tomato soup",
  "cream-of-chicken": "cream of chicken soup",
  "cream-of-veg": "cream of vegetable soup",
  "sweetcorn-chicken-soup": "sweetcorn chicken soup",
  "sweetcorn-veg-soup": "sweetcorn vegetable soup",
  "manchow-chicken": "manchow soup chicken",
  "manchow-veg": "manchow soup vegetable",
  "chicken-clear-soup": "chicken clear soup",
  "veg-clear-soup": "vegetable clear soup",
  "ginger-tea": "ginger tea cup",
  "mint-tea": "mint tea cup",
  "lime-tea": "lime tea cup",
  "mint-lime": "mint lime drink",
  "pineapple-lime": "pineapple lime drink",
  "grape-lime": "grape lime drink",
  "orange-lime": "orange lime drink",
  "blue-lime": "blue lagoon mocktail",
  "anar": "pomegranate juice",
};

function titleToQuery(slug) {
  if (queries[slug]) return queries[slug];
  let words = slug.replace(/-/g, " ");
  if (slug.includes("mandhi")) return words;
  if (slug.includes("fried-rice")) return words.replace("fried rice", "") + " fried rice";
  if (slug.includes("noodles")) return words.replace("noodles", "") + " noodles";
  if (slug.includes("soup")) return words.replace("soup", "") + " soup";
  if (slug.includes("kebab")) return words.replace("kebab", "") + " kebab";
  if (slug.includes("lime")) return words.replace("lime", "") + " lime drink";
  if (/^\d+$/.test(words.split(" ").pop())) return words + " Indian dish";
  return words + " Indian food";
}

const reject = /\bcook(ed|ing|book|s)?\b|\bchef\b|\bkitchen\b|\bprepar|\bmak(ing|e|es|ed)\b|\bmade\b|\bhold(ing)?\b|\bheld\b|\bhand(s)?\b|\bpeople\b|\bman\b|\bwoman\b|\beat(ing|en)?\b|\bmarket\b|\bstreet\b|\bstall\b|\bvendor\b|\bbuffet\b|\bhotel\b|\bcafe\b|\brestaurant\b|\binterior\b|\bselfie\b|\bfestival\b/i;

const nonFood = /\b(soldiers?|military|uniformed?|war|paintings?|art project|proverbs?|fungi|botanic|poisonous|distribution|nutrition|training|tribes?|cricket|stadium|ceremony|election|concert|museum|monument)\b|plate xviii/i;

function rank(info, slug) {
  const title = info?.title ?? "";
  const words = slug.split("-").filter((word) => word.length > 2);
  const matches = words.filter((word) => new RegExp(`\\b${word}`, "i").test(title));
  let value = matches.length * 8;
  if (/\b(plate|plated|served|serving|table|top.?view|bowl|cup|glass|dish)\b/i.test(title)) value += 5;
  if (/\b(dish|meal|curry|cuisine|food)\b/i.test(title)) value += 2;
  if (reject.test(title) || nonFood.test(title)) value -= 40;
  return value;
}

const stripHtml = (value) => String(value ?? "").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

async function apiGet(params) {
  const url = `${api}?${new URLSearchParams({ format: "json", ...params })}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Commons API ${res.status}`);
      return await res.json();
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
}

function describe(page) {
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  return {
    title: page.title.replace(/^File:/, ""),
    page: info.descriptionurl,
    url: info.thumburl || info.url,
    width: info.width,
    height: info.height,
    artist: stripHtml(meta.Artist?.value),
    license: stripHtml(meta.LicenseShortName?.value),
  };
}

const blocked = /\blogo\b|\bmap\b|diagram|robot|porcelain|\bmenu\b|\bicon\b|poster|\bsign\b|\bflag\b|coat of arms|svg|pdf|gif|screenshot|trophy|advert|wellcome|catalogue|journal|how to prepare|book|illustration|drawing|engraving|seller|mall|shop|street|geograph|opening soon|chimp|spacesuit|historic|ladies home journal|cook book/i;

function acceptable(item) {
  if (!item || !/\.(jpe?g|png|webp)$/i.test(item.title) || blocked.test(item.title) || reject.test(item.title) || nonFood.test(item.title)) return false;
  if (item.width && item.height && (item.width < 220 || item.height < 180)) return false;
  return true;
}

async function searchCandidates(query) {
  const search = await apiGet({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "700",
  });
  return Object.values(search.query?.pages ?? {})
    .sort((a, b) => a.index - b.index)
    .map(describe)
    .filter(acceptable);
}

async function resolve(slug) {
  if (exactTitles[slug]) {
    const exact = await apiGet({
      action: "query",
      titles: `File:${exactTitles[slug]}`,
      redirects: "1",
      prop: "imageinfo",
      iiprop: "url|extmetadata|mime|size",
      iiurlwidth: "700",
    });
    const info = describe(Object.values(exact.query?.pages ?? {})[0]);
    if (acceptable(info)) return info;
  }
  const base = titleToQuery(slug);
  let pool = [];
  for (const query of [`${base} plated on table`, `${base} on plate`, base]) {
    try {
      pool = pool.concat(await searchCandidates(query));
    } catch {}
  }
  const words = slug.split("-").filter((word) => word.length > 2);
  const ranked = pool
    .filter((item, index, array) => array.findIndex((other) => other.title === item.title) === index)
    .filter((item) => words.some((word) => new RegExp(`\\b${word}`, "i").test(item.title)))
    .map((item) => ({ item, value: rank(item, slug) }))
    .filter(({ value }) => value >= 10)
    .sort((a, b) => b.value - a.value)
    .map(({ item }) => item);
  if (ranked[0]) return ranked[0];
  throw new Error(`no usable image for "${base}"`);
}

async function download(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function save(slug, info) {
  const buffer = await download(info.url);
  const output = path.join(productDir, `${slug}.jpg`);
  await sharp(buffer)
    .rotate()
    .resize(640, 520, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90, progressive: true, mozjpeg: true })
    .toFile(output);
  return { file: `/images/products/${slug}.jpg`, title: info.title, source: info.page, author: info.artist, license: info.license };
}

const force = process.argv.includes("--force");
const requested = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
fs.mkdirSync(productDir, { recursive: true });
const pending = slugs.filter((slug) => requested.includes(slug) || (force && requested.length === 0) || !fs.existsSync(path.join(productDir, `${slug}.jpg`)));
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : [];
const byFile = new Map(credits.map((entry) => [entry.file, entry]));
const failures = [];
let cursor = 0;

async function worker() {
  while (cursor < pending.length) {
    const slug = pending[cursor++];
    try {
      const info = await resolve(slug);
      byFile.set(`/images/products/${slug}.jpg`, await save(slug, info));
      console.log(`OK   ${slug}.jpg  <-  ${info.title}`);
    } catch (error) {
      failures.push(`${slug}: ${error.message}`);
      console.error(`FAIL ${slug}: ${error.message}`);
    }
  }
}

await Promise.all(Array.from({ length: 6 }, worker));
const output = slugs.map((slug) => byFile.get(`/images/products/${slug}.jpg`)).filter(Boolean);
fs.writeFileSync(creditsPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`\nDone: ${output.length}/${slugs.length} product images, ${failures.length} failures.`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
