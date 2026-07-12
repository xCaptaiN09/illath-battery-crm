import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Battery, Wrench, Package, Shield } from "lucide-react";
import Inventory from "./Inventory";
import Sales from "./Sales";
import Service from "./Service";
import AdminPanel from "./AdminPanel";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("sales");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (data) setIsAdmin(data.role === "admin");
      }
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Base tabs
  let tabs = [
    { id: "sales", name: "Sales", icon: Battery },
    { id: "service", name: "Service", icon: Wrench },
    { id: "inventory", name: "Inventory", icon: Package },
  ];

  // Add Admin tab if user is admin
  if (isAdmin) {
    tabs.push({ id: "admin", name: "Admin", icon: Shield });
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row p-4 gap-4">
      <div className="md:w-64 bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex md:flex-col items-center md:items-start gap-4">
        <h1 className="hidden md:block text-base font-semibold tracking-tight mb-6 text-white/90 uppercase">
          Illath Battery House
        </h1>

        <nav className="flex md:flex-col gap-2 w-full justify-around md:justify-start">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 w-full justify-center md:justify-start text-sm font-medium
                  ${activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="hidden md:inline relative z-10">{tab.name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto hidden md:flex items-center gap-3 px-4 py-2.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 w-full text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      <div className="flex-1 bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {activeTab === "sales" && <Sales isAdmin={isAdmin} />}
            {activeTab === "service" && <Service isAdmin={isAdmin} />}
            {activeTab === "inventory" && <Inventory isAdmin={isAdmin} />}
            {activeTab === "admin" && isAdmin && <AdminPanel />}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleLogout}
          className="md:hidden mt-8 flex items-center gap-2 px-4 py-2 text-red-400 bg-red-500/10 rounded-xl w-full justify-center text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
