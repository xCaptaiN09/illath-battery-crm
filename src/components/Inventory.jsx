import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Trash2,
  Package,
  Pencil,
  Search,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";

export default function Inventory({ isAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteText, setDeleteText] = useState("");

  const [form, setForm] = useState({
    brand: "",
    model: "",
    type: "Car",
    price: "",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inventory")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const openNewForm = () => {
    setEditingItem(null);
    setForm({ brand: "", model: "", type: "Car", price: "" });
    setShowForm(true);
  };
  const openEditForm = (item) => {
    setEditingItem(item);
    setForm({
      brand: item.brand,
      model: item.model,
      type: item.type,
      price: item.price || "",
    });
    setShowForm(true);
    setExpandedId(null);
  };
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
    };
    if (editingItem) {
      const { error } = await supabase
        .from("inventory")
        .update(payload)
        .eq("id", editingItem.id);
      if (error) return alert("Error updating: " + error.message);
    } else {
      const { error } = await supabase.from("inventory").insert([payload]);
      if (error) return alert("Error saving: " + error.message);
    }
    setShowForm(false);
    fetchInventory();
  };

  const handleDelete = async (id) => {
    await supabase.from("inventory").delete().eq("id", id);
    setDeleteConfirmId(null);
    setDeleteText("");
    setExpandedId(null);
    fetchInventory();
  };

  const displayedItems = useMemo(() => {
    let filtered = items.filter(
      (item) =>
        item.brand.toLowerCase().includes(search.toLowerCase()) ||
        item.model.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase()),
    );

    if (sort === "price-high")
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === "price-low")
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "newest")
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sort === "oldest")
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return filtered;
  }, [items, search, sort]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            Battery Inventory
          </h2>
          <p className="text-white/40 text-sm">
            Add and manage available battery stock & pricing.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openNewForm}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Battery
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search brand, model, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-white/30 focus:outline-none"
          />
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
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-white/40">Loading...</div>
        ) : displayedItems.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            No batteries found.
          </div>
        ) : (
          displayedItems.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden"
            >
              <div
                onClick={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Package className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <div className="text-white/90 font-medium">
                      {item.brand} {item.model}
                    </div>
                    <div className="text-white/40 text-xs">
                      {item.type} • ₹{item.price || "-"}
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                >
                  <ChevronDown className="w-5 h-5 text-white/30" />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-white/5 bg-black/20">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Brand
                          </span>
                          <span className="text-white/90">{item.brand}</span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Model
                          </span>
                          <span className="text-white/90">{item.model}</span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Type
                          </span>
                          <span className="text-white/90">{item.type}</span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Price
                          </span>
                          <span className="text-white/90">
                            ₹{item.price || "-"}
                          </span>
                        </div>
                      </div>

                      {deleteConfirmId === item.id ? (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-red-400 text-sm mb-2">
                            Type DELETE to confirm
                          </p>
                          <input
                            autoFocus
                            value={deleteText}
                            onChange={(e) =>
                              setDeleteText(e.target.value.toUpperCase())
                            }
                            className="w-full bg-black/30 border border-red-500/30 rounded-lg px-3 py-2 text-white mb-2 outline-none"
                            placeholder="DELETE"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                deleteText === "DELETE"
                                  ? handleDelete(item.id)
                                  : alert("Text doesn't match")
                              }
                              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                            >
                              Confirm Delete
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirmId(null);
                                setDeleteText("");
                              }}
                              className="px-4 bg-zinc-700 text-white py-2 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(item)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white py-2 rounded-lg text-sm hover:bg-white/20 transition-colors"
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="px-4 flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-2 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
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
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-white/70" />{" "}
                  {editingItem ? "Edit Battery" : "Add New Battery"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                    Brand
                  </label>
                  <input
                    required
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none transition-all"
                    placeholder="e.g. Exide"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                    Model
                  </label>
                  <input
                    required
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none transition-all"
                    placeholder="e.g. DIN55"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Type
                    </label>
                    <input
                      list="battery-types"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none transition-all"
                      placeholder="Select or type"
                    />
                    <datalist id="battery-types">
                      <option value="Car" />
                      <option value="Bike" />
                      <option value="Truck" />
                      <option value="Auto-rickshaw" />
                      <option value="Bus" />
                      <option value="Inverter" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none transition-all"
                      placeholder="e.g. 6500"
                    />
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-white text-black font-medium py-3 rounded-xl mt-4 hover:bg-white/90 transition-colors"
                >
                  {editingItem ? "Update Battery" : "Save Battery"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
