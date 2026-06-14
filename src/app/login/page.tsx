"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (authError) {
      setError("Credenciales inválidas. Verificá tu email y contraseña.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-olive-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-playfair text-3xl text-cream mb-1">Dietética Celina</p>
          <p className="label-tag text-beige-sand text-[10px] tracking-widest">PANEL DE ADMINISTRACIÓN</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-background p-8 space-y-5">
          <div>
            <label className="label-tag text-[10px] block mb-1.5 text-muted-foreground">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-beige-sand bg-white px-4 py-3 text-sm focus:outline-none focus:border-olive-dark transition-colors"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label-tag text-[10px] block mb-1.5 text-muted-foreground">CONTRASEÑA</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-beige-sand bg-white px-4 py-3 text-sm focus:outline-none focus:border-olive-dark transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-celina-error text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-olive-dark text-cream py-3 label-tag text-[11px] hover:bg-olive-mid transition-colors disabled:opacity-50"
          >
            {loading ? "INGRESANDO..." : "INGRESAR"}
          </button>
        </form>
      </div>
    </div>
  );
}
