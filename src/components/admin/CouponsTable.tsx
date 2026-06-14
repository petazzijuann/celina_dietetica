"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, X, Pencil, Trash2, Copy } from "lucide-react";
import type { CouponPublic } from "@/types";
import { formatARS } from "@/lib/utils";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface FormState {
  code: string;
  type: string;
  value: string;
  stock: string;
  min_purchase: string;
  expires_at: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  code: "", type: "percent", value: "", stock: "1",
  min_purchase: "", expires_at: "", is_active: true,
};

export default function CouponsTable() {
  const { data, isLoading, mutate } = useSWR<CouponPublic[]>("/api/admin/coupons", fetcher);
  const [sheetOpen,  setSheetOpen]  = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [form,       setForm]       = useState<FormState>(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState("");
  const [deleteC,    setDeleteC]    = useState<CouponPublic | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openNew() {
    setEditId(null); setForm(EMPTY); setFormError(""); setSheetOpen(true);
  }

  function openEdit(c: CouponPublic) {
    setEditId(c.id);
    setForm({
      code: c.code, type: c.type, value: c.value ? String(c.value) : "",
      stock: String(c.stock), min_purchase: c.min_purchase ? String(c.min_purchase) : "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "", is_active: c.is_active,
    });
    setFormError(""); setSheetOpen(true);
  }

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setFormError("");
    if (!form.code.trim()) { setFormError("El código es requerido"); return; }
    if (form.type !== "free_shipping" && (!form.value || parseFloat(form.value) <= 0)) {
      setFormError("El valor es requerido"); return;
    }
    setSaving(true);
    const body = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: form.type === "free_shipping" ? null : parseFloat(form.value),
      stock: parseInt(form.stock) || 1,
      min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    };
    const url = editId ? `/api/admin/coupons/${editId}` : "/api/admin/coupons";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setFormError(d.error ?? "Error al guardar");
      return;
    }
    setSheetOpen(false);
    showToast(editId ? "Cupón actualizado" : "Cupón creado", "ok");
    await mutate();
  }

  async function handleDelete() {
    if (!deleteC) return;
    setDeleting(true);
    await fetch(`/api/admin/coupons/${deleteC.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteOpen(false);
    setDeleteC(null);
    showToast("Cupón eliminado", "ok");
    await mutate();
  }

  const inputClass = "w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-olive-dark bg-background";
  const labelClass = "label-tag text-[10px] block mb-1.5 text-muted-foreground";

  function typeLabel(type: string) {
    return type === "percent" ? "%" : type === "fixed" ? "ARS" : "Envío gratis";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label-tag text-muted-foreground text-[10px] mb-1">GESTIÓN</p>
          <h1 className="font-playfair text-5xl">Cupones</h1>
        </div>
        <button onClick={openNew} className="label-tag text-[11px] px-5 py-3 bg-olive-dark text-cream hover:bg-olive-mid transition-colors flex items-center gap-2 shrink-0">
          <Plus size={13} /> NUEVO CUPÓN
        </button>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 text-sm font-medium shadow-lg ${toast.type === "ok" ? "bg-celina-success text-white" : "bg-celina-error text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="border-b border-border">
            <tr>
              {["CÓDIGO", "TIPO", "VALOR", "STOCK", "USOS", "ESTADO", ""].map((h) => (
                <th key={h} className="label-tag text-[10px] text-muted-foreground text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse w-16" /></td>)}
                  </tr>
                ))
              : !data?.length
              ? <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No hay cupones.</td></tr>
              : data.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{c.code}</span>
                        <button onClick={() => navigator.clipboard.writeText(c.code)} className="text-muted-foreground hover:text-foreground transition-colors"><Copy size={12} /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{typeLabel(c.type)}</td>
                    <td className="px-4 py-3">
                      {c.type === "free_shipping" ? "—" : c.type === "percent" ? `${c.value}%` : c.value ? formatARS(Number(c.value)) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.stock}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.used_count}</td>
                    <td className="px-4 py-3">
                      <span className={`label-tag text-[10px] px-2 py-0.5 ${c.is_active ? "bg-celina-success/10 text-celina-success" : "bg-muted text-muted-foreground"}`}>
                        {c.is_active ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => { setDeleteC(c); setDeleteOpen(true); }} className="text-muted-foreground hover:text-celina-error transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="relative bg-background w-full max-w-md flex flex-col shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="font-playfair text-2xl">{editId ? "Editar Cupón" : "Nuevo Cupón"}</h2>
              <button onClick={() => setSheetOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="flex-1 px-6 py-6 flex flex-col gap-4">
              <div>
                <label className={labelClass}>CÓDIGO *</label>
                <input type="text" value={form.code} onChange={(e) => setField("code", e.target.value.toUpperCase())} className={inputClass} placeholder="DESCUENTO20" disabled={!!editId} />
              </div>
              <div>
                <label className={labelClass}>TIPO *</label>
                <select value={form.type} onChange={(e) => setField("type", e.target.value)} className={inputClass}>
                  <option value="percent">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo (ARS)</option>
                  <option value="free_shipping">Envío gratis</option>
                </select>
              </div>
              {form.type !== "free_shipping" && (
                <div>
                  <label className={labelClass}>VALOR *</label>
                  <input type="number" min={0.01} step="0.01" value={form.value} onChange={(e) => setField("value", e.target.value)} className={inputClass} placeholder={form.type === "percent" ? "20" : "5000"} />
                </div>
              )}
              <div>
                <label className={labelClass}>STOCK (usos disponibles)</label>
                <input type="number" min={1} value={form.stock} onChange={(e) => setField("stock", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>COMPRA MÍNIMA (opcional)</label>
                <input type="number" min={0} value={form.min_purchase} onChange={(e) => setField("min_purchase", e.target.value)} className={inputClass} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>VENCE (opcional)</label>
                <input type="date" value={form.expires_at} onChange={(e) => setField("expires_at", e.target.value)} className={inputClass} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setField("is_active", e.target.checked)} className="accent-olive-dark" />
                <label htmlFor="is_active" className={labelClass + " !mb-0"}>ACTIVO</label>
              </div>
              {formError && <p className="label-tag text-celina-error text-xs">{formError}</p>}
            </div>
            <div className="px-6 py-5 border-t border-border">
              <button onClick={handleSave} disabled={saving} className="w-full bg-olive-dark text-cream py-3 label-tag text-[11px] hover:bg-olive-mid transition-colors disabled:opacity-50">
                {saving ? "GUARDANDO..." : editId ? "GUARDAR CAMBIOS" : "CREAR CUPÓN"}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar este cupón?"
        description={deleteC ? `El cupón "${deleteC.code}" será eliminado.` : ""}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
