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

    // Get current month start date
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch Sales
    const { data: salesData } = await supabase
      .from("sales")
      .select("price, sale_date");

    // Fetch Service
    const { data: serviceData } = await supabase
      .from("service")
      .select("status");

    let revenue = 0;
    let salesCount = 0;

    if (salesData) {
      salesData.forEach((sale) => {
        if (sale.sale_date && new Date(sale.sale_date) >= firstDay) {
          revenue += sale.price || 0;
          salesCount += 1;
        }
      });
    }

    let activeService = 0;
    let readyService = 0;

    if (serviceData) {
      serviceData.forEach((svc) => {
        if (["Received", "Under Testing", "Charging"].includes(svc.status)) {
          activeService += 1;
        } else if (svc.status === "Ready for Delivery") {
          readyService += 1;
        }
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
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      title: "Sales This Month",
      value: stats.salesCount,
      icon: TrendingUp,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Active Service Tickets",
      value: stats.activeService,
      icon: Wrench,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Ready for Delivery",
      value: stats.readyService,
      icon: CheckCircle2,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            Dashboard
          </h2>
          <p className="text-white/40 text-sm">
            Overview of your shop's performance this month.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 p-8 text-center text-white/40">
            Loading stats...
          </div>
        ) : (
          cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-white/50 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div
                className={`text-2xl md:text-3xl font-bold font-mono ${card.color}`}
              >
                {card.value}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-8 bg-blue-500/5 border border-blue-500/10 text-blue-400/80 text-sm p-4 rounded-xl flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <p>
          All systems are running smoothly. Use the sidebar to add new sales,
          service tickets, or manage inventory.
        </p>
      </div>
    </div>
  );
}
