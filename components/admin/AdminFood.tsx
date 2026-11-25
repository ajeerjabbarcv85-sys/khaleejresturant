"use client";

import { useRef, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, FolderPlus, X } from "lucide-react";
import { money } from "@/lib/utils";
import { api } from "@/lib/api";
import { Modal, PageHeading, Toggle, EmptyState } from "@/components/admin/ui";
import type { Category, FoodItem } from "@/lib/types";

type Props = {
  items: FoodItem[];
  categories: Category[];
  onRefresh: () => void;
  notify: (message: string, ok?: boolean) => void;
};

const blankItem = {
  name: "",
  categoryId: 0,
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  featured: false,
  available: true,
  veg: true,
};

export default function AdminFood({ items, categories, onRefresh, notify }: Props) {
  const [itemOpen, setItemOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ ...blankItem, categoryId: categories[0]?.id || 0 });
  const [imageData, setImageData] = useState("");
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", image: "" });
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const visible = filter === "all" ? items : items.filter((item) => String(item.categoryId) === filter);

  const openItem = (item?: FoodItem) => {
    setEditing(item?.id || null);
    setForm(
      item
        ? {
            name: item.name,
            categoryId: item.categoryId,
            description: item.description,
            price: String(item.price),
            stock: String(item.stock),
            imageUrl: item.imageUrl,
            featured: item.featured,
            available: item.available,
            veg: item.veg,
          }
        : { ...blankItem, categoryId: categories[0]?.id || 0 }
    );
    setImageData("");
    setItemOpen(true);
  };

  const openCategory = (category?: Category) => {
    setEditingCategory(category?.id || null);
    setCategoryForm(
      category
        ? { name: category.name, description: category.description, image: category.image }
        : { name: "", description: "", image: "" }
    );
    setCategoryOpen(true);
  };

  const readFile = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify("Images must be under 5 MB", false);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageData(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const saveItem = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        stock: Number(form.stock),
        ...(imageData ? { imageData } : {}),
      };
      if (editing) await api.updateItem(editing, payload);
      else await api.createItem(payload);
      notify(editing ? "Item updated" : "Item added");
      setItemOpen(false);
      onRefresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to save item", false);
    } finally {
      setBusy(false);
    }
  };

  const saveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (editingCategory) await api.updateCategory(editingCategory, categoryForm);
      else await api.createCategory(categoryForm);
      notify(editingCategory ? "Category updated" : "Category added");
      setCategoryOpen(false);
      onRefresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to save category", false);
    } finally {
      setBusy(false);
    }
  };

  const removeItem = async (item: FoodItem) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteItem(item.id);
      notify("Item deleted");
      onRefresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to delete item", false);
    }
  };

  const toggleAvailable = async (item: FoodItem) => {
    try {
      await api.updateItem(item.id, { available: !item.available });
      notify(item.available ? "Item hidden from menu" : "Item is now available");
      onRefresh();
    } catch {
      notify("Unable to update availability", false);
    }
  };

  const removeCategory = async (category: Category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await api.deleteCategory(category.id);
      notify("Category deleted");
      onRefresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to delete category", false);
    }
  };

  return (
    <div>
      <PageHeading
        title="Food management"
        subtitle="Add dishes, update prices, manage categories and control availability."
        action={
          <div className="flex gap-2">
            <button type="button" onClick={() => openCategory()} className="btn-dark !py-2.5 !text-[10px]"><FolderPlus size={14} /> Category</button>
            <button type="button" onClick={() => openItem()} className="btn-primary !py-2.5 !text-[10px]"><Plus size={14} /> New item</button>
          </div>
        }
      />

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-sm border border-olive-dark/10 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-olive-dark/10 p-4">
            <button type="button" onClick={() => setFilter("all")} className={`rounded-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${filter === "all" ? "bg-olive-dark text-white" : "bg-cream text-black/50"}`}>All</button>
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => setFilter(String(category.id))} className={`rounded-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${filter === String(category.id) ? "bg-olive text-white" : "bg-cream text-black/50"}`}>
                {category.name}
              </button>
            ))}
          </div>
          {visible.length === 0 ? (
            <EmptyState title="No items found" text="Add your first dish to get started." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-cream text-[10px] uppercase tracking-wider text-black/45">
                  <tr>
                    <th className="px-5 py-3">Dish</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Available</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive-dark/10">
                  {visible.map((item) => (
                    <tr key={item.id} className="hover:bg-cream/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-sm object-cover" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-olive-dark">{item.name}</p>
                            {item.featured && <span className="text-[9px] font-bold uppercase tracking-wider text-olive">Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-black/55">{item.categoryName}</td>
                      <td className="px-5 py-3 font-bold text-olive-dark">{money(item.price)}</td>
                      <td className="px-5 py-3">{item.stock}</td>
                      <td className="px-5 py-3"><Toggle checked={item.available} onChange={() => toggleAvailable(item)} /></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => openItem(item)} className="flex h-8 w-8 items-center justify-center rounded-sm border border-olive-dark/15 text-olive-dark hover:bg-olive-dark hover:text-white" aria-label="Edit item"><Pencil size={13} /></button>
                          <button type="button" onClick={() => removeItem(item)} className="flex h-8 w-8 items-center justify-center rounded-sm border border-olive/20 text-olive hover:bg-olive hover:text-white" aria-label="Delete item"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="h-fit rounded-sm border border-olive-dark/10 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-olive-dark">Categories</h2>
          <p className="mt-1 text-xs text-black/45">Shown in the customer menu filter.</p>
          <div className="mt-5 space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-3 rounded-sm border border-olive-dark/10 p-3">
                <img src={category.image || "/images/categories/breakfast.jpg"} alt="" className="h-9 w-9 rounded-sm object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-olive-dark">{category.name}</p>
                  <p className="text-[10px] text-black/40">{category.itemCount || 0} items</p>
                </div>
                <button type="button" onClick={() => openCategory(category)} className="text-olive-dark/50 hover:text-olive" aria-label="Edit category"><Pencil size={13} /></button>
                <button type="button" onClick={() => removeCategory(category)} className="text-olive-dark/50 hover:text-olive" aria-label="Delete category"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={itemOpen} onClose={() => setItemOpen(false)} title={editing ? "Edit dish" : "Add a new dish"} wide>
        <form onSubmit={saveItem} className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="label">Dish name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="e.g. Kaleej Signature Grill" />
          </label>
          <label>
            <span className="label">Category</span>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })} className="field">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Price (₹)</span>
            <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="field" />
          </label>
          <label>
            <span className="label">Stock</span>
            <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="field" />
          </label>
          <label>
            <span className="label">Image URL</span>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="field" placeholder="/images/dishes/..." />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Description</span>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field" />
          </label>
          <div className="sm:col-span-2">
            <span className="label">Food photograph</span>
            <div className="flex items-center gap-4 rounded-sm border border-dashed border-olive-dark/20 p-4">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-sm bg-cream">
                {(imageData || form.imageUrl) ? <img src={imageData || form.imageUrl} alt="Preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-olive-dark/25"><ImagePlus size={24} /></div>}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => readFile(e.target.files?.[0])} />
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-dark !py-2 !text-[10px]">Choose image</button>
                <p className="mt-2 text-[10px] text-black/40">JPG, PNG, WEBP or SVG · max 5 MB</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <Toggle checked={form.veg} onChange={(value) => setForm({ ...form, veg: value })} label="Vegetarian" />
            <Toggle checked={form.featured} onChange={(value) => setForm({ ...form, featured: value })} label="Feature on homepage" />
            <Toggle checked={form.available} onChange={(value) => setForm({ ...form, available: value })} label="Available to order" />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button type="button" onClick={() => setItemOpen(false)} className="btn-dark flex-1">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? "Saving..." : editing ? "Save changes" : "Add dish"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={categoryOpen} onClose={() => setCategoryOpen(false)} title={editingCategory ? "Edit category" : "Add a category"}>
        <form onSubmit={saveCategory} className="space-y-5">
          <label className="block">
            <span className="label">Category name</span>
            <input required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="field" />
          </label>
          <label className="block">
            <span className="label">Description</span>
            <textarea rows={2} value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="field" />
          </label>
          <label className="block">
            <span className="label">Image URL</span>
            <input value={categoryForm.image} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })} className="field" />
          </label>
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? "Saving..." : "Save category"}</button>
        </form>
      </Modal>
    </div>
  );
}
