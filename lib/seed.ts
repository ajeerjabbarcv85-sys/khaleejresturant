import type Database from "better-sqlite3";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { hashPassword } from "@/lib/password";
import { slugify } from "@/lib/utils";

const CATEGORIES: { name: string; description: string; image: string; items: { name: string; description: string; price: number; featured?: boolean; veg?: boolean; image?: string }[] }[] = [
  {
    name: "Beverages",
    description: "Explore our beverages at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/beverages.jpg",
    items: [
      { name: "Tea", description: "Beverages at Khaleej Restaurant, Velliparamba.", price: 12, featured: true, veg: true, image: "/images/products/tea.jpg" },
      { name: "Coffee", description: "Beverages at Khaleej Restaurant, Velliparamba.", price: 20, featured: true, veg: true, image: "/images/products/coffee.jpg" },
      { name: "Black Tea", description: "Beverages at Khaleej Restaurant, Velliparamba.", price: 10, featured: true, veg: true, image: "/images/products/black-tea.jpg" },
      { name: "Lime Tea", description: "Beverages at Khaleej Restaurant, Velliparamba.", price: 15, featured: false, veg: true, image: "/images/products/lime-tea.jpg" },
      { name: "Mint Tea", description: "Beverages at Khaleej Restaurant, Velliparamba.", price: 15, featured: false, veg: true, image: "/images/products/mint-tea.jpg" },
      { name: "Ginger Tea", description: "Beverages at Khaleej Restaurant, Velliparamba.", price: 25, featured: false, veg: true, image: "/images/products/ginger-tea.jpg" },
    ],
  },
  {
    name: "Fresh Juice",
    description: "Explore our fresh juice at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/hot-starters.jpg",
    items: [
      { name: "Orange", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 70, featured: true, veg: true, image: "/images/products/orange.jpg" },
      { name: "Pineapple", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 70, featured: true, veg: true, image: "/images/products/pineapple.jpg" },
      { name: "Grape", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 70, featured: true, veg: true, image: "/images/products/grape.jpg" },
      { name: "Mosambi", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 70, featured: false, veg: true, image: "/images/products/mosambi.jpg" },
      { name: "Watermelon", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 70, featured: false, veg: true, image: "/images/products/watermelon.jpg" },
      { name: "Anar", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 80, featured: false, veg: true, image: "/images/products/anar.jpg" },
      { name: "Apple", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 80, featured: false, veg: true, image: "/images/products/apple.jpg" },
      { name: "Chikku", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 80, featured: false, veg: true, image: "/images/products/chikku.jpg" },
      { name: "Mango", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 80, featured: false, veg: true, image: "/images/products/mango.jpg" },
      { name: "Papaya", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 80, featured: false, veg: true, image: "/images/products/papaya.jpg" },
      { name: "Shamam", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 80, featured: false, veg: true, image: "/images/products/shamam.jpg" },
      { name: "Avocado", description: "Fresh Juice at Khaleej Restaurant, Velliparamba.", price: 90, featured: false, veg: true, image: "/images/products/avocado.jpg" },
    ],
  },
  {
    name: "Lime & Sarbath",
    description: "Explore our lime & sarbath at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/salads.jpg",
    items: [
      { name: "Fresh Lime", description: "Lime & Sarbath at Khaleej Restaurant, Velliparamba.", price: 20, featured: true, veg: true, image: "/images/products/fresh-lime.jpg" },
      { name: "Mint Lime", description: "Lime & Sarbath at Khaleej Restaurant, Velliparamba.", price: 25, featured: true, veg: true, image: "/images/products/mint-lime.jpg" },
      { name: "Lime Soda", description: "Lime & Sarbath at Khaleej Restaurant, Velliparamba.", price: 20, featured: true, veg: true, image: "/images/products/lime-soda.jpg" },
      { name: "Pineapple Lime", description: "Lime & Sarbath at Khaleej Restaurant, Velliparamba.", price: 30, featured: false, veg: true, image: "/images/products/pineapple-lime.jpg" },
      { name: "Grape Lime", description: "Lime & Sarbath at Khaleej Restaurant, Velliparamba.", price: 30, featured: false, veg: true, image: "/images/products/grape-lime.jpg" },
      { name: "Orange Lime", description: "Lime & Sarbath at Khaleej Restaurant, Velliparamba.", price: 30, featured: false, veg: true, image: "/images/products/orange-lime.jpg" },
      { name: "Blue Lime", description: "Lime & Sarbath at Khaleej Restaurant, Velliparamba.", price: 40, featured: false, veg: true, image: "/images/products/blue-lime.jpg" },
      { name: "Chilli Sarbath", description: "Lime & Sarbath at Khaleej Restaurant, Velliparamba.", price: 25, featured: false, veg: true, image: "/images/products/chilli-sarbath.jpg" },
      { name: "Kulki Sarbath", description: "Lime & Sarbath at Khaleej Restaurant, Velliparamba.", price: 25, featured: false, veg: true, image: "/images/products/kulki-sarbath.jpg" },
      { name: "Malabar Sarbath", description: "Lime & Sarbath at Khaleej Restaurant, Velliparamba.", price: 25, featured: false, veg: true, image: "/images/products/malabar-sarbath.jpg" },
    ],
  },
  {
    name: "Fruit Salad",
    description: "Explore our fruit salad at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/soups.jpg",
    items: [
      { name: "Fruit Salad", description: "Fruit Salad at Khaleej Restaurant, Velliparamba.", price: 110, featured: true, veg: true, image: "/images/products/fruit-salad.jpg" },
      { name: "Fruit Salad with Ice Cream", description: "Fruit Salad at Khaleej Restaurant, Velliparamba.", price: 140, featured: true, veg: true, image: "/images/products/fruit-salad-with-ice-cream.jpg" },
      { name: "Dry Fruit Salad", description: "Fruit Salad at Khaleej Restaurant, Velliparamba.", price: 130, featured: true, veg: true, image: "/images/products/dry-fruit-salad.jpg" },
      { name: "Dry Fruit Salad with Ice Cream", description: "Fruit Salad at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: true, image: "/images/products/dry-fruit-salad-with-ice-cream.jpg" },
    ],
  },
  {
    name: "Soup",
    description: "Explore our soup at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/seafood.jpg",
    items: [
      { name: "Sweetcorn Chicken Soup", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 100, featured: true, veg: false, image: "/images/products/sweetcorn-chicken-soup.jpg" },
      { name: "Sweetcorn Veg Soup", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 80, featured: true, veg: true, image: "/images/products/sweetcorn-veg-soup.jpg" },
      { name: "Hot & Sour Soup Chicken", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 100, featured: true, veg: false, image: "/images/products/hot-and-sour-soup-chicken.jpg" },
      { name: "Hot & Sour Soup Veg", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 80, featured: false, veg: true, image: "/images/products/hot-and-sour-soup-veg.jpg" },
      { name: "Manchow Chicken", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 110, featured: false, veg: false, image: "/images/products/manchow-chicken.jpg" },
      { name: "Manchow Veg", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 90, featured: false, veg: true, image: "/images/products/manchow-veg.jpg" },
      { name: "Cream of Chicken", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 130, featured: false, veg: false, image: "/images/products/cream-of-chicken.jpg" },
      { name: "Cream of Veg", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 110, featured: false, veg: true, image: "/images/products/cream-of-veg.jpg" },
      { name: "Chicken Clear Soup", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 100, featured: false, veg: false, image: "/images/products/chicken-clear-soup.jpg" },
      { name: "Veg Clear Soup", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 80, featured: false, veg: true, image: "/images/products/veg-clear-soup.jpg" },
      { name: "Lemon Coriander Chicken", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 130, featured: false, veg: false, image: "/images/products/lemon-coriander-chicken.jpg" },
      { name: "Lemon Coriander Veg", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 110, featured: false, veg: true, image: "/images/products/lemon-coriander-veg.jpg" },
      { name: "Cream of Mushroom", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 130, featured: false, veg: true, image: "/images/products/cream-of-mushroom.jpg" },
      { name: "Cream of Tomato", description: "Soup at Khaleej Restaurant, Velliparamba.", price: 130, featured: false, veg: true, image: "/images/products/cream-of-tomato.jpg" },
    ],
  },
  {
    name: "Starters",
    description: "Explore our starters at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/poultry-meat.jpg",
    items: [
      { name: "Chicken 65", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 130, featured: true, veg: false, image: "/images/products/chicken-65.jpg" },
      { name: "Chicken Lollipop", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 150, featured: true, veg: false, image: "/images/products/chicken-lollipop.jpg" },
      { name: "Dragon Chicken", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 160, featured: true, veg: false, image: "/images/products/dragon-chicken.jpg" },
      { name: "Pop Corn Chicken", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 140, featured: false, veg: false, image: "/images/products/pop-corn-chicken.jpg" },
      { name: "Chicken Nuggets", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 140, featured: false, veg: false, image: "/images/products/chicken-nuggets.jpg" },
      { name: "Beef Dry Fry", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 150, featured: false, veg: false, image: "/images/products/beef-dry-fry.jpg" },
      { name: "Beef Pepper Fry", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/beef-pepper-fry.jpg" },
      { name: "Gobi 65", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 100, featured: false, veg: true, image: "/images/products/gobi-65.jpg" },
      { name: "Paneer 65", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 120, featured: false, veg: true, image: "/images/products/paneer-65.jpg" },
      { name: "Mushroom 65", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 120, featured: false, veg: true, image: "/images/products/mushroom-65.jpg" },
      { name: "Mushroom Pepper Fry", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 140, featured: false, veg: true, image: "/images/products/mushroom-pepper-fry.jpg" },
      { name: "French Fries", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 90, featured: false, veg: true, image: "/images/products/french-fries.jpg" },
      { name: "Fish Fingers", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/fish-fingers.jpg" },
      { name: "Prawns 65", description: "Starters at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/prawns-65.jpg" },
    ],
  },
  {
    name: "Salad",
    description: "Explore our salad at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/meals-biriyani.jpg",
    items: [
      { name: "Green Salad", description: "Salad at Khaleej Restaurant, Velliparamba.", price: 80, featured: true, veg: true, image: "/images/products/green-salad.jpg" },
      { name: "Cucumber Salad", description: "Salad at Khaleej Restaurant, Velliparamba.", price: 60, featured: true, veg: true, image: "/images/products/cucumber-salad.jpg" },
      { name: "Russian Salad", description: "Salad at Khaleej Restaurant, Velliparamba.", price: 140, featured: true, veg: true, image: "/images/products/russian-salad.jpg" },
      { name: "Chicken Salad", description: "Salad at Khaleej Restaurant, Velliparamba.", price: 140, featured: false, veg: false, image: "/images/products/chicken-salad.jpg" },
    ],
  },
  {
    name: "Mandhi",
    description: "Explore our mandhi at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/rice-noodles.jpg",
    items: [
      { name: "Chicken Mandhi (Q)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 170, featured: true, veg: false, image: "/images/products/chicken-mandhi.jpg" },
      { name: "Chicken Mandhi (H)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 340, featured: false, veg: false, image: "/images/products/chicken-mandhi.jpg" },
      { name: "Chicken Mandhi (TQ)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 510, featured: false, veg: false, image: "/images/products/chicken-mandhi.jpg" },
      { name: "Chicken Mandhi (F)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 650, featured: false, veg: false, image: "/images/products/chicken-mandhi.jpg" },
      { name: "Al Faham Mandhi (Q)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 190, featured: false, veg: false, image: "/images/products/al-faham-mandhi.jpg" },
      { name: "Al Faham Mandhi (H)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 380, featured: false, veg: false, image: "/images/products/al-faham-mandhi.jpg" },
      { name: "Al Faham Mandhi (TQ)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 570, featured: false, veg: false, image: "/images/products/al-faham-mandhi.jpg" },
      { name: "Al Faham Mandhi (F)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 720, featured: false, veg: false, image: "/images/products/al-faham-mandhi.jpg" },
      { name: "Peri Peri Mandhi (Q)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 200, featured: false, veg: false, image: "/images/products/peri-peri-mandhi.jpg" },
      { name: "Peri Peri Mandhi (H)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 390, featured: false, veg: false, image: "/images/products/peri-peri-mandhi.jpg" },
      { name: "Peri Peri Mandhi (TQ)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 590, featured: false, veg: false, image: "/images/products/peri-peri-mandhi.jpg" },
      { name: "Peri Peri Mandhi (F)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 760, featured: false, veg: false, image: "/images/products/peri-peri-mandhi.jpg" },
      { name: "Honey Chilli Mandhi (Q)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 200, featured: false, veg: false, image: "/images/products/honey-chilli-mandhi.jpg" },
      { name: "Honey Chilli Mandhi (H)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 390, featured: false, veg: false, image: "/images/products/honey-chilli-mandhi.jpg" },
      { name: "Honey Chilli Mandhi (TQ)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 570, featured: false, veg: false, image: "/images/products/honey-chilli-mandhi.jpg" },
      { name: "Honey Chilli Mandhi (F)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 760, featured: false, veg: false, image: "/images/products/honey-chilli-mandhi.jpg" },
      { name: "Kanthari Mandhi (Q)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 200, featured: false, veg: false, image: "/images/products/kanthari-mandhi.jpg" },
      { name: "Kanthari Mandhi (H)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 390, featured: false, veg: false, image: "/images/products/kanthari-mandhi.jpg" },
      { name: "Kanthari Mandhi (TQ)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 590, featured: false, veg: false, image: "/images/products/kanthari-mandhi.jpg" },
      { name: "Kanthari Mandhi (F)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 760, featured: false, veg: false, image: "/images/products/kanthari-mandhi.jpg" },
      { name: "Afghani Mandhi (Q)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 200, featured: false, veg: false, image: "/images/products/afghani-mandhi.jpg" },
      { name: "Afghani Mandhi (H)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 390, featured: false, veg: false, image: "/images/products/afghani-mandhi.jpg" },
      { name: "Afghani Mandhi (TQ)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 590, featured: false, veg: false, image: "/images/products/afghani-mandhi.jpg" },
      { name: "Afghani Mandhi (F)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 760, featured: false, veg: false, image: "/images/products/afghani-mandhi.jpg" },
      { name: "Shawaya Mandhi (Q)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 190, featured: false, veg: false, image: "/images/products/shawaya-mandhi.jpg" },
      { name: "Shawaya Mandhi (H)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 380, featured: false, veg: false, image: "/images/products/shawaya-mandhi.jpg" },
      { name: "Shawaya Mandhi (TQ)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 570, featured: false, veg: false, image: "/images/products/shawaya-mandhi.jpg" },
      { name: "Shawaya Mandhi (F)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 720, featured: false, veg: false, image: "/images/products/shawaya-mandhi.jpg" },
      { name: "Broast Mandhi (Q)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 220, featured: false, veg: false, image: "/images/products/broast-mandhi.jpg" },
      { name: "Broast Mandhi (H)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 420, featured: false, veg: false, image: "/images/products/broast-mandhi.jpg" },
      { name: "Broast Mandhi (TQ)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 620, featured: false, veg: false, image: "/images/products/broast-mandhi.jpg" },
      { name: "Broast Mandhi (F)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 780, featured: false, veg: false, image: "/images/products/broast-mandhi.jpg" },
      { name: "Beef Mandhi (Q)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 230, featured: false, veg: false, image: "/images/products/beef-mandhi.jpg" },
      { name: "Beef Mandhi (H)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 460, featured: false, veg: false, image: "/images/products/beef-mandhi.jpg" },
      { name: "Beef Mandhi (TQ)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 690, featured: false, veg: false, image: "/images/products/beef-mandhi.jpg" },
      { name: "Beef Mandhi (F)", description: "Mandhi at Khaleej Restaurant, Velliparamba.", price: 890, featured: false, veg: false, image: "/images/products/beef-mandhi.jpg" },
    ],
  },
  {
    name: "Tandoor",
    description: "Explore our tandoor at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/vegetarian-dishes.jpg",
    items: [
      { name: "Tandoori Chicken (Q)", description: "Tandoor at Khaleej Restaurant, Velliparamba.", price: 150, featured: true, veg: false, image: "/images/products/tandoori-chicken.jpg" },
      { name: "Tandoori Chicken (H)", description: "Tandoor at Khaleej Restaurant, Velliparamba.", price: 250, featured: false, veg: false, image: "/images/products/tandoori-chicken.jpg" },
      { name: "Tandoori Chicken (F)", description: "Tandoor at Khaleej Restaurant, Velliparamba.", price: 480, featured: false, veg: false, image: "/images/products/tandoori-chicken.jpg" },
      { name: "Chicken Tikka (Q)", description: "Tandoor at Khaleej Restaurant, Velliparamba.", price: 260, featured: false, veg: false, image: "/images/products/chicken-tikka.jpg" },
      { name: "Chicken Tikka (H)", description: "Price on request.", price: 0, featured: false, veg: false, image: "/images/products/chicken-tikka.jpg" },
      { name: "Chicken Tikka (F)", description: "Price on request.", price: 0, featured: false, veg: false, image: "/images/products/chicken-tikka.jpg" },
      { name: "Malai Kebab (Q)", description: "Tandoor at Khaleej Restaurant, Velliparamba.", price: 270, featured: false, veg: false, image: "/images/products/malai-kebab.jpg" },
      { name: "Malai Kebab (H)", description: "Price on request.", price: 0, featured: false, veg: false, image: "/images/products/malai-kebab.jpg" },
      { name: "Malai Kebab (F)", description: "Price on request.", price: 0, featured: false, veg: false, image: "/images/products/malai-kebab.jpg" },
      { name: "Hariyali Kebab (Q)", description: "Tandoor at Khaleej Restaurant, Velliparamba.", price: 270, featured: false, veg: false, image: "/images/products/hariyali-kebab.jpg" },
      { name: "Hariyali Kebab (H)", description: "Price on request.", price: 0, featured: false, veg: false, image: "/images/products/hariyali-kebab.jpg" },
      { name: "Hariyali Kebab (F)", description: "Price on request.", price: 0, featured: false, veg: false, image: "/images/products/hariyali-kebab.jpg" },
      { name: "Tongri Kebab (Q)", description: "Tandoor at Khaleej Restaurant, Velliparamba.", price: 260, featured: false, veg: false, image: "/images/products/tongri-kebab.jpg" },
      { name: "Tongri Kebab (H)", description: "Price on request.", price: 0, featured: false, veg: false, image: "/images/products/tongri-kebab.jpg" },
      { name: "Tongri Kebab (F)", description: "Price on request.", price: 0, featured: false, veg: false, image: "/images/products/tongri-kebab.jpg" },
      { name: "Tandoori Platter (Q)", description: "Half tandoori chicken, 4 pcs tikka, 4 pcs malai kebab, 2 pcs sheek kebab, 2 rotti, 2 butter naan, 2 garlic naan", price: 790, featured: false, veg: true, image: "/images/products/tandoori-platter.jpg" },
      { name: "Tandoori Platter (H)", description: "Half tandoori chicken, 4 pcs tikka, 4 pcs malai kebab, 2 pcs sheek kebab, 2 rotti, 2 butter naan, 2 garlic naan Price on request.", price: 0, featured: false, veg: true, image: "/images/products/tandoori-platter.jpg" },
      { name: "Tandoori Platter (F)", description: "Half tandoori chicken, 4 pcs tikka, 4 pcs malai kebab, 2 pcs sheek kebab, 2 rotti, 2 butter naan, 2 garlic naan Price on request.", price: 0, featured: false, veg: true, image: "/images/products/tandoori-platter.jpg" },
    ],
  },
  {
    name: "Arabic",
    description: "Explore our arabic at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/desserts.jpg",
    items: [
      { name: "Al Faham Normal (Q)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 130, featured: true, veg: false, image: "/images/products/al-faham-normal.jpg" },
      { name: "Al Faham Normal (H)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 250, featured: false, veg: false, image: "/images/products/al-faham-normal.jpg" },
      { name: "Al Faham Normal (F)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 480, featured: false, veg: false, image: "/images/products/al-faham-normal.jpg" },
      { name: "Peri Peri (Q)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 140, featured: false, veg: true, image: "/images/products/peri-peri.jpg" },
      { name: "Peri Peri (H)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 270, featured: false, veg: true, image: "/images/products/peri-peri.jpg" },
      { name: "Peri Peri (F)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 500, featured: false, veg: true, image: "/images/products/peri-peri.jpg" },
      { name: "Honey Chilli (Q)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 150, featured: false, veg: true, image: "/images/products/honey-chilli.jpg" },
      { name: "Honey Chilli (H)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 280, featured: false, veg: true, image: "/images/products/honey-chilli.jpg" },
      { name: "Honey Chilli (F)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 520, featured: false, veg: true, image: "/images/products/honey-chilli.jpg" },
      { name: "Kanthari (Q)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 150, featured: false, veg: true, image: "/images/products/kanthari.jpg" },
      { name: "Kanthari (H)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 280, featured: false, veg: true, image: "/images/products/kanthari.jpg" },
      { name: "Kanthari (F)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 500, featured: false, veg: true, image: "/images/products/kanthari.jpg" },
      { name: "Afghani (Q)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 150, featured: false, veg: true, image: "/images/products/afghani.jpg" },
      { name: "Afghani (H)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 280, featured: false, veg: true, image: "/images/products/afghani.jpg" },
      { name: "Afghani (F)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 520, featured: false, veg: true, image: "/images/products/afghani.jpg" },
      { name: "Masala Shawarma (Q)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 130, featured: false, veg: true, image: "/images/products/masala-shawarma.jpg" },
      { name: "Masala Shawarma (H)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 250, featured: false, veg: true, image: "/images/products/masala-shawarma.jpg" },
      { name: "Masala Shawarma (F)", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 480, featured: false, veg: true, image: "/images/products/masala-shawarma.jpg" },
      { name: "Shawarma Roll", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 90, featured: false, veg: true, image: "/images/products/shawarma-roll.jpg" },
      { name: "Shawarma Plate", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 110, featured: false, veg: true, image: "/images/products/shawarma-plate.jpg" },
      { name: "Rumali Roll", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 100, featured: false, veg: true, image: "/images/products/rumali-roll.jpg" },
      { name: "Rumali Plate", description: "Arabic at Khaleej Restaurant, Velliparamba.", price: 120, featured: false, veg: true, image: "/images/products/rumali-plate.jpg" },
    ],
  },
  {
    name: "Broast",
    description: "Explore our broast at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/beverages.jpg",
    items: [
      { name: "Broast Chicken (2 pcs)", description: "Broast at Khaleej Restaurant, Velliparamba.", price: 150, featured: true, veg: false, image: "/images/products/broast-chicken.jpg" },
      { name: "Broast Chicken (4 pcs)", description: "Broast at Khaleej Restaurant, Velliparamba.", price: 280, featured: false, veg: false, image: "/images/products/broast-chicken.jpg" },
      { name: "Broast Chicken (8 pcs)", description: "Broast at Khaleej Restaurant, Velliparamba.", price: 540, featured: false, veg: false, image: "/images/products/broast-chicken.jpg" },
    ],
  },
  {
    name: "Chinese Dry Items",
    description: "Explore our chinese dry items at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/beverages.jpg",
    items: [
      { name: "Gobi Manchurian", description: "Chinese Dry Items at Khaleej Restaurant, Velliparamba.", price: 120, featured: true, veg: true, image: "/images/products/gobi-manchurian.jpg" },
      { name: "Chilli Gobi", description: "Chinese Dry Items at Khaleej Restaurant, Velliparamba.", price: 120, featured: true, veg: true, image: "/images/products/chilli-gobi.jpg" },
      { name: "Paneer Chilli", description: "Chinese Dry Items at Khaleej Restaurant, Velliparamba.", price: 140, featured: true, veg: true, image: "/images/products/paneer-chilli.jpg" },
      { name: "Chilli Mushroom", description: "Chinese Dry Items at Khaleej Restaurant, Velliparamba.", price: 140, featured: false, veg: true, image: "/images/products/chilli-mushroom.jpg" },
    ],
  },
  {
    name: "Beef, Fish & Seafood",
    description: "Explore our beef, fish & seafood at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/beverages.jpg",
    items: [
      { name: "Beef Fry", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 150, featured: true, veg: false, image: "/images/products/beef-fry.jpg" },
      { name: "Beef Roast", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 160, featured: true, veg: false, image: "/images/products/beef-roast.jpg" },
      { name: "Beef Masala", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 160, featured: true, veg: false, image: "/images/products/beef-masala.jpg" },
      { name: "Chilli Beef", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 150, featured: false, veg: false, image: "/images/products/chilli-beef.jpg" },
      { name: "Beef Kondattam", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/beef-kondattam.jpg" },
      { name: "Ginger Beef", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/ginger-beef.jpg" },
      { name: "Pepper Beef", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/pepper-beef.jpg" },
      { name: "Fish Roast", description: "Price as per size — confirm with restaurant.", price: 0, featured: false, veg: false, image: "/images/products/fish-roast.jpg" },
      { name: "Fish Masala", description: "Price as per size — confirm with restaurant.", price: 0, featured: false, veg: false, image: "/images/products/fish-masala.jpg" },
      { name: "Fish Molly", description: "Price as per size — confirm with restaurant.", price: 0, featured: false, veg: false, image: "/images/products/fish-molly.jpg" },
      { name: "Fish Pollichathu", description: "Price as per size — confirm with restaurant.", price: 0, featured: false, veg: false, image: "/images/products/fish-pollichathu.jpg" },
      { name: "Prawns Fry", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 190, featured: false, veg: false, image: "/images/products/prawns-fry.jpg" },
      { name: "Prawns Roast", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 210, featured: false, veg: false, image: "/images/products/prawns-roast.jpg" },
      { name: "Prawns Masala", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 220, featured: false, veg: false, image: "/images/products/prawns-masala.jpg" },
      { name: "Prawns Kizhi", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 230, featured: false, veg: false, image: "/images/products/prawns-kizhi.jpg" },
      { name: "Squid Dry Fry", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/squid-dry-fry.jpg" },
      { name: "Squid Roast", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 170, featured: false, veg: false, image: "/images/products/squid-roast.jpg" },
      { name: "Squid Masala", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 180, featured: false, veg: false, image: "/images/products/squid-masala.jpg" },
      { name: "Squid Kizhi", description: "Beef, Fish & Seafood at Khaleej Restaurant, Velliparamba.", price: 180, featured: false, veg: false, image: "/images/products/squid-kizhi.jpg" },
    ],
  },
  {
    name: "Chinese Curries",
    description: "Explore our chinese curries at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/beverages.jpg",
    items: [
      { name: "Chilli Chicken (Q)", description: "Chinese Curries at Khaleej Restaurant, Velliparamba.", price: 150, featured: true, veg: false, image: "/images/products/chilli-chicken.jpg" },
      { name: "Chilli Chicken (H)", description: "Chinese Curries at Khaleej Restaurant, Velliparamba.", price: 280, featured: false, veg: false, image: "/images/products/chilli-chicken.jpg" },
      { name: "Chilli Chicken (F)", description: "Chinese Curries at Khaleej Restaurant, Velliparamba.", price: 560, featured: false, veg: false, image: "/images/products/chilli-chicken.jpg" },
      { name: "Ginger Chicken (Q)", description: "Chinese Curries at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/ginger-chicken.jpg" },
      { name: "Ginger Chicken (H)", description: "Chinese Curries at Khaleej Restaurant, Velliparamba.", price: 300, featured: false, veg: false, image: "/images/products/ginger-chicken.jpg" },
      { name: "Ginger Chicken (F)", description: "Chinese Curries at Khaleej Restaurant, Velliparamba.", price: 590, featured: false, veg: false, image: "/images/products/ginger-chicken.jpg" },
      { name: "Pepper Chicken (Q)", description: "Chinese Curries at Khaleej Restaurant, Velliparamba.", price: 150, featured: false, veg: false, image: "/images/products/pepper-chicken.jpg" },
      { name: "Pepper Chicken (H)", description: "Chinese Curries at Khaleej Restaurant, Velliparamba.", price: 280, featured: false, veg: false, image: "/images/products/pepper-chicken.jpg" },
      { name: "Pepper Chicken (F)", description: "Chinese Curries at Khaleej Restaurant, Velliparamba.", price: 560, featured: false, veg: false, image: "/images/products/pepper-chicken.jpg" },
    ],
  },
  {
    name: "Chinese Rice & Noodles",
    description: "Explore our chinese rice & noodles at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/beverages.jpg",
    items: [
      { name: "Veg Fried Rice", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 140, featured: true, veg: true, image: "/images/products/veg-fried-rice.jpg" },
      { name: "Chicken Fried Rice", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 180, featured: true, veg: false, image: "/images/products/chicken-fried-rice.jpg" },
      { name: "Egg Fried Rice", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 160, featured: true, veg: false, image: "/images/products/egg-fried-rice.jpg" },
      { name: "Mixed Fried Rice", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 200, featured: false, veg: true, image: "/images/products/mixed-fried-rice.jpg" },
      { name: "Schezwan Chicken", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 220, featured: false, veg: false, image: "/images/products/schezwan-chicken.jpg" },
      { name: "Schezwan Egg", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 190, featured: false, veg: false, image: "/images/products/schezwan-egg.jpg" },
      { name: "Schezwan Veg", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 180, featured: false, veg: true, image: "/images/products/schezwan-veg.jpg" },
      { name: "Schezwan Mix 2", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 240, featured: false, veg: true, image: "/images/products/schezwan-mix-2.jpg" },
      { name: "Singapore Fried Rice", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: true, image: "/images/products/singapore-fried-rice.jpg" },
      { name: "Shanghai Fried Rice", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 170, featured: false, veg: true, image: "/images/products/shanghai-fried-rice.jpg" },
      { name: "Triple Fried Rice", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 190, featured: false, veg: true, image: "/images/products/triple-fried-rice.jpg" },
      { name: "Banen Fried Rice", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 180, featured: false, veg: true, image: "/images/products/banen-fried-rice.jpg" },
      { name: "Veg Noodles", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 130, featured: false, veg: true, image: "/images/products/veg-noodles.jpg" },
      { name: "Egg Noodles", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/egg-noodles.jpg" },
      { name: "Chicken Noodles", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 170, featured: false, veg: false, image: "/images/products/chicken-noodles.jpg" },
      { name: "Mixed Noodles", description: "Chinese Rice & Noodles at Khaleej Restaurant, Velliparamba.", price: 190, featured: false, veg: true, image: "/images/products/mixed-noodles.jpg" },
    ],
  },
  {
    name: "Curries",
    description: "Explore our curries at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/beverages.jpg",
    items: [
      { name: "Kadai Chicken (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 150, featured: true, veg: false, image: "/images/products/kadai-chicken.jpg" },
      { name: "Kadai Chicken (H)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 280, featured: false, veg: false, image: "/images/products/kadai-chicken.jpg" },
      { name: "Kadai Chicken (F)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 560, featured: false, veg: false, image: "/images/products/kadai-chicken.jpg" },
      { name: "Hyderabadi Chicken (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/hyderabadi-chicken.jpg" },
      { name: "Hyderabadi Chicken (H)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 300, featured: false, veg: false, image: "/images/products/hyderabadi-chicken.jpg" },
      { name: "Hyderabadi Chicken (F)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 600, featured: false, veg: false, image: "/images/products/hyderabadi-chicken.jpg" },
      { name: "Malai Chicken (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 150, featured: false, veg: false, image: "/images/products/malai-chicken.jpg" },
      { name: "Malai Chicken (H)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 290, featured: false, veg: false, image: "/images/products/malai-chicken.jpg" },
      { name: "Malai Chicken (F)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 580, featured: false, veg: false, image: "/images/products/malai-chicken.jpg" },
      { name: "Mughlai Chicken (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 150, featured: false, veg: false, image: "/images/products/mughlai-chicken.jpg" },
      { name: "Mughlai Chicken (H)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 290, featured: false, veg: false, image: "/images/products/mughlai-chicken.jpg" },
      { name: "Mughlai Chicken (F)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 580, featured: false, veg: false, image: "/images/products/mughlai-chicken.jpg" },
      { name: "Chicken Kurma (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 140, featured: false, veg: false, image: "/images/products/chicken-kurma.jpg" },
      { name: "Chicken Kurma (H)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 270, featured: false, veg: false, image: "/images/products/chicken-kurma.jpg" },
      { name: "Chicken Kurma (F)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 460, featured: false, veg: false, image: "/images/products/chicken-kurma.jpg" },
      { name: "Patiala Chicken (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 150, featured: false, veg: false, image: "/images/products/patiala-chicken.jpg" },
      { name: "Patiala Chicken (H)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 290, featured: false, veg: false, image: "/images/products/patiala-chicken.jpg" },
      { name: "Patiala Chicken (F)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 580, featured: false, veg: false, image: "/images/products/patiala-chicken.jpg" },
      { name: "Punjabi Chicken (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 160, featured: false, veg: false, image: "/images/products/punjabi-chicken.jpg" },
      { name: "Punjabi Chicken (H)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 300, featured: false, veg: false, image: "/images/products/punjabi-chicken.jpg" },
      { name: "Punjabi Chicken (F)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 600, featured: false, veg: false, image: "/images/products/punjabi-chicken.jpg" },
      { name: "Tikka Masala (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 150, featured: false, veg: false, image: "/images/products/tikka-masala.jpg" },
      { name: "Tikka Masala (H)", description: "Price on request.", price: 0, featured: false, veg: false, image: "/images/products/tikka-masala.jpg" },
      { name: "Tikka Masala (F)", description: "Price on request.", price: 0, featured: false, veg: false, image: "/images/products/tikka-masala.jpg" },
      { name: "Paneer Butter Masala (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 140, featured: false, veg: true, image: "/images/products/paneer-butter-masala.jpg" },
      { name: "Paneer Butter Masala (H)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/paneer-butter-masala.jpg" },
      { name: "Paneer Butter Masala (F)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/paneer-butter-masala.jpg" },
      { name: "Kadai Paneer (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 140, featured: false, veg: true, image: "/images/products/kadai-paneer.jpg" },
      { name: "Kadai Paneer (H)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/kadai-paneer.jpg" },
      { name: "Kadai Paneer (F)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/kadai-paneer.jpg" },
      { name: "Mushroom Masala (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 130, featured: false, veg: true, image: "/images/products/mushroom-masala.jpg" },
      { name: "Mushroom Masala (H)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/mushroom-masala.jpg" },
      { name: "Mushroom Masala (F)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/mushroom-masala.jpg" },
      { name: "Kadai Mushroom (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 130, featured: false, veg: true, image: "/images/products/kadai-mushroom.jpg" },
      { name: "Kadai Mushroom (H)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/kadai-mushroom.jpg" },
      { name: "Kadai Mushroom (F)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/kadai-mushroom.jpg" },
      { name: "Kadai Veg (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 130, featured: false, veg: true, image: "/images/products/kadai-veg.jpg" },
      { name: "Kadai Veg (H)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/kadai-veg.jpg" },
      { name: "Kadai Veg (F)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/kadai-veg.jpg" },
      { name: "Veg Kurma (Q)", description: "Curries at Khaleej Restaurant, Velliparamba.", price: 120, featured: false, veg: true, image: "/images/products/veg-kurma.jpg" },
      { name: "Veg Kurma (H)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/veg-kurma.jpg" },
      { name: "Veg Kurma (F)", description: "Price on request.", price: 0, featured: false, veg: true, image: "/images/products/veg-kurma.jpg" },
    ],
  },
  {
    name: "Special",
    description: "Explore our special at Khaleej Restaurant, Velliparamba.",
    image: "/images/categories/beverages.jpg",
    items: [
      { name: "Khaleej Special Porotta", description: "Price on request.", price: 0, featured: true, veg: true, image: "/images/products/khaleej-special-porotta.jpg" },
    ],
  },
];

export function seed(db: Database.Database) {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const adminCount = (db.prepare("SELECT COUNT(*) AS n FROM admins").get() as { n: number }).n;
  if (adminCount === 0) {
    db.prepare("INSERT INTO admins (username, passwordHash) VALUES (?, ?)").run(
      "admin",
      hashPassword(adminPassword)
    );
  }

  const categoryCount = (db.prepare("SELECT COUNT(*) AS n FROM food_categories").get() as { n: number }).n;
  if (categoryCount === 0) {
    const insertCategory = db.prepare(
      "INSERT INTO food_categories (name, slug, description, image, sortOrder) VALUES (?, ?, ?, ?, ?)"
    );
    const insertItem = db.prepare(`
      INSERT INTO food_items
        (categoryId, name, slug, description, price, stock, imageUrl, featured, available, veg)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    const insertImage = db.prepare(
      "INSERT INTO food_images (itemId, url, alt, sortOrder) VALUES (?, ?, ?, 0)"
    );

    db.transaction(() => {
      CATEGORIES.forEach((category, categoryIndex) => {
        const result = insertCategory.run(
          category.name,
          slugify(category.name),
          category.description,
          category.image,
          categoryIndex
        );
        const categoryId = Number(result.lastInsertRowid);

        category.items.forEach((item) => {
          const slug = slugify(item.name);
          const itemResult = insertItem.run(
            categoryId,
            item.name,
            slug,
            item.description,
            item.price,
            25 + ((categoryIndex * 7 + item.name.length) % 40),
            item.image || `/images/dishes/${slug}.jpg`,
            item.featured ? 1 : 0,
            item.veg === false ? 0 : 1
          );
          insertImage.run(
            Number(itemResult.lastInsertRowid),
            item.image || `/images/dishes/${slug}.jpg`,
            item.name
          );
        });
      });
    })();
  }

  const tableCount = (db.prepare("SELECT COUNT(*) AS n FROM restaurant_tables").get() as { n: number }).n;
  if (tableCount === 0) {
    const insertTable = db.prepare(
      "INSERT INTO restaurant_tables (name, seats, active) VALUES (?, ?, 1)"
    );
    db.transaction(() => {
      [
        ["T01", 2],
        ["T02", 2],
        ["T03", 4],
        ["T04", 4],
        ["T05", 4],
        ["T06", 6],
        ["T07", 6],
        ["T08", 8],
      ].forEach(([name, seats]) => insertTable.run(name, seats));
    })();
  }

  const couponCount = (db.prepare("SELECT COUNT(*) AS n FROM coupons").get() as { n: number }).n;
  if (couponCount === 0) {
    const insertCoupon = db.prepare(
      "INSERT INTO coupons (code, type, value, minOrder, active, expiresAt, usageLimit) VALUES (?, ?, ?, ?, 1, NULL, NULL)"
    );
    insertCoupon.run("WELCOME10", "PERCENT", 10, 300);
    insertCoupon.run("KALEEJ100", "FIXED", 100, 600);
    insertCoupon.run("FREESHIP", "FIXED", 40, 400);
  }

  const settingCount = (db.prepare("SELECT COUNT(*) AS n FROM restaurant_settings").get() as { n: number }).n;
  if (settingCount === 0) {
    const insertSetting = db.prepare(
      "INSERT INTO restaurant_settings (key, value) VALUES (?, ?)"
    );
    db.transaction(() => {
      Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) =>
        insertSetting.run(key, JSON.stringify(value))
      );
    })();
  }
}
