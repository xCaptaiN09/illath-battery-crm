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
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
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
  const { theme, toggleTheme } = useTheme();

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

  const handleLogout = async () => await supabase.auth.signOut();
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
  if (isAdmin) tabs.push({ id: "admin", name: "Admin", icon: Shield });

  return (
    <div className="min-h-screen p-4 flex flex-col md:flex-row gap-4 relative transition-colors dark:bg-black light:bg-gray-50">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-2 mb-2 sticky top-0 z-30 transition-colors dark:bg-black light:bg-gray-50">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 glass-card rounded-xl dark:text-white light:text-zinc-900"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold tracking-tight dark:text-white light:text-zinc-900 uppercase truncate">
          {shopName}
        </h1>
        <button
          onClick={toggleTheme}
          className="p-2 glass-card rounded-xl dark:text-white light:text-zinc-900"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

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
        className={`glass-card p-6 flex flex-col gap-4 z-50 fixed top-0 left-0 h-full w-72 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:static md:translate-x-0 md:w-64 md:h-auto md:min-h-[calc(100vh-2rem)] md:z-0 rounded-3xl`}
      >
        <div className="flex justify-between items-center w-full mb-8">
          <h1 className="text-lg font-extrabold tracking-tight dark:text-white light:text-zinc-900 uppercase truncate">
            {shopName}
          </h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden dark:text-white light:text-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 w-full flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-sm font-semibold ${activeTab === tab.id ? "dark:text-white light:text-white dark:bg-white/10 light:bg-zinc-900" : "dark:text-zinc-400 light:text-zinc-600 dark:hover:bg-white/5 light:hover:bg-black/5"}`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 mt-auto dark:text-zinc-400 light:text-zinc-600 dark:hover:text-red-400 light:hover:text-red-500 dark:hover:bg-red-500/10 light:hover:bg-red-500/10 rounded-xl transition-all duration-200 w-full text-sm font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 glass-card rounded-3xl p-6 md:p-10 overflow-y-auto">
        <div className="hidden md:flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl dark:bg-white/5 light:bg-black/5 dark:text-white light:text-zinc-900"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
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
