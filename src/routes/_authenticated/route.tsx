import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const roles = useQuery({
    queryKey: ["my-roles", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (roles.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  if (!roles.data || roles.data.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-cyan" />
          <h1 className="mt-4 font-display text-xl font-semibold">Acesso pendente</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta ({user.email}) ainda não foi autorizada para o VEROS Admin. Peça a um administrador da VEROS para liberar o seu acesso.
          </p>
          <Button variant="outline" className="mt-6" onClick={signOut}>Sair</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar email={user.email ?? ""} onSignOut={signOut} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <span className="font-display text-sm font-semibold tracking-wide text-muted-foreground">VEROS Admin</span>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
