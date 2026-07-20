import { useState } from "react";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, UserPlus, LogIn, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("login");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSignupSuccess(false);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        setSignupSuccess(true);
        setMode("login");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black dark:bg-black light:bg-gray-50 p-4 transition-colors">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-black/5 backdrop-blur-md border border-white/10 dark:border-white/10 light:border-black/10"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-zinc-900" />
        )}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md flex flex-col items-center text-center"
      >
        <div className="p-4 bg-indigo-500/10 rounded-3xl mb-6 border border-indigo-500/20">
          <Battery className="w-8 h-8 text-indigo-400 dark:text-indigo-400 light:text-indigo-600" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-2 dark:text-white light:text-zinc-900">
          Illath Battery House
        </h1>
        <p className="text-lg text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-10 font-light">
          {mode === "login"
            ? "Welcome back. Sign in to manage your shop."
            : "Create a worker account to get started."}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
          <div>
            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest font-medium">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-zinc-700 dark:border-zinc-700 light:border-zinc-300 px-1 py-3 text-lg dark:text-white light:text-zinc-900 focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div className="pt-2">
            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest font-medium">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-zinc-700 dark:border-zinc-700 light:border-zinc-300 px-1 py-3 text-lg dark:text-white light:text-zinc-900 focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 mt-4"
              >
                {error}
              </motion.p>
            )}
            {signupSuccess && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20 mt-4"
              >
                Account created! Please ask the Admin to approve you, then sign
                in.
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-full mt-8 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 text-lg shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)]"
          >
            {loading ? (
              "Please wait..."
            ) : mode === "login" ? (
              <>
                <LogIn className="w-5 h-5" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> Sign Up
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8">
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setSignupSuccess(false);
            }}
            className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors font-medium"
          >
            {mode === "login"
              ? "Need an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
