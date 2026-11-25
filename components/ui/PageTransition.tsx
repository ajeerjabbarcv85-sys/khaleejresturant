"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion } from "@/lib/animations";

export default function PageTransition() {
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!panel.current) return;
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion()) return;

    const element = panel.current;
    gsap.set(element, { display: "block", scaleY: 0, transformOrigin: "bottom" });
    gsap.to(element, {
      scaleY: 1,
      duration: 0.32,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(element, { transformOrigin: "top" });
        gsap.to(element, {
          scaleY: 0,
          duration: 0.45,
          delay: 0.08,
          ease: "power2.out",
          onComplete: () => gsap.set(element, { display: "none" }),
        });
      },
    });
  }, [pathname]);

  return (
    <div
      ref={panel}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[200] bg-olive"
      style={{ display: "none", transform: "scaleY(0)" }}
    />
  );
}
