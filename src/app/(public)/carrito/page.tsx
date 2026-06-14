"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatARS } from "@/lib/utils";
import type { ShippingOption } from "@/types";
import StickyCartBar from "@/components/public/StickyCartBar";

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    type:       "rosario",
    label:      "Envío en Rosario",
    days_label: "Se coordina con el vendedor",
    cost:       0,
  },
  {
    type:       "pickup",
    label:      "Retiro en local",
    days_label: "Coordinamos por WhatsApp",
    cost:       0,
  },
];

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, totalPrice, setShippingOption, shippingOption } = useCartStore();
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(shippingOption);

  const subtotal = totalPrice();
  const shippingCost = selectedShipping?.cost ?? 0;
  const total = subtotal + shippingCost;

  function handleSelectShipping(opt: ShippingOption) {
    setSelectedShipping(opt);
    setShippingOption(opt);
  }

  if (items.length === 0) {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="label-tag text-muted-foreground mb-4 tracking-widest">TU CARRITO</p>
        <h2 className="font-playfair text-4xl mb-6">Está vacío</h2>
        <p className="text-muted-foreground font-dm-sans mb-10">Explorá nuestra tienda y encontrá lo que necesitás.</p>
        <Link href="/tienda" className="inline-block bg-olive-dark text-cream px-10 py-4 label-tag text-[11px] hover:bg-olive-mid transition-colors">
          IR A LA TIENDA
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen pb-32 md:pb-0">
      <div className="bg-beige-sand py-10 px-4 border-b border-beige-warm">
        <div className="max-w-5xl mx-auto">
          <p className="label-tag text-muted-foreground text-[10px] mb-1">RESUMEN</p>
          <h1 className="font-playfair text-4xl">Tu Carrito</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-10">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.product_id}-${item.size}-${item.color}`} className="bg-white border border-beige-sand flex gap-4 p-4">
              <div className="relative w-20 h-24 shrink-0 bg-beige-sand/30">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="label-tag text-[10px] text-muted-foreground mt-0.5">
                  {item.size}{item.color ? ` · ${item.color}` : ""}
                </p>
                <p className="price-text text-sm mt-2">{formatARS(item.price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                    className="w-7 h-7 border border-beige-sand flex items-center justify-center text-sm hover:bg-beige-sand transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                    className="w-7 h-7 border border-beige-sand flex items-center justify-center text-sm hover:bg-beige-sand transition-colors"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.product_id, item.size, item.color)}
                    className="ml-auto label-tag text-[10px] text-muted-foreground hover:text-celina-error transition-colors"
                  >
                    ELIMINAR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          {/* Shipping */}
          <div className="bg-white border border-beige-sand p-5">
            <p className="label-tag text-[10px] mb-4">ENVÍO</p>
            <div className="space-y-3">
              {SHIPPING_OPTIONS.map((opt) => (
                <label key={opt.type} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="shipping"
                    value={opt.type}
                    checked={selectedShipping?.type === opt.type}
                    onChange={() => handleSelectShipping(opt)}
                    className="mt-0.5 accent-olive-dark"
                  />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.days_label}</p>
                    <p className="label-tag text-[10px] text-olive-dark mt-0.5">
                      {opt.cost === 0 ? "GRATIS" : formatARS(opt.cost)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white border border-beige-sand p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatARS(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span>{shippingCost === 0 ? "Gratis" : formatARS(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-medium border-t border-beige-sand pt-3">
              <span>Total</span>
              <span className="price-text">{formatARS(total)}</span>
            </div>
          </div>

          <Link
            href={selectedShipping ? "/checkout" : "#"}
            onClick={(e) => !selectedShipping && e.preventDefault()}
            className={`block text-center py-4 label-tag text-[11px] transition-colors ${
              selectedShipping
                ? "bg-olive-dark text-cream hover:bg-olive-mid"
                : "bg-beige-sand text-muted-foreground cursor-not-allowed"
            }`}
          >
            {selectedShipping ? "CONTINUAR AL PAGO" : "SELECCIONÁ ENVÍO"}
          </Link>

          <Link href="/tienda" className="block text-center label-tag text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            ← SEGUIR COMPRANDO
          </Link>
        </div>
      </div>

      <StickyCartBar />
    </div>
  );
}
