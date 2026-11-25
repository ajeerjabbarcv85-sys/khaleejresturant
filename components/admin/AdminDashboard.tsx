"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingBag, CalendarDays, UtensilsCrossed, Users,
  ChartNoAxesCombined, Settings as SettingsIcon, LogOut, ExternalLink, RefreshCw, Menu, X, Check,
} from "lucide-react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminReservations from "@/components/admin/AdminReservations";
import AdminFood from "@/components/admin/AdminFood";
import AdminCustomers, { type CustomerView } from "@/components/admin/AdminCustomers";
import AdminReports from "@/components/admin/AdminReports";
import AdminSettings from "@/components/admin/AdminSettings";
import { api } from "@/lib/api";
import type {
  Category, Coupon,   Feedback, FoodItem, Order,
  Reservation, RestaurantSettings, RestaurantTable,
} from "@/lib/types";

type Tab = "overview" | "orders" | "reservations" | "food" | "customers" | "reports" | "settings";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "reservations", label: "Reservations", icon: CalendarDays },
  { id: "food", label: "Food & menu", icon: UtensilsCrossed },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reports", label: "Reports", icon: ChartNoAxesCombined },
  { id: "settings", label: "Website settings", icon: SettingsIcon },
];

type Reports = {
  summary: { revenue: number; todayRevenue: number; totalOrders: number; todayOrders: number; averageOrder: number };
  weekly: { label: string; revenue: number; orders: number }[];
  monthly: { label: string; revenue: number; orders: number }[];
  popular: { name: string; qty: number; revenue: number; imageUrl: string }[];
  statusCounts: { status: string; count: number }[];
};

export default function AdminDashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [customers, setCustomers] = useState<CustomerView[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [reports, setReports] = useState<Reports | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useCallback((next: string) => {
    if (!TABS.some((item) => item.id === next)) return;
    setTab(next as Tab);
    setSidebarOpen(false);
    window.history.replaceState(null, "", `/admin?tab=${next}`);
  }, []);

  useEffect(() => {
    api
      .me()
      .then((result) => setAuthed(result.authenticated))
      .catch(() => setAuthed(false));
    const requested = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (requested && TABS.some((item) => item.id === requested)) setTab(requested);
  }, []);

  const notify = useCallback((text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsData, categoriesData, ordersData, reservationsData, tablesData, customersData, couponsData, feedbackData, reportsData, settingsData] =
        await Promise.all([
          api.listItems({ all: true }),
          api.listCategories(true),
          api.listOrders(),
          api.listReservations(),
          api.listTables(),
          api.listCustomers(),
          api.listCoupons(true),
          api.listFeedback(true),
          api.getReports(),
          api.getSettings(),
        ]);
      setItems(itemsData);
      setCategories(categoriesData);
      setOrders(ordersData);
      setReservations(reservationsData);
      setTables(tablesData);
      setCustomers(customersData as CustomerView[]);
      setCoupons(couponsData);
      setFeedback(feedbackData);
      setReports(reportsData);
      setSettings(settingsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setAuthed(false);
    }
  };

  if (authed === null) {
    return <div className="flex min-h-screen items-center justify-center bg-olive-dark text-cream">Loading dashboard…</div>;
  }
  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  const active = TABS.find((item) => item.id === tab)!;

  return (
    <div className="min-h-screen bg-cream text-black">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-olive-dark text-cream transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-cream/10 px-6 py-6">
          <div>
            <p className="font-display text-2xl font-bold tracking-[0.2em]">{settings?.restaurantName?.toUpperCase() || "KALEEJ"}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-olive">Management</p>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden" aria-label="Close sidebar"><X size={18} /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-sm px-4 py-3 text-left text-sm font-semibold transition ${tab === item.id ? "bg-olive text-white" : "text-cream/60 hover:bg-cream/10 hover:text-cream"}`}
            >
              <item.icon size={17} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-1 border-t border-cream/10 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-semibold text-cream/60 hover:bg-cream/10 hover:text-cream"><ExternalLink size={17} /> View website</Link>
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-sm px-4 py-3 text-left text-sm font-semibold text-cream/60 hover:bg-cream/10 hover:text-cream"><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-olive-dark/10 bg-cream/95 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden" aria-label="Open sidebar"><Menu size={20} /></button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-olive">Dashboard</p>
              <p className="font-display text-lg font-bold text-olive-dark">{active.label}</p>
            </div>
          </div>
          <button type="button" onClick={load} disabled={loading} className="btn-dark !py-2 !text-[10px]">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> {loading ? "Refreshing" : "Refresh"}
          </button>
        </header>

        <main className="p-5 sm:p-8">
          {error && <div className="mb-6 rounded-sm bg-olive/10 px-5 py-4 text-sm text-olive">{error}</div>}

          {loading && !items.length ? (
            <div className="grid place-items-center py-32 text-sm text-black/45">Loading dashboard data…</div>
          ) : (
            <>
              {tab === "overview" && (
                <AdminOverview orders={orders} reservations={reservations} reports={reports} itemCount={items.length} customerCount={customers.length} onNavigate={navigate} />
              )}
              {tab === "orders" && <AdminOrders orders={orders} onRefresh={load} notify={notify} />}
              {tab === "reservations" && (
                <AdminReservations reservations={reservations} tables={tables} timeSlots={settings?.timeSlots || []} onRefresh={load} notify={notify} />
              )}
              {tab === "food" && <AdminFood items={items} categories={categories} onRefresh={load} notify={notify} />}
              {tab === "customers" && <AdminCustomers customers={customers} />}
              {tab === "reports" && <AdminReports reports={reports} orders={orders} />}
              {tab === "settings" && settings && (
                <AdminSettings settings={settings} coupons={coupons} feedback={feedback} onRefresh={load} notify={notify} />
              )}
            </>
          )}
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-sm px-5 py-3.5 text-sm font-semibold shadow-2xl ${toast.ok ? "bg-olive-dark text-cream" : "bg-olive text-white"}`}>
          {toast.ok && <Check size={15} />} {toast.text}
        </div>
      )}
    </div>
  );
}
