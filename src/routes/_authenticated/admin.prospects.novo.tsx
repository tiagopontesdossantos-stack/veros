import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, adminHead } from "@/components/admin/PageHeader";
import { ProspectForm, type ProspectValues } from "@/components/admin/ProspectForm";

export const Route = createFileRoute("/_authenticated/admin/prospects/novo")({
  head: adminHead("Nova empresa"),
  component: NewProspect,
});

function NewProspect() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const m = useMutation({
    mutationFn: async (v: ProspectValues) => {
      const { data, error } = await supabase.from("prospects").insert({ ...v, created_by: user.id }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["prospects"] });
      toast.success("Empresa cadastrada");
      navigate({ to: "/admin/prospects/$id", params: { id } });
    },
    onError: () => toast.error("Não foi possível salvar a empresa."),
  });
  return (
    <div className="max-w-4xl">
      <PageHeader title="Nova empresa prospect" />
      <ProspectForm submitLabel="Cadastrar empresa" saving={m.isPending} onSubmit={(v) => m.mutate(v)} />
    </div>
  );
}
