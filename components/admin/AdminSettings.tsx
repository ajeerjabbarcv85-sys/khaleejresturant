"use client";

import { useEffect, useState } from "react";
import { Save, Tag, Trash2, MessageSquare, Check, X, Loader2 } from "lucide-react";
import { money } from "@/lib/utils";
import { api } from "@/lib/api";
import { PageHeading, Toggle } from "@/components/admin/ui";
import type { Coupon, Feedback, RestaurantSettings } from "@/lib/types";

export default function AdminSettings({
  settings,
  coupons,
  feedback,
  onRefresh,
  notify,
}: {
  settings: RestaurantSettings;
  coupons: Coupon[];
  feedback: Feedback[];
  onRefresh: () => void;
  notify: (message: string, ok?: boolean) => void;
}) {
  const [form, setForm] = useState<RestaurantSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: "", type: "PERCENT", value: "10", minOrder: "300" });
  const [slotText, setSlotText] = useState((settings.timeSlots || []).join(", "));

  useEffect(() => {
    setForm(settings);
    setSlotText((settings.timeSlots || []).join(", "));
  }, [settings]);

  const set = (key: keyof RestaurantSettings, value: unknown) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.saveSettings({ ...form, timeSlots: slotText.split(",").map((slot) => slot.trim()).filter(Boolean) });
      notify("Settings saved — the website has been updated");
      onRefresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to save settings", false);
    } finally {
      setSaving(false);
    }
  };

  const addCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.createCoupon({
        code: couponForm.code.trim().toUpperCase(),
        type: couponForm.type as "PERCENT" | "FIXED",
        value: Number(couponForm.value),
        minOrder: Number(couponForm.minOrder),
      });
      notify("Coupon created");
      setCouponForm({ code: "", type: "PERCENT", value: "10", minOrder: "300" });
      onRefresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to create coupon", false);
    }
  };

  const toggleCoupon = async (coupon: Coupon) => {
    try {
      await api.toggleCoupon(coupon.id, !coupon.active);
      notify("Coupon updated");
      onRefresh();
    } catch {
      notify("Unable to update coupon", false);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!window.confirm("Delete this coupon?")) return;
    await api.deleteCoupon(id);
    notify("Coupon deleted");
    onRefresh();
  };

  const approveFeedback = async (item: Feedback) => {
    try {
      await api.approveFeedback(item.id, !item.approved);
      notify(item.approved ? "Feedback hidden" : "Feedback published");
      onRefresh();
    } catch {
      notify("Unable to update feedback", false);
    }
  };

  return (
    <div>
      <PageHeading title="Website settings" subtitle="Control the identity, contact details and content shown across the site." />

      <form onSubmit={save} className="mt-7 grid gap-6 xl:grid-cols-2">
        <section className="h-fit rounded-sm border border-olive-dark/10 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-olive-dark">Brand & homepage</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label><span className="label">Restaurant name</span><input value={form.restaurantName} onChange={(e) => set("restaurantName", e.target.value)} className="field" /></label>
            <label><span className="label">Tagline</span><input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="field" /></label>
            <label className="sm:col-span-2"><span className="label">Logo image URL</span><input value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} className="field" placeholder="Leave blank for text logo" /></label>
            <label className="sm:col-span-2"><span className="label">Hero heading</span><input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} className="field" /></label>
            <label className="sm:col-span-2"><span className="label">Hero script heading</span><input value={form.heroScript} onChange={(e) => set("heroScript", e.target.value)} className="field" /></label>
            <label className="sm:col-span-2"><span className="label">Hero introduction</span><textarea rows={3} value={form.heroIntro} onChange={(e) => set("heroIntro", e.target.value)} className="field" /></label>
            <label className="sm:col-span-2"><span className="label">About heading</span><input value={form.aboutTitle} onChange={(e) => set("aboutTitle", e.target.value)} className="field" /></label>
            <label className="sm:col-span-2"><span className="label">Our story</span><textarea rows={4} value={form.aboutStory} onChange={(e) => set("aboutStory", e.target.value)} className="field" /></label>
            <label><span className="label">Chef name</span><input value={form.chefName} onChange={(e) => set("chefName", e.target.value)} className="field" /></label>
            <label><span className="label">Chef title</span><input value={form.chefTitle} onChange={(e) => set("chefTitle", e.target.value)} className="field" /></label>
            <label className="sm:col-span-2"><span className="label">Chef bio</span><textarea rows={2} value={form.chefBio} onChange={(e) => set("chefBio", e.target.value)} className="field" /></label>
            <label><span className="label">Promo title</span><input value={form.promoTitle} onChange={(e) => set("promoTitle", e.target.value)} className="field" /></label>
            <label><span className="label">Promo text</span><input value={form.promoText} onChange={(e) => set("promoText", e.target.value)} className="field" /></label>
            <label className="sm:col-span-2"><span className="label">Reservation time slots (comma separated)</span><textarea rows={3} value={slotText} onChange={(e) => setSlotText(e.target.value)} className="field" placeholder="11:00, 11:30, 19:00" /></label>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-sm border border-olive-dark/10 bg-white p-6">
            <h2 className="font-display text-lg font-bold text-olive-dark">Contact & hours</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="label">Address</span><input value={form.address} onChange={(e) => set("address", e.target.value)} className="field" /></label>
              <label className="sm:col-span-2"><span className="label">Google Maps location link</span><input value={form.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} className="field" placeholder="https://maps.app.goo.gl/..." /></label>
              <label className="sm:col-span-2"><span className="label">Google Maps embed URL</span><input value={form.mapEmbedUrl} onChange={(e) => set("mapEmbedUrl", e.target.value)} className="field" placeholder="https://maps.google.com/maps?q=...&output=embed" /></label>
              <label><span className="label">Phone</span><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="field" /></label>
              <label><span className="label">Email</span><input value={form.email} onChange={(e) => set("email", e.target.value)} className="field" /></label>
              <label className="sm:col-span-2"><span className="label">Opening hours</span><input value={form.openingHours} onChange={(e) => set("openingHours", e.target.value)} className="field" /></label>
              <label><span className="label">WhatsApp URL</span><input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="field" /></label>
              <label><span className="label">Instagram URL</span><input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className="field" /></label>
              <label className="sm:col-span-2"><span className="label">Facebook URL</span><input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} className="field" /></label>
            </div>
          </section>

          <section className="rounded-sm border border-olive-dark/10 bg-white p-6">
            <h2 className="font-display text-lg font-bold text-olive-dark">Charges</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label><span className="label">Tax %</span><input type="number" min="0" value={form.taxPercent} onChange={(e) => set("taxPercent", Number(e.target.value))} className="field" /></label>
              <label><span className="label">Delivery fee</span><input type="number" min="0" value={form.deliveryFee} onChange={(e) => set("deliveryFee", Number(e.target.value))} className="field" /></label>
              <label><span className="label">Free delivery above</span><input type="number" min="0" value={form.freeDeliveryAbove} onChange={(e) => set("freeDeliveryAbove", Number(e.target.value))} className="field" /></label>
            </div>
          </section>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save all settings</>}
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-sm border border-olive-dark/10 bg-white p-6">
          <div className="flex items-center gap-2"><Tag size={17} className="text-olive" /><h2 className="font-display text-lg font-bold text-olive-dark">Coupons & offers</h2></div>
          <form onSubmit={addCoupon} className="mt-5 grid gap-3 sm:grid-cols-4">
            <input required value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} placeholder="CODE" className="field uppercase" />
            <select value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })} className="field">
              <option value="PERCENT">Percent</option><option value="FIXED">Fixed</option>
            </select>
            <input required type="number" min="0" value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} placeholder="Value" className="field" />
            <button type="submit" className="btn-dark !px-3 !text-[10px]">Add</button>
            <input type="number" min="0" value={couponForm.minOrder} onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })} placeholder="Min order" className="field sm:col-span-4" />
          </form>
          <div className="mt-5 space-y-2">
            {coupons.length === 0 ? <p className="py-4 text-center text-sm text-black/45">No coupons yet.</p> : coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center gap-3 rounded-sm border border-olive-dark/10 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-olive-dark">{coupon.code} <span className="ml-1 text-[10px] font-normal text-black/40">{coupon.type === "PERCENT" ? `${coupon.value}%` : money(coupon.value)} off · min {money(coupon.minOrder)}</span></p>
                  <p className="text-[10px] text-black/40">Used {coupon.usedCount} times</p>
                </div>
                <Toggle checked={coupon.active} onChange={() => toggleCoupon(coupon)} />
                <button type="button" onClick={() => deleteCoupon(coupon.id)} className="text-olive-dark/35 hover:text-olive" aria-label="Delete coupon"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-sm border border-olive-dark/10 bg-white p-6">
          <div className="flex items-center gap-2"><MessageSquare size={17} className="text-olive" /><h2 className="font-display text-lg font-bold text-olive-dark">Guest feedback</h2></div>
          <div className="mt-5 max-h-96 space-y-3 overflow-y-auto">
            {feedback.length === 0 ? <p className="py-6 text-center text-sm text-black/45">No feedback received yet.</p> : feedback.map((item) => (
              <div key={item.id} className="rounded-sm border border-olive-dark/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-olive-dark">{item.name} <span className="text-amber-500">{'★'.repeat(item.rating)}</span></p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${item.approved ? "text-green-700" : "text-black/35"}`}>{item.approved ? "Published" : "Pending"}</span>
                    <button type="button" onClick={() => approveFeedback(item)} className="text-olive-dark/45 hover:text-olive" aria-label="Toggle approval">{item.approved ? <X size={14} /> : <Check size={14} />}</button>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-6 text-black/55">“{item.message}”</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
