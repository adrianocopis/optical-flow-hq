import * as React from "react";

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
  prazo: string; // ISO
  criadoEm: string; // ISO
  executadoPor?: ExecutadoPor;
  motivoOutro?: string;
  observacaoOutro?: string;
  motivoAtraso?: MotivoAtraso;
  observacaoAtraso?: string;
  responsavelEntrave?: string;
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
}

const DEMANDAS_KEY = "optical-demandas";
const METAS_KEY = "optical-metas";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const seedDemandas = (): Demanda[] => [];

const seedMetas = (): MetaFixa[] => [];


function read<T>(key: string, seed: () => T): T {
  if (typeof window === "undefined") return seed();
  try {
    const v = localStorage.getItem(key);
    if (!v) {
      const s = seed();
      localStorage.setItem(key, JSON.stringify(s));
      return s;
    }
    return JSON.parse(v) as T;
  } catch {
    return seed();
  }
}

function write<T>(key: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(v));
}

// Simple pub/sub
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function useDemandas() {
  const [data, setData] = React.useState<Demanda[]>(() =>
    read(DEMANDAS_KEY, seedDemandas),
  );
  React.useEffect(() => {
    const l = () => setData(read(DEMANDAS_KEY, seedDemandas));
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  const save = (next: Demanda[]) => {
    write(DEMANDAS_KEY, next);
    setData(next);
    notify();
  };
  return {
    demandas: data,
    add: (d: Omit<Demanda, "id" | "criadoEm">) =>
      save([
        { ...d, id: uid(), criadoEm: new Date().toISOString() },
        ...data,
      ]),
    update: (id: string, patch: Partial<Demanda>) =>
      save(data.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    remove: (id: string) => save(data.filter((x) => x.id !== id)),
  };
}

export function useMetas() {
  const [data, setData] = React.useState<MetaFixa[]>(() =>
    read(METAS_KEY, seedMetas),
  );
  React.useEffect(() => {
    const l = () => setData(read(METAS_KEY, seedMetas));
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  const save = (next: MetaFixa[]) => {
    write(METAS_KEY, next);
    setData(next);
    notify();
  };
  return {
    metas: data,
    update: (id: string, patch: Partial<MetaFixa>) =>
      save(data.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    add: (m: Omit<MetaFixa, "id">) => save([...data, { ...m, id: uid() }]),
    remove: (id: string) => save(data.filter((x) => x.id !== id)),
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
