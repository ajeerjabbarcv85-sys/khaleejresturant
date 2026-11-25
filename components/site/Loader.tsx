"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/animations";

export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const timer = setTimeout(onDone, 250);
      return () => clearTimeout(timer);
    }
    const timeline = gsap.timeline({ onComplete: onDone });
    timeline
      .fromTo(logo.current, { autoAlpha: 0, y: 24, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" })
      .fromTo(line.current, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, "-=0.2")
      .fromTo(caption.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.35")
      .to({}, { duration: 0.35 })
      .to(root.current, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" });
    return () => {
      timeline.kill();
    };
  }, [onDone]);

  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
      <div ref={logo} className="text-center">
        <p className="font-display text-5xl font-bold tracking-[0.3em] text-cream sm:text-7xl">KALEEJ</p>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.5em] text-olive">Restaurant</p>
      </div>
      <div ref={line} className="mt-8 h-px w-40 bg-olive" />
      <p ref={caption} className="mt-6 font-script text-2xl text-cream/70">
        Crafted with passion
      </p>
    </div>
  );
}
