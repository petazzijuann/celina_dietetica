"use client";

import { useState } from "react";
import useSWR from "swr";
import { Download, Plus, X } from "lucide-react";
import type { SaleRecord } from "@/types";
import { formatARS } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SalesTable() {
  const { data, isLoading, mutate } = useSWR<SaleRecord[]>("/api/admin/sales", fetcher);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState("");
  const [toast,     setToast]     = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [form, setForm] = useState({
    product_name: "", size: "", color: "", quantity: "1",
    sale_price: "", cost_price: "", channel: "offline", payment_method: "efectivo", customer_note: "",
  });

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function setField(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setFormError("");
    if (!form.product_name.trim()) { setFormError("El nombre es requerido"); return; }
    if (!form.sale_price || parseFloat(form.sale_price) <= 0) { setFormError("El precio de venta es requerido"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_name: form.product_name.trim(),
        size: form.size || "Único",
        color: form.color || null,
        quantity: parseInt(form.quantity) || 1,
        sale_price: parseFloat(form.sale_price),
        cost_price: parseFloat(form.cost_price) || 0,
        channel: form.channel,
        payment_method: form.payment_method,
        customer_note: form.customer_note || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setFormError(d.error ?? "Error al guardar");
      return;
    }
    setSheetOpen(false);
    showToast("Venta registrada", "ok");
    await mutate();
  }

  function downloadCSV() {
    if (!data) return;
    const rows = [["Fecha", "Producto", "Peso", "Sabor", "Cantidad", "Precio Venta", "Precio Costo", "Canal", "Pago"]];
    data.forEach((s) => rows.push([
      new Date(s.created_at).toLocaleDateString("es-AR"),
      s.product_name, s.size, s.color ?? "", String(s.quantity),
      String(s.sale_price), String(s.cost_price), s.channel, s.payment_method,
    ]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `celina-ventas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const inputClass = "w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-olive-dark bg-background";
  const labelClass = "label-tag text-[10px] block mb-1.5 text-muted-foreground";

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="label-tag text-muted-foreground text-[10px] mb-1">GESTIÓN</p>
          <h1 className="font-playfair text-5xl">Ventas</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCSV} disabled={!data?.length} className="label-tag text-[11px] px-4 py-3 border border-border hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-40">
            <Download size={13} /> CSV
          </button>
          <button onClick={() => setSheetOpen(true)} className="label-tag text-[11px] px-5 py-3 bg-olive-dark text-cream hover:bg-olive-mid transition-colors flex items-center gap-2">
            <Plus size={13} /> VENTA MANUAL
          </button>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 text-sm font-medium shadow-lg ${toast.type === "ok" ? "bg-celina-success text-white" : "bg-celina-error text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="border-b border-border">
            <tr>
              {["FECHA", "PRODUCTO", "PESO", "SABOR", "CANT.", "VENTA", "COSTO", "CANAL", "PAGO"].map((h) => (
                <th key={h} className="label-tag text-[10px] text-muted-foreground text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(9)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse w-16" /></td>)}
                  </tr>
                ))
              : !data?.length
              ? <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground text-sm">Sin ventas registradas.</td></tr>
              : data.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(s.created_at).toLocaleDateString("es-AR")}</td>
                    <td className="px-4 py-3 font-medium max-w-[160px] truncate">{s.product_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.size}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.color ?? "—"}</td>
                    <td className="px-4 py-3 text-center">{s.quantity}</td>
                    <td className="px-4 py-3 text-olive-dark font-medium">{formatARS(s.sale_price)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatARS(s.cost_price)}</td>
                    <td className="px-4 py-3"><span className="label-tag text-[10px]">{s.channel}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{s.payment_method}</td>
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
              <h2 className="font-playfair text-2xl">Venta Manual</h2>
              <button onClick={() => setSheetOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="flex-1 px-6 py-6 flex flex-col gap-4">
              <div><label className={labelClass}>PRODUCTO *</label><input type="text" value={form.product_name} onChange={(e) => setField("product_name", e.target.value)} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>PESO/VOLUMEN</label><input type="text" value={form.size} onChange={(e) => setField("size", e.target.value)} className={inputClass} placeholder="500g" /></div>
                <div><label className={labelClass}>SABOR</label><input type="text" value={form.color} onChange={(e) => setField("color", e.target.value)} className={inputClass} placeholder="Vainilla" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>PRECIO VENTA *</label><input type="number" min={0.01} step="0.01" value={form.sale_price} onChange={(e) => setField("sale_price", e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>PRECIO COSTO</label><input type="number" min={0} step="0.01" value={form.cost_price} onChange={(e) => setField("cost_price", e.target.value)} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>CANTIDAD</label><input type="number" min={1} value={form.quantity} onChange={(e) => setField("quantity", e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>PAGO</label>
                  <select value={form.payment_method} onChange={(e) => setField("payment_method", e.target.value)} className={inputClass}>
                    <option value="efectivo">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
              {formError && <p className="label-tag text-celina-error text-xs">{formError}</p>}
            </div>
            <div className="px-6 py-5 border-t border-border">
              <button onClick={handleSave} disabled={saving} className="w-full bg-olive-dark text-cream py-3 label-tag text-[11px] hover:bg-olive-mid transition-colors disabled:opacity-50">
                {saving ? "GUARDANDO..." : "REGISTRAR VENTA"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
