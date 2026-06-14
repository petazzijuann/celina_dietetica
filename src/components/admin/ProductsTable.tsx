"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Download, Eye, EyeOff } from "lucide-react";
import type { ProductAdmin, ColorVariant, StockMap } from "@/types";
import { formatARS } from "@/lib/utils";
import { downloadCSV } from "@/lib/export/products";
import EditProductSheet from "./EditProductSheet";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function totalStock(p: ProductAdmin): number {
  const variants = (p.color_variants ?? []) as ColorVariant[];
  if (variants.length > 0) {
    return variants.reduce(
      (s, v) => s + Object.values(v.stock).reduce((a, q) => a + q, 0),
      0
    );
  }
  return Object.values(p.stock as StockMap).reduce((a, q) => a + q, 0);
}

export default function ProductsTable() {
  const { data: products, isLoading, mutate } = useSWR<ProductAdmin[]>("/api/admin/products", fetcher);
  const [sheetOpen,   setSheetOpen]   = useState(false);
  const [editing,     setEditing]     = useState<ProductAdmin | null>(null);
  const [deleteP,     setDeleteP]     = useState<ProductAdmin | null>(null);
  const [deleteOpen,  setDeleteOpen]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [toast,       setToast]       = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [filter,      setFilter]      = useState<"all" | "published" | "unpublished">("all");
  const [search,      setSearch]      = useState("");

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openNew() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(p: ProductAdmin) {
    setEditing(p);
    setSheetOpen(true);
  }

  async function handleTogglePublish(p: ProductAdmin) {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !p.is_published }),
    });
    if (res.ok) {
      showToast(p.is_published ? "Producto despublicado" : "Producto publicado", "ok");
      await mutate();
    }
  }

  async function handleDelete() {
    if (!deleteP) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${deleteP.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteOpen(false);
    setDeleteP(null);
    if (res.ok || res.status === 204) {
      showToast("Producto eliminado", "ok");
      await mutate();
    } else {
      showToast("No se pudo eliminar", "err");
    }
  }

  const filtered = (products ?? []).filter((p) => {
    const matchFilter =
      filter === "all" ? true :
      filter === "published" ? p.is_published :
      !p.is_published;
    const matchSearch = search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="label-tag text-muted-foreground text-[10px] mb-1">GESTIÓN</p>
          <h1 className="font-playfair text-5xl">Productos</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => products && downloadCSV(products)}
            disabled={!products?.length}
            className="label-tag text-[11px] px-4 py-3 border border-border hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-40"
          >
            <Download size={13} /> CSV
          </button>
          <button
            onClick={openNew}
            className="label-tag text-[11px] px-5 py-3 bg-olive-dark text-cream hover:bg-olive-mid transition-colors flex items-center gap-2"
          >
            <Plus size={13} /> NUEVO
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center flex-wrap">
        {(["all", "published", "unpublished"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`label-tag text-[10px] px-4 py-2 border transition-colors ${
              filter === f
                ? "bg-olive-dark text-cream border-olive-dark"
                : "border-border text-muted-foreground hover:border-olive-mid"
            }`}
          >
            {f === "all" ? "TODOS" : f === "published" ? "PUBLICADOS" : "BORRADORES"}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-olive-dark bg-background ml-auto"
        />
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
              {["PRODUCTO", "CATEGORÍA", "PRECIO", "STOCK", "MARGEN", "ESTADO", ""].map((h) => (
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
              ? <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">Sin productos.</td></tr>
              : filtered.map((p) => {
                  const stock  = totalStock(p);
                  const margin = p.price_sale > 0
                    ? Math.round(((p.price_sale - p.price_cost) / p.price_sale) * 100)
                    : 0;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images[0] && (
                            <img src={p.images[0]} alt="" className="w-8 h-8 object-cover border border-border shrink-0" />
                          )}
                          <p className="font-medium max-w-[200px] truncate">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="label-tag text-[10px] text-muted-foreground">{p.category}</span>
                      </td>
                      <td className="px-4 py-3 text-olive-dark font-medium">{formatARS(p.price_sale)}</td>
                      <td className="px-4 py-3">
                        <span className={`label-tag text-[10px] px-2 py-0.5 ${
                          stock === 0
                            ? "bg-celina-error/10 text-celina-error"
                            : stock <= 5
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-celina-success/10 text-celina-success"
                        }`}>
                          {stock}u
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`label-tag text-[10px] ${margin >= 30 ? "text-celina-success" : margin >= 15 ? "text-yellow-600" : "text-celina-error"}`}>
                          {margin}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`label-tag text-[10px] px-2 py-0.5 ${
                          p.is_published
                            ? "bg-celina-success/10 text-celina-success"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {p.is_published ? "PUBLICADO" : "BORRADOR"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleTogglePublish(p)} className="text-muted-foreground hover:text-foreground transition-colors" title={p.is_published ? "Despublicar" : "Publicar"}>
                            {p.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => { setDeleteP(p); setDeleteOpen(true); }} className="text-muted-foreground hover:text-celina-error transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      <EditProductSheet
        product={editing}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={async () => { showToast(editing ? "Producto actualizado" : "Producto creado", "ok"); await mutate(); }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar este producto?"
        description={deleteP ? `"${deleteP.name}" será eliminado permanentemente.` : ""}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
