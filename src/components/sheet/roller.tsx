import { Dices, X } from "lucide-react";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DEGREE_LABEL, degreeOfSuccess, fmt, type Degree } from "@/lib/pf2/calc";
import { cn } from "@/lib/utils";

export type RollRecord = {
  id: string;
  label: string;
  kind: "check" | "damage";
  natural?: number;
  dice: number[];
  modifier: number;
  total: number;
  dc: number | null;
  degree?: Degree;
  detail: string;
};

type RollApi = {
  dc: string;
  setDc: (dc: string) => void;
  history: RollRecord[];
  rollCheck: (label: string, modifier: number) => void;
  rollDamage: (label: string, dice: number, die: number, flat: number, extra?: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const RollContext = createContext<RollApi | null>(null);

function rollDie(sides: number): number {
  return 1 + Math.floor(Math.random() * sides);
}

function rollExtra(expr: string): { total: number; detail: string } | null {
  const match = expr.match(/(\d+)\s*d\s*(\d+)/i);
  if (!match) return null;
  const count = Math.min(40, Number(match[1]));
  const sides = Number(match[2]);
  if (!sides) return null;
  const dice = Array.from({ length: count }, () => rollDie(sides));
  const bonusMatch = expr.match(/([+-])\s*(\d+)/);
  const bonus = bonusMatch ? Number(bonusMatch[2]) * (bonusMatch[1] === "-" ? -1 : 1) : 0;
  return {
    total: dice.reduce((sum, die) => sum + die, 0) + bonus,
    detail: `${expr}: [${dice.join(", ")}]${bonus ? ` ${fmt(bonus)}` : ""}`,
  };
}

export function RollProvider({ children }: { children: ReactNode }) {
  const [dc, setDc] = useState("");
  const [history, setHistory] = useState<RollRecord[]>([]);
  const [open, setOpen] = useState(false);

  const api = useMemo<RollApi>(() => {
    const push = (record: RollRecord) => {
      setHistory((prev) => [record, ...prev].slice(0, 8));
      setOpen(true);
    };
    return {
      dc,
      setDc,
      history,
      open,
      setOpen,
      rollCheck: (label, modifier) => {
        const natural = rollDie(20);
        const total = natural + modifier;
        const dcNum = dc.trim() === "" ? null : Number(dc);
        const degree =
          dcNum != null && Number.isFinite(dcNum) ? degreeOfSuccess(natural, total, dcNum) : undefined;
        push({
          id: `${Date.now()}-${natural}`,
          label,
          kind: "check",
          natural,
          dice: [natural],
          modifier,
          total,
          dc: dcNum != null && Number.isFinite(dcNum) ? dcNum : null,
          degree,
          detail: `d20 ${natural} ${fmt(modifier)}`,
        });
      },
      rollDamage: (label, diceCount, die, flat, extra = "") => {
        const dice = Array.from({ length: Math.max(1, diceCount) }, () => rollDie(die));
        const extraRoll = extra.trim() ? rollExtra(extra) : null;
        const total = dice.reduce((sum, value) => sum + value, 0) + flat + (extraRoll?.total ?? 0);
        push({
          id: `${Date.now()}-d`,
          label,
          kind: "damage",
          dice,
          modifier: flat,
          total,
          dc: null,
          detail: `${dice.length}d${die} [${dice.join(", ")}] ${fmt(flat)}${extraRoll ? ` · ${extraRoll.detail}` : extra.trim() ? ` · ${extra}` : ""}`,
        });
      },
    };
  }, [dc, history, open]);

  return (
    <RollContext.Provider value={api}>
      {children}
      <RollDock />
    </RollContext.Provider>
  );
}

export function useRoll(): RollApi {
  const ctx = useContext(RollContext);
  if (!ctx) throw new Error("Кости доступны только внутри листа");
  return ctx;
}

function RollDock() {
  const roll = useRoll();
  const last = roll.history[0];
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto flex max-w-3xl flex-col items-end gap-2 px-3 pb-3">
        {roll.open && last ? (
          <div className="pointer-events-auto w-full rounded-lg border border-gold bg-desk-2 p-3 text-paper shadow-sheet">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gold-soft">{last.label}</p>
                <p className="font-display text-4xl leading-none tabular">
                  {last.total}
                  {last.kind === "check" ? <span className="ml-2 text-xl text-gold-soft">{last.detail}</span> : null}
                </p>
                {last.kind === "damage" ? <p className="mt-1 text-sm text-gold-soft">{last.detail}</p> : null}
                {last.degree ? (
                  <p className={cn("mt-1 text-sm font-semibold", last.degree.includes("crit") ? "text-gold-soft" : "text-paper")}>
                    СЛ {last.dc}: {DEGREE_LABEL[last.degree]}
                    {last.natural === 20 ? " · натуральная 20 поднимает степень" : null}
                    {last.natural === 1 ? " · натуральная 1 снижает степень" : null}
                  </p>
                ) : last.kind === "check" ? (
                  <p className="mt-1 text-sm text-faint">Укажите СЛ, чтобы увидеть степень успеха.</p>
                ) : null}
              </div>
              <button type="button" className="inline-flex size-11 items-center justify-center text-paper" onClick={() => roll.setOpen(false)} aria-label="Скрыть бросок">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="text-sm text-gold-soft">
                СЛ проверки
                <input
                  inputMode="numeric"
                  value={roll.dc}
                  placeholder="—"
                  onChange={(event) => roll.setDc(event.target.value.replace(/[^\d-]/g, "").slice(0, 3))}
                  className="mt-1 block min-h-11 w-24 rounded-md border border-gold bg-desk px-3 text-base text-paper tabular"
                />
              </label>
              {last.kind === "check" ? (
                <button
                  type="button"
                  className="min-h-11 rounded-md border border-gold px-3 text-sm font-semibold text-gold-soft"
                  onClick={() => roll.rollCheck(last.label, last.modifier)}
                >
                  Ещё раз
                </button>
              ) : null}
            </div>
            {roll.history.length > 1 ? (
              <ul className="mt-3 flex gap-2 overflow-x-auto text-sm text-gold-soft">
                {roll.history.slice(1).map((item) => (
                  <li key={item.id} className="shrink-0 rounded-md border border-desk bg-desk px-2 py-1 tabular">
                    {item.label} {item.total}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          className="pointer-events-auto inline-flex size-14 items-center justify-center rounded-full border border-gold bg-blood text-paper shadow-sheet"
          aria-label="Открыть кости"
          onClick={() => roll.setOpen(!roll.open)}
        >
          <Dices className="size-6" />
        </button>
      </div>
    </div>
  );
}
