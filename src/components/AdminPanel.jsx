import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, X, Save, ChevronDown, Mail } from "lucide-react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    shop_name: "",
    shop_address: "",
    shop_phone: "",
    shop_gstin: "",
    shop_state: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("email", { ascending: true });
    if (data) setUsers(data);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("shop_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (data) setSettings(data);
  };

  const toggleApproval = async (userId, currentStatus) => {
    await supabase
      .from("profiles")
      .update({ approved: !currentStatus })
      .eq("id", userId);
    fetchUsers();
  };

  const handleSettingsChange = (e) =>
    setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleSettingsSave = async () => {
    setSavingSettings(true);
    const { error } = await supabase
      .from("shop_settings")
      .update({
        shop_name: settings.shop_name,
        shop_address: settings.shop_address,
        shop_phone: settings.shop_phone,
        shop_gstin: settings.shop_gstin,
        shop_state: settings.shop_state,
      })
      .eq("id", 1);

    if (error) alert("Error saving settings: " + error.message);
    else alert("Shop settings saved successfully!");
    setSavingSettings(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            Admin Panel
          </h2>
          <p className="text-white/40 text-sm">
            Manage shop settings and worker access.
          </p>
        </div>
      </div>

      {/* Shop Settings Section */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Save className="w-5 h-5 text-white/70" /> Shop Details (For Invoices)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
              Shop Name
            </label>
            <input
              name="shop_name"
              value={settings.shop_name || ""}
              onChange={handleSettingsChange}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
              Shop Address
            </label>
            <input
              name="shop_address"
              value={settings.shop_address || ""}
              onChange={handleSettingsChange}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
              Shop Phone
            </label>
            <input
              name="shop_phone"
              value={settings.shop_phone || ""}
              onChange={handleSettingsChange}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
              Shop GSTIN
            </label>
            <input
              name="shop_gstin"
              value={settings.shop_gstin || ""}
              onChange={handleSettingsChange}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
              Shop State
            </label>
            <input
              name="shop_state"
              value={settings.shop_state || ""}
              onChange={handleSettingsChange}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSettingsSave}
          disabled={savingSettings}
          className="mt-4 bg-white text-black font-medium py-2 px-4 rounded-xl text-sm hover:bg-white/90 transition-colors"
        >
          {savingSettings ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Users Accordion List */}
      <div className="bg-blue-500/5 border border-blue-500/10 text-blue-400/80 text-xs p-3 rounded-xl mb-4">
        Note: Suspended workers remain in the list. They can still log in, but
        cannot see any shop data. Click "Approve" to restore their access at any
        time.
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-white/40">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-white/40">No users found.</div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden"
            >
              <div
                onClick={() =>
                  setExpandedId(expandedId === user.id ? null : user.id)
                }
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Mail className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white/90 font-medium text-sm truncate">
                      {user.email}
                    </div>
                    <div className="text-white/40 text-xs capitalize">
                      {user.role}
                    </div>
                  </div>
                  {user.role !== "admin" && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-lg ${user.approved ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {user.approved ? "Active" : "Suspended"}
                    </span>
                  )}
                </div>
                {user.role !== "admin" && (
                  <motion.div
                    animate={{ rotate: expandedId === user.id ? 180 : 0 }}
                    className="ml-4"
                  >
                    <ChevronDown className="w-5 h-5 text-white/30" />
                  </motion.div>
                )}
              </div>

              <AnimatePresence>
                {expandedId === user.id && user.role !== "admin" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-white/5 bg-black/20 flex justify-end gap-2">
                      <button
                        onClick={() => toggleApproval(user.id, user.approved)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${user.approved ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-green-500/10 text-green-400 hover:bg-green-500/20"}`}
                      >
                        {user.approved ? (
                          <>
                            <X className="w-4 h-4" /> Suspend Access
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Approve Access
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
