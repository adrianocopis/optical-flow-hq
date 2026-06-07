import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertOctagon, Ban, Clock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useDemandas, useMetas } from "@/lib/store";
import {
  PeriodFilter,
  defaultPeriod,
  computeRange,
  demandaInRange,
} from "@/components/period-filter";


export const Route = createFileRoute("/gargalos")({
  head: () => ({
    meta: [
      { title: "Gargalos — Demandas Optical" },
      {
        name: "description",
        content: "Visão consolidada dos gargalos da operação: atrasos e bloqueios.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { demandas: allDemandas } = useDemandas();
  const { metas } = useMetas();
  const [period, setPeriod] = React.useState(defaultPeriod);
  const range = computeRange(period.preset, period);
  const demandas = allDemandas.filter((d) => demandaInRange(d, range));

  const atrasos = demandas.filter((d) => d.status === "Atrasado");
  const bloqueios = demandas.filter((d) => d.status === "Bloqueado");
  const metasBloq = metas.filter((m) => m.bloqueada);

  // Agregar por responsável
  const porResp: Record<string, number> = {};
  [...atrasos, ...bloqueios].forEach((d) => {
    const k = d.responsavelEntrave || d.executadoPor || "Não atribuído";
    porResp[k] = (porResp[k] ?? 0) + 1;
  });
  const ranking = Object.entries(porResp).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader
        title="Gargalos"
        subtitle="Diagnóstico operacional — onde a operação está travando e quem está envolvido."
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />


      <div className="grid gap-4 md:grid-cols-3">
        <Tile
          icon={AlertOctagon}
          label="Atrasos ativos"
          value={atrasos.length}
          tone="danger"
        />
        <Tile
          icon={Ban}
          label="Bloqueios em demandas"
          value={bloqueios.length}
          tone="muted"
        />
        <Tile
          icon={Clock}
          label="Metas bloqueadas"
          value={metasBloq.length}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="neo-card lg:col-span-2 rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-medium tracking-tight">
            Demandas em gargalo
          </h3>
          <ul className="divide-y divide-border/60">
            {[...atrasos, ...bloqueios].map((d) => (
              <li key={d.id} className="py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{d.titulo}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {d.setor} · prazo{" "}
                      {new Date(d.prazo).toLocaleDateString("pt-BR")}
                    </p>
                    {(d.motivoAtraso || d.observacaoAtraso) && (
                      <p className="mt-2 rounded-lg bg-surface/60 px-3 py-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {d.motivoAtraso}
                        </span>
                        {d.observacaoAtraso && ` — ${d.observacaoAtraso}`}
                      </p>
                    )}
                  </div>
                  {d.responsavelEntrave && (
                    <span className="rounded-full border border-border bg-surface/60 px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {d.responsavelEntrave}
                    </span>
                  )}
                </div>
              </li>
            ))}
            {atrasos.length + bloqueios.length === 0 && (
              <p className="py-10 text-center text-xs text-muted-foreground">
                Nenhum gargalo ativo. Operação fluida.
              </p>
            )}
          </ul>
        </section>

        <section className="neo-card rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-medium tracking-tight">
            Por responsável
          </h3>
          {ranking.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Sem dados
            </p>
          ) : (
            <ul className="space-y-3">
              {ranking.map(([k, v]) => {
                const max = ranking[0][1];
                return (
                  <li key={k}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{k}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {v}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-[oklch(0.62_0.19_25)]"
                        style={{ width: `${(v / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {metasBloq.length > 0 && (
        <section className="neo-card mt-6 rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-medium tracking-tight">
            Metas bloqueadas
          </h3>
          <ul className="space-y-2">
            {metasBloq.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/40 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{m.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.statusBloqueio} · {m.responsavelBloqueio ?? "—"}
                  </p>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {m.realizado}/{m.meta}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  tone: "danger" | "muted" | "warning";
}) {
  const colorMap = {
    danger: "text-[oklch(0.78_0.18_25)]",
    muted: "text-muted-foreground",
    warning: "text-[oklch(0.85_0.15_75)]",
  };
  return (
    <div className="neo-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${colorMap[tone]}`} strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}
