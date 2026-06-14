export default function ProductCardSkeleton() {
  return (
    <div className="block">
      <div className="aspect-square bg-beige-sand/40 animate-pulse" />
      <div className="pt-3 space-y-2">
        <div className="h-3 bg-beige-sand animate-pulse w-16" />
        <div className="h-4 bg-beige-sand/70 animate-pulse w-3/4" />
        <div className="h-4 bg-beige-sand/50 animate-pulse w-1/2" />
      </div>
    </div>
  );
}
