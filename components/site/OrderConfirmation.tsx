"use client";

import { Check, MapPin, Phone } from "lucide-react";
import { money } from "@/lib/utils";
import type { PlacedOrder } from "@/lib/types";

type Props = {
  orders: PlacedOrder[];
  orderCode: string;
  onClose: () => void;
  onTrack: (code: string) => void;
};

export default function OrderConfirmation({ orders, orderCode, onClose, onTrack }: Props) {
  const total = orders.reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="relative my-4 w-full max-w-lg overflow-hidden rounded-sm bg-cream shadow-2xl">
        <div className="h-1.5 bg-olive" />
        <div className="p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-olive text-white">
            <Check size={30} />
          </div>
          <p className="eyebrow mt-6">Order confirmed</p>
          <h2 className="display-title mt-2 text-3xl text-olive-dark">Thank you for ordering</h2>
          <p className="mt-3 text-sm leading-7 text-black/60">
            Your order is with the kitchen. Keep the reference below handy — you can track its
            progress any time.
          </p>

          <div className="mt-7 rounded-sm border-2 border-dashed border-olive/40 bg-white px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Your order number</p>
            <p className="mt-1 font-display text-3xl font-bold tracking-wide text-olive">{orderCode}</p>
          </div>

          <div className="mt-6 space-y-3 rounded-sm border border-olive-dark/10 bg-white p-5 text-left">
            {orders.map((order, index) => (
              <div key={`${order.orderId}-${index}`} className="flex items-center justify-between border-b border-olive-dark/10 pb-3 text-sm last:border-0 last:pb-0">
                <span>{order.qty} × {order.itemName}</span>
                <span className="font-semibold">{money(order.total)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-olive-dark/10 pt-4 text-base font-bold text-olive-dark">
              <span>Total paid on {orders[0]?.paymentMethod === "COD" ? "delivery" : "order"}</span>
              <span className="text-olive">{money(total)}</span>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-sm bg-olive-dark/5 p-4 text-left text-xs text-black/60">
            {orders[0]?.orderType === "PICKUP" ? <MapPin size={16} className="mt-0.5 shrink-0 text-olive" /> : <Phone size={16} className="mt-0.5 shrink-0 text-olive" />}
            <span>
              {orders[0]?.orderType === "PICKUP"
                ? "We will message you when your order is ready for pickup."
                : "Our team will call you on your registered number when the rider is on the way."}
            </span>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => onTrack(orderCode)} className="btn-primary">Track order</button>
            <button type="button" onClick={onClose} className="btn-dark">Continue browsing</button>
          </div>
        </div>
      </div>
    </div>
  );
}
