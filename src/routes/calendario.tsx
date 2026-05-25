import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useDemandas } from "@/lib/store";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — Demandas Optical" },
      {
        name: "description",
        content: "Calendário anual 2026 com filtro semanal de demandas.",
      },
    ],
  }),
  component: Page,
});

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function startOfWeek(d: Date) {
  const day = (d.getDay() + 6) % 7;
  const s = new Date(d);
  s.setDate(d.getDate() - day);
  s.setHours(0, 0, 0, 0);
  return s;
}

function fmt(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Page() {
  const { demandas } = useDemandas();
  const [weekStart, setWeekStart] = React.useState(() => startOfWeek(new Date(2026, 4, 17)));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const semanaItems = demandas.filter((d) => {
    const t = new Date(d.prazo);
    return t >= weekStart && t <= weekEnd;
  });

  const move = (n: number) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + n * 7);
    setWeekStart(next);
  };

  return (
    <>
      <PageHeader
        title="Calendário 2026"
        subtitle="Visão anual com filtro semanal. Navegue pelas semanas para focar a operação."
      />

      <div className="neo-card mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Semana selecionada
          </p>
          <p className="mt-1 text-lg font-medium tracking-tight">
            {fmt(weekStart)} <span className="text-muted-foreground">até</span>{" "}
            {fmt(weekEnd)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => move(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/60 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="rounded-full border border-border bg-surface/60 px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Hoje
          </button>
          <button
            onClick={() => move(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/60 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="neo-card mb-8 rounded-2xl p-6">
        <h3 className="mb-3 text-sm font-medium tracking-tight">
          Demandas com prazo na semana
        </h3>
        {semanaItems.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Nenhuma demanda nesta semana
          </p>
        ) : (
          <ul className="space-y-2">
            {semanaItems.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/40 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{d.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.setor} · {d.status}
                  </p>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {new Date(d.prazo).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Visão anual
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MESES.map((nome, idx) => (
          <MiniMonth
            key={idx}
            month={idx}
            year={2026}
            label={nome}
            weekStart={weekStart}
            onPick={(d) => setWeekStart(startOfWeek(d))}
          />
        ))}
      </div>
    </>
  );
}

function MiniMonth({
  month,
  year,
  label,
  weekStart,
  onPick,
}: {
  month: number;
  year: number;
  label: string;
  weekStart: Date;
  onPick: (d: Date) => void;
}) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let i = 1; i <= days; i++) cells.push(i);

  const ws = startOfWeek(weekStart);
  const we = new Date(ws);
  we.setDate(ws.getDate() + 6);

  return (
    <div className="neo-card rounded-2xl p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h4 className="text-sm font-medium tracking-tight">{label}</h4>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {year}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
        {cells.map((c, i) => {
          if (c === null) return <span key={i} />;
          const date = new Date(year, month, c);
          const inWeek = date >= ws && date <= we;
          return (
            <button
              key={i}
              onClick={() => onPick(date)}
              className={`flex h-7 items-center justify-center rounded-md text-[11px] tabular-nums transition-colors ${
                inWeek
                  ? "bg-foreground text-background"
                  : "text-foreground/80 hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
