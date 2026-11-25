"use client";

import { ShoppingBag, TrendingUp, Clock3, Users, Star, ArrowRight } from "lucide-react";
import { money, statusLabel } from "@/lib/utils";
import { BarChart, EmptyState, StatCard, StatusBadge } from "@/components/admin/ui";
import type { Order, Reservation } from "@/lib/types";

type Reports = {
  summary: { revenue: number; todayRevenue: number; totalOrders: number; todayOrders: number; averageOrder: number };
  weekly: { label: string; revenue: number; orders: number }[];
  monthly: { label: string; revenue: number; orders: number }[];
  popular: { name: string; qty: number; revenue: number; imageUrl: string }[];
  statusCounts: { status: string; count: number }[];
};

export default function AdminOverview({
  orders,
  reservations,
  reports,
  itemCount,
  customerCount,
  onNavigate,
}: {
  orders: Order[];
  reservations: Reservation[];
  reports: Reports | null;
  itemCount: number;
  customerCount: number;
  onNavigate: (tab: string) => void;
}) {
  const summary = reports?.summary;
  const pending = orders.filter((order) => order.status === "PENDING").length;
  const todayReservations = reservations.filter((reservation) => reservation.date === new Date().toISOString().slice(0, 10)).length;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={money(summary?.revenue || 0)} icon={TrendingUp} hint="Across all completed orders" />
        <StatCard label="Total orders" value={summary?.totalOrders ?? orders.length} icon={ShoppingBag} hint={`${summary?.todayOrders || 0} placed today`} />
        <StatCard label="Pending orders" value={pending} icon={Clock3} hint="Need your attention" />
        <StatCard label="Customers" value={customerCount} icon={Users} hint={`${itemCount} items on the menu`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-sm border border-olive-dark/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-olive-dark">Sales this week</h2>
              <p className="mt-1 text-xs text-black/45">Revenue across the last 7 days</p>
            </div>
            <span className="rounded-sm bg-olive/10 px-3 py-1.5 text-xs font-bold text-olive">{money(summary?.todayRevenue || 0)} today</span>
          </div>
          <div className="mt-7">
            <BarChart data={(reports?.weekly || []) as unknown as Record<string, unknown>[]} labelKey="label" valueKey="revenue" format={(value) => money(value)} />
          </div>
        </div>

        <div className="rounded-sm border border-olive-dark/10 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-olive-dark">Order volume</h2>
          <p className="mt-1 text-xs text-black/45">Orders per month over the last year</p>
          <div className="mt-7">
            <BarChart data={(reports?.monthly || []) as unknown as Record<string, unknown>[]} labelKey="label" valueKey="orders" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-sm border border-olive-dark/10 bg-white">
          <div className="flex items-center justify-between border-b border-olive-dark/10 px-6 py-5">
            <div>
              <h2 className="font-display text-lg font-bold text-olive-dark">Recent orders</h2>
              <p className="mt-1 text-xs text-black/45">The latest activity in your restaurant</p>
            </div>
            <button type="button" onClick={() => onNavigate("orders")} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-olive hover:underline">
              View all <ArrowRight size={13} />
            </button>
          </div>
          {orders.length === 0 ? (
            <EmptyState title="No orders yet" text="New orders will appear here as they arrive." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-cream text-[10px] uppercase tracking-wider text-black/45">
                  <tr>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive-dark/10">
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-cream/50">
                      <td className="px-6 py-4 font-bold text-olive">{order.orderCode}</td>
                      <td className="px-6 py-4">{order.name}</td>
                      <td className="px-6 py-4 font-semibold">{money(Number(order.total))}</td>
                      <td className="px-6 py-4"><StatusBadge status={String(order.status)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-sm border border-olive-dark/10 bg-white p-6">
          <div className="flex items-center gap-2">
            <Star size={17} className="text-olive" />
            <h2 className="font-display text-lg font-bold text-olive-dark">Popular dishes</h2>
          </div>
          <div className="mt-5 space-y-4">
            {(reports?.popular || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-black/45">No sales data yet.</p>
            ) : (
              reports?.popular.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-olive-dark text-[10px] font-bold text-cream">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-olive-dark">{item.name}</p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-olive-dark/10">
                      <div className="h-1.5 rounded-full bg-olive" style={{ width: `${Math.min(100, (Number(item.qty) / Number(reports.popular[0].qty || 1)) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-black/55">{item.qty} sold</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-7 border-t border-olive-dark/10 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-black/55">Today&apos;s reservations</span>
              <span className="font-display text-xl font-bold text-olive">{todayReservations}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {(reports?.statusCounts || []).slice(0, 6).map((item) => (
          <div key={item.status} className="flex items-center justify-between rounded-sm border border-olive-dark/10 bg-white px-5 py-4">
            <StatusBadge status={item.status} />
            <span className="font-display text-2xl font-bold text-olive-dark">{item.count}</span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-sm border border-olive-dark/10 bg-white px-5 py-4">
          <span className="text-xs font-bold uppercase tracking-wider text-black/50">Avg. order value</span>
          <span className="font-display text-2xl font-bold text-olive">{money(summary?.averageOrder || 0)}</span>
        </div>
        <div className="flex items-center justify-between rounded-sm border border-olive-dark/10 bg-white px-5 py-4">
          <span className="text-xs font-bold uppercase tracking-wider text-black/50">Order status</span>
          <span className="text-[10px] font-semibold text-black/45">{statusLabel("out_for_delivery")}</span>
        </div>
      </div>
    </div>
  );
}
