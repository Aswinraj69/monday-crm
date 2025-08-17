import { useState } from "react";
import { 
  Home, 
  BarChart3, 
  FileText, 
  Users, 
  Building2, 
  Target, 
  Calendar,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Sequences", url: "/sequences", icon: BarChart3 },
  { title: "Quotes and Invoices", url: "/quotes", icon: FileText },
  { title: "More", url: "/more", icon: MoreHorizontal },
];

const workspaceItems = [
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Deals", url: "/", icon: Target, active: true },
  { title: "Leads", url: "/leads", icon: Target },
  { title: "Accounts", url: "/accounts", icon: Building2 },
  { title: "Client Projects", url: "/projects", icon: Calendar },
  { title: "Products & Services", url: "/products", icon: MoreHorizontal },
  { title: "Activities", url: "/activities", icon: Calendar },
  { title: "Sales Dashboard", url: "/dashboard", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [workspacesCollapsed, setWorkspacesCollapsed] = useState(false);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  const toggleWorkspaces = () => {
    setWorkspacesCollapsed(!workspacesCollapsed);
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent className="bg-sidebar text-sidebar-foreground">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              M
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg">monday CRM</span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted-foreground">
            Favorites
          </SidebarGroupLabel>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel 
            className="flex items-center justify-between text-sidebar-muted-foreground  hover:bg-sidebar-accent/50 rounded-md transition-colors"
            onClick={toggleWorkspaces}
          >
            Workspaces
            {!collapsed && (
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-200 ${
                  workspacesCollapsed ? 'rotate-0' : 'rotate-180'
                }`} 
              />
            )}
          </SidebarGroupLabel>
          {!workspacesCollapsed && (
            <SidebarGroupContent>
              <div className="mb-2 px-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs font-bold">
                    C
                  </div>
                  {!collapsed && <span className="font-medium">CRM</span>}
                </div>
              </div>
              <SidebarMenu>
                {workspaceItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}