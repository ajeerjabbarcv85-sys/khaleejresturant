"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, Users, Loader2 } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import IndiaTime from "@/components/site/IndiaTime";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { isValidPhone, todayISO } from "@/lib/utils";
import type { RestaurantSettings, RestaurantTable } from "@/lib/types";

type Props = { settings: RestaurantSettings; onBooked?: () => void };

export default function Reservations({ settings, onBooked }: Props) {
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(settings.timeSlots?.[0] || "19:00");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState<{ code: string; table: string } | null>(null);

  useEffect(() => {
    let active = true;
    const loadTables = () => {
      api
        .listTables({ date, time })
        .then((data) => active && setTables(data))
        .catch(() => active && setTables([]));
    };
    loadTables();
    const interval = window.setInterval(loadTables, 8000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [date, time]);

  useEffect(() => {
    setSelectedTableId(null);
    setError(null);
  }, [date, time, guests]);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId]
  );

  useEffect(() => {
    if (selectedTable && (selectedTable.available === false || selectedTable.seats < guests)) {
      setSelectedTableId(null);
      setError(
        selectedTable.available === false
          ? "That table was just booked. Please choose another one."
          : "That table is too small for your group. Choose a larger table."
      );
    }
  }, [selectedTable, guests]);

  const suitableTables = useMemo(
    () => tables.filter((table) => table.available !== false && table.seats >= guests),
    [tables, guests]
  );

  const canSubmit = useMemo(
    () =>
      name.trim().length > 1 &&
      isValidPhone(phone) &&
      selectedTable !== null &&
      selectedTable.available === true &&
      selectedTable.seats >= guests,
    [name, phone, selectedTable, guests]
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !selectedTable) {
      setError("Enter your name and mobile number, then choose an available table.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await api.createReservation({
        name,
        phone,
        date,
        time,
        guests,
        tableId: selectedTable.id,
      });
      setConfirmed({ code: result.code || "RSV-PENDING", table: result.tableName || "To be assigned" });
      onBooked?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save your reservation");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="reservations" className="relative overflow-hidden bg-olive-deep py-20 text-cream md:py-28">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/images/hero/hero-3.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-gradient-to-r from-olive-dark via-olive-dark/95 to-olive-dark/70" />
      <div className="container-x relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <p className="eyebrow !text-olive">Reservations</p>
          <h2 className="display-title mt-4 text-4xl sm:text-5xl lg:text-6xl">Save your seat</h2>
          <p className="mt-6 max-w-lg text-sm leading-8 text-cream/65">
            Whether it is a quiet dinner for two or a celebration with friends, reserve a table
            and we will have everything ready when you arrive.
          </p>
          <div className="mt-10 space-y-5">
            <div className="flex items-start gap-4">
              <CalendarDays size={20} className="mt-0.5 text-olive" />
              <div>
                <p className="text-sm font-semibold">Open every day</p>
                <p className="mt-1 text-xs text-cream/50">Lunch 11:00 – 14:30 · Dinner 18:00 – 22:30</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-cream/50">
                  <span>Live India time</span>
                  <IndiaTime className="font-semibold text-cream/80" />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Users size={20} className="mt-0.5 text-olive" />
              <div>
                <p className="text-sm font-semibold">Groups welcome</p>
                <p className="mt-1 text-xs text-cream/50">Tables for 1 to 8 guests. Larger parties — call us.</p>
              </div>
            </div>
          </div>
          <div className="mt-10 border-l-2 border-olive pl-5">
            <p className="font-script text-base text-olive">See you soon</p>
            <p className="mt-2 text-xs text-cream/50">Free cancellation up to 2 hours before your slot.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-sm border border-cream/10 bg-black/30 p-6 backdrop-blur-md sm:p-9">
            {confirmed ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-olive">
                  <Check size={28} />
                </div>
                <h3 className="display-title mt-6 text-3xl">Reservation requested</h3>
                <p className="mt-3 text-sm text-cream/65">
                  We have noted {confirmed.table} for {guests} guests on {date} at {time}.
                </p>
                <div className="mt-6 rounded-sm border border-cream/15 p-5 text-left text-sm">
                  <div className="flex justify-between border-b border-cream/10 pb-3">
                    <span className="text-cream/50">Reference</span>
                    <span className="font-bold text-gold">{confirmed.code}</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-cream/50">Table</span>
                    <span className="font-semibold">{confirmed.table}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setConfirmed(null); setName(""); setPhone(""); setSelectedTableId(null); }}
                  className="btn-outline mt-7"
                >
                  Make another reservation
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="grid gap-5 sm:grid-cols-3">
                  <label>
                    <span className="label !text-cream/60">Date</span>
                    <input type="date" required min={todayISO()} value={date} onChange={(e) => { setDate(e.target.value); setError(null); }} className="field !border-cream/20 !bg-black/30 !text-cream [color-scheme:dark]" />
                  </label>
                  <label>
                    <span className="label !text-cream/60">Time</span>
                    <select value={time} onChange={(e) => { setTime(e.target.value); setError(null); }} className="field !border-cream/20 !bg-black/30 !text-cream [color-scheme:dark]">
                      {(settings.timeSlots || []).map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="label !text-cream/60">Guests</span>
                    <select value={guests} onChange={(e) => { setGuests(Number(e.target.value)); setError(null); }} className="field !border-cream/20 !bg-black/30 !text-cream [color-scheme:dark]">
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}
                    </select>
                  </label>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-sm border border-cream/10 bg-cream/5 px-4 py-3 text-[11px] text-cream/60">
                  <Clock3 size={14} className="text-olive" />
                  {suitableTables.length > 0
                    ? `${suitableTables.length} suitable table${suitableTables.length === 1 ? "" : "s"} available for this slot`
                    : "No suitable tables free for this slot — try another time"}
                </div>

                <div className="mt-6">
                  <p className="label !text-cream/60">Choose your table</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {tables.map((table) => {
                      const booked = table.available === false;
                      const tooSmall = table.seats < guests;
                      const disabled = booked || tooSmall;
                      const selected = selectedTableId === table.id;
                      const status = booked ? "Booked" : tooSmall ? "Too small" : "Available";
                      return (
                        <button
                          key={table.id}
                          type="button"
                          disabled={disabled}
                          aria-pressed={selected}
                          onClick={() => { setSelectedTableId(table.id); setError(null); }}
                          className={`rounded-sm border px-3 py-3 text-left transition ${
                            selected
                              ? "border-olive bg-olive/20"
                              : "border-cream/15 bg-white/5 enabled:hover:border-olive/60"
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          <span className="block text-sm font-bold text-cream">{table.seats} seats</span>
                          <span className="mt-0.5 block text-[10px] text-cream/45">{table.name}</span>
                          <span className={`mt-2 block text-[9px] font-bold uppercase tracking-[0.12em] ${booked || tooSmall ? "text-olive-200/70" : "text-green-300"}`}>
                            {status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="label !text-cream/60">Your name</span>
                    <input required value={name} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="Full name" className="field !border-cream/20 !bg-black/30 !text-cream placeholder:!text-cream/30" />
                  </label>
                  <label>
                    <span className="label !text-cream/60">Phone</span>
                    <input required inputMode="numeric" value={phone} onChange={(e) => { setPhone(e.target.value); setError(null); }} placeholder="10-digit mobile number" className="field !border-cream/20 !bg-black/30 !text-cream placeholder:!text-cream/30" />
                  </label>
                </div>

                {error && <p className="mt-4 rounded-sm bg-olive/15 px-4 py-3 text-xs text-olive-200">{error}</p>}

                <button type="submit" disabled={busy} className="btn-primary mt-7 w-full">
                  {busy ? <><Loader2 size={15} className="animate-spin" /> Reserving...</> : "Request a table"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
