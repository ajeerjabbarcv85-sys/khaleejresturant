"use client";

import { useMemo, useState } from "react";
import { Search, Eye, X, Check, Clock3 } from "lucide-react";
import { money, statusLabel } from "@/lib/utils";
import { api } from "@/lib/api";
import { EmptyState, Modal, PageHeading, StatusBadge } from "@/components/admin/ui";
import { ORDER_STATUSES } from "@/lib/types";
import type { Order } from "@/lib/types";

export default function AdminOrders({
  orders,
  onRefresh,
  notify,
}: {
  orders: Order[];
  onRefresh: () => void;
  notify: (message: string, ok?: boolean) => void;
}) {
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== "ALL" && order.status !== status) return false;
      if (q && !`${order.orderCode} ${order.name} ${order.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [orders, status, query]);

  const update = async (order: Order, field: "status" | "paymentStatus", value: string) => {
    setBusy(`${order.id}-${field}`);
    try {
      await api.updateOrder(order.id, { [field]: value });
      notify("Order updated");
      if (detail?.id === order.id) setDetail({ ...detail, [field]: value } as Order);
      onRefresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Update failed", false);
    } finally {
      setBusy(null);
    }
  };

  const quickAction = (order: Order, next: string) => update(order, "status", next);

  return (
    <div>
      <PageHeading title="Orders" subtitle="Manage approvals, preparation, delivery and payments." />

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <label className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order, name or phone" className="field !pl-9" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {["ALL", ...ORDER_STATUSES].map((value) => (
            <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-sm px-3 py-2 text-[9px] font-bold uppercase tracking-wider transition ${status === value ? "bg-olive text-white" : "bg-white text-black/50 hover:text-olive"}`}>
              {statusLabel(value)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-olive-dark/10 bg-white">
        {visible.length === 0 ? (
          <EmptyState title="No orders found" text="Try a different filter or check back later." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-cream text-[10px] uppercase tracking-wider text-black/45">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive-dark/10">
                {visible.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/50">
                    <td className="px-5 py-4">
                      <p className="font-bold text-olive">{order.orderCode}</p>
                      <p className="text-[10px] text-black/40">{String(order.createdAt).slice(0, 16).replace("T", " ")}</p>
                      <p className="text-[9px] uppercase tracking-wider text-black/35">{order.orderType}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-olive-dark">{order.name}</p>
                      <p className="text-[11px] text-black/45">{order.phone}</p>
                      <p className="text-[10px] text-black/35">{order.email}</p>
                    </td>
                    <td className="px-5 py-4 text-black/60">
                      {(order.items || []).slice(0, 2).map((item) => (
                        <p key={item.id} className="text-xs">{item.qty} × {item.name}</p>
                      ))}
                      {(order.items?.length || 0) > 2 && <p className="text-[10px] text-olive">+{order.items!.length - 2} more</p>}
                    </td>
                    <td className="px-5 py-4 font-bold text-olive-dark">{money(Number(order.total))}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={String(order.status)} />
                      <select
                        value={String(order.status)}
                        disabled={busy === `${order.id}-status`}
                        onChange={(e) => update(order, "status", e.target.value)}
                        className="mt-2 block w-full rounded-sm border border-olive-dark/15 bg-cream px-2 py-1.5 text-[11px] outline-none focus:border-olive"
                      >
                        {ORDER_STATUSES.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={String(order.paymentStatus)} />
                      <select
                        value={String(order.paymentStatus)}
                        disabled={busy === `${order.id}-paymentStatus`}
                        onChange={(e) => update(order, "paymentStatus", e.target.value)}
                        className="mt-2 block w-full rounded-sm border border-olive-dark/15 bg-cream px-2 py-1.5 text-[11px] outline-none focus:border-olive"
                      >
                        {["PENDING", "PAID", "FAILED", "REFUNDED"].map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
                      </select>
                      <p className="mt-1 text-[9px] uppercase tracking-wider text-black/35">{order.paymentMethod}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <button type="button" onClick={() => setDetail(order)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-olive-dark hover:text-olive"><Eye size={13} /> View</button>
                        {order.status === "PENDING" && (
                          <button type="button" onClick={() => quickAction(order, "APPROVED")} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-700 hover:underline"><Check size={13} /> Approve</button>
                        )}
                        {order.status === "PENDING" && (
                          <button type="button" onClick={() => quickAction(order, "CANCELLED")} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-olive hover:underline"><X size={13} /> Reject</button>
                        )}
                        {order.status === "APPROVED" && (
                          <button type="button" onClick={() => quickAction(order, "PREPARING")} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 hover:underline"><Clock3 size={13} /> Start preparing</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={`Order ${detail?.orderCode || ""}`} wide>
        {detail && (
          <div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-sm bg-cream p-4">
                <p className="text-[10px] uppercase tracking-wider text-black/45">Customer</p>
                <p className="mt-2 font-semibold text-olive-dark">{detail.name}</p>
                <p className="text-xs text-black/55">{detail.phone}</p>
                <p className="text-xs text-black/55">{detail.email}</p>
              </div>
              <div className="rounded-sm bg-cream p-4">
                <p className="text-[10px] uppercase tracking-wider text-black/45">{detail.orderType === "PICKUP" ? "Pickup" : "Delivery address"}</p>
                <p className="mt-2 text-xs leading-6 text-olive-dark">{detail.address}</p>
              </div>
              <div className="rounded-sm bg-cream p-4">
                <p className="text-[10px] uppercase tracking-wider text-black/45">Payment</p>
                <p className="mt-2 text-sm font-semibold text-olive-dark">{detail.paymentMethod}</p>
                <p className="mt-1"><StatusBadge status={String(detail.paymentStatus)} /></p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-sm border border-olive-dark/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream text-[10px] uppercase tracking-wider text-black/45">
                  <tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-olive-dark/10">
                  {(detail.items || []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.qty}</td>
                      <td className="px-4 py-3">{money(Number(item.price))}</td>
                      <td className="px-4 py-3 font-semibold">{money(Number(item.price) * Number(item.qty))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 space-y-2 rounded-sm bg-cream p-4 text-sm">
              <div className="flex justify-between text-black/60"><span>Subtotal</span><span>{money(Number(detail.subtotal))}</span></div>
              <div className="flex justify-between text-black/60"><span>Tax</span><span>{money(Number(detail.tax))}</span></div>
              <div className="flex justify-between text-black/60"><span>Delivery</span><span>{money(Number(detail.deliveryFee))}</span></div>
              <div className="flex justify-between text-black/60"><span>Discount</span><span>− {money(Number(detail.discount))}</span></div>
              <div className="flex justify-between border-t border-olive-dark/15 pt-3 font-bold text-olive-dark"><span>Total</span><span className="text-olive">{money(Number(detail.total))}</span></div>
            </div>

            {detail.notes && <p className="mt-4 rounded-sm border-l-2 border-olive bg-olive/5 p-4 text-xs text-black/60">“{detail.notes}”</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
