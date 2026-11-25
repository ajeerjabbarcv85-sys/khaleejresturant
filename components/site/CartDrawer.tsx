"use client";

import { useEffect } from "react";
import { ShoppingBag, Trash2, X, ArrowRight, ReceiptText } from "lucide-react";
import { money } from "@/lib/utils";
import type { CartLine } from "@/lib/types";
import type { RestaurantSettings } from "@/lib/types";

type Props = {
  open: boolean;
  lines: CartLine[];
  onChangeQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
  onCheckout: () => void;
  onTrack: () => void;
  settings: RestaurantSettings;
};

export default function CartDrawer({
  open,
  lines,
  onChangeQty,
  onRemove,
  onClose,
  onCheckout,
  onTrack,
  settings,
}: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const tax = Math.round((subtotal * Number(settings.taxPercent || 0)) / 100);
  const delivery =
    subtotal >= Number(settings.freeDeliveryAbove || 0) ? 0 : Number(settings.deliveryFee || 0);
  const total = subtotal + tax + delivery;
  const count = lines.reduce((sum, line) => sum + line.qty, 0);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-olive-dark/10 px-6 py-6">
          <div>
            <p className="eyebrow">Your order</p>
            <h2 className="display-title mt-1 text-2xl text-olive-dark">Order summary</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-olive-dark/15 transition hover:bg-olive hover:text-white" aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-olive-dark/5">
                <ShoppingBag size={30} className="text-olive-dark/30" />
              </div>
              <p className="mt-6 font-display text-2xl text-olive-dark">Your cart is empty</p>
              <p className="mt-2 max-w-xs text-sm text-black/50">Add something delicious from the menu to get started.</p>
              <button type="button" onClick={onClose} className="btn-dark mt-7">Browse the menu</button>
              <button type="button" onClick={onTrack} className="mt-4 flex items-center gap-2 text-xs font-semibold text-olive hover:underline">
                <ReceiptText size={14} /> Track an existing order
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {lines.map(({ item, qty }) => (
                <li key={item.id} className="flex gap-4 border-b border-olive-dark/10 pb-4">
                  <img src={item.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-sm object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-base font-semibold text-olive-dark">{item.name}</p>
                      <button type="button" onClick={() => onRemove(item.id)} className="text-black/35 hover:text-olive" aria-label={`Remove ${item.name}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-black/45">{money(item.price)} each</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-sm border border-olive-dark/20">
                        <button type="button" onClick={() => onChangeQty(item.id, qty - 1)} className="px-3 py-1.5 text-sm font-bold text-olive-dark hover:bg-olive-dark/5" aria-label="Decrease quantity">−</button>
                        <span className="w-7 text-center text-sm font-bold">{qty}</span>
                        <button type="button" onClick={() => onChangeQty(item.id, qty + 1)} disabled={qty >= item.stock} className="px-3 py-1.5 text-sm font-bold text-olive-dark hover:bg-olive-dark/5 disabled:text-black/20" aria-label="Increase quantity">+</button>
                      </div>
                      <span className="font-sans text-sm font-bold uppercase tracking-[0.08em] text-olive-dark">{money(item.price * qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

        </div>

        {lines.length > 0 && (
          <div className="border-t border-olive-dark/10 bg-white px-6 py-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-black/60"><span>Subtotal ({count} items)</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between text-black/60"><span>Tax ({settings.taxPercent}%)</span><span>{money(tax)}</span></div>
              <div className="flex justify-between text-black/60"><span>Delivery</span><span>{delivery === 0 ? "Free" : money(delivery)}</span></div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-olive-dark/10 pt-4">
              <span className="text-sm font-bold text-olive-dark">Total</span>
              <span className="font-display text-3xl font-bold text-olive">{money(total)}</span>
            </div>
            <button type="button" onClick={onCheckout} className="btn-primary mt-5 w-full">
              Continue to checkout <ArrowRight size={15} />
            </button>
            <button type="button" onClick={onTrack} className="mt-3 w-full text-center text-xs font-semibold text-olive-dark/55 hover:text-olive">
              Already ordered? Track your order
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
