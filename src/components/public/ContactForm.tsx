"use client";

import { useState } from "react";

interface FormData {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

const EMPTY: FormData = { nombre: "", email: "", asunto: "", mensaje: "" };

export default function ContactForm() {
  const [form,     setForm]     = useState<FormData>(EMPTY);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  function setField(key: keyof FormData, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setForm(EMPTY);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Error al enviar el mensaje. Intentá nuevamente.");
    }
  }

  const inputClass = "w-full border border-beige-sand bg-white px-4 py-3 text-sm focus:outline-none focus:border-olive-dark transition-colors";
  const labelClass = "label-tag text-[10px] block mb-1.5 text-muted-foreground";

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 bg-celina-success/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-celina-success text-2xl">✓</span>
        </div>
        <h3 className="font-playfair text-xl mb-2">¡Mensaje enviado!</h3>
        <p className="text-muted-foreground text-sm font-dm-sans">
          Te respondemos a la brevedad.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 label-tag text-[10px] text-olive-dark underline underline-offset-2"
        >
          ENVIAR OTRO MENSAJE
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>NOMBRE *</label>
        <input
          required
          value={form.nombre}
          onChange={(e) => setField("nombre", e.target.value)}
          className={inputClass}
          placeholder="Tu nombre"
        />
      </div>
      <div>
        <label className={labelClass}>EMAIL *</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          className={inputClass}
          placeholder="tu@email.com"
        />
      </div>
      <div>
        <label className={labelClass}>ASUNTO</label>
        <input
          value={form.asunto}
          onChange={(e) => setField("asunto", e.target.value)}
          className={inputClass}
          placeholder="¿En qué podemos ayudarte?"
        />
      </div>
      <div>
        <label className={labelClass}>MENSAJE *</label>
        <textarea
          required
          rows={5}
          value={form.mensaje}
          onChange={(e) => setField("mensaje", e.target.value)}
          className={inputClass}
          placeholder="Escribí tu consulta aquí..."
        />
      </div>

      {error && <p className="text-celina-error text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-olive-dark text-cream py-4 label-tag text-[11px] hover:bg-olive-mid transition-colors disabled:opacity-50"
      >
        {loading ? "ENVIANDO..." : "ENVIAR MENSAJE"}
      </button>
    </form>
  );
}
