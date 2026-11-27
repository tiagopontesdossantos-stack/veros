import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { dateTime, show, STATUS_LABELS } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/reunioes/")({
  validateSearch: (s: Record<string, unknown>): { status?: string } => {
    const v = s["status"];
    return typeof v === "string" ? { status: v } : {};
  },
  head: adminHead("Reuniões"),
  component: MeetingsPage,
});

function MeetingsPage() {
  const { status } = Route.useSearch();
  const q = useQuery({
    queryKey: ["meetings", status ?? "all"],
    queryFn: async () => {
      let query = supabase.from("diagnostic_meetings").select("id, scheduled_at, status, interviewee_name, owner_name, prospects(legal_name, trade_name)").order("scheduled_at", { ascending: false });
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
  const title = status === "em_andamento" ? "Diagnósticos em andamento" : status === "concluido" ? "Diagnósticos concluídos" : "Histórico de reuniões";
  const tabs = [{ label: "Todas", s: {} }, { label: "Em andamento", s: { status: "em_andamento" } }, { label: "Concluídas", s: { status: "concluido" } }];
  return (
    <div>
      <PageHeader title={title} actions={<Button asChild><Link to="/admin/reunioes/nova"><Plus className="h-4 w-4" />Nova reunião</Link></Button>} />
      <div className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <Link key={t.label} to="/admin/reunioes" search={t.s} className={`rounded-full border px-3 py-1 text-sm ${(t.s.status ?? undefined) === status ? "border-primary bg-primary/15 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t.label}</Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr className="border-b">
            <th className="px-4 py-3 font-medium">Empresa</th><th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3 font-medium">Entrevistado</th><th className="px-4 py-3 font-medium">Responsável</th><th className="px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {q.data?.map((m) => (
              <tr key={m.id} className="hover:bg-muted/40">
                <td className="px-4 py-3"><Link to="/admin/reunioes/$id" params={{ id: m.id }} className="font-medium hover:text-cyan">{m.prospects?.trade_name || m.prospects?.legal_name}</Link></td>
                <td className="px-4 py-3 text-muted-foreground">{dateTime(m.scheduled_at)}</td>
                <td className="px-4 py-3 text-muted-foreground">{show(m.interviewee_name)}</td>
                <td className="px-4 py-3 text-muted-foreground">{show(m.owner_name)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${m.status === "concluido" ? "bg-performance/15 text-performance" : "bg-cyan/15 text-cyan"}`}>{STATUS_LABELS[m.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {q.data?.length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma reunião encontrada.</p>}
      </div>
    </div>
  );
}
