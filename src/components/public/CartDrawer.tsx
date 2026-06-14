"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatARS } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative bg-cream w-full max-w-sm flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-beige-sand">
          <div>
            <p className="font-playfair text-lg">Tu Carrito</p>
            <p className="label-tag text-[10px] text-muted-foreground">
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </p>
          </div>
          <button onClick={closeCart} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto scrollbar-none py-4 px-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <p className="text-muted-foreground font-dm-sans mb-4">Tu carrito está vacío</p>
              <button
                onClick={closeCart}
                className="label-tag text-[11px] text-olive-dark underline underline-offset-2"
              >
                VER TIENDA
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product_id}-${item.size}-${item.color}`}
                className="flex gap-3 bg-white p-3 border border-beige-sand"
              >
                <div className="relative w-16 h-20 shrink-0 bg-beige-sand/30">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">{item.name}</p>
                  <p className="label-tag text-[10px] text-muted-foreground mt-0.5">
                    {item.size}{item.color ? ` · ${item.color}` : ""}
                  </p>
                  <p className="price-text text-sm mt-1.5">{formatARS(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                      className="w-6 h-6 border border-beige-sand flex items-center justify-center text-xs hover:bg-beige-sand transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                      className="w-6 h-6 border border-beige-sand flex items-center justify-center text-xs hover:bg-beige-sand transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.product_id, item.size, item.color)}
                      className="ml-auto label-tag text-[10px] text-muted-foreground hover:text-celina-error transition-colors"
                    >
                      QUITAR
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-beige-sand px-5 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="label-tag text-[10px] text-muted-foreground">SUBTOTAL</span>
              <span className="price-text text-lg">{formatARS(totalPrice())}</span>
            </div>
            <Link
              href="/carrito"
              onClick={closeCart}
              className="block text-center bg-olive-dark text-cream py-3.5 label-tag text-[11px] hover:bg-olive-mid transition-colors"
            >
              VER CARRITO Y PAGAR
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
