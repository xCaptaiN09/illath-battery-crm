import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Shield, Check, X, Save } from "lucide-react";

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
          <div className="col-span-2">
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
          <div className="col-span-2">
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

      {/* Users Table */}
      <div className="bg-blue-500/5 border border-blue-500/10 text-blue-400/80 text-xs p-3 rounded-xl mb-4">
        Note: Suspended workers remain in the list. They can still log in, but
        cannot see any shop data. Click "Approve" to restore their access at any
        time.
      </div>

      <div className="border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-white/40">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-white/40">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-white/90 font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-white/30" /> {user.email}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-lg ${user.role === "admin" ? "bg-indigo-500/10 text-indigo-400" : "bg-zinc-500/10 text-zinc-400"}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.role === "admin" ? (
                      <span className="text-xs text-white/40">
                        Always Active
                      </span>
                    ) : user.approved ? (
                      <span className="text-xs text-green-400 font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-red-400 font-medium">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => toggleApproval(user.id, user.approved)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                          ${user.approved ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"}`}
                      >
                        {user.approved ? (
                          <span className="flex items-center gap-1">
                            <X className="w-3 h-3" /> Suspend
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" /> Approve
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
