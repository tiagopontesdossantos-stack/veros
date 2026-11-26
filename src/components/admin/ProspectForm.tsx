import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Prospect } from "@/lib/admin-data";
import { toNumberOrNull, toTextOrNull } from "@/lib/admin-data";
import type { TablesInsert } from "@/integrations/supabase/types";

type Kind = "text" | "int" | "money" | "long";
type Field = { key: keyof TablesInsert<"prospects">; label: string; kind: Kind; required?: boolean };

const SECTIONS: { title: string; fields: Field[] }[] = [
  { title: "Empresa", fields: [
    { key: "legal_name", label: "Razão social", kind: "text", required: true },
    { key: "trade_name", label: "Nome fantasia", kind: "text" },
    { key: "cnpj", label: "CNPJ (opcional)", kind: "text" },
    { key: "segment", label: "Segmento de atuação", kind: "text" },
    { key: "city", label: "Cidade", kind: "text" },
    { key: "state", label: "Estado", kind: "text" },
    { key: "website", label: "Site", kind: "text" },
  ]},
  { title: "Responsável", fields: [
    { key: "contact_name", label: "Nome do empresário ou responsável", kind: "text" },
    { key: "contact_role", label: "Cargo", kind: "text" },
    { key: "phone", label: "Telefone", kind: "text" },
    { key: "email", label: "E-mail", kind: "text" },
  ]},
  { title: "Números da operação", fields: [
    { key: "monthly_revenue", label: "Faturamento mensal aproximado (R$)", kind: "money" },
    { key: "employees", label: "Nº de funcionários", kind: "int" },
    { key: "sellers", label: "Nº de vendedores", kind: "int" },
    { key: "marketing_staff", label: "Nº de profissionais de marketing", kind: "int" },
    { key: "cs_staff", label: "Nº de profissionais de atendimento/CS", kind: "int" },
    { key: "average_ticket", label: "Ticket médio (R$)", kind: "money" },
    { key: "active_customers", label: "Clientes ativos (aprox.)", kind: "int" },
    { key: "marketing_investment", label: "Investimento mensal em marketing (R$)", kind: "money" },
  ]},
  { title: "Contexto", fields: [
    { key: "products", label: "Principais produtos ou serviços", kind: "long" },
    { key: "acquisition_channels", label: "Principais canais de aquisição", kind: "long" },
    { key: "tools", label: "CRM ou ferramentas utilizadas", kind: "long" },
    { key: "growth_goals", label: "Objetivos de crescimento", kind: "long" },
    { key: "perceived_challenges", label: "Principais dificuldades percebidas", kind: "long" },
  ]},
];

export type ProspectValues = TablesInsert<"prospects">;

export function ProspectForm({ initial, submitLabel, onSubmit, saving }: {
  initial?: Prospect | undefined; submitLabel: string; saving: boolean; onSubmit: (v: ProspectValues) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const s of SECTIONS) for (const f of s.fields) {
      const v = initial?.[f.key as keyof Prospect];
      out[f.key] = v === null || v === undefined ? "" : String(v);
    }
    return out;
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    const payload: Record<string, string | number | null> = {};
    for (const s of SECTIONS) for (const f of s.fields) {
      const raw = values[f.key] ?? "";
      payload[f.key] = f.kind === "int" || f.kind === "money" ? toNumberOrNull(raw) : toTextOrNull(raw);
    }
    onSubmit(payload as unknown as ProspectValues);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-sm text-muted-foreground">Deixe em branco o que não souber: o campo aparece como "Não informado".</p>
      {SECTIONS.map((s) => (
        <fieldset key={s.title} className="rounded-xl border bg-card p-5">
          <legend className="px-2 font-display text-sm font-semibold text-cyan">{s.title}</legend>
          <div className="grid gap-4 md:grid-cols-2">
            {s.fields.map((f) => (
              <div key={f.key} className={`space-y-1.5 ${f.kind === "long" ? "md:col-span-2" : ""}`}>
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.kind === "long" ? (
                  <Textarea id={f.key} rows={2} value={values[f.key] ?? ""} placeholder="Não informado" onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                ) : (
                  <Input id={f.key} required={f.required ?? false} inputMode={f.kind === "text" ? "text" : "decimal"} value={values[f.key] ?? ""} placeholder={f.required ? "" : "Não informado"} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
        </fieldset>
      ))}
      <Button type="submit" disabled={saving}>{saving ? "Salvando…" : submitLabel}</Button>
    </form>
  );
}
