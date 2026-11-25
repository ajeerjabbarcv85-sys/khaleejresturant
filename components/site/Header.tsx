"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/animations";
import IndiaTime from "@/components/site/IndiaTime";
import type { RestaurantSettings } from "@/lib/types";

type Props = {
  settings: RestaurantSettings;
  cartCount: number;
  onCart: () => void;
  onOrder: () => void;
  onBook: () => void;
  onTrack: () => void;
};

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Reservations", href: "#reservations" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Header({ settings, cartCount, onCart, onOrder, onBook, onTrack }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const lineOne = useRef<HTMLSpanElement>(null);
  const lineTwo = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".site-logo",
        { y: -22, autoAlpha: 0, scale: 0.86, filter: "blur(10px)" },
        { y: 0, autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.25, delay: 0.3, ease: "expo.out" }
      );
      gsap.fromTo(
        ".site-logo-rule",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, delay: 1.05, stagger: 0.1, ease: "power3.out", transformOrigin: "center" }
      );
      gsap.fromTo(
        ".site-logo-caption",
        { autoAlpha: 0, letterSpacing: "0.9em" },
        { autoAlpha: 1, letterSpacing: "0.45em", duration: 1, delay: 0.95, ease: "power2.out" }
      );
      gsap.to(".site-logo-img", {
        filter: "drop-shadow(0 0 14px rgba(107,127,50,0.45))",
        duration: 2.4,
        delay: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      if (open) {
        gsap.set(overlayRef.current, { display: "flex" });
        gsap.fromTo(
          overlayRef.current,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power3.inOut" }
        );
        gsap.fromTo(
          linksRef.current?.children || [],
          { y: 45, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, stagger: 0.055, duration: 0.6, delay: 0.28, ease: "power3.out" }
        );
        gsap.to(lineOne.current, { y: 7, rotate: 45, duration: 0.35 });
        gsap.to(lineTwo.current, { y: -7, rotate: -45, duration: 0.35 });
      } else {
        gsap.to(overlayRef.current, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.5,
          ease: "power3.inOut",
          onComplete: () => gsap.set(overlayRef.current, { display: "none" }),
        });
        gsap.to([lineOne.current, lineTwo.current], { y: 0, rotate: 0, duration: 0.3 });
      }
    });
    return () => ctx.revert();
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 120);
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled ? "bg-olive-dark/95 py-3 shadow-2xl backdrop-blur-xl" : "bg-gradient-to-b from-black/70 to-transparent py-5"
        }`}
      >
        <div className="container-x grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="relative flex h-10 w-10 flex-col items-center justify-center gap-[7px] text-cream"
            >
              <span ref={lineOne} className="block h-[1.5px] w-6 bg-current" />
              <span ref={lineTwo} className="block h-[1.5px] w-6 bg-current" />
            </button>
            <IndiaTime className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-cream/55 lg:inline" />
            <button
              type="button"
              onClick={onTrack}
              className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-cream/70 transition hover:text-olive lg:inline"
            >
              Track order
            </button>
          </div>

          <button
            ref={logoRef}
            type="button"
            onClick={() => go("#home")}
            className="site-logo group flex items-center gap-3 leading-none"
            aria-label={`${settings.restaurantName} home`}
          >
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt={settings.restaurantName}
                className="site-logo-img h-10 w-auto max-w-[150px] shrink-0 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:h-12 sm:max-w-[180px]"
              />
            )}
            <span className="flex flex-col items-start">
              <span className="font-display text-2xl font-bold tracking-[0.08em] text-cream sm:text-3xl">
                KHALEEJ
              </span>
              <span className="site-logo-caption mt-1 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.3em] text-olive">
                <i className="site-logo-rule h-px w-3 bg-olive" />
                RESTAURANT
                <i className="site-logo-rule h-px w-3 bg-olive" />
              </span>
            </span>
          </button>

          <div className="flex items-center justify-end gap-2 sm:gap-4">
            <button
              type="button"
              onClick={onCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 text-cream transition hover:border-olive hover:bg-olive"
              aria-label="Open cart"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6Z" />
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-olive px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button type="button" onClick={onBook} className="btn-primary hidden !px-5 !py-3 sm:inline-flex">
              Book a table
            </button>
            <button
              type="button"
              onClick={onOrder}
              className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-cream/70 transition hover:text-olive xl:inline"
            >
              Order online
            </button>
          </div>
        </div>
      </header>

      <div
        ref={overlayRef}
        className="fixed inset-0 z-30 hidden flex-col items-center justify-center bg-olive-dark px-6"
        style={{ clipPath: "inset(0 0 100% 0)" }}
      >
        <div ref={linksRef} className="flex flex-col items-center gap-2 text-center">
          {LINKS.map((link, index) => (
            <button
              key={link.href}
              type="button"
              onClick={() => go(link.href)}
              className="group flex items-baseline gap-4 text-cream"
            >
              <span className="text-[10px] tracking-widest text-olive">0{index + 1}</span>
              <span className="font-display text-3xl font-semibold transition group-hover:text-olive sm:text-5xl">
                {link.label}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button type="button" onClick={() => { setOpen(false); onOrder(); }} className="btn-primary">
            Order online
          </button>
          <button type="button" onClick={() => { setOpen(false); onTrack(); }} className="btn-outline">
            Track order
          </button>
          <a href="#feedback" onClick={() => setOpen(false)} className="btn-outline">
            Feedback
          </a>
        </div>
        <p className="absolute bottom-8 text-[10px] uppercase tracking-[0.35em] text-cream/40">
          {settings.phone} · {settings.openingHours}
        </p>
      </div>
    </>
  );
}
