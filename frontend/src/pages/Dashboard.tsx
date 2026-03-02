import { useAuth } from "@/contexts/AuthContext";
import { Users, Shield, UserCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { PermissionGate } from "@/components/PermissionGate";

const statCards = [
  {
    title: "User Management",
    description: "Create and manage system users",
    icon: Users,
    permission: "USER_VIEW",
    href: "/users",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Role Management",
    description: "Configure roles and permissions",
    icon: Shield,
    permission: "ROLE_VIEW",
    href: "/roles",
    color: "bg-info/10 text-info",
  },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="crm-page-header">
        <h1 className="crm-page-title">Dashboard</h1>
        <p className="crm-page-subtitle">
          Welcome back{user?.username ? `, ${user.username}` : ''} to your CRM workspace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Permission-protected cards */}
        {statCards.map((card, i) => (
          <PermissionGate key={card.title} permission={card.permission}>
            <motion.a
              href={card.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="crm-stat-card flex items-start gap-4 cursor-pointer group hover:scale-105 transition-all duration-200"
            >
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">{card.description}</p>
              </div>
            </motion.a>
          </PermissionGate>
        ))}

        {/* Customer card - always visible */}
        <motion.a
          href="/customers"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: statCards.length * 0.1 }}
          className="crm-stat-card flex items-start gap-4 cursor-pointer group hover:scale-105 transition-all duration-200"
        >
          <div className="p-3 rounded-lg bg-success/10 text-success">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
              Customers
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">Manage customer relationships</p>
          </div>
        </motion.a>
      </div>

      <div className="mt-8 crm-stat-card">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-medium text-foreground">Quick Overview</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Your CRM system is up and running. Use the cards above to navigate to different modules.
          Only features you have permission to access are visible.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;