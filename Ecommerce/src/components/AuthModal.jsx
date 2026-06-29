import React, { useState } from "react";
import { X, Mail, Lock, User, Briefcase, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin 
      ? { email, password } 
      : { email, password, name, role: "customer", businessName: businessName || `${name}'s Boutique` };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole) => {
    setEmail(demoRole === "customer" ? "buyer@atelier.com" : "seller@atelier.com");
    setPassword("password");
    setIsLogin(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md overflow-hidden bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl"
      >
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-850">
          <div>
            <h3 className="text-xl font-bold font-sans text-zinc-100 tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {isLogin ? "Sign in to access your dashboard & listings" : "Join Atelier as a shopper or reseller"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 mb-5 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input (Only on Sign Up) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3.5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 transition"
                  />
                </div>
              </div>
            )}

            {/* Business Name (Only on Sign Up, optional) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Boutique / Business Name (Optional)</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Atelier Premium Crafts (defaults to name's Boutique)"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 transition"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-12 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-700/60 text-white font-medium rounded-xl text-sm tracking-wide shadow-lg shadow-orange-950/20 active:scale-[0.98] transition-all"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Register Store & Profile"}
            </button>
          </form>

          {/* Toggle login vs register */}
          <div className="mt-6 text-center text-xs text-zinc-400 border-t border-zinc-900 pt-5">
            {isLogin ? "New to Atelier?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="font-medium text-orange-400 hover:text-orange-350 hover:underline transition"
            >
              {isLogin ? "Create an account" : "Sign in instead"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
