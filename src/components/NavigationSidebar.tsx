import { Shield, Video, AlertTriangle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Shield },
  { id: "live-feed", label: "Live Feed", icon: Video },
  { id: "logs", label: "Logs", icon: FileText },
];

export const NavigationSidebar = ({ activeView, onNavigate }: NavigationSidebarProps) => {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Weapon Detection</h1>
            <p className="text-xs text-muted-foreground">CCTV Surveillance</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent focus:outline-none focus:ring-2 focus:ring-sidebar-ring",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-glow"
                      : "text-sidebar-foreground hover:text-sidebar-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="px-4 py-3 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse-slow" />
            <span className="text-xs font-medium text-success">System Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
