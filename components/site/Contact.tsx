"use client";

import Reveal from "@/components/ui/Reveal";
import { MapPin, MapPinned, Car, Footprints, Phone, Mail, Clock3, MessageCircle, Camera, Globe2 } from "lucide-react";
import type { RestaurantSettings } from "@/lib/types";

export default function Contact({ settings }: { settings: RestaurantSettings }) {
  const mapUrl = settings.mapUrl || "https://maps.app.goo.gl/7VvhQFpyoXEKeWcGA";
  const coordinates = "11.2700893,75.8378943";
  const directionsUrl = (mode: "driving" | "walking") =>
    `https://www.google.com/maps/dir/?api=1&destination=${coordinates}&travelmode=${mode}`;

  const details = [
    { icon: MapPin, label: "Find us", value: settings.address, href: mapUrl },
    { icon: Phone, label: "Call us", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { icon: Clock3, label: "Opening hours", value: settings.openingHours },
  ];

  return (
    <section id="contact" className="relative bg-olive-dark py-20 text-cream md:py-28">
      <div className="container-x">
        <Reveal className="text-center">
          <p className="eyebrow !text-olive">Contact us</p>
          <h2 className="display-title mt-4 text-4xl sm:text-5xl lg:text-6xl">Come find us</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-cream/60">
            We are easy to find and even easier to reach. Drop in, call ahead or send a message.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {details.map((item) => (
                <div key={item.label} className="border border-cream/10 bg-black/20 p-6 transition hover:border-olive/50">
                  <item.icon size={20} className="text-olive" />
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm leading-6 text-cream/90 hover:text-olive">
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-cream/90">{item.value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={settings.whatsapp} target="_blank" rel="noreferrer" className="btn-primary">
                <MessageCircle size={15} /> WhatsApp
              </a>
              <a href={settings.instagram} target="_blank" rel="noreferrer" className="btn-outline">
                <Camera size={15} /> Instagram
              </a>
              <a href={settings.facebook} target="_blank" rel="noreferrer" className="btn-outline">
                <Globe2 size={15} /> Facebook
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative flex h-full min-h-[360px] flex-col justify-between overflow-hidden rounded-sm border border-cream/10 bg-black/20 p-8 sm:p-10">
              <div>
                <MapPinned size={26} className="text-olive" />
                <p className="eyebrow mt-6 !text-olive">Exact location</p>
                <h3 className="display-title mt-3 text-3xl text-cream">{settings.restaurantName.toUpperCase()}</h3>
                <p className="mt-3 text-sm leading-7 text-cream/60">{settings.address}</p>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <a
                  href={directionsUrl("driving")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-sm bg-olive px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-olive-dark"
                >
                  <Car size={15} /> Drive there
                </a>
                <a
                  href={directionsUrl("walking")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-sm border border-cream/30 px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cream transition hover:border-olive hover:bg-olive"
                >
                  <Footprints size={15} /> Walk there
                </a>
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-cream/45 transition hover:text-olive"
              >
                <MapPin size={13} /> Open in Google Maps
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
