import ProductCardSkeleton from "@/components/public/ProductCardSkeleton";

export default function TiendaLoading() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-beige-sand py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 bg-beige-warm/50 animate-pulse w-48 mb-2" />
          <div className="h-4 bg-beige-warm/30 animate-pulse w-24" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
