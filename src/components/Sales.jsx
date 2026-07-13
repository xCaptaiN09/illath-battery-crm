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
  Battery,
} from "lucide-react";

export default function Sales({ isAdmin }) {
  const [records, setRecords] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [filterBrand, setFilterBrand] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteText, setDeleteText] = useState("");

  const emptyForm = {
    customer_name: "",
    phone: "",
    vehicle_number: "",
    vehicle_type: "Car",
    battery_brand: "",
    battery_model: "",
    serial_number: "",
    price: "",
    warranty_months: "12",
    sale_date: new Date().toISOString().split("T")[0],
    image_urls: [],
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchSales();
    fetchInventory();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  };

  const fetchInventory = async () => {
    const { data } = await supabase.from("inventory").select("*");
    if (data) setInventory(data);
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
      const fileName = `sale_${Date.now()}_${file.name}`;
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

  const handleInventorySelect = (id) => {
    const item = inventory.find((i) => i.id === id);
    if (item)
      setForm({
        ...form,
        battery_brand: item.brand,
        battery_model: item.model,
        price: item.price || "",
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      warranty_months: form.warranty_months
        ? parseInt(form.warranty_months)
        : null,
    };
    if (editingItem) {
      const { error } = await supabase
        .from("sales")
        .update(payload)
        .eq("id", editingItem.id);
      if (error) return alert("Error updating: " + error.message);
    } else {
      const { error } = await supabase.from("sales").insert([payload]);
      if (error) return alert("Error saving: " + error.message);
    }
    setShowForm(false);
    fetchSales();
  };

  const handleDelete = async (id) => {
    await supabase.from("sales").delete().eq("id", id);
    setDeleteConfirmId(null);
    setDeleteText("");
    setExpandedId(null);
    fetchSales();
  };

  const calculateExpiry = (date, months) => {
    if (!date || !months) return "-";
    const d = new Date(date);
    d.setMonth(d.getMonth() + parseInt(months));
    return d.toLocaleDateString();
  };

  const uniqueBrands = useMemo(
    () => [
      "all",
      ...new Set(records.map((r) => r.battery_brand).filter(Boolean)),
    ],
    [records],
  );

  const displayedRecords = useMemo(() => {
    let filtered = records.filter(
      (item) =>
        (filterBrand === "all" || item.battery_brand === filterBrand) &&
        (item.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          item.phone?.toLowerCase().includes(search.toLowerCase()) ||
          item.vehicle_number?.toLowerCase().includes(search.toLowerCase()) ||
          item.battery_brand?.toLowerCase().includes(search.toLowerCase()) ||
          item.battery_model?.toLowerCase().includes(search.toLowerCase())),
    );

    if (sort === "price-high")
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === "price-low")
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "newest")
      filtered.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
    if (sort === "oldest")
      filtered.sort((a, b) => new Date(a.sale_date) - new Date(b.sale_date));

    return filtered;
  }, [records, search, sort, filterBrand]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            Sales Records
          </h2>
          <p className="text-white/40 text-sm">
            Track all batteries sold to customers.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openNewForm}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Sale
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search name, phone, vehicle, battery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-white/30 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full md:w-auto bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-white text-sm focus:ring-1 focus:ring-white/30 focus:outline-none appearance-none capitalize"
          >
            {uniqueBrands.map((brand) => (
              <option key={brand} value={brand} className="capitalize">
                {brand === "all" ? "All Brands" : brand}
              </option>
            ))}
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
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-white/40">Loading...</div>
        ) : displayedRecords.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            No sales records found.
          </div>
        ) : (
          displayedRecords.map((sale) => (
            <div
              key={sale.id}
              className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden"
            >
              <div
                onClick={() =>
                  setExpandedId(expandedId === sale.id ? null : sale.id)
                }
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Battery className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <div className="text-white/90 font-medium">
                      {sale.customer_name}{" "}
                      <span className="text-white/40 font-normal text-xs">
                        ({sale.phone})
                      </span>
                    </div>
                    <div className="text-white/40 text-xs">
                      {sale.battery_brand} {sale.battery_model} •{" "}
                      {sale.vehicle_number || "No Vehicle"}
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedId === sale.id ? 180 : 0 }}
                >
                  <ChevronDown className="w-5 h-5 text-white/30" />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedId === sale.id && (
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
                            Vehicle Type
                          </span>
                          <span className="text-white/90">
                            {sale.vehicle_type || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Serial Number
                          </span>
                          <span className="text-white/90">
                            {sale.serial_number || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Price
                          </span>
                          <span className="text-white/90">
                            ₹{sale.price || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Warranty
                          </span>
                          <span className="text-white/90">
                            {sale.warranty_months
                              ? `${sale.warranty_months} Months`
                              : "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Sale Date
                          </span>
                          <span className="text-white/90">
                            {sale.sale_date
                              ? new Date(sale.sale_date).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase text-xs block mb-1">
                            Warranty Until
                          </span>
                          <span className="text-white/90">
                            {calculateExpiry(
                              sale.sale_date,
                              sale.warranty_months,
                            )}
                          </span>
                        </div>
                      </div>

                      {sale.image_urls?.length > 0 && (
                        <div className="mb-4">
                          <span className="text-white/40 uppercase text-xs block mb-2">
                            Attached Photos
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {sale.image_urls.map((url, idx) => (
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

                      {deleteConfirmId === sale.id ? (
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
                                  ? handleDelete(sale.id)
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
                            onClick={() => openEditForm(sale)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white py-2 rounded-lg text-sm hover:bg-white/20 transition-colors"
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteConfirmId(sale.id)}
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
                  {editingItem ? "Edit Sale" : "Record New Sale"}
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
                      Vehicle Number
                    </label>
                    <input
                      name="vehicle_number"
                      value={form.vehicle_number || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      placeholder="KA01AB1234"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Vehicle Type
                    </label>
                    <input
                      list="vehicle-types"
                      name="vehicle_type"
                      value={form.vehicle_type || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      placeholder="Select or type"
                    />
                    <datalist id="vehicle-types">
                      <option value="Car" />
                      <option value="Bike" />
                      <option value="Truck" />
                      <option value="Auto-rickshaw" />
                      <option value="Bus" />
                      <option value="Inverter" />
                    </datalist>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                    Select from Inventory (Optional)
                  </label>
                  <select
                    onChange={(e) =>
                      e.target.value
                        ? handleInventorySelect(e.target.value)
                        : null
                    }
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                  >
                    <option value="">Manual Entry / None</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.brand} - {item.model} (₹{item.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Battery Brand
                    </label>
                    <input
                      required
                      name="battery_brand"
                      value={form.battery_brand || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      placeholder="Exide"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Model
                    </label>
                    <input
                      required
                      name="battery_model"
                      value={form.battery_model || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      placeholder="DIN55"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Serial Number
                    </label>
                    <input
                      name="serial_number"
                      value={form.serial_number || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      placeholder="SN12345"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price || ""}
                      onChange={handleChange}
                      readOnly={!isAdmin}
                      className={`w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none ${!isAdmin ? "cursor-not-allowed opacity-50" : ""}`}
                      placeholder="6500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Warranty (Months)
                    </label>
                    <input
                      type="number"
                      name="warranty_months"
                      value={form.warranty_months || ""}
                      onChange={handleChange}
                      readOnly={!isAdmin}
                      className={`w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none ${!isAdmin ? "cursor-not-allowed opacity-50" : ""}`}
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
                      Sale Date
                    </label>
                    <input
                      type="date"
                      name="sale_date"
                      value={form.sale_date || ""}
                      onChange={handleChange}
                      readOnly={!isAdmin}
                      className={`w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none ${!isAdmin ? "cursor-not-allowed opacity-50" : ""}`}
                    />
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
                  {editingItem ? "Update Sale" : "Save Sale"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
