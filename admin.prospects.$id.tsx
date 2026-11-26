import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";
import { ProspectForm, type ProspectValues } from "@/components/admin/ProspectForm";
import { Button } from "@/components/ui/button";
import { dateTime, STATUS_LABELS } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/prospects/$id")({
  head: adminHead("Empresa"),
  component: ProspectDetail,
});

function ProspectDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["prospect", id],
    queryFn: async () => {
      const [p, m] = await Promise.all([
        supabase.from("prospects").select("*").eq("id", id).single(),
        supabase.from("diagnostic_meetings").select("id, scheduled_at, status, objective").eq("prospect_id", id).order("scheduled_at", { ascending: false }),
      ]);
      if (p.error) throw p.error;
      return { prospect: p.data, meetings: m.data ?? [] };
    },
  });
  const save = useMutation({
    mutationFn: async (v: ProspectValues) => {
      const { error } = await supabase.from("prospects").update(v).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospect", id] });
      qc.invalidateQueries({ queryKey: ["prospects"] });
      toast.success("Alterações salvas");
    },
    onError: () => toast.error("Não foi possível salvar."),
  });

  if (q.isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  if (!q.data) return <p className="text-muted-foreground">Empresa não encontrada.</p>;
  const p = q.data.prospect;

  return (
    <div className="max-w-4xl">
      <PageHeader title={p.trade_name || p.legal_name} description={p.trade_name ? p.legal_name : undefined}
        actions={<Button asChild><Link to="/admin/reunioes/nova" search={{ prospect: id }}><Plus className="h-4 w-4" />Nova reunião</Link></Button>} />
      <div className="mb-8 rounded-xl border bg-card p-5">
        <h2 className="font-display font-semibold">Histórico de diagnósticos</h2>
        {q.data.meetings.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Nenhuma reunião registrada.</p>}
        <ul className="mt-3 divide-y">
          {q.data.meetings.map((m) => (
            <li key={m.id}>
              <Link to="/admin/reunioes/$id" params={{ id: m.id }} className="flex items-center justify-between gap-3 py-2 text-sm hover:text-cyan">
                <span>{dateTime(m.scheduled_at)} · {m.objective || "Diagnóstico"}</span>
                <span className="text-xs text-muted-foreground">{STATUS_LABELS[m.status]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <ProspectForm key={p.updated_at} initial={p} submitLabel="Salvar alterações" saving={save.isPending} onSubmit={(v) => save.mutate(v)} />
    </div>
  );
}
