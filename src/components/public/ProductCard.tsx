import Link from "next/link";
import Image from "next/image";
import { formatARS } from "@/lib/utils";
import type { ProductPublic, ColorVariant, StockMap } from "@/types";

interface Props {
  product: ProductPublic;
}

function getTotalStock(product: ProductPublic): number {
  const variants = product.color_variants as ColorVariant[];
  if (variants.length > 0) {
    return variants.reduce(
      (sum, v) => sum + Object.values(v.stock).reduce((a, q) => a + q, 0),
      0
    );
  }
  return Object.values(product.stock as StockMap).reduce((a, q) => a + q, 0);
}

export default function ProductCard({ product }: Props) {
  const inStock = getTotalStock(product) > 0;

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="relative aspect-square bg-beige-sand/40 overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground text-xs">Sin imagen</span>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-cream/60 flex items-center justify-center">
            <span className="label-tag text-[10px] bg-beige-sand px-3 py-1">SIN STOCK</span>
          </div>
        )}
      </div>
      <div className="pt-3 pb-1">
        <p className="label-tag text-[9px] text-muted-foreground mb-1">{product.category.toUpperCase()}</p>
        <p className="text-sm font-medium leading-tight group-hover:text-olive-dark transition-colors line-clamp-2">
          {product.name}
        </p>
        <p className="price-text text-sm mt-2 text-olive-dark">{formatARS(product.price_sale)}</p>
      </div>
    </Link>
  );
}
