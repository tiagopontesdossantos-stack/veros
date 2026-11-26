import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CheckCircle2, Building2, Target, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { dateTime, STATUS_LABELS } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: adminHead("Dashboard"),
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [m, c, p, recent] = await Promise.all([
        supabase.from("diagnostic_meetings").select("id", { count: "exact", head: true }),
        supabase.from("diagnostic_meetings").select("id", { count: "exact", head: true }).eq("status", "concluido"),
        supabase.from("prospects").select("id", { count: "exact", head: true }),
        supabase.from("diagnostic_meetings").select("id, status, scheduled_at, prospects(legal_name, trade_name)").order("updated_at", { ascending: false }).limit(6),
      ]);
      if (recent.error) throw recent.error;
      return { meetings: m.count ?? 0, done: c.count ?? 0, prospects: p.count ?? 0, recent: recent.data };
    },
  });

  const cards = [
    { label: "Reuniões realizadas", value: stats.data?.meetings, icon: CalendarCheck },
    { label: "Diagnósticos concluídos", value: stats.data?.done, icon: CheckCircle2 },
    { label: "Empresas prospectadas", value: stats.data?.prospects, icon: Building2 },
    { label: "Oportunidades comerciais", value: null, icon: Target, note: "Disponível com o CRM" },
  ];

  return (
    <div>
      <PageHeader
        title="Visão geral"
        description="Acompanhe as reuniões de diagnóstico da VEROS."
        actions={<Button asChild><Link to="/admin/reunioes/nova"><Plus className="h-4 w-4" />Nova reunião</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">{c.label}</span>
              <c.icon className="h-4 w-4 text-cyan" />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{c.value ?? "—"}</p>
            {c.note && <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>}
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-display font-semibold">Reuniões recentes</h2>
          <Link to="/admin/reunioes" className="text-sm text-cyan hover:underline">Ver histórico</Link>
        </div>
        {stats.data && stats.data.recent.length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma reunião ainda.</p>}
        <ul className="divide-y">
          {stats.data?.recent.map((r) => (
            <li key={r.id}>
              <Link to="/admin/reunioes/$id" params={{ id: r.id }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 hover:bg-muted/40">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.prospects?.trade_name || r.prospects?.legal_name}</span>
                  <span className="text-xs text-muted-foreground">{dateTime(r.scheduled_at)}</span>
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "concluido" ? "bg-performance/15 text-performance" : "bg-cyan/15 text-cyan"}`}>{STATUS_LABELS[r.status]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
