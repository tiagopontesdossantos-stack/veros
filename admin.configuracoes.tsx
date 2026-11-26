import { createFileRoute } from "@tanstack/react-router";
import { User, Palette, SlidersHorizontal } from "lucide-react";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: adminHead("Configurações"),
  component: Settings,
});

function Settings() {
  const { user } = Route.useRouteContext();
  return (
    <div className="max-w-3xl">
      <PageHeader title="Configurações" />
      <div className="space-y-4">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display font-semibold"><User className="h-4 w-4 text-cyan" />Perfil do usuário</h2>
          <p className="mt-2 text-sm text-muted-foreground">E-mail: {user.email}</p>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display font-semibold"><Palette className="h-4 w-4 text-cyan" />Identidade visual</h2>
          <div className="mt-3 flex gap-2">
            {["bg-background", "bg-navy", "bg-primary", "bg-cyan", "bg-performance", "bg-foreground"].map((c) => <span key={c} className={`h-8 w-8 rounded-md border ${c}`} />)}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Paleta institucional da Veros Advisory, compartilhada com o site.</p>
        </section>
        <section className="rounded-xl border border-dashed bg-card/50 p-5">
          <h2 className="flex items-center gap-2 font-display font-semibold"><SlidersHorizontal className="h-4 w-4 text-cyan" />Preferências do sistema</h2>
          <p className="mt-2 text-sm text-muted-foreground">Planejado para uma próxima etapa.</p>
        </section>
      </div>
    </div>
  );
}
