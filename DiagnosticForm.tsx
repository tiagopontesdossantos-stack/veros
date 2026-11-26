import { useState, type FormEvent, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { diagnosticSchema, REVENUE_RANGES, SEGMENTS } from "@/lib/diagnostic-schema";
import { submitDiagnostic } from "@/lib/diagnostic.functions";

const WA_NUMBER = "5594992179773";

type Errors = Partial<Record<string, string>>;

function Field({ name, label, error, children }: { name: string; label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p id={`e-${name}`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const fieldCls =
  "w-full rounded-lg border border-input bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-cyan focus:ring-2 focus:ring-ring/30";

export function DiagnosticForm({ source }: { source: string }) {
  const submit = useServerFn(submitDiagnostic);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [sentName, setSentName] = useState("");
  const [waText, setWaText] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = diagnosticSchema.safeParse({ ...raw, source });
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await submit({ data: parsed.data });
      if (!res.ok) throw new Error("fail");
      setSentName(parsed.data.name.split(" ")[0] ?? "");
      setWaText(
        `Olá! Sou ${parsed.data.name}, da ${parsed.data.company}. Acabei de solicitar um diagnóstico de receita pelo site da Veros Advisory.`,
      );
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-border bg-navy p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-performance" aria-hidden />
        <h3 className="mt-4 text-xl font-semibold">Solicitação recebida{sentName ? `, ${sentName}` : ""}.</h3>
        <p className="mt-2 text-muted-foreground">
          Vamos analisar as informações e entrar em contato para agendar o diagnóstico.
        </p>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition hover:border-cyan hover:text-cyan"
        >
          <MessageCircle className="h-4 w-4" aria-hidden /> Adiantar a conversa no WhatsApp
        </a>
      </div>
    );
  }

  const a = (name: string) => ({
    id: `f-${name}`,
    name,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `e-${name}` : undefined,
    className: fieldCls,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-navy p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Nome" error={errors["name"]}>
          <input {...a("name")} autoComplete="name" maxLength={100} />
        </Field>
        <Field name="company" label="Empresa" error={errors["company"]}>
          <input {...a("company")} autoComplete="organization" maxLength={120} />
        </Field>
        <Field name="role" label="Cargo" error={errors["role"]}>
          <input {...a("role")} autoComplete="organization-title" maxLength={80} />
        </Field>
        <Field name="email" label="E-mail" error={errors["email"]}>
          <input {...a("email")} type="email" autoComplete="email" maxLength={255} />
        </Field>
        <Field name="whatsapp" label="WhatsApp (com DDD)" error={errors["whatsapp"]}>
          <input {...a("whatsapp")} type="tel" autoComplete="tel" placeholder="(00) 00000-0000" maxLength={20} />
        </Field>
        <Field name="segment" label="Segmento" error={errors["segment"]}>
          <select {...a("segment")} defaultValue="">
            <option value="" disabled>Selecione</option>
            {SEGMENTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field name="revenue_range" label="Faixa de faturamento mensal" error={errors["revenue_range"]}>
            <select {...a("revenue_range")} defaultValue="">
              <option value="" disabled>Selecione</option>
              {REVENUE_RANGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field name="challenge" label="Principal desafio da operação" error={errors["challenge"]}>
            <textarea {...a("challenge")} rows={4} maxLength={1000} />
          </Field>
        </div>
      </div>
      {status === "error" && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Solicitar diagnóstico estratégico
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Seus dados são usados apenas para contato sobre o diagnóstico.
      </p>
    </form>
  );
}
