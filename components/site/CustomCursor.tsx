"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/animations";

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const element = dot.current;
    if (!element) return;

    const moveX = gsap.quickTo(element, "x", { duration: 0.16, ease: "power3.out" });
    const moveY = gsap.quickTo(element, "y", { duration: 0.16, ease: "power3.out" });

    const onMove = (event: MouseEvent) => {
      moveX(event.clientX);
      moveY(event.clientY);
      gsap.to(element, { opacity: 0.65, scale: 1, duration: 0.25 });
    };
    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const interactive = target.closest("a, button, input, select, textarea");
      gsap.to(element, { scale: interactive ? 3.6 : 1, opacity: interactive ? 0.22 : 0.65, duration: 0.3 });
    };
    const onLeave = () => gsap.to(element, { opacity: 0, duration: 0.2 });

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <div ref={dot} className="cursor-dot hidden md:block" aria-hidden="true" />;
}
