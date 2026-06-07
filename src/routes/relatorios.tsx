import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Download, Printer, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useDemandas, useMetas } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  PeriodFilter,
  defaultPeriod,
  computeRange,
  demandaInRange,
} from "@/components/period-filter";


export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Demandas Optical" },
      {
        name: "description",
        content: "Relatórios semanais, mensais e executivos.",
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

  const setores = ["Design", "Web Design", "Vídeo"].map((s) => ({
    setor: s,
    total: demandas.filter((d) => d.setor === s).length,
    concluidas: demandas.filter((d) => d.setor === s && d.status === "Finalizado")
      .length,
    porOutros: demandas.filter(
      (d) => d.setor === s && d.status === "Realizado por outro",
    ).length,
  }));

  const perf = metas.length
    ? Math.round(
        (metas.reduce(
          (a, m) => a + Math.min(1, m.realizado / Math.max(m.meta, 1)),
          0,
        ) /
          metas.length) *
          100,
      )
    : 0;

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="Visão executiva — produtividade, metas, gargalos e eficiência operacional."
        actions={
          <div className="flex flex-wrap gap-2">
            <PeriodFilter value={period} onChange={setPeriod} />
            <Button variant="outline" className="rounded-full" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button className="rounded-full" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        }
      />


      <div className="grid gap-4 md:grid-cols-4">
        <KPI label="Performance" value={`${perf}%`} />
        <KPI label="Metas atingidas" value={`${metas.filter((m) => m.realizado >= m.meta).length}/${metas.length}`} />
        <KPI label="Executadas" value={demandas.filter((d) => d.status === "Finalizado").length} />
        <KPI
          label="Por terceiros"
          value={demandas.filter((d) => d.status === "Realizado por outro").length}
        />
      </div>

      <section className="neo-card mt-6 rounded-2xl p-6">
        <header className="mb-5 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Relatório executivo
            </p>
            <h2 className="mt-1 text-lg font-medium tracking-tight">
              Performance por setor
            </h2>
          </div>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </header>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={setores} margin={{ top: 10, right: 10, left: -20 }}>
            <CartesianGrid stroke="oklch(0.3 0.003 80 / 0.5)" strokeDasharray="3 6" vertical={false} />
            <XAxis dataKey="setor" stroke="oklch(0.72 0.006 60)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="oklch(0.72 0.006 60)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.215 0.003 80)",
                border: "1px solid oklch(0.3 0.003 80)",
                borderRadius: 12,
                fontSize: 12,
              }}
              cursor={{ fill: "oklch(0.3 0.003 80 / 0.3)" }}
            />
            <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="oklch(0.85 0.12 75)" name="Total" />
            <Bar dataKey="concluidas" radius={[8, 8, 0, 0]} fill="oklch(0.72 0.15 155)" name="Concluídas" />
            <Bar dataKey="porOutros" radius={[8, 8, 0, 0]} fill="oklch(0.72 0.12 230)" name="Por outros" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ReportCard title="Resumo da semana">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between border-b border-border/60 py-2 last:border-0">
              <span className="text-muted-foreground">Demandas criadas</span>
              <span className="tabular-nums">{demandas.length}</span>
            </li>
            <li className="flex justify-between border-b border-border/60 py-2 last:border-0">
              <span className="text-muted-foreground">Demandas concluídas</span>
              <span className="tabular-nums">
                {demandas.filter((d) => d.status === "Finalizado").length}
              </span>
            </li>
            <li className="flex justify-between border-b border-border/60 py-2 last:border-0">
              <span className="text-muted-foreground">Volume produzido</span>
              <span className="tabular-nums">
                {metas.reduce((a, m) => a + m.realizado, 0)}
              </span>
            </li>
            <li className="flex justify-between py-2">
              <span className="text-muted-foreground">Eficiência operacional</span>
              <span className="tabular-nums">{perf}%</span>
            </li>
          </ul>
        </ReportCard>

        <ReportCard title="Gargalos da operação">
          <ul className="space-y-3 text-sm">
            {demandas
              .filter((d) => d.status === "Atrasado" || d.status === "Bloqueado")
              .map((d) => (
                <li
                  key={d.id}
                  className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[oklch(0.62_0.19_25)]" />
                  <div className="flex-1">
                    <p className="font-medium">{d.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.motivoAtraso ?? d.status} ·{" "}
                      {d.responsavelEntrave ?? d.setor}
                    </p>
                  </div>
                </li>
              ))}
            {demandas.filter(
              (d) => d.status === "Atrasado" || d.status === "Bloqueado",
            ).length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Sem gargalos ativos
              </p>
            )}
          </ul>
        </ReportCard>
      </div>
    </>
  );
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="neo-card rounded-2xl p-5">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}
function ReportCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="neo-card rounded-2xl p-6">
      <h3 className="mb-4 text-sm font-medium tracking-tight">{title}</h3>
      {children}
    </section>
  );
}
