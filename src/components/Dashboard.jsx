import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Battery,
  Wrench,
  Package,
  Shield,
  Home,
  Menu,
  X,
} from "lucide-react";
import Overview from "./Overview";
import Inventory from "./Inventory";
import Sales from "./Sales";
import Service from "./Service";
import AdminPanel from "./AdminPanel";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [shopName, setShopName] = useState("Battery CRM");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile) setIsAdmin(profile.role === "admin");
      }

      const { data: settings } = await supabase
        .from("shop_settings")
        .select("shop_name")
        .eq("id", 1)
        .single();
      if (settings) setShopName(settings.shop_name);
    };
    fetchInitialData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  let tabs = [
    { id: "home", name: "Home", icon: Home },
    { id: "sales", name: "Sales", icon: Battery },
    { id: "service", name: "Service", icon: Wrench },
    { id: "inventory", name: "Inventory", icon: Package },
  ];

  if (isAdmin) {
    tabs.push({ id: "admin", name: "Admin", icon: Shield });
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col md:flex-row gap-4 relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-2 mb-2 sticky top-0 bg-black z-30">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-zinc-900/50 rounded-xl border border-white/5 text-white/80"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold tracking-tight text-white/90 uppercase truncate">
          {shopName}
        </h1>
        <div className="w-9"></div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`bg-zinc-900/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex flex-col gap-4 z-50
          fixed top-0 left-0 h-full w-64 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-64 md:h-auto md:min-h-[calc(100vh-2rem)] md:z-0`}
      >
        <div className="flex justify-between items-center w-full mb-6">
          <h1 className="text-base font-semibold tracking-tight text-white/90 uppercase truncate">
            {shopName}
          </h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-white/40 hover:text-white flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 w-full flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 w-full text-sm font-medium
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
              <span className="relative z-10">{tab.name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 mt-auto text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 w-full text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {activeTab === "home" && <Overview />}
            {activeTab === "sales" && <Sales isAdmin={isAdmin} />}
            {activeTab === "service" && <Service isAdmin={isAdmin} />}
            {activeTab === "inventory" && <Inventory isAdmin={isAdmin} />}
            {activeTab === "admin" && isAdmin && <AdminPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
