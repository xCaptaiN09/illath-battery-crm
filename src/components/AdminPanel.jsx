import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import { Save, Mail } from "lucide-react";

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

  const statusColors = {
    Active: "bg-green-500/10 text-green-400 border-green-500/20",
    Suspended: "bg-red-500/10 text-red-400 border-red-500/20",
    "Always Active": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
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

      {/* Users List with Dropdown Action */}
      <div className="bg-blue-500/5 border border-blue-500/10 text-blue-400/80 text-xs p-3 rounded-xl mb-4">
        Note: Suspended workers remain in the list. They can still log in, but
        cannot see any shop data.
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-white/40">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-white/40">No users found.</div>
        ) : (
          users.map((user) => {
            const currentStatus =
              user.role === "admin"
                ? "Always Active"
                : user.approved
                  ? "Active"
                  : "Suspended";

            return (
              <div
                key={user.id}
                className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                    <Mail className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-white/90 font-medium text-sm truncate">
                      {user.email}
                    </div>
                    <div className="text-white/40 text-xs capitalize">
                      {user.role}
                    </div>
                  </div>
                </div>

                {user.role === "admin" ? (
                  <span
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border whitespace-nowrap ${statusColors[currentStatus]}`}
                  >
                    {currentStatus}
                  </span>
                ) : (
                  <select
                    value={currentStatus}
                    onChange={(e) =>
                      toggleApproval(user.id, e.target.value === "Active")
                    }
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border outline-none cursor-pointer whitespace-nowrap ${statusColors[currentStatus]}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
