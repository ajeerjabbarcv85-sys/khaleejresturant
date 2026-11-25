"use client";

import { X } from "lucide-react";
import { statusLabel } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  hint?: string;
}) {
  return (
    <div className="rounded-sm border border-olive-dark/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/45">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-olive/10 text-olive">
          <Icon size={17} />
        </div>
      </div>
      <p className="mt-4 font-display text-3xl font-bold text-olive-dark">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-black/40">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const value = String(status).toUpperCase();
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-blue-100 text-blue-700",
    PREPARING: "bg-indigo-100 text-indigo-700",
    READY: "bg-cyan-100 text-cyan-700",
    OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-olive/10 text-olive",
    REJECTED: "bg-olive/10 text-olive",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-olive/10 text-olive",
    REFUNDED: "bg-silver/20 text-black/60",
    COMPLETED: "bg-green-100 text-green-700",
  };
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${styles[value] || "bg-black/5 text-black/55"}`}>
      {statusLabel(value)}
    </span>
  );
}

export function BarChart({
  data,
  labelKey,
  valueKey,
  format = (value: number) => String(value),
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  format?: (value: number) => string;
}) {
  const max = Math.max(...data.map((item) => Number(item[valueKey]) || 0), 1);
  return (
    <div className="flex h-52 items-end gap-2">
      {data.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const height = Math.max((value / max) * 100, value > 0 ? 6 : 2);
        return (
          <div key={`${String(item[labelKey])}-${index}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[9px] font-bold text-olive-dark opacity-0 transition group-hover:opacity-100">
              {format(value)}
            </span>
            <div className="relative w-full max-w-12 flex-1">
              <div
                className="absolute bottom-0 w-full rounded-t-sm bg-gradient-to-t from-olive/70 to-olive transition-all duration-500 group-hover:from-olive-dark group-hover:to-olive"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-[9px] font-semibold uppercase text-black/45">{String(item[labelKey])}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
      aria-pressed={checked}
    >
      <span className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-olive" : "bg-black/20"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-[1.15rem]" : "left-0.5"}`} />
      </span>
      {label && <span className="text-xs font-semibold text-black/60">{label}</span>}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className={`my-4 w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-sm bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-olive-dark/10 px-6 py-5">
          <h3 className="font-display text-xl font-bold text-olive-dark">{title}</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-olive-dark/5" aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="py-16 text-center">
      <p className="font-display text-xl text-olive-dark">{title}</p>
      {text && <p className="mt-2 text-sm text-black/45">{text}</p>}
    </div>
  );
}

export function PageHeading({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-olive-dark sm:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-black/50">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
