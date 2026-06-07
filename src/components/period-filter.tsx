import * as React from "react";
import { Calendar as CalIcon, ChevronDown, X } from "lucide-react";

export type PeriodRange = { start: Date; end: Date } | null;
export type PeriodPreset =
  | "todos"
  | "hoje"
  | "7d"
  | "30d"
  | "mes"
  | "mes-anterior"
  | "semana"
  | "custom";

const PRESET_LABEL: Record<PeriodPreset, string> = {
  todos: "Todos os períodos",
  hoje: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  mes: "Este mês",
  "mes-anterior": "Mês anterior",
  semana: "Semana específica",
  custom: "Intervalo personalizado",
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfWeek(d: Date) {
  const day = (d.getDay() + 6) % 7;
  const s = startOfDay(d);
  s.setDate(s.getDate() - day);
  return s;
}

export function computeRange(
  preset: PeriodPreset,
  custom?: { from?: string; to?: string },
): PeriodRange {
  const now = new Date();
  switch (preset) {
    case "todos":
      return null;
    case "hoje":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "7d": {
      const s = startOfDay(now);
      s.setDate(s.getDate() - 6);
      return { start: s, end: endOfDay(now) };
    }
    case "30d": {
      const s = startOfDay(now);
      s.setDate(s.getDate() - 29);
      return { start: s, end: endOfDay(now) };
    }
    case "mes":
      return {
        start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    case "mes-anterior":
      return {
        start: startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    case "semana": {
      const base = custom?.from ? new Date(custom.from) : now;
      const s = startOfWeek(base);
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      return { start: s, end: endOfDay(e) };
    }
    case "custom": {
      if (!custom?.from || !custom?.to) return null;
      return {
        start: startOfDay(new Date(custom.from)),
        end: endOfDay(new Date(custom.to)),
      };
    }
  }
}

export function inRange(date: string | Date | undefined, range: PeriodRange) {
  if (!range) return true;
  if (!date) return false;
  const t = +new Date(date);
  return t >= +range.start && t <= +range.end;
}

/** Demanda matches if ANY of criadoEm or prazo falls in range */
export function demandaInRange(
  d: { criadoEm?: string; prazo?: string },
  range: PeriodRange,
) {
  if (!range) return true;
  return inRange(d.criadoEm, range) || inRange(d.prazo, range);
}

function fmt(d: Date) {
  return d.toLocaleDateString("pt-BR");
}

export function PeriodFilter({
  value,
  onChange,
}: {
  value: { preset: PeriodPreset; from?: string; to?: string };
  onChange: (v: { preset: PeriodPreset; from?: string; to?: string }) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const range = computeRange(value.preset, value);
  const labelExtra = range
    ? `${fmt(range.start)} → ${fmt(range.end)}`
    : "todos os dados";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass flex h-10 items-center gap-2 rounded-full border border-border px-4 text-xs text-foreground transition-colors hover:bg-surface/60"
      >
        <CalIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{PRESET_LABEL[value.preset]}</span>
        <span className="hidden text-muted-foreground sm:inline">·</span>
        <span className="hidden text-muted-foreground sm:inline">
          {labelExtra}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[320px] origin-top-right rounded-2xl border border-border bg-surface-elevated/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Período
            </p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {(
              [
                "todos",
                "hoje",
                "7d",
                "30d",
                "mes",
                "mes-anterior",
                "semana",
                "custom",
              ] as PeriodPreset[]
            ).map((p) => (
              <button
                key={p}
                onClick={() => {
                  onChange({ ...value, preset: p });
                  if (p !== "semana" && p !== "custom") setOpen(false);
                }}
                className={`rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                  value.preset === p
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {PRESET_LABEL[p]}
              </button>
            ))}
          </div>

          {(value.preset === "semana" || value.preset === "custom") && (
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {value.preset === "semana" ? "Qualquer dia da semana" : "De"}
                </span>
                <input
                  type="date"
                  value={value.from ?? ""}
                  onChange={(e) => onChange({ ...value, from: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/40"
                />
              </label>
              {value.preset === "custom" && (
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Até
                  </span>
                  <input
                    type="date"
                    value={value.to ?? ""}
                    onChange={(e) =>
                      onChange({ ...value, to: e.target.value })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/40"
                  />
                </label>
              )}
              <div className="rounded-lg bg-surface/60 px-3 py-2 text-[11px] text-muted-foreground">
                {range
                  ? `${fmt(range.start)} até ${fmt(range.end)}`
                  : "Selecione as datas"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const defaultPeriod = {
  preset: "todos" as PeriodPreset,
  from: undefined,
  to: undefined,
};
