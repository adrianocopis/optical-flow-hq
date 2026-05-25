import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Ban,
  Target as TargetIcon,
  Gauge,
  TrendingUp,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useDemandas, useMetas } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Demandas Optical" },
      {
        name: "description",
        content:
          "Visão executiva da operação criativa: produtividade, metas, gargalos e fluxo operacional.",
      },
    ],
  }),
  component: Dashboard,
});

const palette = {
  primary: "oklch(0.945 0.002 80)",
  accent: "oklch(0.85 0.12 75)",
  success: "oklch(0.72 0.15 155)",
  info: "oklch(0.72 0.12 230)",
  danger: "oklch(0.62 0.19 25)",
  muted: "oklch(0.72 0.006 60)",
  grid: "oklch(0.3 0.003 80 / 0.5)",
};

function isThisWeek(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}
function isThisMonth(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

function Dashboard() {
  const { demandas } = useDemandas();
  const { metas } = useMetas();

  const concluidas = demandas.filter((d) => d.status === "Finalizado").length;
  const atrasadas = demandas.filter((d) => d.status === "Atrasado").length;
  const bloqueadas = demandas.filter((d) => d.status === "Bloqueado").length;
  const semana = demandas.filter((d) => isThisWeek(d.criadoEm)).length;
  const mes = demandas.filter((d) => isThisMonth(d.criadoEm)).length;
  const metasOk = metas.filter((m) => m.realizado >= m.meta).length;
  const performance = Math.round(
    (metas.reduce(
      (acc, m) => acc + Math.min(1, m.realizado / Math.max(m.meta, 1)),
      0,
    ) /
      Math.max(metas.length, 1)) *
      100,
  );
  const volume = metas.reduce((acc, m) => acc + m.realizado, 0);

  // Charts data
  const weekly = [
    { d: "Seg", v: 12 },
    { d: "Ter", v: 18 },
    { d: "Qua", v: 22 },
    { d: "Qui", v: 16 },
    { d: "Sex", v: 28 },
    { d: "Sáb", v: 9 },
    { d: "Dom", v: 4 },
  ];
  const monthly = [
    { m: "Jan", v: 140 },
    { m: "Fev", v: 178 },
    { m: "Mar", v: 162 },
    { m: "Abr", v: 198 },
    { m: "Mai", v: 224 },
    { m: "Jun", v: 211 },
  ];
  const porSetor = ["Design", "Web Design", "Vídeo"].map((s) => ({
    setor: s,
    v: demandas.filter((d) => d.setor === s).length || 0,
    meta: metas
      .filter((m) => m.setor === s)
      .reduce((a, m) => a + m.realizado, 0),
  }));
  const donut = [
    {
      name: "Executadas",
      value: demandas.filter((d) => d.status === "Finalizado").length,
      c: palette.success,
    },
    {
      name: "Por outros",
      value: demandas.filter((d) => d.status === "Realizado por outro").length,
      c: palette.info,
    },
    { name: "Bloqueadas", value: bloqueadas, c: palette.muted },
    { name: "Atrasadas", value: atrasadas, c: palette.danger },
  ].filter((x) => x.value > 0);

  const fluxo = [
    { k: "Executadas por mim", v: concluidas, c: palette.primary },
    {
      k: "Por terceiros",
      v: demandas.filter((d) => d.status === "Realizado por outro").length,
      c: palette.info,
    },
    { k: "Bloqueadas", v: bloqueadas, c: palette.muted },
    { k: "Atrasadas", v: atrasadas, c: palette.danger },
  ];

  return (
    <>
      <PageHeader
        title="Visão executiva"
        subtitle="Acompanhamento da operação criativa em tempo real — Design, Web Design e Vídeo."
        actions={
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.15_155)]" />
            Operação ativa · semana atual
          </div>
        }
      />

      {/* Top cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Demandas da semana" value={semana} icon={Clock} delta="+12%" />
        <Stat label="Demandas do mês" value={mes} icon={Layers} delta="+8%" />
        <Stat
          label="Concluídas"
          value={concluidas}
          icon={CheckCircle2}
          delta="+3"
          positive
        />
        <Stat
          label="Atrasadas"
          value={atrasadas}
          icon={AlertOctagon}
          delta="-1"
          negative
        />
        <Stat
          label="Bloqueadas"
          value={bloqueadas}
          icon={Ban}
          delta="0"
          subtle
        />
        <Stat
          label="Metas concluídas"
          value={`${metasOk}/${metas.length}`}
          icon={TargetIcon}
        />
        <Stat
          label="Performance geral"
          value={`${performance}%`}
          icon={Gauge}
          highlight
        />
        <Stat label="Volume produzido" value={volume} icon={TrendingUp} />
      </div>

      {/* Charts row 1 */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Produtividade semanal"
          hint="Demandas concluídas por dia"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={palette.accent} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={palette.grid} strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="d" stroke={palette.muted} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={palette.muted} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ stroke: palette.grid }}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={palette.accent}
                strokeWidth={2}
                fill="url(#g1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fluxo operacional" hint="Distribuição da produção">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={donut}
                dataKey="value"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                stroke="none"
              >
                {donut.map((e, i) => (
                  <Cell key={i} fill={e.c} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: palette.muted }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Comparativo mensal" hint="Volume produzido por mês">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly} margin={{ top: 10, right: 10, left: -20 }}>
              <CartesianGrid stroke={palette.grid} strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="m" stroke={palette.muted} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={palette.muted} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="v" stroke={palette.primary} strokeWidth={2} dot={{ r: 3, fill: palette.accent }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Produtividade por setor" hint="Volume por área">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={porSetor} margin={{ top: 10, right: 10, left: -20 }}>
              <CartesianGrid stroke={palette.grid} strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="setor" stroke={palette.muted} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={palette.muted} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.3 0.003 80 / 0.3)" }} />
              <Bar dataKey="meta" radius={[8, 8, 0, 0]} fill={palette.accent} />
              <Bar dataKey="v" radius={[8, 8, 0, 0]} fill={palette.info} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fluxo operacional" hint="Por origem de execução">
          <div className="flex h-[240px] flex-col justify-center gap-4">
            {fluxo.map((f) => {
              const total = fluxo.reduce((a, b) => a + b.v, 0) || 1;
              const pct = Math.round((f.v / total) * 100);
              return (
                <div key={f.k}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{f.k}</span>
                    <span className="tabular-nums">
                      {f.v}
                      <span className="ml-2 text-muted-foreground">{pct}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: f.c }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "oklch(0.215 0.003 80)",
  border: "1px solid oklch(0.3 0.003 80)",
  borderRadius: 12,
  fontSize: 12,
  padding: "8px 12px",
  boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.5)",
};

function Stat({
  label,
  value,
  icon: Icon,
  delta,
  positive,
  negative,
  subtle,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  delta?: string;
  positive?: boolean;
  negative?: boolean;
  subtle?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`neo-card group relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
        highlight ? "premium-glow" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {delta && (
          <span
            className={`flex items-center gap-1 text-xs ${
              positive
                ? "text-[oklch(0.72_0.15_155)]"
                : negative
                  ? "text-[oklch(0.62_0.19_25)]"
                  : subtle
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : negative ? (
              <ArrowDownRight className="h-3.5 w-3.5" />
            ) : null}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  hint,
  children,
  className = "",
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`neo-card rounded-2xl p-6 ${className}`}>
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-medium tracking-tight">{title}</h3>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
