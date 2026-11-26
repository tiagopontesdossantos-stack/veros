import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/_authenticated/admin/relatorios")({
  head: adminHead("Relatórios"),
  component: () => (
    <div>
      <PageHeader title="Relatórios gerados" description="Relatórios executivos em PDF dos diagnósticos." />
      <div className="rounded-xl border border-dashed bg-card/50 p-10 text-center">
        <FileText className="mx-auto h-8 w-8 text-cyan" />
        <p className="mt-3 font-medium">Geração de relatórios em desenvolvimento</p>
        <p className="mt-1 text-sm text-muted-foreground">Os relatórios executivos serão gerados a partir dos diagnósticos na próxima etapa.</p>
      </div>
    </div>
  ),
});
