import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const NaviBar = () => {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-2 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Search */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-80 border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all duration-300">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-600 placeholder:text-slate-400"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800 hidden lg:block">
          Workspace Dashboard
        </h1>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-95">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">
                {/* {user?.name || "Super Admin"} */}
              </p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Administrator
              </p>
            </div>

            <motion.img
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              src={`https://ui-avatars.com/api/?name=${ "Admin"}&background=0ea5e9&color=fff`}
              alt="profile"
              className="w-10 h-10 rounded-xl border-2 border-white shadow-lg"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NaviBar;