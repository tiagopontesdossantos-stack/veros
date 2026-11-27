const KPIS = [
  { label: "Receita recorrente", value: "R$ 482k", delta: "+8,4%" },
  { label: "Taxa de conversão", value: "18,2%", delta: "+2,1 p.p." },
  { label: "CAC", value: "R$ 1.240", delta: "-6,3%" },
  { label: "Pipeline", value: "R$ 1,9 mi", delta: "+12%" },
  { label: "Churn", value: "2,1%", delta: "-0,4 p.p." },
  { label: "Forecast", value: "R$ 530k", delta: "92% conf." },
];

const BARS = [38, 46, 42, 55, 61, 58, 70, 74, 69, 82, 88, 94];

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden />
      Dados ilustrativos — demonstração
    </span>
  );
}

export function DemoDashboard() {
  return (
    <div
      className="relative rounded-2xl border border-border bg-navy/80 p-4 glow-primary backdrop-blur sm:p-5"
      role="img"
      aria-label="Painel ilustrativo de Revenue Intelligence com dados fictícios de demonstração"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-performance" aria-hidden />
          <span className="font-display text-sm font-semibold">Revenue Intelligence</span>
        </div>
        <DemoBadge />
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-background/50 p-3">
            <p className="text-[11px] text-muted-foreground">{k.label}</p>
            <p className="mt-1 font-display text-lg font-semibold">{k.value}</p>
            <p className="text-[11px] font-semibold text-performance">{k.delta}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-border bg-background/50 p-3">
        <div className="mb-2 flex justify-between text-[11px] text-muted-foreground">
          <span>Receita x Forecast (12 meses)</span>
          <span className="text-cyan">Forecast</span>
        </div>
        <div className="flex h-24 items-end gap-1.5">
          {BARS.map((h, i) => (
            <div
              key={i}
              className={i >= 9 ? "flex-1 rounded-sm bg-cyan/60" : "flex-1 rounded-sm bg-primary/80"}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const MODULES = [
  "Executive Dashboard",
  "Revenue Audit",
  "Marketing Intelligence",
  "Sales Intelligence",
  "Customer Success",
  "Revenue Forecast",
  "Action Plans",
  "Performance Reports",
];

export function PlatformPreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-navy/80"
      role="img"
      aria-label="Prévia conceitual da plataforma Veros, em desenvolvimento, com dados fictícios"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        </div>
        <DemoBadge />
      </div>
      <div className="grid sm:grid-cols-[180px_1fr]">
        <ul className="hidden border-r border-border p-3 text-xs sm:block">
          {MODULES.map((m, i) => (
            <li
              key={m}
              className={
                i === 0
                  ? "mb-1 rounded-md bg-primary/20 px-2.5 py-2 font-semibold text-foreground"
                  : "mb-1 px-2.5 py-2 text-muted-foreground"
              }
            >
              {m}
            </li>
          ))}
        </ul>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              ["Saúde da operação", "74/100"],
              ["Gargalos mapeados", "6"],
              ["Ações em andamento", "11"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-border bg-background/50 p-3">
                <p className="text-[10px] text-muted-foreground">{l}</p>
                <p className="mt-1 font-display text-base font-semibold">{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <p className="mb-3 text-[11px] text-muted-foreground">Funil de receita</p>
            {[
              ["Leads", 100],
              ["Oportunidades", 62],
              ["Propostas", 38],
              ["Fechamentos", 21],
            ].map(([l, w]) => (
              <div key={l} className="mb-2 flex items-center gap-3 text-[11px]">
                <span className="w-24 text-muted-foreground">{l}</span>
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-cyan/70" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-3 text-[11px]">
            <p className="mb-2 text-muted-foreground">Plano de ação</p>
            {["Padronizar etapas do pipeline", "Integrar origem dos leads ao CRM", "Rotina de forecast semanal"].map(
              (t, i) => (
                <div key={t} className="flex items-center justify-between border-t border-border py-1.5 first:border-0">
                  <span>{t}</span>
                  <span className={i === 0 ? "text-performance" : "text-muted-foreground"}>
                    {i === 0 ? "Concluída" : "Em andamento"}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { MODULES };
