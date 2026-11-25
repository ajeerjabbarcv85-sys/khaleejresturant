"use client";

import Reveal from "@/components/ui/Reveal";
import { Leaf, Flame, Clock3, Award } from "lucide-react";
import type { RestaurantSettings } from "@/lib/types";

const PILLARS = [
  { icon: Leaf, title: "Honest ingredients", text: "Sourced from trusted growers and the coast, every morning." },
  { icon: Flame, title: "Patient technique", text: "Slow cooking, open fire and recipes handed down through generations." },
  { icon: Clock3, title: "Made to linger", text: "A room designed for long conversations and one more course." },
  { icon: Award, title: "Consistent quality", text: "The same care on a quiet Tuesday as on a packed Saturday." },
];

export default function About({ settings }: { settings: RestaurantSettings }) {
  return (
    <section id="about" className="relative overflow-hidden bg-cream py-20 md:py-28">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-olive/5 blur-3xl" />
      <div className="container-x relative">
        <Reveal>
          <p className="eyebrow">Our story</p>
          <h2 className="display-title mt-4 text-4xl text-olive-dark sm:text-5xl lg:text-6xl">
            {settings.aboutTitle}
          </h2>
          <div className="mt-6 h-px w-20 bg-olive" />
          <p className="mt-7 text-[15px] leading-8 text-black/65">{settings.aboutStory}</p>
          <p className="mt-5 text-[15px] leading-8 text-black/65">
            Every plate that leaves our kitchen carries a little of that belief — familiar
            flavours, presented with quietly modern confidence.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.08}>
              <div className="group flex h-full flex-col gap-4 border-b border-olive-dark/10 pb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-olive/30 text-olive transition group-hover:bg-olive group-hover:text-white">
                  <pillar.icon size={18} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-olive-dark">{pillar.title}</h3>
                  <p className="mt-1 text-[13px] leading-6 text-black/55">{pillar.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-12 rounded-sm bg-olive-dark p-7 text-cream">
            <p className="font-script text-base text-olive">A word from the chef</p>
            <p className="mt-3 text-sm leading-7 text-cream/70">&ldquo;{settings.chefBio}&rdquo;</p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-cream/45">
              {settings.chefName} — {settings.chefTitle}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
