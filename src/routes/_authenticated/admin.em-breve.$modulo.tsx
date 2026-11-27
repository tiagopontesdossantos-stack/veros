import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, BriefcaseBusiness, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money, dateTime, show } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/em-breve/$modulo")({
  head: adminHead("Workspace VEROS"),
  component: WorkspaceModule,
});

const MODULES: Record<string, { name: string; description: string }> = {
  crm: { name: "CRM Comercial", description: "Pipeline, oportunidades, forecast e próximas atividades." },
  clientes: { name: "Clientes e Projetos", description: "Carteira de clientes, projetos, marcos e atualizações." },
  financeiro: { name: "Financeiro", description: "Receitas, despesas, recebíveis e fluxo financeiro." },
  indicadores: { name: "Indicadores", description: "Métricas de receita, aquisição, conversão e eficiência." },
  propostas: { name: "Propostas", description: "Propostas comerciais, escopo, valores e acompanhamento." },
  atividades: { name: "Atividades", description: "Agenda de tarefas, reuniões, ligações e follow-ups." },
};

function WorkspaceModule() {
  const { modulo } = Route.useParams();
  const meta = MODULES[modulo] ?? { name: "Workspace", description: "Módulos operacionais VEROS Intelligence." };
  return (
    <div className="space-y-6">
      <PageHeader title={meta.name} description={meta.description} />
      {modulo === "crm" ? <CRMModule /> :
        modulo === "clientes" ? <ProjectsModule /> :
        modulo === "financeiro" ? <FinanceModule /> :
        modulo === "indicadores" ? <MetricsModule /> :
        modulo === "propostas" ? <ProposalsModule /> :
        modulo === "atividades" ? <ActivitiesModule /> :
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Módulo não encontrado.</div>}
    </div>
  );
}

function useInternalOrganization() {
  return useQuery({
    queryKey: ["veros-internal-organization"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("id").eq("slug", "veros-internal").single();
      if (error) throw error;
      return data;
    },
  });
}

function CRMModule() {
  const qc = useQueryClient();
  const org = useInternalOrganization();
  const [title, setTitle] = useState("");
  const [prospectId, setProspectId] = useState("");
  const [amount, setAmount] = useState("0");
  const data = useQuery({
    queryKey: ["crm-workspace", org.data?.id],
    enabled: !!org.data?.id,
    queryFn: async () => {
      const [pipeline, prospects, opportunities] = await Promise.all([
        supabase.from("crm_pipelines").select("*").eq("organization_id", org.data!.id).order("created_at").limit(1).single(),
        supabase.from("prospects").select("id, legal_name, trade_name").order("legal_name"),
        supabase.from("crm_opportunities").select("*").eq("organization_id", org.data!.id).order("created_at", { ascending: false }),
      ]);
      if (pipeline.error) throw pipeline.error;
      if (prospects.error) throw prospects.error;
      if (opportunities.error) throw opportunities.error;
      const { data: stages, error: stagesError } = await supabase.from("crm_stages").select("*").eq("pipeline_id", pipeline.data.id).order("position");
      if (stagesError) throw stagesError;
      return { pipeline: pipeline.data, stages, prospects: prospects.data, opportunities: opportunities.data };
    },
  });
  const create = useMutation({
    mutationFn: async (event: FormEvent) => {
      event.preventDefault();
      if (!data.data || !title.trim() || !prospectId) throw new Error("Preencha o nome e selecione a empresa.");
      const firstStage = data.data.stages.find((stage) => !stage.is_won && !stage.is_lost) ?? data.data.stages[0];
      if (!firstStage) throw new Error("Cadastre uma etapa no pipeline.");
      const { error } = await supabase.from("crm_opportunities").insert({
        organization_id: org.data!.id, pipeline_id: data.data.pipeline.id, stage_id: firstStage.id,
        prospect_id: prospectId, title: title.trim(), amount: Number(amount) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => { setTitle(""); setProspectId(""); setAmount("0"); qc.invalidateQueries({ queryKey: ["crm-workspace"] }); toast.success("Oportunidade criada."); },
    onError: (error) => toast.error(error.message || "Não foi possível criar a oportunidade."),
  });
  const move = useMutation({
    mutationFn: async ({ id, stageId }: { id: string; stageId: string }) => {
      const { error } = await supabase.from("crm_opportunities").update({ stage_id: stageId }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm-workspace"] }),
    onError: () => toast.error("Não foi possível atualizar a etapa."),
  });
  const prospectName = (id: string | null) => data.data?.prospects.find((p) => p.id === id)?.trade_name || data.data?.prospects.find((p) => p.id === id)?.legal_name || "Empresa não vinculada";
  if (data.isLoading || org.isLoading) return <Loading />;
  if (data.isError || !data.data) return <Empty title="CRM aguardando estrutura do banco" detail="Aplique as migrations 0005 e 0006 no Supabase para criar o pipeline comercial e suas etapas." />;
  return (
    <div className="space-y-5">
      <form onSubmit={(e) => create.mutate(e)} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1.4fr_1fr_150px_auto] md:items-end">
        <div className="space-y-1"><Label htmlFor="deal-title">Nova oportunidade</Label><Input id="deal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Projeto de RevOps — Empresa X" required /></div>
        <div className="space-y-1"><Label htmlFor="deal-prospect">Empresa</Label><select id="deal-prospect" value={prospectId} onChange={(e) => setProspectId(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="">Selecione uma empresa</option>{data.data.prospects.map((p) => <option key={p.id} value={p.id}>{p.trade_name || p.legal_name}</option>)}</select></div>
        <div className="space-y-1"><Label htmlFor="deal-amount">Valor (R$)</Label><Input id="deal-amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <Button type="submit" disabled={create.isPending || !title.trim() || !prospectId}><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
      </form>
      <div className="flex items-center justify-between"><h2 className="font-display font-semibold">{data.data.pipeline.name}</h2><span className="text-xs text-muted-foreground">{data.data.opportunities.length} oportunidades</span></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {data.data.stages.map((stage) => {
          const items = data.data.opportunities.filter((item) => item.stage_id === stage.id);
          const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
          return <section key={stage.id} className="min-h-48 rounded-xl border bg-muted/20 p-3">
            <div className="mb-3 flex items-center justify-between gap-2"><div><h3 className="text-sm font-semibold">{stage.name}</h3><p className="text-xs text-muted-foreground">{stage.probability}% de probabilidade</p></div><span className="rounded-full bg-background px-2 py-1 text-xs">{items.length}</span></div>
            <p className="mb-3 text-sm font-medium">{money(total)}</p>
            <div className="space-y-2">{items.map((item) => {
              const currentIndex = data.data!.stages.findIndex((s) => s.id === stage.id);
              const next = data.data!.stages[currentIndex + 1];
              return <article key={item.id} className="rounded-lg border bg-card p-3">
                <p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{prospectName(item.prospect_id)}</p>
                <p className="mt-2 text-sm font-semibold">{money(Number(item.amount))}</p>
                {next && <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => move.mutate({ id: item.id, stageId: next.id })}>Mover para {next.name}<ArrowRight className="ml-1 h-3 w-3" /></Button>}
              </article>;
            })}</div>
          </section>;
        })}
      </div>
    </div>
  );
}

function ProjectsModule() {
  const qc = useQueryClient();
  const org = useInternalOrganization();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [service, setService] = useState("revops_diagnostic");
  const q = useQuery({
    queryKey: ["workspace-projects", org.data?.id],
    enabled: !!org.data?.id,
    queryFn: async () => {
      const [projects, clients] = await Promise.all([
        supabase.from("client_projects").select("*").eq("organization_id", org.data!.id).order("created_at", { ascending: false }),
        supabase.from("organizations").select("id, name").eq("organization_type", "client").eq("status", "active").order("name"),
      ]);
      if (projects.error) throw projects.error;
      if (clients.error) throw clients.error;
      return { projects: projects.data, clients: clients.data };
    },
  });
  const createClient = useMutation({
    mutationFn: async (e: FormEvent) => {
      e.preventDefault();
      const cleanName = clientName.trim();
      if (!cleanName) throw new Error("Informe o nome do cliente.");
      const slug = cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { data, error } = await supabase.from("organizations").insert({ name: cleanName, slug, organization_type: "client" }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => { setClientName(""); setClientId(id); qc.invalidateQueries({ queryKey: ["workspace-projects"] }); toast.success("Organização cliente criada."); },
    onError: (e) => toast.error(e.message || "Não foi possível cadastrar o cliente."),
  });
  const create = useMutation({
    mutationFn: async (e: FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !clientId) throw new Error("Informe o nome e selecione o cliente.");
      const { error } = await supabase.from("client_projects").insert({ organization_id: org.data!.id, client_organization_id: clientId, name: name.trim(), service_type: service });
      if (error) throw error;
    },
    onSuccess: () => { setName(""); qc.invalidateQueries({ queryKey: ["workspace-projects"] }); toast.success("Projeto criado."); },
    onError: (e) => toast.error(e.message || "Não foi possível criar o projeto."),
  });
  if (q.isLoading || org.isLoading) return <Loading />;
  if (q.isError || !q.data) return <Empty title="Projetos aguardando dados" detail="Aplique a migration 0005 e cadastre as organizações dos clientes para iniciar projetos." />;
  return <div className="space-y-4">
    <form onSubmit={(e) => createClient.mutate(e)} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto] md:items-end">
      <div className="space-y-1"><Label htmlFor="new-client">Cadastrar organização cliente</Label><Input id="new-client" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome da empresa cliente" required /></div>
      <Button type="submit" variant="outline" disabled={createClient.isPending || !clientName.trim()}><Plus className="mr-1 h-4 w-4" />Cadastrar cliente</Button>
    </form>
    <form onSubmit={(e) => create.mutate(e)} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
      <div className="space-y-1"><Label htmlFor="project-name">Nome do projeto</Label><Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Diagnóstico RevOps — Cliente" required /></div>
      <div className="space-y-1"><Label htmlFor="project-client">Organização cliente</Label><select id="project-client" value={clientId} onChange={(e) => setClientId(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="">Selecione</option>{q.data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="space-y-1"><Label htmlFor="project-service">Serviço</Label><select id="project-service" value={service} onChange={(e) => setService(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="revops_diagnostic">Diagnóstico RevOps</option><option value="revops_implementation">Implementação + acompanhamento</option></select></div>
      <Button type="submit" disabled={create.isPending || !clientId}><Plus className="mr-1 h-4 w-4" />Criar</Button>
    </form>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{q.data.projects.map((p) => <article key={p.id} className="rounded-xl border bg-card p-4"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{p.service_type === "revops_diagnostic" ? "Diagnóstico RevOps" : "Implementação"}</span><span className="text-xs capitalize">{p.status.replace("_", " ")}</span></div><h3 className="mt-2 font-semibold">{p.name}</h3><p className="mt-1 text-sm text-muted-foreground">{p.description || "Sem descrição cadastrada."}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: p.progress + "%" }} /></div><p className="mt-1 text-right text-xs text-muted-foreground">{p.progress}% concluído</p></article>)}</div>
    {q.data.projects.length === 0 && <Empty title="Nenhum projeto cadastrado" detail="Crie o primeiro projeto vinculando-o a uma organização cliente." />}
  </div>;
}

function FinanceModule() {
  const qc = useQueryClient();
  const org = useInternalOrganization();
  const [entryType, setEntryType] = useState("income");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Consultoria");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const q = useQuery({
    queryKey: ["finance-entries", org.data?.id],
    enabled: !!org.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("finance_entries").select("*").eq("organization_id", org.data!.id).order("due_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const create = useMutation({
    mutationFn: async (e: FormEvent) => {
      e.preventDefault();
      const value = Number(amount);
      if (!description.trim() || !Number.isFinite(value) || value <= 0) throw new Error("Informe descrição e valor válido.");
      const { error } = await supabase.from("finance_entries").insert({ organization_id: org.data!.id, entry_type: entryType, description: description.trim(), category, amount: value, due_date: dueDate });
      if (error) throw error;
    },
    onSuccess: () => { setDescription(""); setAmount(""); qc.invalidateQueries({ queryKey: ["finance-entries"] }); toast.success("Lançamento criado."); },
    onError: (e) => toast.error(e.message || "Não foi possível salvar o lançamento."),
  });
  const totals = useMemo(() => ({
    income: (q.data ?? []).filter((x) => x.entry_type === "income" && x.status === "paid").reduce((s, x) => s + Number(x.amount), 0),
    expense: (q.data ?? []).filter((x) => x.entry_type === "expense" && x.status === "paid").reduce((s, x) => s + Number(x.amount), 0),
    receivable: (q.data ?? []).filter((x) => x.entry_type === "income" && x.status === "pending").reduce((s, x) => s + Number(x.amount), 0),
  }), [q.data]);
  if (q.isLoading || org.isLoading) return <Loading />;
  if (q.isError || !q.data) return <Empty title="Financeiro aguardando banco" detail="Aplique a migration 0005 no Supabase para habilitar os lançamentos financeiros." />;
  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-3">{[{ label: "Receitas recebidas", value: totals.income }, { label: "Despesas pagas", value: totals.expense }, { label: "A receber", value: totals.receivable }].map((item) => <div key={item.label} className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-2 font-display text-2xl font-semibold">{money(item.value)}</p></div>)}</div>
    <form onSubmit={(e) => create.mutate(e)} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-5 md:items-end">
      <div className="space-y-1"><Label htmlFor="entry-type">Tipo</Label><select id="entry-type" value={entryType} onChange={(e) => setEntryType(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="income">Receita</option><option value="expense">Despesa</option></select></div>
      <div className="space-y-1"><Label htmlFor="entry-description">Descrição</Label><Input id="entry-description" value={description} onChange={(e) => setDescription(e.target.value)} required /></div>
      <div className="space-y-1"><Label htmlFor="entry-category">Categoria</Label><Input id="entry-category" value={category} onChange={(e) => setCategory(e.target.value)} required /></div>
      <div className="space-y-1"><Label htmlFor="entry-amount">Valor (R$)</Label><Input id="entry-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
      <Button type="submit" disabled={create.isPending}><Plus className="mr-1 h-4 w-4" />Lançar</Button>
    </form>
    <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Lançamento</th><th className="p-3">Tipo</th><th className="p-3">Vencimento</th><th className="p-3 text-right">Valor</th><th className="p-3">Status</th></tr></thead><tbody className="divide-y">{q.data.map((item) => <tr key={item.id}><td className="p-3"><p className="font-medium">{item.description}</p><p className="text-xs text-muted-foreground">{item.category}</p></td><td className="p-3">{item.entry_type === "income" ? "Receita" : "Despesa"}</td><td className="p-3">{item.due_date}</td><td className="p-3 text-right font-medium">{money(Number(item.amount))}</td><td className="p-3 capitalize">{item.status}</td></tr>)}</tbody></table>{q.data.length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhum lançamento registrado.</p>}</div>
  </div>;
}

function MetricsModule() {
  const org = useInternalOrganization();
  const q = useQuery({
    queryKey: ["business-metrics", org.data?.id],
    enabled: !!org.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("business_metrics").select("*").eq("organization_id", org.data!.id).order("period_start", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (q.isLoading || org.isLoading) return <Loading />;
  if (q.isError || !q.data) return <Empty title="Indicadores aguardando banco" detail="Aplique a migration 0005 no Supabase para habilitar os indicadores." />;
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{q.data.map((m) => <article key={m.id} className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">{m.name}</p><p className="mt-2 font-display text-3xl font-semibold">{m.unit === "currency" ? money(Number(m.value)) : m.unit === "percent" ? m.value + "%" : m.value}</p><p className="mt-2 text-xs text-muted-foreground">{m.period_start} até {m.period_end}</p>{m.target !== null && <p className="mt-1 text-xs">Meta: {m.target} {m.unit === "percent" ? "%" : ""}</p>}</article>)}{q.data.length === 0 && <Empty title="Nenhum indicador cadastrado" detail="Os indicadores serão alimentados pelo consultor após a coleta e validação dos dados." />}</div>;
}

function ProposalsModule() {
  const org = useInternalOrganization();
  const q = useQuery({
    queryKey: ["commercial-proposals", org.data?.id],
    enabled: !!org.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("commercial_proposals").select("*").eq("organization_id", org.data!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (q.isLoading || org.isLoading) return <Loading />;
  if (q.isError || !q.data) return <Empty title="Propostas aguardando banco" detail="Aplique a migration 0005 no Supabase para habilitar o controle de propostas." />;
  return <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Proposta</th><th className="p-3">Serviço</th><th className="p-3">Validade</th><th className="p-3 text-right">Valor</th><th className="p-3">Status</th></tr></thead><tbody className="divide-y">{q.data.map((p) => <tr key={p.id}><td className="p-3 font-medium">{p.title}</td><td className="p-3">{p.service_type}</td><td className="p-3">{show(p.valid_until)}</td><td className="p-3 text-right">{money(Number(p.amount))}</td><td className="p-3 capitalize">{p.status}</td></tr>)}</tbody></table>{q.data.length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma proposta cadastrada.</p>}</div>;
}

function ActivitiesModule() {
  const org = useInternalOrganization();
  const q = useQuery({
    queryKey: ["crm-activities", org.data?.id],
    enabled: !!org.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_activities").select("*").eq("organization_id", org.data!.id).order("due_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
  if (q.isLoading || org.isLoading) return <Loading />;
  if (q.isError || !q.data) return <Empty title="Atividades aguardando banco" detail="Aplique a migration 0005 no Supabase para habilitar tarefas e follow-ups." />;
  return <div className="space-y-2">{q.data.map((a) => <article key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4"><div><p className="font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.activity_type} · {a.due_at ? dateTime(a.due_at) : "Sem prazo"}</p></div><span className="rounded-full border px-2 py-1 text-xs capitalize">{a.status}</span></article>)}{q.data.length === 0 && <Empty title="Nenhuma atividade" detail="As próximas tarefas e follow-ups serão organizadas aqui." />}</div>;
}

function Loading() { return <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">Carregando módulo…</div>; }
function Empty({ title, detail }: { title: string; detail: string }) { return <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center"><BriefcaseBusiness className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{detail}</p></div>; }
