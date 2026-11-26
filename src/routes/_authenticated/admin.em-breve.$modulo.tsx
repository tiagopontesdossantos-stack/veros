import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";

const NAMES: Record<string, string> = { crm: "CRM", clientes: "Clientes e Projetos", financeiro: "Financeiro" };

export const Route = createFileRoute("/_authenticated/admin/em-breve/$modulo")({
  head: adminHead("Módulo planejado"),
  component: Planned,
});

function Planned() {
  const { modulo } = Route.useParams();
  const name = NAMES[modulo] ?? "Módulo";
  return (
    <div>
      <PageHeader title={name} description="Área planejada para uma próxima etapa." />
      <div className="rounded-xl border border-dashed bg-card/50 p-10 text-center">
        <Construction className="mx-auto h-8 w-8 text-cyan" />
        <p className="mt-3 font-medium">{name} ainda não está disponível</p>
        <p className="mt-1 text-sm text-muted-foreground">Este módulo será desenvolvido em uma etapa posterior do VEROS Admin.</p>
      </div>
    </div>
  );
}
