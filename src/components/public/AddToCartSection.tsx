"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import type { ProductPublic, ColorVariant, StockMap } from "@/types";

const WEIGHT_ORDER = ["250g", "500g", "1kg", "250ml", "500ml", "1L"];

interface Props {
  product: ProductPublic;
}

export default function AddToCartSection({ product }: Props) {
  const { addItem } = useCartStore();

  const variants      = product.color_variants as ColorVariant[];
  const hasVariants   = variants.length > 0;

  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    hasVariants ? variants[0].name : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty]                   = useState(1);
  const [added, setAdded]               = useState(false);
  const [sizeError, setSizeError]       = useState(false);

  // Determine available sizes
  const currentStock: StockMap = hasVariants
    ? (variants.find((v) => v.name === selectedVariant)?.stock ?? {})
    : (product.stock as StockMap);

  const availableSizes = WEIGHT_ORDER.filter(
    (s) => s in currentStock
  );

  function handleSizeSelect(size: string) {
    setSelectedSize(size);
    setSizeError(false);
  }

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    const stockQty = currentStock[selectedSize] ?? 0;
    if (stockQty === 0) return;

    addItem({
      product_id: product.id,
      slug:       product.slug,
      name:       product.name,
      image:      product.images[0] ?? "",
      size:       selectedSize,
      color:      selectedVariant,
      price:      product.price_sale,
      quantity:   qty,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const selectedStockQty = selectedSize ? (currentStock[selectedSize] ?? 0) : null;

  return (
    <div className="space-y-6">
      {/* Flavor/variant selector */}
      {hasVariants && (
        <div>
          <p className="label-tag text-[10px] mb-3 text-muted-foreground">
            SABOR — <span className="text-foreground">{selectedVariant}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.name}
                onClick={() => {
                  setSelectedVariant(v.name);
                  setSelectedSize(null);
                }}
                className={`px-4 py-2 border label-tag text-[10px] transition-colors ${
                  selectedVariant === v.name
                    ? "bg-olive-dark text-cream border-olive-dark"
                    : "border-beige-sand hover:border-olive-mid"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weight/size selector */}
      <div>
        <p className={`label-tag text-[10px] mb-3 ${sizeError ? "text-celina-error" : "text-muted-foreground"}`}>
          {sizeError ? "ELEGÍ UN PESO" : "PESO / VOLUMEN"}
          {selectedSize && <span className="text-foreground"> — {selectedSize}</span>}
        </p>
        {availableSizes.length === 0 ? (
          <p className="text-sm text-muted-foreground font-dm-sans">Sin stock disponible</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const qty = currentStock[size] ?? 0;
              const outOfStock = qty === 0;
              return (
                <button
                  key={size}
                  onClick={() => !outOfStock && handleSizeSelect(size)}
                  disabled={outOfStock}
                  className={`px-4 py-2 border label-tag text-[10px] transition-colors ${
                    outOfStock
                      ? "border-beige-sand text-muted-foreground/40 cursor-not-allowed line-through"
                      : selectedSize === size
                      ? "bg-olive-dark text-cream border-olive-dark"
                      : "border-beige-sand hover:border-olive-mid"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
        {selectedStockQty !== null && selectedStockQty > 0 && selectedStockQty <= 5 && (
          <p className="label-tag text-[10px] text-almond mt-2">
            ¡Solo quedan {selectedStockQty}!
          </p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <p className="label-tag text-[10px] mb-3 text-muted-foreground">CANTIDAD</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 border border-beige-sand flex items-center justify-center hover:bg-beige-sand transition-colors"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-10 h-10 border border-beige-sand flex items-center justify-center hover:bg-beige-sand transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        className={`w-full py-4 label-tag text-[11px] transition-all ${
          added
            ? "bg-celina-success text-white"
            : "bg-olive-dark text-cream hover:bg-olive-mid"
        }`}
      >
        {added ? "¡AGREGADO AL CARRITO!" : "AGREGAR AL CARRITO"}
      </button>
    </div>
  );
}
