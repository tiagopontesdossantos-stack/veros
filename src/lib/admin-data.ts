import type { Tables } from "@/integrations/supabase/types";

export type Prospect = Tables<"prospects">;
export type Meeting = Tables<"diagnostic_meetings">;
export type Section = Tables<"diagnostic_sections">;
export type Question = Tables<"diagnostic_questions">;
export type Answer = Tables<"diagnostic_answers">;

export const NOT_INFORMED = "Não informado";

export const SPIN_LABELS: Record<string, string> = {
  situacao: "Situação",
  problema: "Problema",
  implicacao: "Implicação",
  necessidade: "Necessidade de solução",
};

export const STATUS_LABELS: Record<string, string> = {
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

export function show(value: unknown): string {
  if (value === null || value === undefined || value === "") return NOT_INFORMED;
  return String(value);
}

export function money(value: number | null | undefined): string {
  if (value === null || value === undefined) return NOT_INFORMED;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function dateTime(value: string | null | undefined): string {
  if (!value) return NOT_INFORMED;
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

/** Texto vazio vira null ("Não informado"); número inválido também. */
export function toNumberOrNull(raw: string): number | null {
  const t = raw.trim().replace(/\./g, "").replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function toTextOrNull(raw: string): string | null {
  const t = raw.trim();
  return t === "" ? null : t;
}
