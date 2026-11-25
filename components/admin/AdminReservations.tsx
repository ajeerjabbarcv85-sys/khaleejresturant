"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, X, Trash2, Plus, Clock3 } from "lucide-react";
import { api } from "@/lib/api";
import { EmptyState, Modal, PageHeading, StatusBadge } from "@/components/admin/ui";
import type { Reservation, RestaurantTable } from "@/lib/types";

export default function AdminReservations({
  reservations,
  tables,
  timeSlots,
  onRefresh,
  notify,
}: {
  reservations: Reservation[];
  tables: RestaurantTable[];
  timeSlots: string[];
  onRefresh: () => void;
  notify: (message: string, ok?: boolean) => void;
}) {
  const [date, setDate] = useState("");
  const [tableOpen, setTableOpen] = useState(false);
  const [tableForm, setTableForm] = useState({ name: "", seats: 2 });
  const [busy, setBusy] = useState(false);

  const visible = useMemo(
    () => (date ? reservations.filter((item) => item.date === date) : reservations),
    [reservations, date]
  );

  const update = async (id: number, status: string) => {
    try {
      await api.updateReservation(id, { status: status as Reservation["status"] });
      notify("Reservation updated");
      onRefresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Update failed", false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this reservation?")) return;
    try {
      await api.deleteReservation(id);
      notify("Reservation deleted");
      onRefresh();
    } catch {
      notify("Unable to delete reservation", false);
    }
  };

  const addTable = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.addTable(tableForm);
      notify("Table added");
      setTableOpen(false);
      setTableForm({ name: "", seats: 2 });
      onRefresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to add table", false);
    } finally {
      setBusy(false);
    }
  };

  const deleteTable = async (id: number) => {
    if (!window.confirm("Delete this table?")) return;
    try {
      await api.deleteTable(id);
      notify("Table deleted");
      onRefresh();
    } catch {
      notify("Unable to delete table", false);
    }
  };

  return (
    <div>
      <PageHeading
        title="Reservations"
        subtitle="Review booking requests, assign tables and manage availability."
        action={<button type="button" onClick={() => setTableOpen(true)} className="btn-primary !py-2.5 !text-[10px]"><Plus size={14} /> Add table</button>}
      />

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-black/55">
              <CalendarCheck size={15} className="text-olive" /> Filter by date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field !w-auto !py-2" />
            </label>
            {date && <button type="button" onClick={() => setDate("")} className="text-xs font-bold text-olive hover:underline">Clear</button>}
          </div>

          <div className="overflow-hidden rounded-sm border border-olive-dark/10 bg-white">
            {visible.length === 0 ? (
              <EmptyState title="No reservations" text="Booking requests will show up here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-cream text-[10px] uppercase tracking-wider text-black/45">
                    <tr>
                      <th className="px-5 py-3">Guest</th>
                      <th className="px-5 py-3">When</th>
                      <th className="px-5 py-3">Guests</th>
                      <th className="px-5 py-3">Table</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-olive-dark/10">
                    {visible.map((item) => (
                      <tr key={item.id} className="hover:bg-cream/50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-olive-dark">{item.name}</p>
                          <p className="text-[11px] text-black/45">{item.phone}</p>
                          <p className="text-[10px] text-black/35">{item.code}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{item.date}</p>
                          <p className="text-xs text-olive">{item.time}</p>
                        </td>
                        <td className="px-5 py-4">{item.guests}</td>
                        <td className="px-5 py-4"><span className="rounded-sm bg-cream px-2.5 py-1 text-xs font-bold">{item.tableName || "Unassigned"}</span></td>
                        <td className="px-5 py-4"><StatusBadge status={String(item.status)} /></td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {item.status === "PENDING" && (
                              <>
                                <button type="button" onClick={() => update(item.id, "APPROVED")} className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-700 hover:underline"><Check size={12} /> Approve</button>
                                <button type="button" onClick={() => update(item.id, "CANCELLED")} className="flex items-center gap-1 text-[10px] font-bold uppercase text-olive hover:underline"><X size={12} /> Cancel</button>
                              </>
                            )}
                            {item.status === "APPROVED" && (
                              <button type="button" onClick={() => update(item.id, "COMPLETED")} className="text-[10px] font-bold uppercase text-olive-dark hover:underline">Mark completed</button>
                            )}
                            {(item.status === "CANCELLED" || item.status === "COMPLETED") && (
                              <button type="button" onClick={() => update(item.id, "PENDING")} className="text-[10px] font-bold uppercase text-olive-dark hover:underline">Reopen</button>
                            )}
                            <button type="button" onClick={() => remove(item.id)} className="text-olive-dark/40 hover:text-olive" aria-label="Delete"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-sm border border-olive-dark/10 bg-white p-5">
            <h2 className="font-display text-lg font-bold text-olive-dark">Restaurant tables</h2>
            <div className="mt-4 space-y-2">
              {tables.map((table) => (
                <div key={table.id} className="flex items-center justify-between rounded-sm border border-olive-dark/10 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-olive-dark">{table.name}</p>
                    <p className="text-[10px] text-black/40">Seats {table.seats}</p>
                  </div>
                  <button type="button" onClick={() => deleteTable(table.id)} className="text-olive-dark/35 hover:text-olive" aria-label="Delete table"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-olive-dark/10 bg-white p-5">
            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-olive" />
              <h2 className="font-display text-lg font-bold text-olive-dark">Time slots</h2>
            </div>
            <p className="mt-1 text-[11px] text-black/45">Edit these in Website Settings.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {timeSlots.map((slot) => (
                <span key={slot} className="rounded-sm bg-cream px-2 py-1 text-[10px] font-semibold text-olive-dark">{slot}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={tableOpen} onClose={() => setTableOpen(false)} title="Add a table">
        <form onSubmit={addTable} className="space-y-5">
          <label className="block">
            <span className="label">Table name</span>
            <input required value={tableForm.name} onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })} className="field" placeholder="T09" />
          </label>
          <label className="block">
            <span className="label">Number of seats</span>
            <input required type="number" min="1" max="30" value={tableForm.seats} onChange={(e) => setTableForm({ ...tableForm, seats: Number(e.target.value) })} className="field" />
          </label>
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? "Adding..." : "Add table"}</button>
        </form>
      </Modal>
    </div>
  );
}
