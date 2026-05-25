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

const seedDemandas = (): Demanda[] => {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const days = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d;
  };
  return [
    {
      id: uid(),
      titulo: "Criativos campanha Mai/26",
      descricao: "Lote de 12 peças para meta paga",
      setor: "Design",
      prioridade: "alta",
      status: "Em execução",
      prazo: iso(days(2)),
      criadoEm: iso(days(-1)),
    },
    {
      id: uid(),
      titulo: "Landing page mentoria",
      descricao: "Nova LP com captação",
      setor: "Web Design",
      prioridade: "crítica",
      status: "Para aprovação",
      prazo: iso(days(1)),
      criadoEm: iso(days(-3)),
    },
    {
      id: uid(),
      titulo: "Edição caso clínico — Dra. Marta",
      descricao: "Vídeo completo + cortes",
      setor: "Vídeo",
      prioridade: "média",
      status: "Aguardando informação",
      prazo: iso(days(4)),
      criadoEm: iso(days(-2)),
    },
    {
      id: uid(),
      titulo: "Banners institucionais",
      descricao: "Atrasada por falta de copy",
      setor: "Design",
      prioridade: "média",
      status: "Atrasado",
      prazo: iso(days(-2)),
      criadoEm: iso(days(-7)),
      motivoAtraso: "aguardando copy",
      responsavelEntrave: "Copy",
    },
    {
      id: uid(),
      titulo: "Página de evento",
      descricao: "Realizada pelo time de tráfego",
      setor: "Web Design",
      prioridade: "baixa",
      status: "Realizado por outro",
      prazo: iso(days(-1)),
      criadoEm: iso(days(-5)),
      executadoPor: "Tráfego",
      motivoOutro: "Demanda absorvida pelo time",
    },
    {
      id: uid(),
      titulo: "Cortes aula 12",
      descricao: "Pacote semanal",
      setor: "Vídeo",
      prioridade: "alta",
      status: "Finalizado",
      prazo: iso(days(-1)),
      criadoEm: iso(days(-4)),
    },
  ];
};

const seedMetas = (): MetaFixa[] => [
  {
    id: uid(),
    titulo: "Vídeos completos de caso clínico",
    setor: "Vídeo",
    meta: 2,
    realizado: 2,
    periodo: "semanal",
  },
  {
    id: uid(),
    titulo: "Cortes dos vídeos de caso clínico",
    setor: "Vídeo",
    meta: 10,
    realizado: 7,
    periodo: "semanal",
  },
  {
    id: uid(),
    titulo: "Vídeos de relato de alunos editados",
    setor: "Vídeo",
    meta: 2,
    realizado: 3,
    periodo: "semanal",
  },
  {
    id: uid(),
    titulo: "Cortes de aulas antigas",
    setor: "Vídeo",
    meta: 5,
    realizado: 4,
    periodo: "semanal",
  },
  {
    id: uid(),
    titulo: "Cortes de vídeos antigos de eventos",
    setor: "Vídeo",
    meta: 10,
    realizado: 6,
    periodo: "semanal",
  },
  {
    id: uid(),
    titulo: "Cortes de insights de mentoria",
    setor: "Vídeo",
    meta: 2,
    realizado: 2,
    periodo: "semanal",
  },
  {
    id: uid(),
    titulo: "Vídeo plataforma por dentro",
    setor: "Vídeo",
    meta: 1,
    realizado: 0,
    periodo: "mensal",
  },
  {
    id: uid(),
    titulo: "Criativos",
    setor: "Design",
    meta: 50,
    realizado: 68,
    periodo: "semanal",
  },
  {
    id: uid(),
    titulo: "Páginas web",
    setor: "Web Design",
    meta: 3,
    realizado: 2,
    periodo: "semanal",
  },
  {
    id: uid(),
    titulo: "Dias presenciais na Optical",
    setor: "Presencial",
    meta: 2,
    realizado: 2,
    periodo: "semanal",
  },
];

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
