"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload } from "lucide-react";
import type { ProductAdmin, ColorVariant } from "@/types";

const CATEGORIES = [
  "jugos","semillas","cereales","mermeladas","galletitas","barrita-de-cereales",
  "mix","harina","pastelería","alfajores","aceites","frutas-desecadas",
  "granola","snacks-salados","especias",
] as const;

const WEIGHTS = ["250g", "500g", "1kg", "250ml", "500ml", "1L"];

interface Props {
  product: ProductAdmin | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type FormData = {
  name: string;
  description: string;
  category: string;
  price_sale: string;
  price_cost: string;
  tags: string;
  is_published: boolean;
  instagram_posted: boolean;
  weight_kg: string;
  images: string[];
  // Simple stock (no color variants)
  stock: Record<string, string>;
  // Color/flavor variants
  color_variants: ColorVariant[];
  use_variants: boolean;
};

const EMPTY_FORM: FormData = {
  name: "", description: "", category: "semillas",
  price_sale: "", price_cost: "", tags: "",
  is_published: false, instagram_posted: false, weight_kg: "",
  images: [], stock: {}, color_variants: [], use_variants: false,
};

function stockToForm(stock: Record<string, number>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(stock)) out[k] = String(v);
  return out;
}

function stockFromForm(stock: Record<string, string>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(stock)) {
    const n = parseInt(v);
    if (!isNaN(n)) out[k] = n;
  }
  return out;
}

export default function EditProductSheet({ product, open, onClose, onSaved }: Props) {
  const [form,      setForm]      = useState<FormData>(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [uploading, setUploading] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");

  useEffect(() => {
    if (!open) return;
    if (product) {
      const variants = (product.color_variants ?? []) as ColorVariant[];
      setForm({
        name:             product.name,
        description:      product.description,
        category:         product.category,
        price_sale:       String(product.price_sale),
        price_cost:       String(product.price_cost),
        tags:             product.tags.join(", "),
        is_published:     product.is_published,
        instagram_posted: product.instagram_posted,
        weight_kg:        product.weight_kg ? String(product.weight_kg) : "",
        images:           product.images,
        stock:            stockToForm(product.stock as Record<string, number>),
        color_variants:   variants,
        use_variants:     variants.length > 0,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError("");
  }, [product, open]);

  function setField<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async () => {
          const res = await fetch("/api/admin/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: reader.result }),
          });
          if (res.ok) {
            const { url } = await res.json();
            setForm((f) => ({ ...f, images: [...f.images, url] }));
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setUploading(false);
  }

  function addVariant() {
    if (!newVariantName.trim()) return;
    const defaultStock: Record<string, number> = {};
    WEIGHTS.forEach((w) => { defaultStock[w] = 0; });
    const variant: ColorVariant = { name: newVariantName.trim(), images: [], stock: defaultStock };
    setForm((f) => ({ ...f, color_variants: [...f.color_variants, variant] }));
    setNewVariantName("");
  }

  function updateVariantStock(vIdx: number, size: string, qty: string) {
    setForm((f) => {
      const variants = [...f.color_variants];
      variants[vIdx] = { ...variants[vIdx], stock: { ...variants[vIdx].stock, [size]: parseInt(qty) || 0 } };
      return { ...f, color_variants: variants };
    });
  }

  function removeVariant(vIdx: number) {
    setForm((f) => ({ ...f, color_variants: f.color_variants.filter((_, i) => i !== vIdx) }));
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim()) { setError("El nombre es requerido"); return; }
    if (!form.price_sale || parseFloat(form.price_sale) <= 0) { setError("El precio de venta es requerido"); return; }

    setSaving(true);

    const body: Record<string, unknown> = {
      name:             form.name.trim(),
      description:      form.description.trim(),
      category:         form.category,
      price_sale:       parseFloat(form.price_sale),
      price_cost:       parseFloat(form.price_cost) || 0,
      tags:             form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_published:     form.is_published,
      instagram_posted: form.instagram_posted,
      weight_kg:        form.weight_kg ? parseFloat(form.weight_kg) : null,
      images:           form.images,
    };

    if (form.use_variants && form.color_variants.length > 0) {
      body.color_variants = form.color_variants;
      // Main stock = first variant's stock
      body.stock = form.color_variants[0].stock;
    } else {
      body.color_variants = [];
      body.stock = stockFromForm(form.stock);
    }

    const url    = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const method = product ? "PATCH" : "POST";
    const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Error al guardar");
      return;
    }
    onSaved();
    onClose();
  }

  if (!open) return null;

  const inputClass = "w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-olive-dark bg-background transition-colors";
  const labelClass = "label-tag text-[10px] block mb-1.5 text-muted-foreground";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-background w-full max-w-xl flex flex-col shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-playfair text-2xl">{product ? "Editar Producto" : "Nuevo Producto"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-6 flex flex-col gap-6">
          {/* Basic info */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>NOMBRE *</label>
              <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>DESCRIPCIÓN</label>
              <textarea rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>CATEGORÍA *</label>
                <select value={form.category} onChange={(e) => setField("category", e.target.value)} className={inputClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>PESO KG (opcional)</label>
                <input type="number" min={0} step="0.001" value={form.weight_kg} onChange={(e) => setField("weight_kg", e.target.value)} className={inputClass} placeholder="0.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>PRECIO VENTA *</label>
                <input type="number" min={0.01} step="0.01" value={form.price_sale} onChange={(e) => setField("price_sale", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>PRECIO COSTO</label>
                <input type="number" min={0} step="0.01" value={form.price_cost} onChange={(e) => setField("price_cost", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>TAGS (separados por coma)</label>
              <input type="text" value={form.tags} onChange={(e) => setField("tags", e.target.value)} className={inputClass} placeholder="orgánico, sin gluten, natural" />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className={labelClass}>IMÁGENES</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-16 h-16 object-cover border border-border" />
                  <button
                    onClick={() => setField("images", form.images.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-celina-error text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >×</button>
                </div>
              ))}
              <label className={`w-16 h-16 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-olive-mid transition-colors ${uploading ? "opacity-50" : ""}`}>
                <Upload size={14} className="text-muted-foreground" />
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Stock mode toggle */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="use_variants"
                checked={form.use_variants}
                onChange={(e) => setField("use_variants", e.target.checked)}
                className="accent-olive-dark"
              />
              <label htmlFor="use_variants" className={labelClass + " !mb-0"}>TIENE VARIANTES DE SABOR</label>
            </div>

            {form.use_variants ? (
              <div className="space-y-4">
                <p className={labelClass}>STOCK POR SABOR Y PESO/VOLUMEN</p>
                {form.color_variants.map((v, vIdx) => (
                  <div key={vIdx} className="border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">{v.name}</p>
                      <button onClick={() => removeVariant(vIdx)} className="text-muted-foreground hover:text-celina-error transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {WEIGHTS.map((w) => (
                        <div key={w}>
                          <label className="label-tag text-[9px] block mb-1 text-muted-foreground">{w}</label>
                          <input
                            type="number"
                            min={0}
                            value={v.stock[w] ?? 0}
                            onChange={(e) => updateVariantStock(vIdx, w, e.target.value)}
                            className={inputClass + " py-1 text-xs"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    placeholder="Nombre del sabor (ej: Vainilla)"
                    className={inputClass}
                    onKeyDown={(e) => e.key === "Enter" && addVariant()}
                  />
                  <button onClick={addVariant} className="shrink-0 bg-olive-dark text-cream px-4 label-tag text-[10px] hover:bg-olive-mid transition-colors flex items-center gap-1">
                    <Plus size={12} /> AGREGAR
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className={labelClass}>STOCK POR PESO/VOLUMEN</p>
                <div className="grid grid-cols-3 gap-2">
                  {WEIGHTS.map((w) => (
                    <div key={w}>
                      <label className="label-tag text-[9px] block mb-1 text-muted-foreground">{w}</label>
                      <input
                        type="number"
                        min={0}
                        value={form.stock[w] ?? ""}
                        onChange={(e) => setField("stock", { ...form.stock, [w]: e.target.value })}
                        className={inputClass + " py-1 text-xs"}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setField("is_published", e.target.checked)} className="accent-olive-dark" />
              <span className={labelClass + " !mb-0"}>PUBLICADO</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.instagram_posted} onChange={(e) => setField("instagram_posted", e.target.checked)} className="accent-olive-dark" />
              <span className={labelClass + " !mb-0"}>POSTEADO EN IG</span>
            </label>
          </div>

          {error && <p className="label-tag text-celina-error text-xs">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-olive-dark text-cream py-3 label-tag text-[11px] hover:bg-olive-mid transition-colors disabled:opacity-50"
          >
            {saving ? "GUARDANDO..." : product ? "GUARDAR CAMBIOS" : "CREAR PRODUCTO"}
          </button>
        </div>
      </div>
    </div>
  );
}
