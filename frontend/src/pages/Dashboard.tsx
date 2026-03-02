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

const navItems = [
  { title: "All Customers", description: "Global directory", icon: Users, href: "/customers", gradient: "from-blue-500 to-blue-600", permission: "CUSTOMER_VIEW" },
  { title: "AMC Customers", description: "Annual Contracts", icon: Settings, href: "/customers/amc", gradient: "from-purple-500 to-purple-600", permission: "CUSTOMER_VIEW" },
  { title: "Visit Customers", description: "On-site support", icon: Building2, href: "/customers/visits", gradient: "from-orange-500 to-orange-600", permission: "CUSTOMER_VIEW" },
  { title: "Implementation", description: "Project setups", icon: Briefcase, href: "/customers/implementation", gradient: "from-emerald-500 to-teal-600", permission: "CUSTOMER_VIEW" },
  { title: "Call Management", description: "Support tracking", icon: PhoneCall, href: "/calls", gradient: "from-rose-500 to-red-600", permission: "CUSTOMER_VIEW" },
  { title: "Appointments", description: "Client meetings", icon: Calendar, href: "/appointments", gradient: "from-indigo-500 to-indigo-600", permission: "CUSTOMER_VIEW" },
  { title: "Accounts", description: "Financial records", icon: UserCheck, href: "/accounts", gradient: "from-sky-500 to-sky-600", permission: "CUSTOMER_VIEW" },
  { title: "Reports", description: "Data analytics", icon: FileText, href: "/reports", gradient: "from-slate-600 to-slate-700", permission: "CUSTOMER_VIEW" },
];

const Dashboard = () => {
  const { user } = useAuth(); //

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <NaviBar />      
      <main className="p-8 max-w-[1600px] mx-auto">
        {/* Main Gradient Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {navItems.map((item, i) => (
            <PermissionGate key={item.title} permission={item.permission}>
              <motion.a
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative overflow-hidden p-6 h-48 rounded-[2rem] bg-gradient-to-br ${item.gradient} text-white shadow-lg flex flex-col justify-between transition-all duration-300 hover:shadow-2xl`}
              >
                {/* Icon with subtle background */}
                <div className="bg-white/20 w-fit p-3 rounded-2xl">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
                  <p className="text-sm text-white/80 font-medium mt-1">
                    {item.description}
                  </p>
                </div>
                
                {/* Subtle design element for professional look */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              </motion.a>
            </PermissionGate>
          ))}
        </div>

        {/* System Status Footer */}
        <div className="mt-16 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-400">
            System is active. Only authorized modules are displayed.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;