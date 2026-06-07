import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Flame, Lock, Plus, Minus, AlertCircle, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useMetas, SECTORS, type MetaFixa, type Sector } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { PeriodFilter, defaultPeriod } from "@/components/period-filter";
import { toast } from "sonner";


export const Route = createFileRoute("/demandas-fixas")({
  head: () => ({
    meta: [
      { title: "Demandas Fixas — Demandas Optical" },
      {
        name: "description",
        content: "Metas recorrentes semanais e mensais com progresso visual.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { metas, update, add, remove } = useMetas();
  const [period, setPeriod] = React.useState(defaultPeriod);
  const [openAdd, setOpenAdd] = React.useState(false);
  const semanais = metas.filter((m) => m.periodo === "semanal");
  const mensais = metas.filter((m) => m.periodo !== "semanal");

  return (
    <>
      <PageHeader
        title="Demandas Fixas"
        subtitle="Metas recorrentes — progresso visual, metas superadas e bloqueios."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PeriodFilter value={period} onChange={setPeriod} />
            <Button onClick={() => setOpenAdd(true)} className="rounded-full">
              <Plus className="h-4 w-4" /> Nova meta
            </Button>
          </div>
        }
      />

      {metas.length === 0 ? (
        <EmptyMetas onAdd={() => setOpenAdd(true)} />
      ) : (
        <>
          <Group title="Semanais" metas={semanais} update={update} remove={remove} />
          <div className="mt-10">
            <Group title="Mensais" metas={mensais} update={update} remove={remove} />
          </div>
        </>
      )}

      {openAdd && (
        <NovaMetaDialog
          onClose={() => setOpenAdd(false)}
          onSave={(m) => {
            add(m);
            toast.success("Meta criada");
            setOpenAdd(false);
          }}
        />
      )}
    </>
  );
}

function EmptyMetas({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="neo-card flex flex-col items-center rounded-2xl px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Flame className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium">Nenhuma demanda fixa cadastrada</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Cadastre metas recorrentes para acompanhar o progresso aqui.
      </p>
      <Button onClick={onAdd} className="mt-5 rounded-full">
        <Plus className="h-4 w-4" /> Criar primeira meta
      </Button>
    </div>
  );
}



function Group({
  title,
  metas,
  update,
  remove,
}: {
  title: string;
  metas: MetaFixa[];
  update: (id: string, p: Partial<MetaFixa>) => void;
  remove: (id: string) => void;
}) {
  if (metas.length === 0) return null;
  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">
          {metas.filter((m) => m.realizado >= m.meta).length}/{metas.length}{" "}
          atingidas
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {metas.map((m) => (
          <MetaCard key={m.id} m={m} update={update} remove={remove} />
        ))}
      </div>
    </section>
  );
}

function MetaCard({
  m,
  update,
  remove,
}: {
  m: MetaFixa;
  update: (id: string, p: Partial<MetaFixa>) => void;
  remove: (id: string) => void;
}) {
  const pct = Math.round((m.realizado / Math.max(m.meta, 1)) * 100);
  const superada = pct > 100;
  const completa = pct >= 100;
  const [showBloqueio, setShowBloqueio] = React.useState(!!m.bloqueada);


  return (
    <div
      className={`neo-card relative overflow-hidden rounded-2xl p-6 transition-all ${
        superada ? "premium-glow" : ""
      } ${m.bloqueada ? "opacity-80" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {m.setor}
          </p>
          <h3 className="mt-1 truncate text-base font-medium tracking-tight">
            {m.titulo}
          </h3>
        </div>
        {superada && (
          <span className="flex items-center gap-1.5 rounded-full border border-[oklch(0.85_0.15_75_/_0.35)] bg-[oklch(0.85_0.15_75_/_0.12)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.88_0.15_75)]">
            <Flame className="h-3 w-3" />
            Meta superada
          </span>
        )}
        {m.bloqueada && (
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <Lock className="h-3 w-3" />
            Bloqueada
          </span>
        )}
        <button
          onClick={() => {
            if (confirm("Remover esta meta?")) {
              remove(m.id);
              toast.success("Meta removida");
            }
          }}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Remover meta"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>


      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-semibold tabular-nums tracking-tight">
            {m.realizado}
            <span className="text-base text-muted-foreground">/{m.meta}</span>
          </span>
          <span
            className={`text-sm font-medium tabular-nums ${
              superada
                ? "text-[oklch(0.88_0.15_75)]"
                : completa
                  ? "text-[oklch(0.82_0.15_155)]"
                  : "text-muted-foreground"
            }`}
          >
            {pct}%
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: superada
                ? "linear-gradient(90deg, oklch(0.85 0.12 75), oklch(0.78 0.18 30))"
                : completa
                  ? "oklch(0.72 0.15 155)"
                  : "oklch(0.945 0.002 80)",
            }}
          />
        </div>
        {superada && (
          <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-[oklch(0.85_0.12_75_/_0.5)] to-transparent" />
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/60 p-1">
          <button
            onClick={() => update(m.id, { realizado: Math.max(0, m.realizado - 1) })}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Minus className="h-3 w-3" />
          </button>
          <input
            type="number"
            min={0}
            value={m.realizado}
            onChange={(e) =>
              update(m.id, {
                realizado: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="w-14 bg-transparent text-center text-xs tabular-nums outline-none"
          />
          <button
            onClick={() => update(m.id, { realizado: m.realizado + 1 })}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={() => {
            setShowBloqueio((s) => !s);
            if (m.bloqueada) update(m.id, { bloqueada: false });
          }}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          {m.bloqueada ? "Remover bloqueio" : "Sinalizar bloqueio"}
        </button>
      </div>


      {(showBloqueio || m.bloqueada) && !m.bloqueada && (
        <BloqueioForm m={m} update={update} onClose={() => setShowBloqueio(false)} />
      )}
      {m.bloqueada && (
        <div className="mt-4 rounded-xl border border-border bg-surface/60 p-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="font-medium uppercase tracking-wider">
              {m.statusBloqueio}
            </span>
          </div>
          {m.motivoBloqueio && (
            <p className="mt-2">{m.motivoBloqueio}</p>
          )}
          {m.responsavelBloqueio && (
            <p className="mt-1 text-muted-foreground">
              Responsável: {m.responsavelBloqueio}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BloqueioForm({
  m,
  update,
  onClose,
}: {
  m: MetaFixa;
  update: (id: string, p: Partial<MetaFixa>) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = React.useState<MetaFixa["statusBloqueio"]>(
    "bloqueada por terceiros",
  );
  const [motivo, setMotivo] = React.useState("");
  const [resp, setResp] = React.useState("");
  return (
    <div className="mt-4 space-y-2 rounded-xl border border-border bg-surface/60 p-3 text-xs">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as any)}
        className="h-9 w-full rounded-lg border border-border bg-background px-2"
      >
        <option>bloqueada por terceiros</option>
        <option>impossibilitada</option>
        <option>aguardando material</option>
        <option>aguardando aprovação</option>
      </select>
      <input
        placeholder="Motivo"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        className="h-9 w-full rounded-lg border border-border bg-background px-2"
      />
      <input
        placeholder="Responsável pelo bloqueio"
        value={resp}
        onChange={(e) => setResp(e.target.value)}
        className="h-9 w-full rounded-lg border border-border bg-background px-2"
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => {
            update(m.id, {
              bloqueada: true,
              statusBloqueio: status,
              motivoBloqueio: motivo,
              responsavelBloqueio: resp,
            });
            onClose();
          }}
        >
          Confirmar bloqueio
        </Button>
      </div>
    </div>
  );
}
