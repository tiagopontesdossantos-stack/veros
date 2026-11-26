import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { show } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/prospects/")({
  head: adminHead("Empresas prospect"),
  component: ProspectsPage,
});

function ProspectsPage() {
  const q = useQuery({
    queryKey: ["prospects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("prospects").select("id, legal_name, trade_name, segment, city, state, contact_name").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <div>
      <PageHeader title="Empresas prospect" description="Cadastro das empresas em diagnóstico."
        actions={<Button asChild><Link to="/admin/prospects/novo"><Plus className="h-4 w-4" />Nova empresa</Link></Button>} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr className="border-b">
            <th className="px-4 py-3 font-medium">Empresa</th><th className="px-4 py-3 font-medium">Segmento</th>
            <th className="px-4 py-3 font-medium">Cidade</th><th className="px-4 py-3 font-medium">Responsável</th>
          </tr></thead>
          <tbody className="divide-y">
            {q.data?.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-4 py-3"><Link to="/admin/prospects/$id" params={{ id: p.id }} className="font-medium hover:text-cyan">{p.trade_name || p.legal_name}</Link></td>
                <td className="px-4 py-3 text-muted-foreground">{show(p.segment)}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.city ? `${p.city}${p.state ? `/${p.state}` : ""}` : show(null)}</td>
                <td className="px-4 py-3 text-muted-foreground">{show(p.contact_name)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {q.data?.length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>}
      </div>
    </div>
  );
}
