import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import { TrendingUp, IndianRupee, Wrench, CheckCircle2 } from "lucide-react";

export default function Overview() {
  const [stats, setStats] = useState({
    revenue: 0,
    salesCount: 0,
    activeService: 0,
    readyService: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const { data: salesData } = await supabase
      .from("sales")
      .select("price, sale_date");
    const { data: serviceData } = await supabase
      .from("service")
      .select("status");

    let revenue = 0,
      salesCount = 0;
    if (salesData) {
      salesData.forEach((sale) => {
        if (sale.sale_date && new Date(sale.sale_date) >= firstDay) {
          revenue += sale.price || 0;
          salesCount += 1;
        }
      });
    }

    let activeService = 0,
      readyService = 0;
    if (serviceData) {
      serviceData.forEach((svc) => {
        if (["Received", "Under Testing", "Charging"].includes(svc.status))
          activeService += 1;
        else if (svc.status === "Ready for Delivery") readyService += 1;
      });
    }

    setStats({ revenue, salesCount, activeService, readyService });
    setLoading(false);
  };

  const supporting = [
    {
      title: "Sales This Month",
      value: stats.salesCount,
      icon: TrendingUp,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Active Service",
      value: stats.activeService,
      icon: Wrench,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Ready for Delivery",
      value: stats.readyService,
      icon: CheckCircle2,
      color: "text-teal-500",
      bg: "bg-teal-500/10",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-zinc-900 dark:text-white">
          Dashboard
        </h2>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-medium mt-1">
          Overview of your shop's performance this month.
        </p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-zinc-500 dark:text-zinc-400">
          Loading stats...
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Hero revenue — solid black accent card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="accent-card rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[180px]"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
                Revenue This Month
              </span>
              <div className="p-2.5 rounded-xl bg-amber-400/15 dark:bg-amber-500/10">
                <IndianRupee className="w-5 h-5 text-amber-400 dark:text-amber-600" />
              </div>
            </div>
            <div className="text-5xl md:text-6xl font-extrabold tracking-tight text-white dark:text-zinc-900 font-mono">
              ₹{stats.revenue.toLocaleString()}
            </div>
          </motion.div>

          {/* Supporting stats — compact floating cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {supporting.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 * (idx + 1) }}
                className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-5 flex flex-col justify-between min-h-[120px] md:min-h-[140px]"
              >
                <div
                  className={`p-2 rounded-lg md:rounded-xl ${card.bg} w-fit`}
                >
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold font-mono text-zinc-900 dark:text-white">
                    {card.value}
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">
                    {card.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Status — free-floating pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] px-4 py-2 w-fit"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              All systems running smoothly
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
