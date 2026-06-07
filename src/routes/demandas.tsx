import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  Upload,
  Trash2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  useDemandas,
  SECTORS,
  PRIORITIES,
  STATUSES,
  EXECUTORES,
  MOTIVOS_ATRASO,
  type Demanda,
  type Status,
  type Priority,
  type Sector,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PeriodFilter,
  defaultPeriod,
  computeRange,
  demandaInRange,
} from "@/components/period-filter";


export const Route = createFileRoute("/demandas")({
  head: () => ({
    meta: [
      { title: "Demandas — Demandas Optical" },
      {
        name: "description",
        content:
          "Gerencie demandas criativas: criação, prioridade, status, gargalos e arquivos.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { demandas, add, update, remove } = useDemandas();
  const [view, setView] = React.useState<"table" | "cards">("table");
  const [q, setQ] = React.useState("");
  const [filterSetor, setFilterSetor] = React.useState<"todos" | Sector>("todos");
  const [filterStatus, setFilterStatus] = React.useState<"todos" | Status>(
    "todos",
  );
  const [filterPrior, setFilterPrior] = React.useState<"todos" | Priority>(
    "todos",
  );
  const [sortBy, setSortBy] = React.useState<"prazo" | "criado" | "prioridade">(
    "prazo",
  );
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Demanda | null>(null);

  const [period, setPeriod] = React.useState(defaultPeriod);
  const range = computeRange(period.preset, period);

  const filtered = React.useMemo(() => {
    let r = demandas.filter((d) => {
      if (!demandaInRange(d, range)) return false;
      if (filterSetor !== "todos" && d.setor !== filterSetor) return false;
      if (filterStatus !== "todos" && d.status !== filterStatus) return false;
      if (filterPrior !== "todos" && d.prioridade !== filterPrior) return false;
      if (q && !`${d.titulo} ${d.descricao}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });

      if (filterPrior !== "todos" && d.prioridade !== filterPrior) return false;
      if (q && !`${d.titulo} ${d.descricao}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
    const prOrder: Priority[] = ["crítica", "alta", "média", "baixa"];
    r.sort((a, b) => {
      if (sortBy === "prazo") return +new Date(a.prazo) - +new Date(b.prazo);
      if (sortBy === "criado")
        return +new Date(b.criadoEm) - +new Date(a.criadoEm);
      return prOrder.indexOf(a.prioridade) - prOrder.indexOf(b.prioridade);
    });
    return r;
  }, [demandas, q, filterSetor, filterStatus, filterPrior, sortBy]);

  return (
    <>
      <PageHeader
        title="Demandas"
        subtitle="Sistema completo de gerenciamento. Filtros, prioridades, status e upload de arquivos."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="rounded-full"
          >
            <Plus className="h-4 w-4" /> Nova demanda
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="neo-card mb-6 flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="h-10 w-full rounded-xl border border-border bg-surface/60 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40"
          />
        </div>

        <Select value={filterSetor} onChange={(v) => setFilterSetor(v as any)}>
          <option value="todos">Todos os setores</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select value={filterStatus} onChange={(v) => setFilterStatus(v as any)}>
          <option value="todos">Todos status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select value={filterPrior} onChange={(v) => setFilterPrior(v as any)}>
          <option value="todos">Todas prioridades</option>
          {PRIORITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select value={sortBy} onChange={(v) => setSortBy(v as any)}>
          <option value="prazo">Ordenar por prazo</option>
          <option value="criado">Mais recentes</option>
          <option value="prioridade">Prioridade</option>
        </Select>

        <div className="ml-auto inline-flex rounded-xl border border-border bg-surface/60 p-1">
          <button
            onClick={() => setView("table")}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs ${
              view === "table"
                ? "bg-foreground text-background"
                : "text-muted-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" /> Tabela
          </button>
          <button
            onClick={() => setView("cards")}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs ${
              view === "cards"
                ? "bg-foreground text-background"
                : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty />
      ) : view === "table" ? (
        <TableView
          rows={filtered}
          onEdit={(d) => {
            setEditing(d);
            setOpen(true);
          }}
          onDelete={(id) => {
            remove(id);
            toast.success("Demanda removida");
          }}
        />
      ) : (
        <CardsView
          rows={filtered}
          onEdit={(d) => {
            setEditing(d);
            setOpen(true);
          }}
        />
      )}

      {open && (
        <DemandaDialog
          initial={editing}
          onClose={() => setOpen(false)}
          onSave={(payload) => {
            if (editing) {
              update(editing.id, payload);
              toast.success("Demanda atualizada");
            } else {
              add(payload as any);
              toast.success("Demanda criada");
            }
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-xl border border-border bg-surface/60 pl-8 pr-8 text-xs outline-none focus:border-foreground/40"
      >
        {children}
      </select>
    </div>
  );
}

function statusColor(s: Status) {
  switch (s) {
    case "Finalizado":
      return "bg-[oklch(0.72_0.15_155_/_0.15)] text-[oklch(0.82_0.15_155)] border-[oklch(0.72_0.15_155_/_0.3)]";
    case "Em execução":
      return "bg-[oklch(0.72_0.12_230_/_0.15)] text-[oklch(0.82_0.12_230)] border-[oklch(0.72_0.12_230_/_0.3)]";
    case "Atrasado":
      return "bg-[oklch(0.62_0.19_25_/_0.15)] text-[oklch(0.78_0.18_25)] border-[oklch(0.62_0.19_25_/_0.3)]";
    case "Bloqueado":
      return "bg-[oklch(0.5_0.01_80_/_0.3)] text-muted-foreground border-border";
    case "Para aprovação":
      return "bg-[oklch(0.78_0.15_75_/_0.15)] text-[oklch(0.85_0.15_75)] border-[oklch(0.78_0.15_75_/_0.3)]";
    case "Aguardando informação":
      return "bg-secondary text-muted-foreground border-border";
    case "Realizado por outro":
      return "bg-[oklch(0.7_0.18_320_/_0.15)] text-[oklch(0.82_0.18_320)] border-[oklch(0.7_0.18_320_/_0.3)]";
  }
}
function prColor(p: Priority) {
  return {
    crítica: "text-[oklch(0.78_0.18_25)]",
    alta: "text-[oklch(0.85_0.15_75)]",
    média: "text-foreground",
    baixa: "text-muted-foreground",
  }[p];
}

function Empty() {
  return (
    <div className="neo-card flex flex-col items-center rounded-2xl px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium">Nenhuma demanda encontrada</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Ajuste os filtros ou crie uma nova demanda para começar.
      </p>
    </div>
  );
}

function TableView({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Demanda[];
  onEdit: (d: Demanda) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="neo-card overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Demanda</th>
              <th className="px-5 py-3 font-medium">Setor</th>
              <th className="px-5 py-3 font-medium">Prioridade</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Prazo</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr
                key={d.id}
                onClick={() => onEdit(d)}
                className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-surface-elevated/50"
              >
                <td className="px-5 py-4">
                  <div className="font-medium">{d.titulo}</div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {d.descricao}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  {d.setor}
                </td>
                <td className={`px-5 py-4 text-xs font-medium ${prColor(d.prioridade)}`}>
                  {d.prioridade}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusColor(d.status)}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs tabular-nums text-muted-foreground">
                  {new Date(d.prazo).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(d.id);
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardsView({
  rows,
  onEdit,
}: {
  rows: Demanda[];
  onEdit: (d: Demanda) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((d) => (
        <button
          key={d.id}
          onClick={() => onEdit(d)}
          className="neo-card group rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-medium tracking-tight">{d.titulo}</h4>
            <span className={`text-xs font-medium ${prColor(d.prioridade)}`}>
              {d.prioridade}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            {d.descricao}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusColor(d.status)}`}
            >
              {d.status}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {d.setor} · {new Date(d.prazo).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function DemandaDialog({
  initial,
  onClose,
  onSave,
}: {
  initial: Demanda | null;
  onClose: () => void;
  onSave: (d: Partial<Demanda>) => void;
}) {
  const [form, setForm] = React.useState<Partial<Demanda>>(
    initial ?? {
      titulo: "",
      descricao: "",
      setor: "Design",
      prioridade: "média",
      status: "Em execução",
      prazo: new Date().toISOString().slice(0, 10),
      arquivos: [],
    },
  );
  const set = <K extends keyof Demanda>(k: K, v: Demanda[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isOutro = form.status === "Realizado por outro";
  const isAtrasado = form.status === "Atrasado";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="neo-card relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-2 text-muted-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-semibold tracking-tight">
          {initial ? "Editar demanda" : "Nova demanda"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Preencha os dados — campos contextuais aparecem conforme o status.
        </p>

        <div className="mt-6 grid gap-4">
          <Field label="Título">
            <input
              value={form.titulo ?? ""}
              onChange={(e) => set("titulo", e.target.value)}
              className={inputCls}
              placeholder="Ex.: Landing page mentoria"
            />
          </Field>
          <Field label="Descrição">
            <textarea
              value={form.descricao ?? ""}
              onChange={(e) => set("descricao", e.target.value)}
              className={`${inputCls} min-h-[80px] py-2`}
              placeholder="Detalhe a demanda..."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Setor">
              <NativeSelect
                value={form.setor as string}
                onChange={(v) => set("setor", v as Sector)}
                options={SECTORS}
              />
            </Field>
            <Field label="Prioridade">
              <NativeSelect
                value={form.prioridade as string}
                onChange={(v) => set("prioridade", v as Priority)}
                options={PRIORITIES}
              />
            </Field>
            <Field label="Status">
              <NativeSelect
                value={form.status as string}
                onChange={(v) => set("status", v as Status)}
                options={STATUSES}
              />
            </Field>
            <Field label="Prazo">
              <input
                type="date"
                value={(form.prazo ?? "").slice(0, 10)}
                onChange={(e) =>
                  set("prazo", new Date(e.target.value).toISOString())
                }
                className={inputCls}
              />
            </Field>
          </div>

          {isOutro && (
            <Section title="Realizado por outro" tone="info">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Executado por">
                  <NativeSelect
                    value={form.executadoPor ?? "Tráfego"}
                    onChange={(v) => set("executadoPor", v as any)}
                    options={EXECUTORES}
                  />
                </Field>
                <Field label="Motivo">
                  <input
                    value={form.motivoOutro ?? ""}
                    onChange={(e) => set("motivoOutro", e.target.value)}
                    className={inputCls}
                    placeholder="Motivo da delegação"
                  />
                </Field>
              </div>
              <Field label="Observação">
                <textarea
                  value={form.observacaoOutro ?? ""}
                  onChange={(e) => set("observacaoOutro", e.target.value)}
                  className={`${inputCls} min-h-[64px] py-2`}
                />
              </Field>
              <p className="text-[11px] text-muted-foreground">
                Estas tarefas não impactam negativamente a performance pessoal.
              </p>
            </Section>
          )}

          {isAtrasado && (
            <Section title="Justificativa de atraso" tone="danger">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Motivo do atraso">
                  <NativeSelect
                    value={form.motivoAtraso ?? "aguardando cliente"}
                    onChange={(v) => set("motivoAtraso", v as any)}
                    options={MOTIVOS_ATRASO}
                  />
                </Field>
                <Field label="Responsável pelo entrave">
                  <input
                    value={form.responsavelEntrave ?? ""}
                    onChange={(e) => set("responsavelEntrave", e.target.value)}
                    className={inputCls}
                    placeholder="Quem segura?"
                  />
                </Field>
              </div>
              <Field label="Observação">
                <textarea
                  value={form.observacaoAtraso ?? ""}
                  onChange={(e) => set("observacaoAtraso", e.target.value)}
                  className={`${inputCls} min-h-[64px] py-2`}
                />
              </Field>
            </Section>
          )}

          <Section title="Arquivos & links">
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-surface/40 p-4">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                PSD · PNG · JPG · MP4 · PDF · FIGMA · Drive · Links externos
              </span>
            </div>
            <input
              placeholder="Cole um link (Drive, Figma, etc.)"
              className={inputCls}
              onKeyDown={(e) => {
                const t = e.currentTarget;
                if (e.key === "Enter" && t.value) {
                  e.preventDefault();
                  set("arquivos", [
                    ...(form.arquivos ?? []),
                    { nome: t.value, url: t.value, tipo: "link" },
                  ]);
                  t.value = "";
                }
              }}
            />
            {(form.arquivos ?? []).length > 0 && (
              <ul className="space-y-1 text-xs">
                {(form.arquivos ?? []).map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-surface/60 px-3 py-2"
                  >
                    <span className="truncate">{a.nome}</span>
                    <button
                      onClick={() =>
                        set(
                          "arquivos",
                          (form.arquivos ?? []).filter((_, j) => j !== i),
                        )
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(form)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-surface/60 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} appearance-none`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
function Section({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "info" | "danger";
}) {
  const border =
    tone === "danger"
      ? "border-[oklch(0.62_0.19_25_/_0.3)]"
      : tone === "info"
        ? "border-[oklch(0.7_0.18_320_/_0.3)]"
        : "border-border";
  return (
    <div className={`space-y-3 rounded-2xl border bg-surface/40 p-4 ${border}`}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}
