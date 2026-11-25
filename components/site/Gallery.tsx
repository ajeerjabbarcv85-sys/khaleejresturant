"use client";

import { useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { gsap, prefersReducedMotion } from "@/lib/animations";

const PHOTOS = [
  { src: "/images/gallery/gallery-1.jpg", label: "Signature platter", span: "row-span-2" },
  { src: "/images/gallery/gallery-2.jpg", label: "From the tandoor", span: "" },
  { src: "/images/gallery/gallery-3.jpg", label: "Chef's special", span: "" },
  { src: "/images/gallery/gallery-4.jpg", label: "Evening favourites", span: "" },
  { src: "/images/gallery/gallery-5.jpg", label: "House special", span: "row-span-2" },
  { src: "/images/gallery/gallery-6.jpg", label: "Fresh from the coast", span: "" },
  { src: "/images/gallery/gallery-7.jpg", label: "Plated to perfection", span: "" },
  { src: "/images/gallery/gallery-8.jpg", label: "Sweet finish", span: "" },
];

export default function Gallery() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gallery-tile",
        { y: 60, autoAlpha: 0, scale: 0.94 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          stagger: 0.08,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="gallery" ref={root} className="bg-cream py-20 md:py-28">
      <div className="container-x">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">On the plate</p>
            <h2 className="display-title mt-4 text-4xl text-olive-dark sm:text-5xl lg:text-6xl">
              Made to be shared
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-black/60">
              A closer look at the dishes we are known for.
            </p>
          </div>
          <div className="flex h-16 items-end gap-1">
            {[18, 34, 24, 44, 30, 52, 38].map((height, index) => (
              <span key={index} className="w-1.5 bg-olive/40" style={{ height }} />
            ))}
          </div>
        </Reveal>

        <div className="mt-12 grid auto-rows-[190px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PHOTOS.map((photo, index) => (
            <div
              key={photo.src}
              className={`gallery-tile group relative overflow-hidden rounded-sm ${photo.span} ${index === 0 || index === 4 ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <img
                src={photo.src}
                alt={photo.label}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 transition group-hover:opacity-95" />
              <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-olive">{photo.label}</p>
              </div>
              {index === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="font-script text-base text-cream/70 sm:text-lg">Good food, good company</p>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-cream/60">Since day one</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-col items-center gap-4 text-center">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="btn-dark">
            <Camera size={15} /> Follow our journey
          </a>
        </Reveal>
      </div>
    </section>
  );
}
