import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListChecks,
  Target,
  BarChart3,
  Calendar,
  FolderOpen,
  AlertTriangle,
} from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/demandas", label: "Demandas", icon: ListChecks },
  { to: "/demandas-fixas", label: "Demandas Fixas", icon: Target },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/calendario", label: "Calendário", icon: Calendar },
  { to: "/arquivos", label: "Arquivos", icon: FolderOpen },
  { to: "/gargalos", label: "Gargalos", icon: AlertTriangle },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl md:flex">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background shadow-soft">
          <span className="text-sm font-semibold tracking-tight">D</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">
            Demandas
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Optical
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-105 ${
                  active ? "text-foreground" : ""
                }`}
                strokeWidth={1.75}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl border border-border bg-surface/50 p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-foreground to-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">Optical Studio</p>
              <p className="truncate text-[10px] text-muted-foreground">
                Operação · 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
