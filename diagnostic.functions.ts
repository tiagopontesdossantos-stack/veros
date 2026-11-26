import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { diagnosticSchema } from "./diagnostic-schema";

export const submitDiagnostic = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => diagnosticSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { error } = await client.from("diagnostic_requests").insert(data);
    if (error) {
      console.error("diagnostic insert failed", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
