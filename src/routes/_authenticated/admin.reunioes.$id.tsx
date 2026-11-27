import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CheckCircle2, Plus, Paperclip, StickyNote, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminHead } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { dateTime, show, SPIN_LABELS, STATUS_LABELS, toNumberOrNull, type Answer, type Question } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/reunioes/$id")({
  head: adminHead("Reunião de diagnóstico"),
  component: MeetingRoom,
});

const SPIN_ORDER = ["situacao", "problema", "implicacao", "necessidade"];

function MeetingRoom() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const key = ["meeting", id];

  const q = useQuery({
    queryKey: key,
    queryFn: async () => {
      const [m, s, qs, a, n, e] = await Promise.all([
        supabase.from("diagnostic_meetings").select("*, prospects(*)").eq("id", id).single(),
        supabase.from("diagnostic_sections").select("*").order("position"),
        supabase.from("diagnostic_questions").select("*").eq("is_active", true).or(`meeting_id.is.null,meeting_id.eq.${id}`).order("position"),
        supabase.from("diagnostic_answers").select("*").eq("meeting_id", id),
        supabase.from("diagnostic_notes").select("*").eq("meeting_id", id).order("created_at"),
        supabase.from("diagnostic_evidence").select("*").eq("meeting_id", id).order("created_at"),
      ]);
      if (m.error) throw m.error;
      return { meeting: m.data, sections: s.data ?? [], questions: qs.data ?? [], answers: a.data ?? [], notes: n.data ?? [], evidence: e.data ?? [] };
    },
  });

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState<string | null>(null);
  const [obs, setObs] = useState("");
  const [evidence, setEvidence] = useState({ description: "", url: "" });
  const [extra, setExtra] = useState("");

  const sections = q.data?.sections ?? [];
  const activeSection = sectionId ?? sections[0]?.id ?? null;
  const sectionQuestions = useMemo(() => {
    const list = (q.data?.questions ?? []).filter((x) => x.section_id === activeSection);
    return list.sort((a, b) => SPIN_ORDER.indexOf(a.spin_stage) - SPIN_ORDER.indexOf(b.spin_stage) || (a.meeting_id ? 1 : 0) - (b.meeting_id ? 1 : 0) || a.position - b.position);
  }, [q.data, activeSection]);
  const current: Question | undefined = sectionQuestions[index];
  const answersById = useMemo(() => new Map((q.data?.answers ?? []).map((a) => [a.question_id, a])), [q.data]);

  // Retomar de onde parou
  useEffect(() => {
    if (!q.data || sectionId !== null) return;
    const cq = q.data.questions.find((x) => x.id === q.data.meeting.current_question_id);
    if (cq) {
      setSectionId(cq.section_id);
      const list = q.data.questions.filter((x) => x.section_id === cq.section_id).sort((a, b) => SPIN_ORDER.indexOf(a.spin_stage) - SPIN_ORDER.indexOf(b.spin_stage) || (a.meeting_id ? 1 : 0) - (b.meeting_id ? 1 : 0) || a.position - b.position);
      setIndex(Math.max(0, list.findIndex((x) => x.id === cq.id)));
    } else if (q.data.sections[0]) setSectionId(q.data.sections[0].id);
  }, [q.data, sectionId]);

  useEffect(() => {
    if (!current) return setDraft("");
    const a: Answer | undefined = answersById.get(current.id);
    setDraft(a ? (current.answer_type === "text" ? (a.answer_text ?? "") : a.answer_number?.toString().replace(".", ",") ?? "") : "");
  }, [current, answersById]);

  const saveAnswer = useMutation({
    mutationFn: async (question: Question) => {
      const isNum = question.answer_type !== "text";
      const { error } = await supabase.from("diagnostic_answers").upsert(
        { meeting_id: id, question_id: question.id, answer_text: isNum ? null : draft.trim() || null, answer_number: isNum ? toNumberOrNull(draft) : null, updated_by: user.id },
        { onConflict: "meeting_id,question_id" },
      );
      if (error) throw error;
      await supabase.from("diagnostic_meetings").update({ current_question_id: question.id }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: () => toast.error("Não foi possível salvar a resposta."),
  });

  const updateMeeting = useMutation({
    mutationFn: async (patch: { general_notes?: string; status?: string }) => {
      const { error } = await supabase.from("diagnostic_meetings").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Reunião salva");
    },
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("diagnostic_notes").insert({ meeting_id: id, section_id: activeSection, content: obs.trim(), created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => { setObs(""); qc.invalidateQueries({ queryKey: key }); },
  });
  const addEvidence = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("diagnostic_evidence").insert({ meeting_id: id, question_id: current?.id ?? null, description: evidence.description.trim(), url: evidence.url.trim() || null, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => { setEvidence({ description: "", url: "" }); qc.invalidateQueries({ queryKey: key }); },
  });
  const addQuestion = useMutation({
    mutationFn: async () => {
      if (!activeSection) return;
      const { error } = await supabase.from("diagnostic_questions").insert({ section_id: activeSection, meeting_id: id, spin_stage: current?.spin_stage ?? "situacao", text: extra.trim(), position: 999, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => { setExtra(""); qc.invalidateQueries({ queryKey: key }); toast.success("Pergunta complementar adicionada"); },
  });

  if (q.isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  if (!q.data) return <p className="text-muted-foreground">Reunião não encontrada.</p>;
  const { meeting } = q.data;
  const p = meeting.prospects;
  const total = q.data.questions.length;
  const answered = q.data.answers.filter((a) => a.answer_text || a.answer_number !== null).length;
  const pct = total ? Math.round((answered / total) * 100) : 0;
  const generalNotes = notes ?? meeting.general_notes ?? "";

  async function go(delta: number) {
    if (current && draft.trim() !== "") await saveAnswer.mutateAsync(current);
    const next = index + delta;
    if (next >= 0 && next < sectionQuestions.length) return setIndex(next);
    const si = sections.findIndex((s) => s.id === activeSection);
    const target = sections[si + (delta > 0 ? 1 : -1)];
    if (target) {
      setSectionId(target.id);
      setIndex(delta > 0 ? 0 : Math.max(0, q.data!.questions.filter((x) => x.section_id === target.id).length - 1));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link to="/admin/prospects/$id" params={{ id: meeting.prospect_id }} className="font-display text-2xl font-semibold hover:text-cyan">{p?.trade_name || p?.legal_name}</Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {dateTime(meeting.scheduled_at)} · Entrevistado: {show(meeting.interviewee_name)} · Responsável: {show(meeting.owner_name)}
          </p>
          <p className="text-sm text-muted-foreground">Objetivo: {show(meeting.objective)}</p>
        </div>
        <div className="w-full shrink-0 lg:w-72">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{STATUS_LABELS[meeting.status]}</span><span>{answered}/{total} respondidas</span></div>
          <Progress value={pct} />
          <div className="mt-3 flex gap-2">
            {meeting.status === "em_andamento" ? (
              <Button size="sm" variant="outline" onClick={() => updateMeeting.mutate({ status: "concluido" })}><CheckCircle2 className="h-4 w-4" />Concluir diagnóstico</Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => updateMeeting.mutate({ status: "em_andamento" })}>Reabrir</Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map((s) => {
          const qs = q.data.questions.filter((x) => x.section_id === s.id);
          const done = qs.filter((x) => answersById.has(x.id)).length;
          return (
            <button key={s.id} onClick={() => { setSectionId(s.id); setIndex(0); }}
              className={`shrink-0 rounded-lg border px-3 py-2 text-left text-sm ${s.id === activeSection ? "border-primary bg-primary/15" : "text-muted-foreground hover:text-foreground"}`}>
              <span className="block font-medium">{s.name}</span>
              <span className="text-xs">{done}/{qs.length}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-linear-to-br from-navy to-card p-6 md:p-8">
            {current ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-cyan">{SPIN_LABELS[current.spin_stage]}{current.meeting_id ? " · complementar" : ""}</span>
                  <span className="text-muted-foreground">Pergunta {index + 1} de {sectionQuestions.length}</span>
                </div>
                <h2 className="mt-4 font-display text-xl font-medium leading-snug md:text-2xl">{current.text}</h2>
                <div className="mt-6">
                  {current.answer_type === "text" ? (
                    <Textarea rows={5} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Registre a resposta do entrevistado…" />
                  ) : (
                    <div className="flex items-center gap-2">
                      {current.answer_type === "currency" && <span className="text-muted-foreground">R$</span>}
                      <Input inputMode="decimal" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Não informado" className="max-w-xs" />
                    </div>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap justify-between gap-2">
                  <Button variant="ghost" onClick={() => go(-1)}><ChevronLeft className="h-4 w-4" />Anterior</Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => saveAnswer.mutate(current, { onSuccess: () => toast.success("Resposta salva") })}><Save className="h-4 w-4" />Salvar</Button>
                    <Button onClick={() => go(1)}>Salvar e avançar<ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Nenhuma pergunta nesta dimensão ainda.</p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold">Pergunta complementar</h3>
            <div className="mt-2 flex gap-2">
              <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Adicionar pergunta só para esta reunião" />
              <Button variant="outline" disabled={!extra.trim()} onClick={() => addQuestion.mutate()}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold">Anotações gerais da reunião</h3>
            <Textarea className="mt-2" rows={4} value={generalNotes} onChange={(e) => setNotes(e.target.value)} />
            <Button size="sm" className="mt-2" variant="outline" onClick={() => updateMeeting.mutate({ general_notes: generalNotes })}>Salvar anotações</Button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><StickyNote className="h-4 w-4 text-cyan" />Observações do consultor</h3>
            <ul className="mt-3 space-y-2">
              {q.data.notes.filter((n) => n.section_id === activeSection).map((n) => <li key={n.id} className="rounded-lg bg-background/50 p-2 text-sm">{n.content}</li>)}
            </ul>
            <Textarea className="mt-2" rows={2} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observação sobre esta dimensão" />
            <Button size="sm" className="mt-2" variant="outline" disabled={!obs.trim()} onClick={() => addNote.mutate()}>Adicionar</Button>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Paperclip className="h-4 w-4 text-cyan" />Evidências</h3>
            <ul className="mt-3 space-y-2">
              {q.data.evidence.map((ev) => (
                <li key={ev.id} className="rounded-lg bg-background/50 p-2 text-sm">
                  {ev.description}
                  {ev.url && <a href={ev.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-cyan hover:underline">{ev.url}</a>}
                </li>
              ))}
            </ul>
            <Input className="mt-2" value={evidence.description} onChange={(e) => setEvidence({ ...evidence, description: e.target.value })} placeholder="Descrição da evidência" />
            <Input className="mt-2" value={evidence.url} onChange={(e) => setEvidence({ ...evidence, url: e.target.value })} placeholder="Link (opcional)" />
            <Button size="sm" className="mt-2" variant="outline" disabled={!evidence.description.trim()} onClick={() => addEvidence.mutate()}>Registrar</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
