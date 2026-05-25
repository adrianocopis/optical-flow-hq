import { createFileRoute } from "@tanstack/react-router";
import { FileText, ImageIcon, Film, Link as LinkIcon, FileType } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useDemandas } from "@/lib/store";

export const Route = createFileRoute("/arquivos")({
  head: () => ({
    meta: [
      { title: "Arquivos — Demandas Optical" },
      {
        name: "description",
        content: "Centralize PSD, PNG, JPG, MP4, PDF, Figma e links externos.",
      },
    ],
  }),
  component: Page,
});

function iconFor(tipo: string) {
  const t = tipo.toLowerCase();
  if (t.includes("mp4") || t.includes("video")) return Film;
  if (t.includes("png") || t.includes("jpg") || t.includes("psd"))
    return ImageIcon;
  if (t.includes("pdf")) return FileText;
  if (t.includes("link") || t.includes("http") || t.includes("drive") || t.includes("figma"))
    return LinkIcon;
  return FileType;
}

function Page() {
  const { demandas } = useDemandas();
  const files = demandas.flatMap((d) =>
    (d.arquivos ?? []).map((a) => ({ ...a, demanda: d.titulo, setor: d.setor })),
  );

  return (
    <>
      <PageHeader
        title="Arquivos"
        subtitle="Tudo o que está anexado às demandas — PSD, PNG, JPG, MP4, PDF, Figma e links."
      />

      {files.length === 0 ? (
        <div className="neo-card flex flex-col items-center rounded-2xl px-6 py-24 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium">Nenhum arquivo anexado</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Anexe arquivos diretamente nas demandas para visualizá-los aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {files.map((f, i) => {
            const Icon = iconFor(f.tipo);
            return (
              <a
                key={i}
                href={f.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="neo-card flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {f.setor} · {f.demanda}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
