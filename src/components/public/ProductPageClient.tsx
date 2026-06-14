"use client";

import ImageGallery from "./ImageGallery";
import ProductInfoAnimated from "./ProductInfoAnimated";
import AddToCartSection from "./AddToCartSection";
import StickyCartBar from "./StickyCartBar";
import type { ProductPublic } from "@/types";

interface Props {
  product: ProductPublic;
}

export default function ProductPageClient({ product }: Props) {
  return (
    <>
      <div className="bg-cream min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            <ImageGallery images={product.images} name={product.name} />
            <div className="flex flex-col gap-8">
              <ProductInfoAnimated product={product} />
              <AddToCartSection product={product} />
            </div>
          </div>
        </div>
      </div>
      <StickyCartBar />
    </>
  );
}
