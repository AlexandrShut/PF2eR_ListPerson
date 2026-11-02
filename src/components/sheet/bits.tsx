import { useEffect, useRef, useState, type ReactNode } from "react";
import { clamp, fmt } from "@/lib/pf2/calc";
import { nextProf, profLabel, profShort } from "@/lib/pf2/data";
import type { Character, Part, Proficiency } from "@/lib/pf2/types";
import { cn } from "@/lib/utils";

export type Patch = (recipe: (character: Character) => Character) => void;

export function Section({
  title,
  kicker,
  extra,
  children,
}: {
  title: string;
  kicker?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="paper p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          {kicker ? <p className="text-xs font-semibold tracking-widest text-gold uppercase">{kicker}</p> : null}
          <h2 className="font-display text-3xl leading-none text-blood">{title}</h2>
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}

export function Btn({
  children,
  onClick,
  tone = "ghost",
  disabled,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "ghost" | "blood" | "gold" | "desk";
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors",
        tone === "ghost" && "border-line bg-paper text-ink hover:bg-paper-2",
        tone === "blood" && "border-blood bg-blood text-paper hover:bg-blood-deep",
        tone === "gold" && "border-gold bg-gold text-paper hover:bg-blood",
        tone === "desk" && "border-desk-2 bg-desk text-paper hover:bg-desk-2",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </button>
  );
}

const fieldClass =
  "min-h-11 w-full rounded-md border border-line bg-paper px-3 text-base text-ink outline-none placeholder:text-faint";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm text-muted">
      {label ? <span>{label}</span> : null}
      <input className={fieldClass} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function NumField({
  label,
  value,
  onChange,
  min = -99,
  max = 99,
}: {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText(String(value));
  }, [value]);
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm text-muted">
      {label ? <span>{label}</span> : null}
      <input
        className={cn(fieldClass, "tabular")}
        inputMode="numeric"
        value={text}
        onChange={(event) => {
          const raw = event.target.value;
          if (!/^-?\d*$/.test(raw)) return;
          setText(raw);
          if (raw === "" || raw === "-") return;
          onChange(clamp(Number(raw), min, max));
        }}
        onBlur={() => {
          if (text === "" || text === "-") onChange(0);
        }}
      />
    </label>
  );
}

export function NullableNum({
  label,
  value,
  onChange,
  placeholder = "нет",
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm text-muted">
      <span>{label}</span>
      <input
        className={cn(fieldClass, "tabular")}
        inputMode="numeric"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(event) => {
          const raw = event.target.value.trim();
          onChange(raw === "" ? null : clamp(Number(raw), -5, 20));
        }}
      />
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm text-muted">
      {label ? <span>{label}</span> : null}
      <select className={fieldClass} value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function GrowText({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm text-muted">
      {label ? <span>{label}</span> : null}
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-16 w-full resize-y rounded-md border border-line bg-paper px-3 py-2 text-base leading-relaxed text-ink outline-none placeholder:text-faint"
      />
    </label>
  );
}

const RANK_CLASS: Record<Proficiency, string> = {
  0: "border-line bg-paper text-faint",
  2: "border-gold bg-paper text-gold",
  4: "border-gold bg-gold-soft text-ink",
  6: "border-blood bg-blood text-paper",
  8: "border-gold bg-blood-deep text-gold-soft",
};

export function RankButton({
  rank,
  onChange,
}: {
  rank: Proficiency;
  onChange: (rank: Proficiency) => void;
}) {
  return (
    <button
      type="button"
      title={`${profLabel(rank)}. Нажмите, чтобы сменить ранг`}
      onClick={() => onChange(nextProf(rank))}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-md border text-sm font-bold",
        RANK_CLASS[rank],
      )}
    >
      <span className="sr-only">{profLabel(rank)}</span>
      {profShort(rank)}
    </button>
  );
}

export function Parts({ parts }: { parts: Part[] }) {
  const shown = parts.filter((part) => part.value !== 0 || part.label === "база");
  if (shown.length === 0) return null;
  return (
    <p className="text-sm leading-snug text-muted">
      {shown.map((part) => `${part.label} ${fmt(part.value)}`).join(" · ")}
    </p>
  );
}

export function StatButton({
  value,
  label,
  onClick,
  hint,
}: {
  value: string;
  label: string;
  onClick?: () => void;
  hint?: string;
}) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} title={hint} className="flex flex-col items-start rounded-md text-left hover:bg-paper-3">
        <span className="text-sm text-muted">{label}</span>
        <span className="font-display text-4xl leading-none text-ink tabular">{value}</span>
      </button>
    );
  }
  return (
    <div className="flex flex-col items-start text-left">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-display text-4xl leading-none text-ink tabular">{value}</span>
    </div>
  );
}

export function ActionMarks({ cost }: { cost: string }) {
  if (cost === "reaction") {
    return (
      <span className="inline-flex min-h-11 min-w-11 items-center justify-center font-display text-2xl text-blood" title="Реакция">
        ↺
      </span>
    );
  }
  if (cost === "free") {
    return (
      <span className="inline-flex min-h-11 items-center px-1 text-xs font-bold tracking-wide text-blood uppercase">
        своб.
      </span>
    );
  }
  const count = Number(cost) || 1;
  return (
    <span className="inline-flex min-h-11 items-center gap-1 text-blood" title={`${count} д.`} aria-label={`${count} действий`}>
      {Array.from({ length: Math.min(3, count) }, (_, index) => (
        <svg key={index} viewBox="0 0 10 10" className="size-4" aria-hidden="true">
          <rect x="1.2" y="1.2" width="7.6" height="7.6" transform="rotate(45 5 5)" fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}

export function Toggle({
  on,
  label,
  onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-md border px-3 text-left text-sm font-medium",
        on ? "border-blood bg-blood text-paper" : "border-line bg-paper text-ink hover:bg-paper-2",
      )}
    >
      {label}
    </button>
  );
}
