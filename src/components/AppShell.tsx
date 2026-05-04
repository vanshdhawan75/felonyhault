import { NavLink, useNavigate } from "react-router-dom";
import { Activity, Bell, LogOut, MapPin, ShieldAlert, Users } from "lucide-react";
import { useZentivo } from "@/lib/zentivo-context";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/history", label: "Alert History", icon: Bell },
  { to: "/map", label: "Location", icon: MapPin },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, status } = useZentivo();
  const navigate = useNavigate();

  const statusColor =
    status === "HIGH_RISK" ? "bg-danger" : status === "MONITORING" ? "bg-warn" : "bg-safe";
  const statusLabel =
    status === "HIGH_RISK" ? "High Risk" : status === "MONITORING" ? "Monitoring" : "Safe";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-border bg-card/40 backdrop-blur-sm">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-danger grid place-items-center shadow-danger">
            <ShieldAlert className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold leading-none">Zentivo</h1>
            <p className="text-[11px] text-muted-foreground mt-1">AI Emergency Detection</p>
          </div>
        </div>

        <nav className="px-3 flex md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary/15 text-foreground border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block mt-auto px-4 py-4 border-t border-border absolute bottom-0 w-64">
          <div className="flex items-center gap-2 mb-3">
            <span className={`stat-dot ${statusColor} ${status === "HIGH_RISK" ? "animate-pulse-ring" : ""}`} />
            <span className="text-sm">{statusLabel}</span>
          </div>
          <div className="text-xs text-muted-foreground truncate mb-2">{user?.email}</div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              logout();
              navigate("/auth");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 px-4 md:px-8 py-6 md:py-10 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}
