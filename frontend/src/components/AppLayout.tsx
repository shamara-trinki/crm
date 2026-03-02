import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Shield,
  UserCheck,
  CreditCard,
  Wallet,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  permission: string | null;
  children?: NavItem[];
}

interface NavItemProps {
  item: NavItem;
  isCollapsed: boolean;
  depth?: number;
}

// Navigation configuration
const navItems: NavItem[] = [
  { 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    href: "/", 
    permission: null 
  },
  { 
    label: "Users", 
    icon: Users, 
    href: "/users", 
    permission: "USER_VIEW" 
  },
  { 
    label: "Roles", 
    icon: Shield, 
    href: "/roles", 
    permission: "ROLE_VIEW" 
  },
  { 
    label: "Customers", 
    icon: UserCheck, 
    href: "/customers", 
    permission:  null
  },
  { 
    label: "Payments", 
    icon: CreditCard, 
    permission: null,
    children: [
      { 
        label: "Service Types", 
        icon: Wallet, 
        href: "/service-types", 
        permission: null 
      },
      { 
        label: "Payment Transactions", 
        icon: CreditCard, 
        href: "/payment", 
        permission: null 
      },
    ]
  },
  { label: "JobScedule", icon: UserCheck, href: "/job-schedule", permission: "CUSTOMER_VIEW" },
];

// Sidebar width constants
const SIDEBAR_WIDTH = {
  expanded: "w-60",
  collapsed: "w-16"
};

// NavItem Component with submenu support
const NavItemComponent = ({ item, isCollapsed, depth = 0 }: NavItemProps) => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = useMemo(() => {
    if (item.children) {
      return item.children.some(child => location.pathname === child.href);
    }
    return location.pathname === item.href;
  }, [location.pathname, item]);

  // Auto-expand parent if a child is active
  useEffect(() => {
    if (item.children && !isCollapsed) {
      const hasActiveChild = item.children.some(child => location.pathname === child.href);
      if (hasActiveChild) {
        setIsOpen(true);
      }
    }
  }, [location.pathname, item.children, isCollapsed]);

  // Close submenu when collapsing sidebar
  useEffect(() => {
    if (isCollapsed) {
      setIsOpen(false);
    }
  }, [isCollapsed]);

  // Check permission
  if (item.permission && !hasPermission(item.permission)) {
    return null;
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // If collapsed, show tooltip
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Link
            to={item.href}
            className={cn(
              "flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  // If item has children, render with submenu
  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={handleToggle}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
          ) : (
            <ChevronRight className="w-4 h-4 transition-transform duration-200" />
          )}
        </button>
        
        {/* Submenu */}
        <div
          className={cn(
            "ml-4 space-y-1 overflow-hidden transition-all duration-200",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {item.children.map((child) => {
            if (child.permission && !hasPermission(child.permission)) return null;
            const isChildActive = location.pathname === child.href;
            
            return (
              <Link
                key={child.href}
                to={child.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                  isChildActive
                    ? "bg-sidebar-accent/50 text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground"
                )}
              >
                <child.icon className="w-4 h-4 shrink-0" />
                <span>{child.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Regular nav item
  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon className="w-5 h-5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
};

// Main AppLayout Component
const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle logout with proper error handling
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show a toast notification here
    }
  }, [logout, navigate]);

  // Filter nav items based on permissions
  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => {
      if (!item.permission) return true;
      // Permission check would go here
      return true; // Placeholder
    });
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-expanded");
    if (savedState !== null) {
      setSidebarOpen(savedState === "true");
    }
  }, []);

  // Update localStorage when sidebar state changes
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", String(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex flex-col border-r transition-all duration-300 ease-in-out",
            "bg-sidebar text-sidebar-foreground border-sidebar-border",
            sidebarOpen ? SIDEBAR_WIDTH.expanded : SIDEBAR_WIDTH.collapsed
          )}
        >
          {/* Header */}
          <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
            {sidebarOpen && (
              <span className="font-semibold text-sidebar-foreground text-lg tracking-tight animate-in fade-in">
                CRM
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "ml-auto text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors",
                !sidebarOpen && "mx-auto"
              )}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border">
            {filteredNavItems.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                isCollapsed={!sidebarOpen}
              />
            ))}
          </nav>

          {/* Footer with user info and logout */}
          <div className="p-3 border-t border-sidebar-border space-y-2">
            {/* User info - only show when expanded */}
            {sidebarOpen && user && (
              <div className="px-3 py-2 text-xs text-sidebar-foreground/70">
                {/* <p className="font-medium truncate">{user.name || user.email}</p>
                <p className="truncate">{user.email}</p> */}
              </div>
            )}
            
            {/* Logout button */}
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-all duration-200",
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    !sidebarOpen && "justify-center"
                  )}
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  {sidebarOpen && <span>Sign out</span>}
                </button>
              </TooltipTrigger>
              {!sidebarOpen && (
                <TooltipContent side="right" className="text-xs">
                  Sign out
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            sidebarOpen ? "ml-60" : "ml-16"
          )}
        >
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default AppLayout;