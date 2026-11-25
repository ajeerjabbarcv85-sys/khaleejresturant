// Complete menu source. Rows use: item | price(s); multiple prices follow the size order in the category label.
const menuData = [
  { category: "Beverages", rows: `Tea|12
Coffee|20
Black Tea|10
Lime Tea|15
Mint Tea|15
Ginger Tea|25` },
  { category: "Fresh Juice", rows: `Orange|70
Pineapple|70
Grape|70
Mosambi|70
Watermelon|70
Anar|80
Apple|80
Chikku|80
Mango|80
Papaya|80
Shamam|80
Avocado|90` },
  { category: "Lime & Sarbath", rows: `Fresh Lime|20
Mint Lime|25
Lime Soda|20
Pineapple Lime|30
Grape Lime|30
Orange Lime|30
Blue Lime|40
Chilli Sarbath|25
Kulki Sarbath|25
Malabar Sarbath|25` },
  { category: "Fruit Salad", rows: `Fruit Salad|110
Fruit Salad with Ice Cream|140
Dry Fruit Salad|130
Dry Fruit Salad with Ice Cream|160` },
  { category: "Soup", rows: `Sweetcorn Chicken Soup|100
Sweetcorn Veg Soup|80
Hot & Sour Soup Chicken|100
Hot & Sour Soup Veg|80
Manchow Chicken|110
Manchow Veg|90
Cream of Chicken|130
Cream of Veg|110
Chicken Clear Soup|100
Veg Clear Soup|80
Lemon Coriander Chicken|130
Lemon Coriander Veg|110
Cream of Mushroom|130
Cream of Tomato|130` },
  { category: "Starters", rows: `Chicken 65|130
Chicken Lollipop|150
Dragon Chicken|160
Pop Corn Chicken|140
Chicken Nuggets|140
Beef Dry Fry|150
Beef Pepper Fry|160
Gobi 65|100
Paneer 65|120
Mushroom 65|120
Mushroom Pepper Fry|140
French Fries|90
Fish Fingers|160
Prawns 65|160` },
  { category: "Salad", rows: `Green Salad|80
Cucumber Salad|60
Russian Salad|140
Chicken Salad|140` },
  { category: "Mandhi", sizes: ["Q", "H", "TQ", "F"], rows: `Chicken Mandhi|170|340|510|650
Al Faham Mandhi|190|380|570|720
Peri Peri Mandhi|200|390|590|760
Honey Chilli Mandhi|200|390|570|760
Kanthari Mandhi|200|390|590|760
Afghani Mandhi|200|390|590|760
Shawaya Mandhi|190|380|570|720
Broast Mandhi|220|420|620|780
Beef Mandhi|230|460|690|890` },
  { category: "Tandoor", sizes: ["Q", "H", "F"], rows: `Tandoori Chicken|150|250|480
Chicken Tikka|260
Malai Kebab|270
Hariyali Kebab|270
Tongri Kebab|260
Tandoori Platter|790|Half tandoori chicken, 4 pcs tikka, 4 pcs malai kebab, 2 pcs sheek kebab, 2 rotti, 2 butter naan, 2 garlic naan` },
  { category: "Arabic", sizes: ["Q", "H", "F"], rows: `Al Faham Normal|130|250|480
Peri Peri|140|270|500
Honey Chilli|150|280|520
Kanthari|150|280|500
Afghani|150|280|520
Masala Shawarma|130|250|480
Shawarma Roll|90
Shawarma Plate|110
Rumali Roll|100
Rumali Plate|120` },
  { category: "Broast", sizes: ["2 pcs", "4 pcs", "8 pcs"], rows: `Broast Chicken|150|280|540` },
  { category: "Chinese Dry Items", rows: `Gobi Manchurian|120
Chilli Gobi|120
Paneer Chilli|140
Chilli Mushroom|140` },
  { category: "Beef, Fish & Seafood", rows: `Beef Fry|150
Beef Roast|160
Beef Masala|160
Chilli Beef|150
Beef Kondattam|160
Ginger Beef|160
Pepper Beef|160
Fish Roast|As per size
Fish Masala|As per size
Fish Molly|As per size
Fish Pollichathu|As per size
Prawns Fry|190
Prawns Roast|210
Prawns Masala|220
Prawns Kizhi|230
Squid Dry Fry|160
Squid Roast|170
Squid Masala|180
Squid Kizhi|180` },
  { category: "Chinese Curries", sizes: ["Q", "H", "F"], rows: `Chilli Chicken|150|280|560
Ginger Chicken|160|300|590
Pepper Chicken|150|280|560` },
  { category: "Chinese Rice & Noodles", rows: `Veg Fried Rice|140
Chicken Fried Rice|180
Egg Fried Rice|160
Mixed Fried Rice|200
Schezwan Chicken|220
Schezwan Egg|190
Schezwan Veg|180
Schezwan Mix 2|240
Singapore Fried Rice|160
Shanghai Fried Rice|170
Triple Fried Rice|190
Banen Fried Rice|180
Veg Noodles|130
Egg Noodles|160
Chicken Noodles|170
Mixed Noodles|190` },
  { category: "Curries", sizes: ["Q", "H", "F"], rows: `Kadai Chicken|150|280|560
Hyderabadi Chicken|160|300|600
Malai Chicken|150|290|580
Mughlai Chicken|150|290|580
Chicken Kurma|140|270|460
Patiala Chicken|150|290|580
Punjabi Chicken|160|300|600
Tikka Masala|150
Paneer Butter Masala|140
Kadai Paneer|140
Mushroom Masala|130
Kadai Mushroom|130
Kadai Veg|130
Veg Kurma|120` },
  { category: "Special", rows: `Khaleej Special Porotta|-` },
];

const slugify = (value) => value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
const allItems = menuData.flatMap((group) => group.rows.split("\n").map((row) => {
  const [name, ...values] = row.trim().split("|");
  const priceValues = values.filter((value) => /^\d+$/.test(value.trim()) || value.trim() === "-" || value.trim().toLowerCase() === "as per size");
  const sizedRow = group.sizes && (priceValues.length > 1 || group.category === "Tandoor" || group.category === "Curries");
  const prices = sizedRow ? group.sizes.map((_, index) => priceValues[index] || "-") : priceValues;
  const description = values.filter((value) => !priceValues.includes(value)).join(" | ");
  return { name, slug: slugify(name), category: group.category, sizes: group.sizes || [], prices, description };
}));
const menuGrid = document.querySelector("#menu-grid");
const tabs = document.querySelector("#category-tabs");
const menuGroupsEl = document.querySelector("#menu-groups");
const drinkCategories = new Set(["Beverages", "Fresh Juice", "Lime & Sarbath"]);
let activeGroup = "food";
let activeCategory = menuData.find((group) => !drinkCategories.has(group.category)).category;

function visibleGroups() {
  return menuData.filter((group) => activeGroup === "drinks" ? drinkCategories.has(group.category) : !drinkCategories.has(group.category));
}
function renderGroups() {
  menuGroupsEl.innerHTML = [["food", "Food"], ["drinks", "Drinks"]].map(([id, label]) => `<button class="menu-group${activeGroup === id ? " is-active" : ""}" type="button" data-group="${id}" aria-pressed="${activeGroup === id}">${label}</button>`).join("");
}
menuGroupsEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-group]");
  if (!button) return;
  activeGroup = button.dataset.group;
  activeCategory = visibleGroups()[0].category;
  renderGroups(); renderTabs(); renderMenu();
});

function priceLabel(value) {
  if (!value || value === "-") return "On request";
  if (value.toLowerCase() === "as per size") return "As per size";
  return `₹${value}`;
}
function renderTabs() {
  tabs.innerHTML = visibleGroups().map((group) => `<button class="category-tab${group.category === activeCategory ? " is-active" : ""}" id="tab-${menuData.indexOf(group)}" role="tab" aria-selected="${group.category === activeCategory}" aria-controls="menu-grid" tabindex="${group.category === activeCategory ? "0" : "-1"}" data-category="${group.category}">${group.category}</button>`).join("");
}
function renderMenu() {
  menuGrid.classList.toggle("drinks", activeGroup === "drinks");
  const group = menuData.find((entry) => entry.category === activeCategory);
  menuGrid.setAttribute("aria-labelledby", `tab-${menuData.indexOf(group)}`);
  const items = allItems.filter((item) => item.category === activeCategory);
  menuGrid.innerHTML = items.map((item) => {
    const image = `/images/products/${item.slug}.jpg`;
    const orderButton = (price, index) => {
      const size = item.sizes[index] || "";
      const priceValue = /^\d+$/.test(price) ? Number(price) : "";
      const key = `${item.slug}|${size}`;
      const label = `Add ${item.name}${size ? ` (${size})` : ""} to your order`;
      return `<button type="button" class="price-option" data-key="${escapeHtml(key)}" data-name="${escapeHtml(item.name)}" data-price="${priceValue}" data-price-text="${escapeHtml(priceLabel(price))}" data-size="${escapeHtml(size)}" aria-label="${escapeHtml(label)}"><small>${size ? `<span>${size}</span>` : ""}</small><b>${priceLabel(price)}</b><span class="add-plus" aria-hidden="true">+</span></button>`;
    };
    const priceMarkup = item.prices.length > 1
      ? `<div class="price-list">${item.prices.map(orderButton).join("")}</div>`
      : `<div class="single-price">${orderButton(item.prices[0], 0)}</div>`;
    return `<article class="menu-card"><div class="product-photo"><img src="${image}" alt="${item.name}" loading="lazy"><div class="image-fallback" aria-hidden="true"><span class="fallback-mark">K</span><span>${escapeHtml(item.name)}</span></div></div><div class="menu-card-body"><div class="item-heading"><h3>${escapeHtml(item.name)}</h3>${priceMarkup}</div>${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ""}</div></article>`;
  }).join("");
  menuGrid.querySelectorAll(".product-photo img").forEach((img) => img.addEventListener("error", () => img.classList.add("is-missing"), { once: true }));
}
renderGroups();
renderTabs();
renderMenu();

// Category tabs support arrow keys, Home and End for keyboard navigation.
tabs.addEventListener("click", (event) => {
  const button = event.target.closest("[role=tab]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderTabs();
  renderMenu();
  tabs.querySelector("[aria-selected=true]").focus();
});
tabs.addEventListener("keydown", (event) => {
  const buttons = [...tabs.querySelectorAll("[role=tab]")];
  let index = buttons.indexOf(document.activeElement);
  if (event.key === "ArrowRight") index = (index + 1) % buttons.length;
  else if (event.key === "ArrowLeft") index = (index - 1 + buttons.length) % buttons.length;
  else if (event.key === "Home") index = 0;
  else if (event.key === "End") index = buttons.length - 1;
  else return;
  event.preventDefault();
  activeCategory = buttons[index].dataset.category;
  renderTabs(); renderMenu();
  tabs.querySelector("[aria-selected=true]").focus();
});

// Mobile navigation closes after selecting a section or pressing Escape.
const nav = document.querySelector("#main-nav");
const menuToggle = document.querySelector(".menu-toggle");
function setNav(open) {
  nav.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}
menuToggle.addEventListener("click", () => setNav(menuToggle.getAttribute("aria-expanded") !== "true"));
nav.addEventListener("click", (event) => { if (event.target.closest("a")) setNav(false); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") setNav(false); });

// Gallery lightbox supports keyboard controls, focus return, and previous/next images.
const galleryButtons = [...document.querySelectorAll(".gallery-item")];
const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox.querySelector("img");
let galleryIndex = 0;
let lightboxOpener = null;
function showGalleryImage(index) {
  galleryIndex = (index + galleryButtons.length) % galleryButtons.length;
  const button = galleryButtons[galleryIndex];
  lightboxImage.src = button.dataset.full;
  lightboxImage.alt = button.querySelector("img").alt;
  lightbox.querySelector(".lightbox-count").textContent = `${galleryIndex + 1} / ${galleryButtons.length}`;
}
galleryButtons.forEach((button, index) => button.addEventListener("click", () => {
  lightboxOpener = button;
  showGalleryImage(index);
  lightbox.showModal();
}));
lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showGalleryImage(galleryIndex - 1));
lightbox.querySelector(".lightbox-next").addEventListener("click", () => showGalleryImage(galleryIndex + 1));
lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener("close", () => lightboxOpener?.focus());
lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showGalleryImage(galleryIndex - 1);
  if (event.key === "ArrowRight") showGalleryImage(galleryIndex + 1);
});
document.querySelector("#year").textContent = new Date().getFullYear();

// Order cart: lines are stored locally so an order survives a page refresh.
const WHATSAPP_NUMBER = "919048700557";
const CART_STORAGE_KEY = "khaleej-order-cart";
const cartButton = document.querySelector("#cart-button");
const cartCount = document.querySelector("#cart-count");
const cartDrawer = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const whatsappLink = document.querySelector("#checkout-whatsapp");
const toast = document.querySelector("#toast");
let toastTimer;

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((line) => line && line.key && line.name && Number(line.qty) > 0).map((line) => ({
      key: String(line.key),
      name: String(line.name),
      size: String(line.size || ""),
      price: line.price === "" || line.price === null ? null : Number(line.price),
      priceText: String(line.priceText || ""),
      qty: Number(line.qty),
    }));
  } catch {
    return [];
  }
}

let cart = readCart();

function saveCart() {
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch { /* storage may be unavailable */ }
}

function linePrice(line) {
  return line.price === null ? (line.priceText || "As per size") : `₹${line.price * line.qty}`;
}

function orderMessage() {
  const lines = cart.map((line, index) => `${index + 1}. ${line.name}${line.size ? ` (${line.size})` : ""} x ${line.qty} — ${linePrice(line)}`).join("\n");
  const total = cart.reduce((sum, line) => sum + (line.price === null ? 0 : line.price * line.qty), 0);
  return `Hello Khaleej Restaurant, I would like to place this order:\n\n${lines}\n\nSubtotal: ₹${total}\n\nPlease confirm availability and the final amount. Thank you!`;
}

function renderCart() {
  const count = cart.reduce((sum, line) => sum + line.qty, 0);
  const total = cart.reduce((sum, line) => sum + (line.price === null ? 0 : line.price * line.qty), 0);
  cartCount.textContent = String(count);
  cartTotal.textContent = `₹${total}`;
  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMessage())}`;
  whatsappLink.setAttribute("aria-disabled", String(cart.length === 0));

  if (!cart.length) {
    cartItems.innerHTML = `<p class="cart-empty">Your order is empty. Add something tasty from the menu.</p>`;
    return;
  }
  cartItems.innerHTML = cart.map((line) => `<div class="cart-line" data-key="${escapeHtml(line.key)}">
    <div class="cart-line-info"><b>${escapeHtml(line.name)}</b><small>${line.size ? `${escapeHtml(line.size)} · ` : ""}${line.price === null ? (line.priceText || "As per size") : `₹${line.price}`}</small></div>
    <div class="qty-control"><button type="button" data-action="decrease" aria-label="One fewer ${escapeHtml(line.name)}">−</button><span aria-label="Quantity ${line.qty}">${line.qty}</span><button type="button" data-action="increase" aria-label="One more ${escapeHtml(line.name)}">+</button></div>
    <strong class="cart-line-price">${linePrice(line)}</strong>
    <button type="button" class="cart-line-remove" data-action="remove" aria-label="Remove ${escapeHtml(line.name)}">×</button>
  </div>`).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".price-option");
  if (!button) return;
  const { key, name, size, price, priceText } = button.dataset;
  const existing = cart.find((line) => line.key === key);
  if (existing) existing.qty += 1;
  else cart.push({ key, name, size, price: price === "" ? null : Number(price), priceText, qty: 1 });
  saveCart();
  renderCart();
  showToast(`${name} added to your order`);
});

cartItems.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  const line = event.target.closest(".cart-line");
  if (!actionButton || !line) return;
  const index = cart.findIndex((entry) => entry.key === line.dataset.key);
  if (index < 0) return;
  const action = actionButton.dataset.action;
  if (action === "increase") cart[index].qty += 1;
  else if (action === "decrease") cart[index].qty -= 1;
  else if (action === "remove") cart[index].qty = 0;
  cart = cart.filter((entry) => entry.qty > 0);
  saveCart();
  renderCart();
});

function setCartOpen(open) {
  if (open) cartDrawer.showModal();
  else cartDrawer.close();
  cartButton.setAttribute("aria-expanded", String(open));
}

cartButton.addEventListener("click", () => setCartOpen(true));
document.querySelector("#cart-close").addEventListener("click", () => setCartOpen(false));
document.querySelector("#cart-clear").addEventListener("click", () => { cart = []; saveCart(); renderCart(); });
cartDrawer.addEventListener("click", (event) => { if (event.target === cartDrawer) setCartOpen(false); });
cartDrawer.addEventListener("close", () => cartButton.setAttribute("aria-expanded", "false"));
whatsappLink.addEventListener("click", (event) => { if (!cart.length) { event.preventDefault(); setCartOpen(false); document.querySelector("#menu").scrollIntoView({ behavior: "smooth" }); } });

renderCart();
