"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatARS } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PROVINCES } from "@/data/argentina";

interface FormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  zip: string;
  coupon: string;
}

interface CouponResult {
  code: string;
  type: string;
  value: number | null;
  discount_amount: number;
}

export default function CheckoutPage() {
  const { items, totalPrice, shippingOption, clearCart } = useCartStore();
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "",
    street: "", city: "", province: "Santa Fe", zip: "",
    coupon: "",
  });
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = totalPrice();
  const shipping = shippingOption?.cost ?? 0;
  const discount = couponResult?.discount_amount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  function setField(key: keyof FormData, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleValidateCoupon() {
    if (!form.coupon.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: form.coupon.trim(), subtotal }),
    });
    const data = await res.json();
    setValidatingCoupon(false);
    if (!res.ok) {
      setCouponError(data.error ?? "Cupón inválido");
      setCouponResult(null);
    } else {
      setCouponResult(data);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingOption) { setError("Seleccioná un método de envío"); return; }
    if (items.length === 0) { setError("Tu carrito está vacío"); return; }

    setSubmitting(true);
    setError("");

    const body = {
      customer_name:    form.name,
      customer_email:   form.email,
      customer_phone:   form.phone,
      customer_address: { street: form.street, city: form.city, province: form.province, zip: form.zip },
      items: items.map((i) => ({
        product_id: i.product_id,
        slug:       i.slug,
        name:       i.name,
        size:       i.size,
        color:      i.color ?? null,
        qty:        i.quantity,
        price:      i.price,
      })),
      shipping_method: shippingOption.type,
      shipping_cost:   shippingOption.cost,
      shipping_days_label: shippingOption.days_label,
      payment_method: "transfer",
      coupon_code:     couponResult?.code ?? null,
      discount_amount: discount,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Error al procesar el pedido");
      return;
    }

    clearCart();
    router.push(`/pedido/${data.order_id}`);
  }

  if (items.length === 0) {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="label-tag text-muted-foreground mb-4">TU CARRITO ESTÁ VACÍO</p>
        <a href="/tienda" className="inline-block bg-olive-dark text-cream px-10 py-4 label-tag text-[11px] hover:bg-olive-mid transition-colors">
          IR A LA TIENDA
        </a>
      </div>
    );
  }

  const inputClass = "w-full border border-beige-sand bg-white px-4 py-3 text-sm focus:outline-none focus:border-olive-dark transition-colors";
  const labelClass = "label-tag text-[10px] block mb-1.5 text-muted-foreground";

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-beige-sand py-10 px-4 border-b border-beige-warm">
        <div className="max-w-5xl mx-auto">
          <p className="label-tag text-muted-foreground text-[10px] mb-1">PASO FINAL</p>
          <h1 className="font-playfair text-4xl">Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-10">
          {/* Form fields */}
          <div className="md:col-span-2 space-y-8">
            {/* Personal data */}
            <div>
              <p className="label-tag text-[10px] mb-4 text-muted-foreground">DATOS PERSONALES</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>NOMBRE COMPLETO *</label>
                  <input required value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>EMAIL *</label>
                    <input required type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>TELÉFONO *</label>
                    <input required value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="label-tag text-[10px] mb-4 text-muted-foreground">DIRECCIÓN</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>CALLE Y NÚMERO *</label>
                  <input required value={form.street} onChange={(e) => setField("street", e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>CIUDAD *</label>
                    <input required value={form.city} onChange={(e) => setField("city", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>PROVINCIA *</label>
                    <select required value={form.province} onChange={(e) => setField("province", e.target.value)} className={inputClass}>
                      {PROVINCES.map((p) => (
                        <option key={p.code} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="max-w-[200px]">
                  <label className={labelClass}>CÓDIGO POSTAL *</label>
                  <input required value={form.zip} onChange={(e) => setField("zip", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div>
              <p className="label-tag text-[10px] mb-4 text-muted-foreground">CUPÓN DE DESCUENTO</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={form.coupon}
                  onChange={(e) => setField("coupon", e.target.value.toUpperCase())}
                  placeholder="CÓDIGO"
                  className={inputClass}
                  disabled={!!couponResult}
                />
                {!couponResult ? (
                  <button
                    type="button"
                    onClick={handleValidateCoupon}
                    disabled={validatingCoupon || !form.coupon.trim()}
                    className="shrink-0 bg-olive-dark text-cream px-5 label-tag text-[11px] hover:bg-olive-mid transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? "..." : "APLICAR"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setCouponResult(null); setField("coupon", ""); }}
                    className="shrink-0 bg-beige-sand text-foreground px-5 label-tag text-[11px] hover:bg-beige-warm transition-colors"
                  >
                    QUITAR
                  </button>
                )}
              </div>
              {couponError && <p className="text-celina-error text-xs mt-2">{couponError}</p>}
              {couponResult && (
                <p className="text-celina-success text-xs mt-2">
                  Cupón aplicado: −{formatARS(couponResult.discount_amount)}
                </p>
              )}
            </div>

            {/* Payment */}
            <div>
              <p className="label-tag text-[10px] mb-4 text-muted-foreground">MÉTODO DE PAGO</p>
              <div className="bg-white border border-beige-sand p-4">
                <div className="flex items-center gap-3">
                  <input type="radio" checked readOnly className="accent-olive-dark" />
                  <div>
                    <p className="font-medium text-sm">Transferencia bancaria</p>
                    <p className="text-xs text-muted-foreground">Recibirás los datos de pago al confirmar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <p className="label-tag text-[10px] text-muted-foreground">TU PEDIDO</p>
            <div className="bg-white border border-beige-sand p-5 space-y-3">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex justify-between text-sm gap-4">
                  <span className="flex-1 truncate">
                    {item.name} <span className="text-muted-foreground">×{item.quantity}</span>
                  </span>
                  <span className="price-text shrink-0">{formatARS(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-beige-sand pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatARS(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-celina-success">
                    <span>Descuento</span>
                    <span>−{formatARS(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>{shipping === 0 ? "Gratis" : formatARS(shipping)}</span>
                </div>
                <div className="flex justify-between font-medium border-t border-beige-sand pt-2">
                  <span>Total</span>
                  <span className="price-text">{formatARS(total)}</span>
                </div>
              </div>
            </div>

            {error && <p className="text-celina-error text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-olive-dark text-cream py-4 label-tag text-[11px] hover:bg-olive-mid transition-colors disabled:opacity-50"
            >
              {submitting ? "PROCESANDO..." : "CONFIRMAR PEDIDO"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
