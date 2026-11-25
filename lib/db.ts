import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA } from "@/lib/schema";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { seed } from "@/lib/seed";
import type { FoodItem, Category, RestaurantSettings } from "@/lib/types";

const globalForDb = globalThis as unknown as { kaleejDb?: Database.Database };

function createDatabase(): Database.Database {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "restaurant.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  seed(db);
  db.prepare("UPDATE food_categories SET image = REPLACE(image, '.svg', '.jpg') WHERE image LIKE '/images/%.svg'").run();
  db.prepare("UPDATE food_items SET imageUrl = REPLACE(imageUrl, '.svg', '.jpg') WHERE imageUrl LIKE '/images/%.svg'").run();
  db.prepare("UPDATE food_images SET url = REPLACE(url, '.svg', '.jpg') WHERE url LIKE '/images/%.svg'").run();
  return db;
}

export const db = globalForDb.kaleejDb ?? createDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.kaleejDb = db;

export function getSettings(): RestaurantSettings {
  const rows = db
    .prepare("SELECT key, value FROM restaurant_settings")
    .all() as { key: string; value: string }[];
  const values = Object.fromEntries(
    rows.map((row) => {
      try {
        return [row.key, JSON.parse(row.value)];
      } catch {
        return [row.key, row.value];
      }
    })
  ) as Partial<RestaurantSettings>;

  return { ...DEFAULT_SETTINGS, ...values };
}

export function toBoolean(value: unknown): boolean {
  return value === 1 || value === true || String(value).toUpperCase() === "TRUE";
}

export function mapItem(row: Record<string, unknown>): FoodItem {
  return {
    id: Number(row.id),
    categoryId: Number(row.categoryId),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description || ""),
    price: Number(row.price),
    stock: Number(row.stock),
    imageUrl: String(row.imageUrl || ""),
    featured: toBoolean(row.featured),
    available: toBoolean(row.available),
    veg: toBoolean(row.veg),
    categoryName: row.categoryName ? String(row.categoryName) : undefined,
    createdAt: row.createdAt ? String(row.createdAt) : undefined,
  };
}

export function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description || ""),
    image: String(row.image || ""),
    sortOrder: Number(row.sortOrder),
    active: toBoolean(row.active),
    itemCount: row.itemCount === undefined ? undefined : Number(row.itemCount),
  };
}
