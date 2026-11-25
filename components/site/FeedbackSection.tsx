"use client";

import { useEffect, useState } from "react";
import { Star, Quote, Send, Loader2 } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { api } from "@/lib/api";
import type { Feedback } from "@/lib/types";

export default function FeedbackSection() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api.listFeedback().then(setItems).catch(() => setItems([]));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      await api.submitFeedback({ name, rating, message });
      setStatus({ ok: true, text: "Thank you — your feedback has been sent." });
      setName("");
      setMessage("");
      setRating(5);
    } catch (error) {
      setStatus({ ok: false, text: error instanceof Error ? error.message : "Unable to send feedback" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="feedback" className="bg-cream-dark/60 py-20 md:py-28">
      <div className="container-x">
        <Reveal className="text-center">
          <p className="eyebrow">Guest stories</p>
          <h2 className="display-title mt-4 text-4xl text-olive-dark sm:text-5xl lg:text-6xl">
            What our guests say
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-olive" />
        </Reveal>

        {items.length > 0 ? (
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {items.slice(0, 3).map((item, index) => (
              <Reveal key={item.id} delay={index * 0.08}>
                <div className="relative h-full rounded-sm border border-olive-dark/10 bg-white p-7">
                  <Quote size={28} className="text-olive/25" />
                  <div className="mt-4 flex gap-1">
                    {Array.from({ length: item.rating }, (_, i) => <Star key={i} size={13} className="fill-olive text-olive" />)}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-black/65">“{item.message}”</p>
                  <div className="mt-6 border-t border-olive-dark/10 pt-4">
                    <p className="font-display text-lg font-semibold text-olive-dark">{item.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-black/40">Verified guest</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="mt-12 text-center">
            <p className="text-sm text-black/55">Be the first to share your Kaleej experience.</p>
          </Reveal>
        )}

        <Reveal className="mx-auto mt-14 max-w-2xl rounded-sm border border-olive-dark/10 bg-white p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-olive/40" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-olive">Leave feedback</p>
            <div className="h-px flex-1 bg-olive/40" />
          </div>
          <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="label">Your name</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="field" />
            </label>
            <div>
              <span className="label">Your rating</span>
              <div className="flex items-center gap-1 pt-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  >
                    <Star size={22} className={value <= rating ? "fill-olive text-olive" : "text-olive-dark/25"} />
                  </button>
                ))}
              </div>
            </div>
            <label className="sm:col-span-2">
              <span className="label">Your experience</span>
              <textarea required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us about the food, the service, the evening..." className="field" />
            </label>
            <div className="sm:col-span-2">
              {status && (
                <p className={`mb-4 rounded-sm px-4 py-3 text-xs ${status.ok ? "bg-green-50 text-green-700" : "bg-olive/10 text-olive"}`}>
                  {status.text}
                </p>
              )}
              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send feedback</>}
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
