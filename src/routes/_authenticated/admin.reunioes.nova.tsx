import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toTextOrNull } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/reunioes/nova")({
  validateSearch: (s: Record<string, unknown>): { prospect?: string } => {
    const v = s["prospect"];
    return typeof v === "string" ? { prospect: v } : {};
  },
  head: adminHead("Nova reunião"),
  component: NewMeeting,
});

function localNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function NewMeeting() {
  const { prospect } = Route.useSearch();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [prospectId, setProspectId] = useState(prospect ?? "");
  const [when, setWhen] = useState(localNow());
  const [interviewee, setInterviewee] = useState("");
  const [owner, setOwner] = useState(user.email ?? "");
  const [objective, setObjective] = useState("Diagnóstico da operação de receita");

  const prospects = useQuery({
    queryKey: ["prospects-options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("prospects").select("id, legal_name, trade_name").order("legal_name");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("diagnostic_meetings").insert({
        prospect_id: prospectId,
        scheduled_at: new Date(when).toISOString(),
        interviewee_name: toTextOrNull(interviewee),
        owner_id: user.id,
        owner_name: toTextOrNull(owner),
        objective: toTextOrNull(objective),
      }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => navigate({ to: "/admin/reunioes/$id", params: { id } }),
    onError: () => toast.error("Não foi possível criar a reunião."),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!prospectId) {
      toast.error("Selecione uma empresa.");
      return;
    }
    create.mutate();
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Nova reunião de diagnóstico" description="Selecione a empresa e registre os dados da conversa." />
      <form onSubmit={submit} className="space-y-5 rounded-xl border bg-card p-6">
        <div className="space-y-1.5">
          <Label htmlFor="prospect">Empresa prospect</Label>
          <select id="prospect" value={prospectId} onChange={(e) => setProspectId(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Selecione…</option>
            {prospects.data?.map((p) => <option key={p.id} value={p.id}>{p.trade_name || p.legal_name}</option>)}
          </select>
          <p className="text-xs text-muted-foreground">Empresa nova? <Link to="/admin/prospects/novo" className="text-cyan hover:underline">Cadastre primeiro</Link>.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="when">Data e horário</Label><Input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required /></div>
          <div className="space-y-1.5"><Label htmlFor="interviewee">Entrevistado</Label><Input id="interviewee" value={interviewee} onChange={(e) => setInterviewee(e.target.value)} placeholder="Não informado" /></div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="owner">Responsável pela reunião</Label><Input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="objective">Objetivo da reunião</Label><Textarea id="objective" rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} /></div>
        <Button type="submit" disabled={create.isPending}>{create.isPending ? "Criando…" : "Iniciar reunião"}</Button>
      </form>
    </div>
  );
}
