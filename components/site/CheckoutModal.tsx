"use client";

import { useState } from "react";
import { ArrowLeft, X, MapPin, Store, Banknote, Loader2, ShieldCheck } from "lucide-react";
import { money, isValidEmail, isValidPhone } from "@/lib/utils";
import { api } from "@/lib/api";
import type { CartLine, PlacedOrder, RestaurantSettings } from "@/lib/types";

type Props = {
  open: boolean;
  lines: CartLine[];
  settings: RestaurantSettings;
  onClose: () => void;
  onBack: () => void;
  onPlaced: (orders: PlacedOrder[], orderCode: string) => void;
};

export default function CheckoutModal({ open, lines, settings, onClose, onBack, onPlaced }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const tax = Math.round((subtotal * Number(settings.taxPercent || 0)) / 100);
  const delivery = orderType === "PICKUP" || subtotal >= Number(settings.freeDeliveryAbove || 0) ? 0 : Number(settings.deliveryFee || 0);
  const total = subtotal + tax + delivery;

  if (!open) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidPhone(phone)) { setError("Enter a valid 10-digit phone number"); return; }
    if (email && !isValidEmail(email)) { setError("Enter a valid email address"); return; }
    if (orderType === "DELIVERY" && address.trim().length < 8) { setError("Enter a complete delivery address"); return; }

    setBusy(true);
    setError(null);
    try {
      const result = await api.createOrder({
        name,
        phone,
        email,
        address,
        orderType,
        paymentMethod: "COD",
        notes,
        items: lines.map((line) => ({ itemId: Number(line.item.id), qty: line.qty })),
      });

      const placed: PlacedOrder[] = lines.map((line) => ({
        orderId: result.orderId,
        orderCode: result.orderCode,
        total: line.item.price * line.qty,
        itemName: line.item.name,
        qty: line.qty,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "COD",
        orderType,
        address: result.address,
      }));
      onPlaced(placed, result.orderCode);
      setName(""); setPhone(""); setEmail(""); setAddress(""); setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place your order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:items-center">
      <div className="relative my-4 w-full max-w-4xl rounded-sm bg-cream shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-olive-dark/15 bg-white transition hover:bg-olive hover:text-white" aria-label="Close checkout">
          <X size={17} />
        </button>

        <div className="border-b border-olive-dark/10 px-6 py-6 sm:px-9">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-olive-dark/60 transition hover:text-olive"
            aria-label="Back to home page"
          >
            <ArrowLeft size={15} /> Back to home
          </button>
          <p className="eyebrow">Almost there</p>
          <h2 className="display-title mt-1 text-3xl text-olive-dark">Checkout</h2>
        </div>

        <form onSubmit={submit} className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-olive">01 — Your details</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="label">Full name</span>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="field" />
              </label>
              <label>
                <span className="label">Phone number</span>
                <input required inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" className="field" />
              </label>
              <label>
                <span className="label">Email (optional)</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="field" />
              </label>
            </div>

            <p className="mt-9 text-[10px] font-bold uppercase tracking-[0.22em] text-olive">02 — How would you like it?</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType("DELIVERY")}
                className={`flex items-center gap-3 rounded-sm border p-4 text-left transition ${orderType === "DELIVERY" ? "border-olive bg-olive/5" : "border-olive-dark/15 hover:border-olive/50"}`}
              >
                <MapPin size={18} className={orderType === "DELIVERY" ? "text-olive" : "text-olive-dark/50"} />
                <span>
                  <span className="block text-sm font-semibold text-olive-dark">Delivery</span>
                  <span className="block text-[10px] text-black/45">To your address</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType("PICKUP")}
                className={`flex items-center gap-3 rounded-sm border p-4 text-left transition ${orderType === "PICKUP" ? "border-olive bg-olive/5" : "border-olive-dark/15 hover:border-olive/50"}`}
              >
                <Store size={18} className={orderType === "PICKUP" ? "text-olive" : "text-olive-dark/50"} />
                <span>
                  <span className="block text-sm font-semibold text-olive-dark">Pickup</span>
                  <span className="block text-[10px] text-black/45">At the restaurant</span>
                </span>
              </button>
            </div>

            {orderType === "DELIVERY" ? (
              <label className="mt-5 block">
                <span className="label">Delivery address</span>
                <textarea required rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House / flat, street, landmark, city" className="field" />
              </label>
            ) : (
              <div className="mt-5 rounded-sm border border-olive-dark/15 bg-white p-4 text-xs leading-6 text-black/60">
                Pickup from <strong className="text-olive-dark">{settings.address}</strong>. We will notify you when your order is ready.
              </div>
            )}

            <label className="mt-5 block">
              <span className="label">Notes for the kitchen (optional)</span>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, spice level, instructions..." className="field" />
            </label>

            <p className="mt-9 text-[10px] font-bold uppercase tracking-[0.22em] text-olive">03 — Payment</p>
            <div className="mt-4 space-y-3">
              <button type="button" onClick={() => setPaymentMethod("COD")} className={`flex w-full items-center gap-3 rounded-sm border p-4 text-left transition ${paymentMethod === "COD" ? "border-olive bg-olive/5" : "border-olive-dark/15"}`}>
                <Banknote size={18} className="text-olive" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-olive-dark">Cash on delivery</span>
                  <span className="block text-[10px] text-black/45">Pay when your food arrives</span>
                </span>
                <span className={`h-4 w-4 rounded-full border-4 ${paymentMethod === "COD" ? "border-olive" : "border-olive-dark/20"}`} />
              </button>
              <div className="flex items-center gap-2 rounded-sm border border-olive-dark/10 bg-white/60 px-4 py-3 text-[11px] text-black/45">
                <ShieldCheck size={14} className="text-green-600" /> Your details are kept private and used only for this order.
              </div>
            </div>
          </div>

          <div className="h-fit rounded-sm bg-olive-dark p-6 text-cream sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-olive">Your order</p>
            <div className="mt-5 max-h-52 space-y-3 overflow-y-auto pr-1">
              {lines.map((line) => (
                <div key={line.item.id} className="flex items-center justify-between gap-3 border-b border-cream/10 pb-3 text-sm">
                  <span className="min-w-0 flex-1 truncate">{line.qty} × {line.item.name}</span>
                  <span className="font-semibold">{money(line.item.price * line.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 text-sm text-cream/65">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between"><span>Tax ({settings.taxPercent}%)</span><span>{money(tax)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? "Free" : money(delivery)}</span></div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-cream/15 pt-5">
              <span className="text-sm font-bold">Total</span>
              <span className="font-display text-3xl font-bold text-gold">{money(total)}</span>
            </div>

            {error && <p className="mt-5 rounded-sm bg-olive/20 px-4 py-3 text-xs text-olive-100">{error}</p>}

            <button type="submit" disabled={busy || lines.length === 0} className="btn-primary mt-6 w-full">
              {busy ? <><Loader2 size={15} className="animate-spin" /> Placing order...</> : `Place order · ${money(total)}`}
            </button>
            <p className="mt-4 text-center text-[10px] text-cream/40">You can track your order after placing it.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
