import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, PlusCircle, History, Timer, CheckCircle2, FileText, ListTree,
  Building2, Users, FolderKanban, Wallet, Settings, LogOut, ChartNoAxesCombined, ListTodo,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import logoAsset from "@/assets/veros-logo-dark.png.asset.json";

type Item = { title: string; icon: typeof LayoutDashboard; to: string; search?: Record<string, string>; params?: Record<string, string>; planned?: boolean };

const groups: { label: string; items: Item[] }[] = [
  { label: "Visão geral", items: [{ title: "Dashboard", icon: LayoutDashboard, to: "/admin" }] },
  {
    label: "Meeting Intelligence",
    items: [
      { title: "Nova reunião", icon: PlusCircle, to: "/admin/reunioes/nova" },
      { title: "Histórico de reuniões", icon: History, to: "/admin/reunioes" },
      { title: "Em andamento", icon: Timer, to: "/admin/reunioes", search: { status: "em_andamento" } },
      { title: "Concluídos", icon: CheckCircle2, to: "/admin/reunioes", search: { status: "concluido" } },
      { title: "Relatórios gerados", icon: FileText, to: "/admin/relatorios" },
      { title: "Modelos de diagnóstico", icon: ListTree, to: "/admin/modelos" },
      { title: "Empresas prospect", icon: Building2, to: "/admin/prospects" },
    ],
  },
  {
    label: "Operação comercial",
    items: [
      { title: "CRM e oportunidades", icon: Users, to: "/admin/em-breve/$modulo", params: { modulo: "crm" } },
      { title: "Atividades e follow-ups", icon: ListTodo, to: "/admin/em-breve/$modulo", params: { modulo: "atividades" } },
      { title: "Propostas comerciais", icon: FileText, to: "/admin/em-breve/$modulo", params: { modulo: "propostas" } },
    ],
  },
  {
    label: "Gestão e inteligência",
    items: [
      { title: "Clientes e projetos", icon: FolderKanban, to: "/admin/em-breve/$modulo", params: { modulo: "clientes" } },
      { title: "Financeiro", icon: Wallet, to: "/admin/em-breve/$modulo", params: { modulo: "financeiro" } },
      { title: "Indicadores", icon: ChartNoAxesCombined, to: "/admin/em-breve/$modulo", params: { modulo: "indicadores" } },
    ],
  },
  { label: "Configurações", items: [{ title: "Configurações", icon: Settings, to: "/admin/configuracoes" }] },
];

export function AdminSidebar({ email, onSignOut }: { email: string; onSignOut?: () => void }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const loc = useRouterState({ select: (r) => ({ path: r.location.pathname, search: r.location.search as Record<string, unknown> }) });

  function isActive(item: Item) {
    if (item.params) return loc.path === `/admin/em-breve/${item.params["modulo"]}`;
    if (loc.path !== item.to && loc.path !== `${item.to}/`) return false;
    const want = item.search?.["status"];
    return (loc.search["status"] ?? undefined) === want;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        {collapsed ? (
          <span className="font-display text-lg font-bold text-cyan">V</span>
        ) : (
          <img src={logoAsset.url} alt="Veros Advisory" className="h-9 w-auto self-start" />
        )}
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item)} tooltip={item.title}>
                      <Link to={item.to} search={item.search ?? {}} params={item.params ?? {}} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && (
                          <span className="flex flex-1 items-center justify-between gap-2">
                            {item.title}
                            {item.planned && <span className="rounded-full border px-1.5 text-[10px] text-muted-foreground">planejado</span>}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && <p className="truncate px-2 text-xs text-muted-foreground">{email}</p>}
        {onSignOut && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onSignOut} tooltip="Sair">
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Sair</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        {!onSignOut && !collapsed && (
          <p className="px-2 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Acesso temporário</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
