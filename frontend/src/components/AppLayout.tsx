import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Shield,
  UserCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", permission: null },
  { label: "Users", icon: Users, href: "/users", permission: "USER_VIEW" },
  { label: "Roles", icon: Shield, href: "/roles", permission: "ROLE_VIEW" },
  { label: "Customers", icon: UserCheck, href: "/customers", permission: "CUSTOMER_VIEW" },
  { label: "JobScedule", icon: UserCheck, href: "/job-schedule", permission: "CUSTOMER_VIEW" },
];

const AppLayout = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r transition-all duration-300",
          "bg-sidebar text-sidebar-foreground",
          sidebarOpen ? "w-60" : "w-16"
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <span className="font-semibold text-sidebar-primary-foreground text-lg tracking-tight">
              CRM
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            if (item.permission && !hasPermission(item.permission)) return null;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-60" : "ml-16"
        )}
      >
        <div className="p-6 lg:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
