import Link from "next/link";

const CATEGORIES = [
  { value: "semillas",          label: "Semillas",          emoji: "🌱" },
  { value: "cereales",          label: "Cereales",          emoji: "🌾" },
  { value: "granola",           label: "Granola",           emoji: "🥣" },
  { value: "especias",          label: "Especias",          emoji: "🌿" },
  { value: "frutas-desecadas",  label: "Frutas Desecadas",  emoji: "🍇" },
  { value: "snacks-salados",    label: "Snacks Salados",    emoji: "🥜" },
  { value: "mermeladas",        label: "Mermeladas",        emoji: "🍓" },
  { value: "aceites",           label: "Aceites",           emoji: "🫙" },
  { value: "jugos",             label: "Jugos",             emoji: "🍋" },
  { value: "alfajores",         label: "Alfajores",         emoji: "🍫" },
  { value: "galletitas",        label: "Galletitas",        emoji: "🍪" },
  { value: "mix",               label: "Mix",               emoji: "✨" },
];

export default function CategoriesSection() {
  return (
    <section className="bg-cream py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="label-tag text-[10px] text-muted-foreground mb-3 tracking-widest">EXPLORÁ</p>
          <h2 className="font-playfair text-3xl text-foreground">Nuestras categorías</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/tienda?categoria=${cat.value}`}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-beige-sand hover:border-olive-mid hover:bg-beige-sand/30 transition-colors group text-center"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="label-tag text-[9px] text-muted-foreground group-hover:text-olive-dark transition-colors">
                {cat.label.toUpperCase()}
              </span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/tienda"
            className="inline-block border border-olive-dark text-olive-dark px-8 py-3 label-tag text-[11px] hover:bg-olive-dark hover:text-cream transition-colors"
          >
            VER TODOS LOS PRODUCTOS
          </Link>
        </div>
      </div>
    </section>
  );
}
