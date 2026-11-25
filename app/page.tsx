"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import About from "@/components/site/About";
import CartDrawer from "@/components/site/CartDrawer";
import CheckoutModal from "@/components/site/CheckoutModal";
import Contact from "@/components/site/Contact";
import CustomCursor from "@/components/site/CustomCursor";
import FeedbackSection from "@/components/site/FeedbackSection";
import Footer from "@/components/site/Footer";
import Gallery from "@/components/site/Gallery";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Loader from "@/components/site/Loader";
import MenuSection from "@/components/site/MenuSection";
import OrderConfirmation from "@/components/site/OrderConfirmation";
import Reservations from "@/components/site/Reservations";
import TrackOrderModal from "@/components/site/TrackOrderModal";
import { api } from "@/lib/api";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import type { CartLine, Category, FoodItem, PlacedOrder, RestaurantSettings } from "@/lib/types";

export default function HomePage() {
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const hideLoader = useCallback(() => setShowLoader(false), []);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [track, setTrack] = useState<{ open: boolean; code: string }>({ open: false, code: "" });
  const [placed, setPlaced] = useState<{ orders: PlacedOrder[]; code: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const [settingsData, itemsData, categoriesData] = await Promise.all([
        api.getSettings(),
        api.listItems(),
        api.listCategories(),
      ]);
      setSettings(settingsData);
      setItems(itemsData);
      setCategories(categoriesData);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load the menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const lines = useMemo<CartLine[]>(
    () =>
      items
        .filter((item) => cart[String(item.id)] > 0)
        .map((item) => ({ item, qty: cart[String(item.id)] })),
    [items, cart]
  );
  const cartCount = lines.reduce((sum, line) => sum + line.qty, 0);

  const addToCart = (item: FoodItem) => {
    setCart((previous) => ({
      ...previous,
      [String(item.id)]: Math.min(Number(item.stock), (previous[String(item.id)] || 0) + 1),
    }));
    setCartOpen(true);
  };

  const changeQty = (id: number, qty: number) => {
    setCart((previous) => {
      const next = { ...previous };
      if (qty <= 0) delete next[String(id)];
      else next[String(id)] = qty;
      return next;
    });
  };

  const scrollTo = (selector: string) => {
    setCartOpen(false);
    setTimeout(() => document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  const handlePlaced = (orders: PlacedOrder[], code: string) => {
    setCart((previous) => {
      const next = { ...previous };
      Object.keys(next).forEach((key) => {
        if (lines.some((line) => String(line.item.id) === key)) delete next[key];
      });
      return next;
    });
    setCheckout(false);
    setCartOpen(false);
    setPlaced({ orders, code });
    load();
  };

  return (
    <div className="min-h-screen bg-cream">
      {showLoader && <Loader onDone={hideLoader} />}
      <CustomCursor />

      <Header
        settings={settings}
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        onOrder={() => scrollTo("#menu")}
        onBook={() => scrollTo("#reservations")}
        onTrack={() => setTrack({ open: true, code: "" })}
      />

      <main>
        <Hero settings={settings} onOrder={() => scrollTo("#menu")} onBook={() => scrollTo("#reservations")} />
        <About settings={settings} />

        {loadError && (
          <div className="bg-olive px-5 py-4 text-center text-sm text-white">
            {loadError} <button type="button" onClick={load} className="ml-2 font-bold underline">Try again</button>
          </div>
        )}

        <MenuSection
          items={items}
          categories={categories}
          cart={cart}
          onAdd={addToCart}
          onCart={() => setCartOpen(true)}
        />
        <Reservations settings={settings} />
        <Gallery />
        <FeedbackSection />
        <Contact settings={settings} />
      </main>

      <Footer settings={settings} />

      <CartDrawer
        open={cartOpen}
        lines={lines}
        onChangeQty={changeQty}
        onRemove={(id) => changeQty(id, 0)}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckout(true); }}
        onTrack={() => { setCartOpen(false); setTrack({ open: true, code: "" }); }}
        settings={settings}
      />

      {checkout && (
        <CheckoutModal
          open
          lines={lines}
          settings={settings}
          onClose={() => setCheckout(false)}
          onBack={() => {
            setCheckout(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlaced={handlePlaced}
        />
      )}

      {placed && (
        <OrderConfirmation
          orders={placed.orders}
          orderCode={placed.code}
          onClose={() => setPlaced(null)}
          onTrack={(code) => { setPlaced(null); setTrack({ open: true, code }); }}
        />
      )}

      <TrackOrderModal
        open={track.open}
        initialCode={track.code}
        onClose={() => setTrack({ open: false, code: "" })}
      />

      {loading && items.length === 0 && !loadError && (
        <div className="pointer-events-none fixed bottom-5 left-5 z-20 rounded-sm bg-olive-dark px-4 py-2 text-[10px] uppercase tracking-widest text-cream/80">
          Loading the menu…
        </div>
      )}
    </div>
  );
}
