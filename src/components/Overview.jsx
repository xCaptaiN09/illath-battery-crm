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

  const cards = [
    {
      title: "Revenue This Month",
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "text-green-500 dark:text-green-400",
    },
    {
      title: "Sales This Month",
      value: stats.salesCount,
      icon: TrendingUp,
      color: "text-indigo-500 dark:text-indigo-400",
    },
    {
      title: "Active Service Tickets",
      value: stats.activeService,
      icon: Wrench,
      color: "text-yellow-500 dark:text-yellow-400",
    },
    {
      title: "Ready for Delivery",
      value: stats.readyService,
      icon: CheckCircle2,
      color: "text-teal-500 dark:text-teal-400",
    },
  ];

  return (
    <div>
      <div className="mb-12">
        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-3 text-zinc-900 dark:text-white">
          Dashboard
        </h2>
        <p className="text-lg text-zinc-500 dark:text-zinc-500 font-medium">
          Overview of your shop's performance this month.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-4 p-8 text-center text-zinc-500 dark:text-zinc-400">
            Loading stats...
          </div>
        ) : (
          cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-8 rounded-2xl flex flex-col justify-between min-h-[180px]"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div
                className={`text-4xl md:text-5xl font-extrabold font-sans ${card.color}`}
              >
                {card.value}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-8 glass-card text-base p-8 rounded-2xl flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
        <CheckCircle2 className="w-8 h-8 text-teal-500 dark:text-teal-400 flex-shrink-0" />
        <p>
          All systems are running smoothly. Use the sidebar to add new sales,
          service tickets, or manage inventory.
        </p>
      </div>
    </div>
  );
}
