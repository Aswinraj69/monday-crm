import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  User,
  Settings,
  Search,
  HelpCircle,
  Grid3X3,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const GlobalHeader = () => (
  <header className="h-14 flex items-center justify-between border-b bg-background px-6">
    <div className="flex items-center gap-4">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-primary">monday CRM</h1>
        <Button variant="outline" size="sm" className="h-6 text-xs">
          See plans
        </Button>
      </div>
    </div>
    
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm">
        <Bell className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <User className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <Settings className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <Search className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <HelpCircle className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <Grid3X3 className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          Import
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          Integrate
          <Badge variant="secondary" className="ml-1 text-xs">M</Badge>
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          Automate / 9
        </Button>
        <Button variant="ghost" size="sm">
          <ChevronDown className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-pink-500 text-white text-sm">VJ</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" className="gap-2">
            Invite / 1
          </Button>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </header>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full overflow-x-auto">
            <AppSidebar />
            <main className="flex-1 flex flex-col overflow-x-auto">
              <GlobalHeader />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/sequences" element={<div className="p-8 text-center text-muted-foreground">Sequences (Coming Soon)</div>} />
                  <Route path="/quotes" element={<div className="p-8 text-center text-muted-foreground">Quotes & Invoices (Coming Soon)</div>} />
                  <Route path="/contacts" element={<div className="p-8 text-center text-muted-foreground">Contacts (Coming Soon)</div>} />
                  <Route path="/leads" element={<div className="p-8 text-center text-muted-foreground">Leads (Coming Soon)</div>} />
                  <Route path="/accounts" element={<div className="p-8 text-center text-muted-foreground">Accounts (Coming Soon)</div>} />
                  <Route path="/projects" element={<div className="p-8 text-center text-muted-foreground">Client Projects (Coming Soon)</div>} />
                  <Route path="/products" element={<div className="p-8 text-center text-muted-foreground">Products & Services (Coming Soon)</div>} />
                  <Route path="/activities" element={<div className="p-8 text-center text-muted-foreground">Activities (Coming Soon)</div>} />
                  <Route path="/dashboard" element={<div className="p-8 text-center text-muted-foreground">Sales Dashboard (Coming Soon)</div>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
