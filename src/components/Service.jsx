import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Trash2,
  Pencil,
  Search,
  ArrowUpDown,
  Filter,
} from "lucide-react";

export default function Service({ isAdmin }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");

  const emptyForm = {
    customer_name: "",
    phone: "",
    battery_brand: "",
    battery_model: "",
    serial_number: "",
    issue: "",
    status: "Pending",
    date_received: new Date().toISOString().split("T")[0],
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchService();
  }, []);

  const fetchService = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("service")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  };

  const openNewForm = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEditForm = (item) => {
    setEditingItem(item);
    setForm(item);
    setShowForm(true);
  };
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingItem) {
      const { error } = await supabase
        .from("service")
        .update(form)
        .eq("id", editingItem.id);
      if (error) return alert("Error updating: " + error.message);
    } else {
      const { error } = await supabase.from("service").insert([form]);
      if (error) return alert("Error saving: " + error.message);
    }
    setShowForm(false);
    fetchService();
  };

  const handleStatusChange = async (id, newStatus) => {
    await supabase.from("service").update({ status: newStatus }).eq("id", id);
    fetchService();
  };

  const handleDelete = async (id) => {
    await supabase.from("service").delete().eq("id", id);
    fetchService();
  };

  const statusColors = {
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Charging: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Ready: "bg-green-500/10 text-green-400 border-green-500/20",
    Unrepairable: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const displayedRecords = useMemo(() => {
    let filtered = records.filter(
      (item) =>
        (filterStatus === "all" || item.status === filterStatus) &&
        (item.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          item.phone?.toLowerCase().includes(search.toLowerCase()) ||
          item.battery_brand?.toLowerCase().includes(search.toLowerCase()) ||
          item.serial_number?.toLowerCase().includes(search.toLowerCase())),
    );

    if (sort === "newest")
      filtered.sort(
        (a, b) => new Date(b.date_received) - new Date(a.date_received),
      );
    if (sort === "oldest")
      filtered.sort(
        (a, b) => new Date(a.date_received) - new Date(b.date_received),
      );

    return filtered;
  }, [records, search, sort, filterStatus]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            Service Records
          </h2>
          <p className="text-white/40 text-sm">
            Manage batteries brought in for charging or repair.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openNewForm}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Service
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search name, phone, battery, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-white/30 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-white text-sm focus:ring-1 focus:ring-white/30 focus:outline-none appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Charging">Charging</option>
            <option value="Ready">Ready</option>
            <option value="Unrepairable">Unrepairable</option>
          </select>
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full md:w-auto bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-white text-sm focus:ring-1 focus:ring-white/30 focus:outline-none appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="border border-white/5 rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Battery Details</th>
              <th className="p-4 font-medium">Issue</th>
              <th className="p-4 font-medium">Received</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-white/40">
                  Loading...
                </td>
              </tr>
            ) : displayedRecords.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-white/40">
                  No service records found.
                </td>
              </tr>
            ) : (
              displayedRecords.map((svc) => (
                <tr
                  key={svc.id}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="text-white/90 font-medium">
                      {svc.customer_name}
                    </div>
                    <div className="text-white/40 text-xs">{svc.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white/90 font-medium">
                      {svc.battery_brand}
                    </div>
                    <div className="text-white/40 text-xs">
                      {svc.serial_number || svc.battery_model}
                    </div>
                  </td>
                  <td className="p-4 text-white/70 text-sm max-w-xs truncate">
                    {svc.issue || "-"}
                  </td>
                  <td className="p-4 text-white/70 text-sm">
                    {svc.date_received
                      ? new Date(svc.date_received).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-4">
                    <select
                      value={svc.status}
                      onChange={(e) =>
                        handleStatusChange(svc.id, e.target.value)
                      }
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${statusColors[svc.status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}
                    >
                      <option>Pending</option>
                      <option>Charging</option>
                      <option>Ready</option>
                      <option>Unrepairable</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEditForm(svc)}
                        className="text-white/30 hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(svc.id)}
                          className="text-white/30 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingItem ? "Edit Service Ticket" : "New Service Ticket"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Customer Name
                    </label>
                    <input
                      required
                      name="customer_name"
                      value={form.customer_name || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Phone
                    </label>
                    <input
                      required
                      name="phone"
                      value={form.phone || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Battery Brand
                    </label>
                    <input
                      name="battery_brand"
                      value={form.battery_brand || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      placeholder="Amaron"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Model / Serial No.
                    </label>
                    <input
                      name="serial_number"
                      value={form.serial_number || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      placeholder="SN98765"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                    Issue / Service Needed
                  </label>
                  <textarea
                    name="issue"
                    value={form.issue || ""}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                    placeholder="Not charging, low backup, etc."
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Date Received
                    </label>
                    <input
                      type="date"
                      name="date_received"
                      value={form.date_received || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status || "Pending"}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                    >
                      <option>Pending</option>
                      <option>Charging</option>
                      <option>Ready</option>
                      <option>Unrepairable</option>
                    </select>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-white text-black font-medium py-3 rounded-xl mt-4 hover:bg-white/90 transition-colors"
                >
                  {editingItem ? "Update Ticket" : "Save Service Ticket"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
