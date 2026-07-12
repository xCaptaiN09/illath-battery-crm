import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Shield, Check, X } from "lucide-react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
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

  const toggleApproval = async (userId, currentStatus) => {
    await supabase
      .from("profiles")
      .update({ approved: !currentStatus })
      .eq("id", userId);
    fetchUsers();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            Admin Panel
          </h2>
          <p className="text-white/40 text-sm">
            Approve new sign-ups or suspend worker access.
          </p>
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 text-blue-400/80 text-xs p-3 rounded-xl mb-4">
        Note: Suspended workers remain in the list. They can still log in, but
        cannot see any shop data. Click "Approve" to restore their access at any
        time.
      </div>

      <div className="border border-white/5 rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[500px] text-left">
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
