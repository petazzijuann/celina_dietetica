"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatARS } from "@/lib/utils";

export default function StickyCartBar() {
  const { items, totalPrice } = useCartStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(items.length > 0);
  }, [items]);

  const total = totalPrice();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 bg-olive-dark text-cream px-4 py-4 flex items-center justify-between shadow-lg transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div>
        <p className="label-tag text-[10px] text-beige-sand">
          {count} {count === 1 ? "producto" : "productos"}
        </p>
        <p className="price-text text-lg">{formatARS(total)}</p>
      </div>
      <Link
        href="/carrito"
        className="bg-cream text-olive-dark px-6 py-3 label-tag text-[11px] hover:bg-beige-sand transition-colors"
      >
        VER CARRITO
      </Link>
    </div>
  );
}
