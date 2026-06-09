import * as React from "react";
import { supabase } from "./supabase";

export type Sector = "Design" | "Web Design" | "Vídeo";
export type Priority = "crítica" | "alta" | "média" | "baixa";
export type Status =
  | "Em execução"
  | "Aguardando informação"
  | "Para aprovação"
  | "Finalizado"
  | "Bloqueado"
  | "Atrasado"
  | "Realizado por outro";

export type ExecutadoPor =
  | "Tráfego"
  | "Social Media"
  | "Copy"
  | "Vídeo"
  | "Design"
  | "Web Design"
  | "Especialista"
  | "Outro";

export type MotivoAtraso =
  | "aguardando cliente"
  | "aguardando especialista"
  | "aguardando copy"
  | "aguardando material"
  | "mudança de escopo"
  | "retrabalho"
  | "erro técnico"
  | "excesso de demandas"
  | "outro";

export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  setor: Sector;
  prioridade: Priority;
  status: Status;
  prazo: string;
  criadoEm: string;
  executadoPor?: ExecutadoPor;
  motivoOutro?: string;
  observacaoOutro?: string;
  motivoAtraso?: MotivoAtraso;
  observacaoAtraso?: string;
  responsavelEntrave?: string;
  dataInicio?: string;
  dataConclusao?: string;
  origemAtraso?: string;
  realizadoPor?: string;
  realizadoPorOutro?: boolean;
  motivoBloqueio?: string;
  responsavelBloqueio?: string;
  observacoes?: string;
  arquivos?: { nome: string; url?: string; tipo: string }[];
}

export interface MetaFixa {
  id: string;
  titulo: string;
  setor: Sector | "Presencial";
  meta: number;
  realizado: number;
  periodo: "semanal" | "mensal" | "diário";
  bloqueada?: boolean;
  statusBloqueio?:
    | "bloqueada por terceiros"
    | "impossibilitada"
    | "aguardando material"
    | "aguardando aprovação";
  motivoBloqueio?: string;
  responsavelBloqueio?: string;
  observacoes?: string;
  semanaInicio?: string;
  semanaFim?: string;
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

let demandasCache: Demanda[] = [];
let metasCache: MetaFixa[] = [];

function uid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function demandaFromRow(row: any): Demanda {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    setor: row.setor,
    prioridade: row.prioridade,
    status: row.status,
    prazo: row.prazo,
    criadoEm: row.criado_em,
    executadoPor: row.executado_por ?? undefined,
    motivoOutro: row.motivo_outro ?? undefined,
    observacaoOutro: row.observacao_outro ?? undefined,
    motivoAtraso: row.motivo_atraso ?? undefined,
    observacaoAtraso: row.observacao_atraso ?? undefined,
    responsavelEntrave: row.responsavel_entrave ?? undefined,
    dataInicio: row.data_inicio ?? undefined,
    dataConclusao: row.data_conclusao ?? undefined,
    origemAtraso: row.origem_atraso ?? undefined,
    realizadoPor: row.realizado_por ?? undefined,
    realizadoPorOutro: row.realizado_por_outro ?? false,
    motivoBloqueio: row.motivo_bloqueio ?? undefined,
    responsavelBloqueio: row.responsavel_bloqueio ?? undefined,
    observacoes: row.observacoes ?? undefined,
    arquivos: [],
  };
}

function demandaToRow(demanda: Demanda) {
  return {
    id: demanda.id,
    titulo: demanda.titulo,
    descricao: demanda.descricao,
    setor: demanda.setor,
    prioridade: demanda.prioridade,
    status: demanda.status,
    prazo: demanda.prazo,
    criado_em: demanda.criadoEm,
    executado_por: demanda.executadoPor ?? null,
    motivo_outro: demanda.motivoOutro ?? null,
    observacao_outro: demanda.observacaoOutro ?? null,
    motivo_atraso: demanda.motivoAtraso ?? null,
    observacao_atraso: demanda.observacaoAtraso ?? null,
    responsavel_entrave: demanda.responsavelEntrave ?? null,
    data_inicio: demanda.dataInicio ?? null,
    data_conclusao: demanda.dataConclusao ?? null,
    origem_atraso: demanda.origemAtraso ?? null,
    realizado_por: demanda.realizadoPor ?? null,
    realizado_por_outro: demanda.realizadoPorOutro ?? false,
    motivo_bloqueio: demanda.motivoBloqueio ?? null,
    responsavel_bloqueio: demanda.responsavelBloqueio ?? null,
    observacoes: demanda.observacoes ?? null,
  };
}

function metaFromRow(row: any): MetaFixa {
  return {
    id: row.id,
    titulo: row.titulo,
    setor: row.setor,
    meta: row.meta,
    realizado: row.realizado,
    periodo: row.periodo,
    bloqueada: row.bloqueada ?? false,
    statusBloqueio: row.status_bloqueio ?? undefined,
    motivoBloqueio: row.motivo_bloqueio ?? undefined,
    responsavelBloqueio: row.responsavel_bloqueio ?? undefined,
    observacoes: row.observacoes ?? undefined,
    semanaInicio: row.semana_inicio ?? undefined,
    semanaFim: row.semana_fim ?? undefined,
  };
}

function metaToRow(meta: MetaFixa) {
  return {
    id: meta.id,
    titulo: meta.titulo,
    setor: meta.setor,
    meta: meta.meta,
    realizado: meta.realizado,
    periodo: meta.periodo,
    bloqueada: meta.bloqueada ?? false,
    status_bloqueio: meta.statusBloqueio ?? null,
    motivo_bloqueio: meta.motivoBloqueio ?? null,
    responsavel_bloqueio: meta.responsavelBloqueio ?? null,
    observacoes: meta.observacoes ?? null,
    semana_inicio: meta.semanaInicio ?? null,
    semana_fim: meta.semanaFim ?? null,
  };
}

async function loadDemandas() {
  const { data, error } = await supabase
    .from("demandas")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar demandas:", error);
    return;
  }

  demandasCache = (data ?? []).map(demandaFromRow);
  notify();
}

async function loadMetas() {
  const { data, error } = await supabase
    .from("metas_fixas")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar metas fixas:", error);
    return;
  }

  metasCache = (data ?? []).map(metaFromRow);
  notify();
}

export function useDemandas() {
  const [data, setData] = React.useState<Demanda[]>(demandasCache);

  React.useEffect(() => {
    const listener = () => setData([...demandasCache]);

    listeners.add(listener);
    loadDemandas();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    demandas: data,

    add: async (demanda: Omit<Demanda, "id" | "criadoEm">) => {
      const item: Demanda = {
        ...demanda,
        id: uid(),
        criadoEm: new Date().toISOString(),
      };

      demandasCache = [item, ...demandasCache];
      notify();

      const { error } = await supabase
        .from("demandas")
        .insert(demandaToRow(item));

      if (error) {
        console.error("Erro ao criar demanda:", error);
        return;
      }

      await loadDemandas();
    },

    update: async (id: string, patch: Partial<Demanda>) => {
      const current = demandasCache.find((item) => item.id === id);

      if (!current) return;

      const updated = {
        ...current,
        ...patch,
      };

      demandasCache = demandasCache.map((item) =>
        item.id === id ? updated : item,
      );
      notify();

      const { error } = await supabase
        .from("demandas")
        .update(demandaToRow(updated))
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar demanda:", error);
        return;
      }

      await loadDemandas();
    },

    remove: async (id: string) => {
      demandasCache = demandasCache.filter((item) => item.id !== id);
      notify();

      const { error } = await supabase.from("demandas").delete().eq("id", id);

      if (error) {
        console.error("Erro ao remover demanda:", error);
        return;
      }

      await loadDemandas();
    },
  };
}

export function useMetas() {
  const [data, setData] = React.useState<MetaFixa[]>(metasCache);

  React.useEffect(() => {
    const listener = () => setData([...metasCache]);

    listeners.add(listener);
    loadMetas();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    metas: data,

    add: async (meta: Omit<MetaFixa, "id">) => {
      const item: MetaFixa = {
        ...meta,
        id: uid(),
      };

      metasCache = [item, ...metasCache];
      notify();

      const { error } = await supabase
        .from("metas_fixas")
        .insert(metaToRow(item));

      if (error) {
        console.error("Erro ao criar meta fixa:", error);
        return;
      }

      await loadMetas();
    },

    update: async (id: string, patch: Partial<MetaFixa>) => {
      const current = metasCache.find((item) => item.id === id);

      if (!current) return;

      const updated = {
        ...current,
        ...patch,
      };

      metasCache = metasCache.map((item) => (item.id === id ? updated : item));
      notify();

      const { error } = await supabase
        .from("metas_fixas")
        .update(metaToRow(updated))
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar meta fixa:", error);
        return;
      }

      await loadMetas();
    },

    remove: async (id: string) => {
      metasCache = metasCache.filter((item) => item.id !== id);
      notify();

      const { error } = await supabase
        .from("metas_fixas")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao remover meta fixa:", error);
        return;
      }

      await loadMetas();
    },
  };
}

export const SECTORS: Sector[] = ["Design", "Web Design", "Vídeo"];

export const PRIORITIES: Priority[] = ["crítica", "alta", "média", "baixa"];

export const STATUSES: Status[] = [
  "Em execução",
  "Aguardando informação",
  "Para aprovação",
  "Finalizado",
  "Bloqueado",
  "Atrasado",
  "Realizado por outro",
];

export const EXECUTORES: ExecutadoPor[] = [
  "Tráfego",
  "Social Media",
  "Copy",
  "Vídeo",
  "Design",
  "Web Design",
  "Especialista",
  "Outro",
];

export const MOTIVOS_ATRASO: MotivoAtraso[] = [
  "aguardando cliente",
  "aguardando especialista",
  "aguardando copy",
  "aguardando material",
  "mudança de escopo",
  "retrabalho",
  "erro técnico",
  "excesso de demandas",
  "outro",
];