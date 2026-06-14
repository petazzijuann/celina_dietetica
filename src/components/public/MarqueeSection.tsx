const ITEMS = [
  "Semillas", "Cereales", "Mermeladas", "Granola", "Especias",
  "Snacks", "Jugos", "Alfajores", "Harinas", "Aceites", "Frutas Desecadas",
];

export default function MarqueeSection() {
  const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <section className="bg-beige-sand border-y border-beige-warm overflow-hidden py-4">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{
          animation: "marquee 30s linear infinite",
        }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="font-playfair text-olive-dark text-lg shrink-0">
            {item} <span className="text-olive-mid mx-2">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
