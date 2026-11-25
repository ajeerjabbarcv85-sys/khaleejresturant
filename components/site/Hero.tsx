"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, CalendarDays, UtensilsCrossed } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/animations";
import type { RestaurantSettings } from "@/lib/types";

type Props = {
  settings: RestaurantSettings;
  onOrder: () => void;
  onBook: () => void;
};

export default function Hero({ settings, onOrder, onBook }: Props) {
  const root = useRef<HTMLElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const orbit = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(background.current, { scale: 1.22, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 1.8 })
        .fromTo(".hero-eyebrow", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, "-=1.1")
        .fromTo(".hero-line", { yPercent: 115, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.11, duration: 0.9 }, "-=0.7")
        .fromTo(".hero-script", { y: 18, autoAlpha: 0, scale: 0.96 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.8 }, "-=0.5")
        .fromTo(".hero-intro", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, "-=0.55")
        .fromTo(".hero-actions", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.6 }, "-=0.5")
        .fromTo(orbit.current, { scale: 0.7, autoAlpha: 0, rotate: -12 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 1.3 }, "-=1.5");

      gsap.to(background.current, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(orbit.current, {
        yPercent: -22,
        rotate: 8,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const heading = settings.heroTitle.split(" ");
  const split = Math.ceil(heading.length / 2);

  return (
    <section id="home" ref={root} className="relative flex min-h-[100svh] items-center overflow-hidden bg-black text-cream">
      <div ref={background} className="absolute inset-0 will-change-transform">
        <img src="/images/hero/hero-1.jpg" alt="" className="h-full w-full scale-105 object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(201,162,39,0.28),transparent_42%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-olive-dark via-olive-dark/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/35" />
        <div className="absolute inset-0 ring-1 ring-inset ring-cream/5" />
      </div>

      <div
        ref={orbit}
        className="pointer-events-none absolute -right-24 top-1/2 hidden h-[34rem] w-[34rem] -translate-y-1/2 items-center justify-center rounded-full border border-cream/10 lg:flex"
      >
        <div className="absolute inset-12 rounded-full border border-olive/30" />
        <div className="absolute inset-28 overflow-hidden rounded-full shadow-[0_0_90px_rgba(107,127,50,0.25)]">
          <img src="/images/hero/hero-2.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <span className="absolute -left-4 top-1/3 h-2 w-2 rounded-full bg-olive" />
        <span className="absolute bottom-1/4 right-2 h-1.5 w-1.5 rounded-full bg-cream/70" />
      </div>

      <div className="container-x relative z-10 pt-28 pb-24">
        <div className="max-w-3xl">
          <p className="hero-eyebrow eyebrow !text-olive">{settings.tagline}</p>

          <h1 className="hero-title mt-7 text-[clamp(3rem,7.4vw,6.6rem)] text-cream">
            <span className="block overflow-hidden"><span className="hero-line block">{heading.slice(0, split).join(" ")}</span></span>
            <span className="block overflow-hidden"><span className="hero-line block text-cream/95">{heading.slice(split).join(" ")}</span></span>
          </h1>

          <p className="hero-script hero-script-text mt-4 text-3xl text-olive sm:text-5xl">
            {settings.heroScript}
          </p>

          <div className="mt-7 h-px w-24 bg-olive" />

          <p className="hero-intro mt-7 max-w-xl text-base leading-relaxed text-cream/70 sm:text-lg">
            {settings.heroIntro}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button type="button" onClick={onOrder} className="hero-actions btn-primary">
              <UtensilsCrossed size={15} /> Explore menu
            </button>
            <button type="button" onClick={onBook} className="hero-actions btn-outline">
              <CalendarDays size={15} /> Book a table
            </button>
          </div>

          <div className="hero-actions mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/50">
            <span>Open daily · 11 AM – 11 PM</span>
            <span className="hidden h-px w-10 bg-olive sm:block" />
            <span>{settings.phone}</span>
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-cream/50 transition hover:text-olive"
        aria-label="Scroll to about section"
      >
        <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown size={16} className="animate-bounce" />
      </a>
    </section>
  );
}
