"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import IndiaTime from "@/components/site/IndiaTime";
import type { RestaurantSettings } from "@/lib/types";
import imageCredits from "@/data/image-credits.json";

export default function Footer({ settings }: { settings: RestaurantSettings }) {
  return (
    <footer className="bg-black pt-16 text-cream">
      <div className="container-x">
        <div className="grid gap-10 border-b border-cream/10 pb-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              {settings.logoUrl && (
                <img src={settings.logoUrl} alt={settings.restaurantName} className="h-12 w-auto max-w-[170px] shrink-0 object-contain" />
              )}
              <span className="flex flex-col">
                <span className="font-display text-3xl font-bold tracking-[0.1em] text-cream">KHALEEJ</span>
                <span className="mt-1 text-[13px] font-bold uppercase tracking-[0.35em] text-olive">RESTAURANT</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-7 text-cream/50">
              {settings.tagline}. Good food, made with care, served with warmth.
            </p>
            <div className="mt-6 h-px w-24 bg-olive" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-olive">Explore</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-cream/60">
              <a href="#about" className="hover:text-olive">Our story</a>
              <a href="#menu" className="hover:text-olive">Menu</a>
              <a href="#reservations" className="hover:text-olive">Reservations</a>
              <a href="#gallery" className="hover:text-olive">Gallery</a>
              <a href="#feedback" className="hover:text-olive">Feedback</a>
              <a href="#contact" className="hover:text-olive">Contact</a>
              <Link href="/admin" className="hover:text-olive">Admin</Link>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-olive">Visit & order</p>
            <a
              href={settings.mapUrl || "https://maps.app.goo.gl/7VvhQFpyoXEKeWcGA"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block text-sm leading-7 text-cream/60 transition hover:text-olive"
            >
              {settings.address}
            </a>
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="mt-3 inline-block font-display text-2xl text-cream hover:text-olive">
              {settings.phone}
            </a>
            <p className="mt-3 text-xs text-cream/45">{settings.openingHours}</p>
          </div>
        </div>
        <details className="border-b border-cream/10 py-5 text-[11px] text-cream/35">
          <summary className="w-fit cursor-pointer transition hover:text-cream/70">Photo credits</summary>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {imageCredits.map((credit) => (
              <a
                key={credit.file}
                href={credit.source}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-olive"
                title={`${credit.title} — ${credit.author} (${credit.license})`}
              >
                {credit.title} — {credit.author} ({credit.license})
              </a>
            ))}
          </div>
        </details>
        <div className="flex flex-col items-center justify-between gap-4 py-7 text-[11px] text-cream/35 sm:flex-row">
          <p>© {new Date().getFullYear()} {settings.restaurantName}. All rights reserved.</p>
          <p><IndiaTime className="text-cream/60" /> · India</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 transition hover:border-olive hover:bg-olive"
            aria-label="Back to top"
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
