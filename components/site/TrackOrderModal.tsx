"use client";

import { useEffect, useState } from "react";
import { X, Search, Loader2, Check, Package, ChefHat, Truck, Home, MapPin } from "lucide-react";
import { money, statusLabel } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

const STEPS = ["PENDING", "APPROVED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"];
const STEP_ICONS = [Package, Check, ChefHat, ChefHat, Truck, Home];

type Props = {
  open: boolean;
  initialCode?: string;
  onClose: () => void;
};

export default function TrackOrderModal({ open, initialCode = "", onClose }: Props) {
  const [code, setCode] = useState(initialCode);
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const search = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!code.trim() || phone.trim().length < 10) {
      setError("Enter your order number and 10-digit phone number");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setOrder(await api.trackOrder(code.trim(), phone));
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : "Unable to find that order");
    } finally {
      setBusy(false);
    }
  };

  const currentIndex = order ? STEPS.indexOf(String(order.status)) : -1;

  return (
    <div className="fixed inset-0 z-[65] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="relative my-4 w-full max-w-2xl rounded-sm bg-cream shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-olive-dark/15 transition hover:bg-olive hover:text-white" aria-label="Close tracking">
          <X size={17} />
        </button>
        <div className="border-b border-olive-dark/10 px-7 py-6">
          <p className="eyebrow">Order tracking</p>
          <h2 className="display-title mt-1 text-3xl text-olive-dark">Where is my order?</h2>
        </div>

        <div className="p-7">
          <form onSubmit={search} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <label>
              <span className="label">Order number</span>
              <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }} placeholder="KLJ-XXXXXX" className="field uppercase" />
            </label>
            <label>
              <span className="label">Phone number</span>
              <input inputMode="numeric" value={phone} onChange={(e) => { setPhone(e.target.value); setError(null); }} placeholder="10-digit mobile" className="field" />
            </label>
            <button type="submit" disabled={busy} className="btn-dark !mt-5 sm:!mt-0">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <><Search size={14} /> Track</>}
            </button>
          </form>

          {error && <p className="mt-5 rounded-sm bg-olive/10 px-4 py-3 text-xs text-olive">{error}</p>}

          {order && (
            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-olive-dark p-5 text-cream">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-cream/50">Order</p>
                  <p className="font-display text-2xl text-gold">{order.orderCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-cream/50">Status</p>
                  <p className="text-sm font-bold text-olive">{statusLabel(String(order.status))}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-cream/50">Total</p>
                  <p className="font-display text-2xl">{money(Number(order.total))}</p>
                </div>
              </div>

              {order.status === "CANCELLED" ? (
                <p className="mt-6 rounded-sm bg-olive/10 p-5 text-center text-sm text-olive">This order was cancelled.</p>
              ) : (
                <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {STEPS.map((step, index) => {
                    const Icon = STEP_ICONS[index];
                    const done = currentIndex >= index;
                    return (
                      <div key={step} className="flex flex-col items-center text-center">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${done ? "border-olive bg-olive text-white" : "border-olive-dark/15 text-olive-dark/30"}`}>
                          <Icon size={17} />
                        </div>
                        <p className={`mt-2 text-[9px] font-bold leading-4 ${done ? "text-olive-dark" : "text-olive-dark/35"}`}>
                          {statusLabel(step)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 rounded-sm border border-olive-dark/10 bg-white p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-olive">Order details</p>
                <div className="mt-3 space-y-2">
                  {(order.items || []).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-black/65">
                      <span>{item.qty} × {item.name}</span>
                      <span>{money(Number(item.price) * Number(item.qty))}</span>
                    </div>
                  ))}
                </div>
                {order.orderType === "DELIVERY" && (
                  <p className="mt-4 flex items-start gap-2 border-t border-olive-dark/10 pt-4 text-xs text-black/50">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-olive" /> {order.address}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
