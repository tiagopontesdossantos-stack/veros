import { z } from "zod";

export const SEGMENTS = [
  "Agência de marketing ou publicidade",
  "SaaS ou startup",
  "Empresa de tecnologia",
  "Serviços B2B",
  "Outro",
] as const;

export const REVENUE_RANGES = [
  "Até R$ 100 mil",
  "R$ 100 mil a R$ 500 mil",
  "R$ 500 mil a R$ 1 milhão",
  "Acima de R$ 1 milhão",
  "Prefiro não informar",
] as const;

export const diagnosticSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  company: z.string().trim().min(1, "Informe a empresa").max(120),
  role: z.string().trim().min(1, "Informe seu cargo").max(80),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/[^\d+]/g, ""))
    .pipe(z.string().min(10, "WhatsApp inválido (com DDD)").max(20, "WhatsApp inválido")),
  segment: z.enum(SEGMENTS, { message: "Selecione o segmento" }),
  revenue_range: z.enum(REVENUE_RANGES, { message: "Selecione a faixa" }),
  challenge: z
    .string()
    .trim()
    .min(10, "Descreva em poucas palavras (mín. 10 caracteres)")
    .max(1000),
  source: z.string().trim().max(60).regex(/^[a-z0-9-]+$/).default("site"),
});

export type DiagnosticInput = z.input<typeof diagnosticSchema>;
