"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = "/admin";
      } else {
        setError(data.error || "Authentication failed. Invalid password.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center container-custom py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#DCE4DD] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#EAF4EC] text-[#166534] flex items-center justify-center mx-auto border border-[#DCE4DD]">
            <Lock className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF4EC] text-[#166534]">
            <ShieldAlert className="w-3.5 h-3.5" />
            Restricted Access
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17221B]">
            Admin Authentication
          </h1>
          <p className="text-xs text-[#59645D]">
            Enter your admin passphrase to access catalog operations and site management.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-[#17221B]"
            >
              Admin Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-[#DCE4DD] bg-[#F7F8F5] text-[#17221B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-[#166534] text-white hover:bg-[#11522a] disabled:opacity-50 transition-all active:scale-[0.99] shadow-2xs"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#EAF4EC] text-center text-[11px] text-[#59645D]">
          Protected route. Default passphrase configured in <code className="bg-[#F7F8F5] px-1 py-0.5 rounded font-mono">ADMIN_PASSWORD</code>.
        </div>
      </div>
    </div>
  );
}
