// import { useAuth } from "@/contexts/AuthContext";
// import { Users, Shield, Activity, UserCheck } from "lucide-react";
// import { motion } from "framer-motion";
// import { PermissionGate } from "@/components/PermissionGate";

// const statCards = [
//   {
//     title: "User Management",
//     description: "Create and manage system users",
//     icon: Users,
//     permission: "USER_VIEW",
//     href: "/users",
//     color: "bg-primary/10 text-primary",
//   },
//   {
//     title: "Role Management",
//     description: "Configure roles and permissions",
//     icon: Shield,
//     permission: "ROLE_VIEW",
//     href: "/roles",
//     color: "bg-info/10 text-info",
//   },
//   {
//     title: "Customers",
//     description: "Manage customer relationships",
//     icon: UserCheck,
//     permission: "CUSTOMER_VIEW",
//     href: "/customers",
//     color: "bg-success/10 text-success",
//   },
// ];

// const Dashboard = () => {
//   const { user } = useAuth();

//   return (
//     <div>
//       <div className="crm-page-header">
//         <h1 className="crm-page-title">Dashboard</h1>
//         <p className="crm-page-subtitle">Welcome back to your CRM workspace</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//         {statCards.map((card, i) => (
//           <PermissionGate key={card.title} permission={card.permission}>
//             <motion.a
//               href={card.href}
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.1 }}
//               className="crm-stat-card flex items-start gap-4 cursor-pointer group"
//             >
//               <div className={`p-3 rounded-lg ${card.color}`}>
//                 <card.icon className="w-5 h-5" />
//               </div>
//               <div>
//                 <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
//                   {card.title}
//                 </h3>
//                 <p className="text-sm text-muted-foreground mt-0.5">{card.description}</p>
//               </div>
//             </motion.a>
//           </PermissionGate>
//         ))}
//       </div>

//       <div className="mt-8 crm-stat-card">
//         <div className="flex items-center gap-3 mb-4">
//           <Activity className="w-5 h-5 text-muted-foreground" />
//           <h2 className="font-medium text-foreground">Quick Overview</h2>
//         </div>
//         <p className="text-sm text-muted-foreground">
//           Your CRM system is up and running. Use the sidebar to navigate between modules.
//           Only features you have permission to access are visible.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Settings,
  Building2,
  Briefcase,
  PhoneCall,
  Calendar,
  UserCheck,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { PermissionGate } from "@/components/PermissionGate";
import NaviBar from "@/components/ui/NaviBar";

const statCards = [
  {
    title: "All Customers",
    description: "Global directory",
    icon: Users,
    permission: "CUSTOMER_VIEW",
    href: "/customers",
    bgGradient: "from-blue-500 to-blue-600",
  },
  {
    title: "AMC Customers",
    description: "Annual Contracts",
    icon: Settings,
    permission: "CUSTOMER_VIEW",
    href: "/customers/amc",
    bgGradient: "from-purple-500 to-purple-600",
  },
  {
    title: "Visit Customers",
    description: "On-site support",
    icon: Building2,
    permission: "CUSTOMER_VIEW",
    href: "/customers/visits",
    bgGradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Implementation",
    description: "Project setups",
    icon: Briefcase,
    permission: "CUSTOMER_VIEW",
    href: "/customers/implementation",
    bgGradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "Call Management",
    description: "Support tracking",
    icon: PhoneCall,
    permission: "CUSTOMER_VIEW",
    href: "/calls",
    bgGradient: "from-rose-500 to-red-600",
  },
  {
    title: "Appointments",
    description: "Client meetings",
    icon: Calendar,
    permission: "CUSTOMER_VIEW",
    href: "/appointments",
    bgGradient: "from-indigo-500 to-indigo-600",
  },
  {
    title: "Accounts",
    description: "Financial records",
    icon: UserCheck,
    permission: "CUSTOMER_VIEW",
    href: "/accounts",
    bgGradient: "from-sky-500 to-sky-600",
  },
  {
    title: "Reports",
    description: "Data analytics",
    icon: FileText,
    permission: "CUSTOMER_VIEW",
    href: "/reports",
    bgGradient: "from-slate-600 to-slate-700",
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <NaviBar />

      <main className="p-8 max-w-[1600px] mx-auto space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => (
            <PermissionGate key={card.title} permission={card.permission}>
              <motion.a
                href={card.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`p-6 rounded-3xl bg-gradient-to-br ${card.bgGradient} text-white shadow-lg h-44 flex flex-col justify-between`}
              >
                <card.icon className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-lg">{card.title}</h3>
                  <p className="text-white/80 text-xs">
                    {card.description}
                  </p>
                </div>
              </motion.a>
            </PermissionGate>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;