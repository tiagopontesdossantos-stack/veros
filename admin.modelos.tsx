import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SPIN_LABELS } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/modelos")({
  head: adminHead("Modelos de diagnóstico"),
  component: Templates,
});

function Templates() {
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const q = useQuery({
    queryKey: ["template"],
    queryFn: async () => {
      const [s, qs] = await Promise.all([
        supabase.from("diagnostic_sections").select("*").order("position"),
        supabase.from("diagnostic_questions").select("*").is("meeting_id", null).order("position"),
      ]);
      if (s.error) throw s.error;
      if (qs.error) throw qs.error;
      return { sections: s.data, questions: qs.data };
    },
  });
  const [drafts, setDrafts] = useState<Record<string, { text: string; stage: string; type: string }>>({});
  const add = useMutation({
    mutationFn: async (sectionId: string) => {
      const d = drafts[sectionId];
      if (!d || !d.text.trim()) throw new Error("vazio");
      const pos = (q.data?.questions.filter((x) => x.section_id === sectionId).length ?? 0) + 1;
      const { error } = await supabase.from("diagnostic_questions").insert({ section_id: sectionId, text: d.text.trim(), spin_stage: d.stage, answer_type: d.type, position: pos, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: (_, sectionId) => {
      setDrafts({ ...drafts, [sectionId]: { text: "", stage: "situacao", type: "text" } });
      qc.invalidateQueries({ queryKey: ["template"] });
      toast.success("Pergunta adicionada ao roteiro");
    },
    onError: () => toast.error("Escreva a pergunta antes de adicionar."),
  });

  return (
    <div className="max-w-4xl">
      <PageHeader title="Modelos de diagnóstico" description="Dimensões do roteiro e perguntas associadas, organizadas por SPIN Selling. A biblioteca completa chega na próxima etapa." />
      <div className="space-y-6">
        {q.data?.sections.map((s) => {
          const d = drafts[s.id] ?? { text: "", stage: "situacao", type: "text" };
          return (
            <section key={s.id} className="rounded-xl border bg-card p-5">
              <h2 className="font-display text-lg font-semibold">{s.name}</h2>
              <p className="text-sm text-muted-foreground">{s.description}</p>
              <ul className="mt-4 space-y-2">
                {q.data.questions.filter((x) => x.section_id === s.id).map((x) => (
                  <li key={x.id} className="flex gap-3 rounded-lg border bg-background/40 px-3 py-2 text-sm">
                    <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-xs text-cyan">{SPIN_LABELS[x.spin_stage]}</span>
                    <span className="min-w-0">{x.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                <Input placeholder="Nova pergunta" value={d.text} onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...d, text: e.target.value } })} />
                <select value={d.stage} onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...d, stage: e.target.value } })} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                  {Object.entries(SPIN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={d.type} onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...d, type: e.target.value } })} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                  <option value="text">Texto</option><option value="number">Número</option><option value="currency">Valor (R$)</option>
                </select>
                <Button variant="outline" onClick={() => add.mutate(s.id)}>Adicionar</Button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
