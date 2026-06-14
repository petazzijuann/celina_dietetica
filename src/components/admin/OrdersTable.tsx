"use client";

import { useState } from "react";
import useSWR from "swr";
import { Eye, X, CheckCircle, XCircle, Truck } from "lucide-react";
import { formatARS } from "@/lib/utils";
import type { OrderItem, CustomerAddress } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: CustomerAddress;
  items: OrderItem[];
  total_amount: number;
  status: string;
  payment_method: string;
  payment_proof_url: string | null;
  shipping_method: string | null;
  shipping_cost: number | null;
  shipping_days_label: string | null;
  coupon_code: string | null;
  discount_amount: number | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment:    { label: "Pendiente",  color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  payment_confirmed:  { label: "Confirmado", color: "text-celina-success bg-celina-success/10 border-celina-success/20" },
  shipped:            { label: "Enviado",    color: "text-blue-600 bg-blue-50 border-blue-200" },
  delivered:          { label: "Entregado",  color: "text-olive-dark bg-olive-dark/10 border-olive-dark/20" },
  cancelled:          { label: "Cancelado",  color: "text-celina-error bg-celina-error/10 border-celina-error/20" },
};

export default function OrdersTable() {
  const { data: orders, isLoading, mutate } = useSWR<Order[]>("/api/admin/orders", fetcher);
  const [selected,   setSelected]   = useState<Order | null>(null);
  const [updating,   setUpdating]   = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [filter,     setFilter]     = useState("all");

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function updateStatus(orderId: string, status: string) {
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    if (res.ok) {
      showToast("Estado actualizado", "ok");
      await mutate();
      if (selected?.id === orderId) {
        setSelected((prev) => prev ? { ...prev, status } : null);
      }
    } else {
      showToast("Error al actualizar", "err");
    }
  }

  const filtered = orders?.filter((o) => filter === "all" || o.status === filter) ?? [];

  const FILTERS = [
    { value: "all",               label: "TODOS" },
    { value: "pending_payment",   label: "PENDIENTES" },
    { value: "payment_confirmed", label: "CONFIRMADOS" },
    { value: "shipped",           label: "ENVIADOS" },
    { value: "delivered",         label: "ENTREGADOS" },
    { value: "cancelled",         label: "CANCELADOS" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="label-tag text-muted-foreground text-[10px] mb-1">GESTIÓN</p>
        <h1 className="font-playfair text-5xl">Pedidos</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 label-tag text-[10px] px-4 py-2 border transition-colors ${
              filter === f.value
                ? "bg-olive-dark text-cream border-olive-dark"
                : "border-border text-muted-foreground hover:border-olive-mid"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 text-sm font-medium shadow-lg ${
          toast.type === "ok" ? "bg-celina-success text-white" : "bg-celina-error text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="border-b border-border">
            <tr>
              {["PEDIDO", "CLIENTE", "TOTAL", "ENVÍO", "ESTADO", "FECHA", ""].map((h) => (
                <th key={h} className="label-tag text-[10px] text-muted-foreground text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse w-20" /></td>)}
                  </tr>
                ))
              : filtered.length === 0
              ? <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">Sin pedidos.</td></tr>
              : filtered.map((order) => {
                  const st = STATUS_LABELS[order.status] ?? { label: order.status, color: "text-muted-foreground" };
                  return (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-olive-dark">{formatARS(order.total_amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{order.shipping_method ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`label-tag text-[10px] px-2 py-0.5 border ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(order)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-background w-full max-w-lg flex flex-col shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h2 className="font-playfair text-xl">Pedido #{selected.id.slice(0, 8).toUpperCase()}</h2>
                <p className="label-tag text-[10px] text-muted-foreground mt-0.5">
                  {new Date(selected.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-6">
              {/* Status actions */}
              <div>
                <p className="label-tag text-[10px] text-muted-foreground mb-3">ESTADO</p>
                <div className="flex flex-wrap gap-2">
                  {selected.status === "pending_payment" && (
                    <>
                      <button
                        onClick={() => updateStatus(selected.id, "payment_confirmed")}
                        disabled={updating}
                        className="flex items-center gap-2 label-tag text-[10px] px-4 py-2 bg-celina-success text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        <CheckCircle size={13} /> CONFIRMAR PAGO
                      </button>
                      <button
                        onClick={() => updateStatus(selected.id, "cancelled")}
                        disabled={updating}
                        className="flex items-center gap-2 label-tag text-[10px] px-4 py-2 bg-celina-error text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        <XCircle size={13} /> CANCELAR
                      </button>
                    </>
                  )}
                  {selected.status === "payment_confirmed" && (
                    <button
                      onClick={() => updateStatus(selected.id, "shipped")}
                      disabled={updating}
                      className="flex items-center gap-2 label-tag text-[10px] px-4 py-2 bg-olive-dark text-cream hover:bg-olive-mid transition-colors disabled:opacity-50"
                    >
                      <Truck size={13} /> MARCAR ENVIADO
                    </button>
                  )}
                  {selected.status === "shipped" && (
                    <button
                      onClick={() => updateStatus(selected.id, "delivered")}
                      disabled={updating}
                      className="flex items-center gap-2 label-tag text-[10px] px-4 py-2 bg-olive-dark text-cream hover:bg-olive-mid transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={13} /> MARCAR ENTREGADO
                    </button>
                  )}
                  {!["pending_payment", "payment_confirmed", "shipped"].includes(selected.status) && (
                    <span className={`label-tag text-[10px] px-3 py-2 border ${(STATUS_LABELS[selected.status] ?? { color: "" }).color}`}>
                      {(STATUS_LABELS[selected.status] ?? { label: selected.status }).label}
                    </span>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div>
                <p className="label-tag text-[10px] text-muted-foreground mb-3">CLIENTE</p>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{selected.customer_name}</p>
                  <p className="text-muted-foreground">{selected.customer_email}</p>
                  <p className="text-muted-foreground">{selected.customer_phone}</p>
                  <p className="text-muted-foreground">
                    {selected.customer_address.street}, {selected.customer_address.city},{" "}
                    {selected.customer_address.province} {selected.customer_address.zip}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="label-tag text-[10px] text-muted-foreground mb-3">PRODUCTOS</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                      <span>
                        {item.name}
                        <span className="text-muted-foreground"> — {item.size}{item.color ? ` · ${item.color}` : ""} ×{item.qty}</span>
                      </span>
                      <span className="font-medium">{formatARS(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-muted/30 p-4 space-y-2">
                {selected.discount_amount ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Descuento ({selected.coupon_code})</span>
                    <span className="text-celina-success">−{formatARS(selected.discount_amount)}</span>
                  </div>
                ) : null}
                {selected.shipping_cost !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío ({selected.shipping_method})</span>
                    <span>{selected.shipping_cost === 0 ? "Gratis" : formatARS(selected.shipping_cost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-olive-dark">{formatARS(selected.total_amount)}</span>
                </div>
              </div>

              {/* Proof */}
              {selected.payment_proof_url && (
                <div>
                  <p className="label-tag text-[10px] text-muted-foreground mb-2">COMPROBANTE</p>
                  <a href={selected.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-sm text-olive-dark underline">
                    Ver comprobante
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
