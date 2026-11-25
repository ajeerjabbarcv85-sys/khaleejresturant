"use client";

import { Download, TrendingUp, ShoppingBag, ReceiptText, Star } from "lucide-react";
import { money } from "@/lib/utils";
import { BarChart, StatCard, EmptyState } from "@/components/admin/ui";

type Reports = {
  summary: { revenue: number; todayRevenue: number; totalOrders: number; todayOrders: number; averageOrder: number };
  weekly: { label: string; revenue: number; orders: number }[];
  monthly: { label: string; revenue: number; orders: number }[];
  popular: { name: string; qty: number; revenue: number; imageUrl: string }[];
  statusCounts: { status: string; count: number }[];
};

export default function AdminReports({ reports, orders }: { reports: Reports | null; orders: unknown[] }) {
  if (!reports) return <EmptyState title="Loading reports" />;

  const exportCsv = () => {
    const rows = [
      ["Order", "Customer", "Phone", "Total", "Status", "Payment", "Date"],
      ...(orders as { orderCode: string; name: string; phone: string; total: number; status: string; paymentStatus: string; createdAt: string }[]).map((order) => [
        order.orderCode, order.name, order.phone, String(order.total), order.status, order.paymentStatus, order.createdAt,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `kaleej-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-olive-dark sm:text-4xl">Reports & analytics</h1>
          <p className="mt-1 text-sm text-black/50">A clear picture of how your restaurant is performing.</p>
        </div>
        <button type="button" onClick={exportCsv} className="btn-dark !py-2.5 !text-[10px]"><Download size={14} /> Export orders CSV</button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All-time revenue" value={money(reports.summary.revenue)} icon={TrendingUp} />
        <StatCard label="Today's sales" value={money(reports.summary.todayRevenue)} icon={ReceiptText} />
        <StatCard label="Total orders" value={reports.summary.totalOrders} icon={ShoppingBag} />
        <StatCard label="Average order" value={money(reports.summary.averageOrder)} icon={Star} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-sm border border-olive-dark/10 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-olive-dark">Daily sales · last 7 days</h2>
          <div className="mt-7"><BarChart data={reports.weekly as unknown as Record<string, unknown>[]} labelKey="label" valueKey="revenue" format={(value) => money(value)} /></div>
        </div>
        <div className="rounded-sm border border-olive-dark/10 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-olive-dark">Monthly sales · last 12 months</h2>
          <div className="mt-7"><BarChart data={reports.monthly as unknown as Record<string, unknown>[]} labelKey="label" valueKey="revenue" format={(value) => money(value)} /></div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-sm border border-olive-dark/10 bg-white">
          <div className="border-b border-olive-dark/10 px-6 py-5">
            <h2 className="font-display text-lg font-bold text-olive-dark">Best-selling dishes</h2>
          </div>
          {reports.popular.length === 0 ? (
            <EmptyState title="No sales yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream text-[10px] uppercase tracking-wider text-black/45">
                  <tr><th className="px-5 py-3">Dish</th><th className="px-5 py-3">Qty sold</th><th className="px-5 py-3">Revenue</th></tr>
                </thead>
                <tbody className="divide-y divide-olive-dark/10">
                  {reports.popular.map((item) => (
                    <tr key={item.name}>
                      <td className="px-5 py-4 font-semibold text-olive-dark">{item.name}</td>
                      <td className="px-5 py-4">{item.qty}</td>
                      <td className="px-5 py-4 font-bold text-olive">{money(Number(item.revenue))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-sm border border-olive-dark/10 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-olive-dark">Order statistics</h2>
          <div className="mt-6 space-y-4">
            {reports.statusCounts.map((item) => {
              const total = Math.max(reports.summary.totalOrders, 1);
              const percent = Math.round((item.count / total) * 100);
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-olive-dark">{item.status.replace(/_/g, " ")}</span>
                    <span className="text-black/45">{item.count} · {percent}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-olive-dark/10">
                    <div className="h-2 rounded-full bg-olive" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
