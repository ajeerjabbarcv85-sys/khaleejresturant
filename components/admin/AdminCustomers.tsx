"use client";

import { useState } from "react";
import { Search, Phone, Mail, ShoppingBag, Eye, X } from "lucide-react";
import { money, statusLabel } from "@/lib/utils";
import { EmptyState, PageHeading } from "@/components/admin/ui";
import type { Customer } from "@/lib/types";

export type CustomerView = Customer & { history?: { orderCode: string; total: number; status: string; createdAt: string }[] };

export default function AdminCustomers({ customers }: { customers: CustomerView[] }) {
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<CustomerView | null>(null);

  const visible = customers.filter((customer) => {
    const q = query.trim().toLowerCase();
    return !q || `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeading title="Customers" subtitle="Your guests, their contact details and order history." />

      <div className="mt-7">
        <label className="relative block max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers" className="field !pl-9" />
        </label>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-olive-dark/10 bg-white">
        {visible.length === 0 ? (
          <EmptyState title="No customers yet" text="Customers are added automatically when they place an order." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-cream text-[10px] uppercase tracking-wider text-black/45">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Orders</th>
                  <th className="px-5 py-3">Total spent</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive-dark/10">
                {visible.map((customer) => (
                  <tr key={customer.id} className="hover:bg-cream/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-olive-dark text-xs font-bold text-cream">
                          {customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-olive-dark">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-1.5 text-xs text-black/60"><Phone size={12} /> {customer.phone}</p>
                      {customer.email && <p className="mt-1 flex items-center gap-1.5 text-[11px] text-black/45"><Mail size={12} /> {customer.email}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 font-semibold"><ShoppingBag size={13} className="text-olive" /> {customer.orders}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-olive-dark">{money(customer.spent)}</td>
                    <td className="px-5 py-4 text-xs text-black/45">{String(customer.createdAt).slice(0, 10)}</td>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => setDetail(customer)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-olive hover:underline"><Eye size={13} /> History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-sm bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">Customer profile</p>
                <h3 className="mt-1 font-display text-2xl font-bold text-olive-dark">{detail.name}</h3>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-olive-dark/5" aria-label="Close"><X size={17} /></button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-sm bg-cream p-4 text-center"><p className="text-[10px] uppercase tracking-wider text-black/45">Orders</p><p className="mt-1 font-display text-2xl font-bold text-olive-dark">{detail.orders}</p></div>
              <div className="rounded-sm bg-cream p-4 text-center"><p className="text-[10px] uppercase tracking-wider text-black/45">Spent</p><p className="mt-1 font-display text-xl font-bold text-olive">{money(detail.spent)}</p></div>
              <div className="rounded-sm bg-cream p-4 text-center"><p className="text-[10px] uppercase tracking-wider text-black/45">Phone</p><p className="mt-2 text-xs font-semibold text-olive-dark">{detail.phone}</p></div>
            </div>
            <p className="mt-7 text-[10px] font-bold uppercase tracking-widest text-olive">Recent orders</p>
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {(detail.history || []).length === 0 ? (
                <p className="py-6 text-center text-sm text-black/45">No orders yet.</p>
              ) : (
                detail.history!.map((order) => (
                  <div key={order.orderCode} className="flex items-center justify-between rounded-sm border border-olive-dark/10 px-4 py-3 text-sm">
                    <div><p className="font-bold text-olive-dark">{order.orderCode}</p><p className="text-[10px] text-black/40">{order.createdAt}</p></div>
                    <div className="text-right"><p className="font-semibold">{money(Number(order.total))}</p><p className="text-[10px] uppercase text-black/45">{statusLabel(order.status)}</p></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
