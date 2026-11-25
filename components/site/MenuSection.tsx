"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { money } from "@/lib/utils";
import { gsap, prefersReducedMotion } from "@/lib/animations";
import type { Category, FoodItem } from "@/lib/types";

type Props = {
  items: FoodItem[];
  categories: Category[];
  cart: Record<string, number>;
  onAdd: (item: FoodItem) => void;
  onCart: () => void;
};

type MenuSectionId =
  | "all"
  | "starters"
  | "main"
  | "biriyani"
  | "arabic"
  | "grills"
  | "chinese"
  | "desserts"
  | "beverages";

type Variant = {
  item: FoodItem;
  label: string;
  price: number;
  available: boolean;
  inCart: number;
};

type MenuCard = {
  key: string;
  name: string;
  imageUrl: string;
  description: string;
  categoryName: string;
  categoryId: string | number;
  veg: boolean;
  variants: Variant[];
  minPrice: number;
  hasSizes: boolean;
};

const PAGE_SIZE = 8;

const SECTIONS: { id: MenuSectionId; label: string; categoryNames: readonly string[] }[] = [
  { id: "all", label: "All", categoryNames: [] },
  { id: "starters", label: "Starters", categoryNames: ["Starters", "Soup", "Salad"] },
  { id: "main", label: "Main Course", categoryNames: ["Curries", "Beef, Fish & Seafood", "Special"] },
  { id: "biriyani", label: "Biriyani", categoryNames: ["Mandhi"] },
  { id: "arabic", label: "Arabic Dishes", categoryNames: ["Arabic"] },
  { id: "grills", label: "Grills", categoryNames: ["Tandoor", "Broast"] },
  { id: "chinese", label: "Chinese", categoryNames: ["Chinese Dry Items", "Chinese Curries", "Chinese Rice & Noodles"] },
  { id: "desserts", label: "Desserts", categoryNames: ["Fruit Salad"] },
  { id: "beverages", label: "Beverages", categoryNames: ["Beverages", "Fresh Juice", "Lime & Sarbath"] },
];

const CATEGORY_SECTION = new Map<string, MenuSectionId>(
  SECTIONS.flatMap((section) => section.categoryNames.map((name) => [name, section.id] as const))
);

type MenuGroupId = "food" | "drinks";

const GROUPS: { id: MenuGroupId; label: string; sections: readonly MenuSectionId[] }[] = [
  { id: "food", label: "Food", sections: ["starters", "main", "biriyani", "arabic", "grills", "chinese", "desserts"] },
  { id: "drinks", label: "Drinks", sections: ["beverages"] },
];

const SIZE_LABELS: Record<string, string> = {
  Q: "Quarter",
  H: "Half",
  TQ: "Three Quarter",
  F: "Full",
};

function sectionForCategory(name: string): MenuSectionId {
  return CATEGORY_SECTION.get(name) ?? "all";
}

function sizeLabel(suffix: string): string {
  if (!suffix) return "Regular";
  return SIZE_LABELS[suffix] ?? suffix;
}

function groupItems(items: FoodItem[]): MenuCard[] {
  const groups = new Map<string, MenuCard>();
  for (const item of items) {
    const match = item.name.match(/\s*\(([^)]+)\)\s*$/);
    const name = match ? item.name.slice(0, match.index).trim() : item.name.trim();
    const suffix = match?.[1] ?? "";
    const key = `${item.categoryId}:${name.toLowerCase()}`;
    const existing = groups.get(key);
    const card: MenuCard = existing ?? {
      key,
      name,
      imageUrl: item.imageUrl,
      description: item.description,
      categoryName: item.categoryName ?? "",
      categoryId: item.categoryId,
      veg: item.veg,
      variants: [],
      minPrice: Number.POSITIVE_INFINITY,
      hasSizes: false,
    };
    if (!existing) groups.set(key, card);
    if (item.price > 0) {
      card.variants.push({
        item,
        label: sizeLabel(suffix),
        price: item.price,
        available: item.available && item.stock > 0,
        inCart: 0,
      });
      card.minPrice = Math.min(card.minPrice, item.price);
    }
  }
  return [...groups.values()]
    .filter((card) => card.variants.length > 0)
    .map((card) => ({ ...card, hasSizes: card.variants.length > 1 }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function MenuImage({ src, alt, large = false }: { src: string; alt: string; large?: boolean }) {
  const [failed, setFailed] = useState(!src);

  return (
    <div className={`relative overflow-hidden bg-[#f2ece3] ${large ? "aspect-[4/3] rounded-t-md" : "aspect-[16/9]"}`}>
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-olive-dark/35">
          <span className="font-display text-sm tracking-[0.08em]">Khaleej</span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
      )}
    </div>
  );
}

export default function MenuSection({ items, cart, onAdd, onCart }: Props) {
  const [group, setGroup] = useState<MenuGroupId>("food");
  const [section, setSection] = useState<MenuSectionId>("all");
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeCard, setActiveCard] = useState<MenuCard | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const allCards = useMemo(() => groupItems(items), [items]);

  const groupSections = useMemo(
    () => SECTIONS.filter((entry) => entry.id === "all" || GROUPS.find((item) => item.id === group)?.sections.includes(entry.id)),
    [group]
  );

  const groupCounts = useMemo(() => {
    const counts: Record<MenuGroupId, number> = { food: 0, drinks: 0 };
    for (const card of allCards) {
      counts[sectionForCategory(card.categoryName) === "beverages" ? "drinks" : "food"] += 1;
    }
    return counts;
  }, [allCards]);

  const sectionCounts = useMemo(() => {
    const counts = Object.fromEntries(SECTIONS.map((entry) => [entry.id, 0])) as Record<MenuSectionId, number>;
    for (const card of allCards) counts[sectionForCategory(card.categoryName)] += 1;
    counts.all = groupSections.reduce((sum, entry) => sum + (entry.id === "all" ? 0 : counts[entry.id]), 0);
    return counts;
  }, [allCards, groupSections]);

  const cards = useMemo(() => {
    const query = search.trim().toLowerCase();
    const allowed = new Set(GROUPS.find((item) => item.id === group)?.sections ?? []);
    return allCards.filter((card) => {
      const cardSection = sectionForCategory(card.categoryName);
      if (cardSection === "all" ? group !== "food" : !allowed.has(cardSection)) return false;
      if (section !== "all" && cardSection !== section) return false;
      if (vegOnly && !card.veg) return false;
      if (query && !`${card.name} ${card.description} ${card.categoryName}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [allCards, group, section, search, vegOnly]);

  const visibleCards = useMemo(() => cards.slice(0, visibleCount), [cards, visibleCount]);

  useEffect(() => {
    setSection("all");
    setVisibleCount(PAGE_SIZE);
  }, [group]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [section, search, vegOnly]);

  useEffect(() => {
    if (!activeCard) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveCard(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCard]);

  useEffect(() => {
    if (!gridRef.current || prefersReducedMotion()) return;
    const elements = gridRef.current.querySelectorAll(".menu-card");
    if (!elements.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.035, duration: 0.45, ease: "power2.out", clearProps: "transform,opacity,visibility" }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [group, section, search, vegOnly]);

  return (
    <section id="menu" className="bg-cream py-10 md:py-14">
      <div className="container-x">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">The menu</p>
            <h2 className="display-title mt-2 text-2xl text-olive-dark sm:text-3xl lg:text-4xl">
              Choose your craving
            </h2>
            <p className="mt-2 max-w-lg text-xs leading-5 text-black/55">
              Browse food and drinks separately. Pick a dish, choose your size, and add it to your order.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <label className="relative block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-dark/40" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search dishes"
                className="field !w-full !rounded-sm !pl-9 !pr-9 sm:!w-40"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-dark/40 hover:text-olive"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </label>
            <button
              type="button"
              onClick={() => setVegOnly((value) => !value)}
              aria-pressed={vegOnly}
              className={`flex items-center justify-center gap-2 rounded-sm px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition ${
                vegOnly ? "bg-olive-dark text-cream" : "border border-olive-dark/15 bg-white text-olive-dark/60 hover:text-olive"
              }`}
            >
              <SlidersHorizontal size={14} /> Pure veg
            </button>
          </div>
        </div>

        <div className="mt-4 inline-flex rounded-sm border border-olive-dark/15 bg-white p-0.5">
          {GROUPS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setGroup(entry.id)}
              aria-pressed={group === entry.id}
              className={`rounded-sm px-5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition ${
                group === entry.id ? "bg-olive-dark text-cream" : "text-olive-dark/50 hover:text-olive"
              }`}
            >
              {entry.label}
              <span className="ml-2 text-[8px] font-semibold opacity-60">{groupCounts[entry.id]}</span>
            </button>
          ))}
        </div>

        <div className="no-scrollbar mt-3 flex max-w-full gap-4 overflow-x-auto border-b border-olive-dark/10 pb-1.5">
          {groupSections.map((entry) => {
            const active = section === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSection(entry.id)}
                aria-pressed={active}
                className={`shrink-0 whitespace-nowrap border-b-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition ${
                  active ? "border-olive text-olive-dark" : "border-transparent text-olive-dark/40 hover:text-olive"
                }`}
              >
                {entry.label}
                <span className="ml-1.5 text-[8px] font-semibold text-black/35">{sectionCounts[entry.id]}</span>
              </button>
            );
          })}
        </div>

        {cards.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl text-olive-dark">No dishes found</p>
            <p className="mt-2 text-sm text-black/50">Try another category or clear your filters.</p>
            <button
              type="button"
              onClick={() => { setGroup("food"); setSearch(""); setSection("all"); setVegOnly(false); }}
              className="mt-6 rounded-sm border border-olive-dark/20 bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-olive-dark transition hover:border-olive hover:text-olive"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div
              ref={gridRef}
              className={`mt-4 grid ${
                group === "drinks"
                  ? "grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                  : "grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8"
              }`}
            >
              {visibleCards.map((card) => {
                const inCart = card.variants.reduce((sum, variant) => sum + (cart[String(variant.item.id)] || 0), 0);
                const unavailable = card.variants.every((variant) => !variant.available);
                return (
                  <article
                    key={card.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => !unavailable && setActiveCard(card)}
                    onKeyDown={(event) => {
                      if ((event.key === "Enter" || event.key === " ") && !unavailable) {
                        event.preventDefault();
                        setActiveCard(card);
                      }
                    }}
                    aria-label={`View sizes for ${card.name}`}
                    className="menu-card group min-w-0 cursor-pointer rounded-md bg-white/70 shadow-[0_1px_2px_rgba(47,58,31,0.04)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_28px_rgba(47,58,31,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40"
                  >
                    <div className="relative">
                      <MenuImage src={card.imageUrl} alt={card.name} large={group === "drinks"} />
                      {unavailable && (
                        <span className="absolute left-2 top-2 bg-white/95 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-olive-dark">
                          Sold out
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col p-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className={`min-w-0 line-clamp-2 font-display font-semibold leading-snug text-olive-dark ${group === "drinks" ? "text-[13px] sm:text-sm" : "text-xs sm:text-[13px]"}`}>
                          {card.name}
                        </h3>
                        <span className={`shrink-0 whitespace-nowrap text-right font-bold text-olive ${group === "drinks" ? "text-xs sm:text-sm" : "text-[11px] sm:text-xs"}`}>
                          {card.hasSizes && <span className="mr-0.5 text-[8px] font-semibold uppercase tracking-wider text-black/40">From</span>}
                          {money(card.minPrice)}
                        </span>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-[1px] ${card.veg ? "bg-green-600" : "bg-olive"}`}
                          title={card.veg ? "Veg" : "Non-veg"}
                        />
                        {inCart > 0 && (
                          <button
                            type="button"
                            onClick={(event) => { event.stopPropagation(); onCart(); }}
                            className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.12em] text-olive"
                          >
                            <ShoppingBag size={10} /> {inCart}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {visibleCount < cards.length && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">
                  Showing {visibleCards.length} of {cards.length} dishes
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount(cards.length)}
                  className="rounded-sm border border-olive-dark/20 bg-white px-7 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-olive-dark transition hover:border-olive hover:text-olive"
                >
                  Show all dishes
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {activeCard && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setActiveCard(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Sizes for ${activeCard.name}`}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-sm bg-cream"
          >
            <div className="flex items-start justify-between gap-4 border-b border-olive-dark/10 p-6">
              <div>
                <p className="eyebrow !text-[10px]">Select your size</p>
                <h3 className="font-display mt-2 text-2xl font-semibold leading-snug text-olive-dark">{activeCard.name}</h3>
                {activeCard.description && (
                  <p className="mt-2 text-sm leading-6 text-black/55">{activeCard.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveCard(null)}
                aria-label="Close sizes"
                className="rounded-sm p-1.5 text-olive-dark/50 transition hover:text-olive"
              >
                <X size={18} />
              </button>
            </div>
            <div className="divide-y divide-olive-dark/10">
              {activeCard.variants.map((variant) => (
                <button
                  key={variant.item.id}
                  type="button"
                  disabled={!variant.available}
                  onClick={() => { onAdd(variant.item); setActiveCard(null); }}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>
                    <span className="block text-base font-bold text-olive-dark">{variant.label}</span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-black/40">
                      {variant.available ? `${variant.item.stock} available` : "Sold out"}
                    </span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="text-lg font-bold text-olive">{money(variant.price)}</span>
                    <span className="rounded-sm bg-olive-dark px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cream">
                      Add
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
