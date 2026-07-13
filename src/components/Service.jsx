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
  ChevronDown,
  Wrench,
  MapPin,
} from "lucide-react";
import MapPicker from "./MapPicker";

export default function Service({ isAdmin }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteText, setDeleteText] = useState("");

  const emptyForm = {
    customer_name: "",
    phone: "",
    battery_brand: "",
    battery_model: "",
    serial_number: "",
    issue: "",
    status: "Received",
    date_received: new Date().toISOString().split("T")[0],
    received_time: new Date().toTimeString().split(" ")[0],
    customer_address: "",
    map_coordinates: "",
    image_urls: [],
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
    setExpandedId(null);
  };
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const uploadedUrls = [...(form.image_urls || [])];
    for (const file of files) {
      if (uploadedUrls.length >= 4) {
        alert("Maximum 4 photos allowed.");
        break;
      }
      const fileName = `service_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("battery-images")
        .upload(fileName, file);
      if (error) {
        alert("Error uploading image: " + error.message);
      } else {
        const { data } = supabase.storage
          .from("battery-images")
          .getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }
    }
    setForm({ ...form, image_urls: uploadedUrls });
  };

  const handleRemoveImage = (urlToRemove) =>
    setForm({
      ...form,
      image_urls: form.image_urls.filter((url) => url !== urlToRemove),
    });

  const handleMapConfirm = (location) => {
    setForm((prev) => ({
      ...prev,
      customer_address: location.address,
      map_coordinates: location.coordinates,
    }));
    setShowMap(false);
  };

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
    setDeleteConfirmId(null);
    setDeleteText("");
    setExpandedId(null);
    fetchService();
  };

  const statusColors = {
    Received: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    "Under Testing": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Charging: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "Ready for Delivery": "bg-green-500/10 text-green-400 border-green-500/20",
    "Handed Over": "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
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
            <option value="Received">Received</option>
            <option value="Under Testing">Under Testing</option>
            <option value="Charging">Charging</option>
            <option value="Ready for Delivery">Ready for Delivery</option>
            <option value="Handed Over">Handed Over</option>
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

      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-white/40">Loading...</div>
        ) : displayedRecords.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            No service records found.
          </div>
        ) : (
          displayedRecords.map((svc) => (
            <div
              key={svc.id}
              className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden"
            >
              <div
                onClick={() =>
                  setExpandedId(expandedId === svc.id ? null : svc.id)
                }
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                    <Wrench className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/90 font-medium truncate">
                      {svc.customer_name}{" "}
                      <span className="text-white/40 font-normal text-xs">
                        ({svc.phone})
                      </span>
                    </div>
                    <div className="text-white/40 text-xs font-mono truncate">
                      {svc.battery_brand}{" "}
                      {svc.serial_number || svc.battery_model}
                    </div>
                  </div>
                  <select
                    value={svc.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(svc.id, e.target.value)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border outline-none cursor-pointer max-w-[110px] md:max-w-none truncate ${statusColors[svc.status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}
                  >
                    <option>Received</option>
                    <option>Under Testing</option>
                    <option>Charging</option>
                    <option>Ready for Delivery</option>
                    <option>Handed Over</option>
                    <option>Unrepairable</option>
                  </select>
                </div>
                <motion.div
                  animate={{ rotate: expandedId === svc.id ? 180 : 0 }}
                  className="ml-4 flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-white/30" />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedId === svc.id && (
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
                            Date & Time
                          </span>
                          <span className="text-white/90">
                            {svc.date_received
                              ? new Date(svc.date_received).toLocaleDateString()
                              : "-"}{" "}
                            {svc.received_time || ""}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Serial Number
                          </span>
                          <span className="text-white/90 font-mono">
                            {svc.serial_number || "-"}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Issue
                          </span>
                          <span className="text-white/90">
                            {svc.issue || "-"}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Address
                          </span>
                          <span className="text-white/90">
                            {svc.customer_address || "-"}{" "}
                            {svc.map_coordinates ? (
                              <a
                                href={`https://maps.google.com/?q=${svc.map_coordinates}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 underline"
                              >
                                (View Map)
                              </a>
                            ) : (
                              ""
                            )}
                          </span>
                        </div>
                      </div>

                      {svc.image_urls?.length > 0 && (
                        <div className="mb-4">
                          <span className="text-white/40 uppercase text-xs block mb-2">
                            Attached Photos
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {svc.image_urls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={url}
                                  alt={`Upload ${idx}`}
                                  className="w-16 h-16 object-cover rounded-lg border border-white/10 hover:opacity-80"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {deleteConfirmId === svc.id ? (
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
                                  ? handleDelete(svc.id)
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
                            onClick={() => openEditForm(svc)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white py-2 rounded-lg text-sm hover:bg-white/20 transition-colors"
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteConfirmId(svc.id)}
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
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
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

                <div>
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                    Address & Location
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="customer_address"
                      value={form.customer_address || ""}
                      onChange={handleChange}
                      className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      placeholder="Enter manually or use map"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-xl text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                    >
                      <MapPin className="w-4 h-4" /> Map
                    </button>
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
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none font-mono"
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Date
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
                      Time
                    </label>
                    <input
                      type="time"
                      name="received_time"
                      value={form.received_time || ""}
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
                      value={form.status || "Received"}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                    >
                      <option>Received</option>
                      <option>Under Testing</option>
                      <option>Charging</option>
                      <option>Ready for Delivery</option>
                      <option>Handed Over</option>
                      <option>Unrepairable</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-4">
                  <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">
                    Upload Photos (Max 4)
                  </label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {(form.image_urls || []).map((url, idx) => (
                      <div key={idx} className="relative w-24 h-24 group">
                        <img
                          src={url}
                          alt={`Upload ${idx}`}
                          className="w-full h-full object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(url)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {(form.image_urls?.length || 0) < 4 && (
                      <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/30 transition-colors text-white/30 text-xs text-center px-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        + Add Photo
                      </label>
                    )}
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

      <AnimatePresence>
        {showMap && (
          <MapPicker
            onConfirm={handleMapConfirm}
            onClose={() => setShowMap(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
