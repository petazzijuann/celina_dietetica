import Link from "next/link";

const LINKS = [
  { href: "/tienda",   label: "Tienda" },
  { href: "/contacto", label: "Contacto" },
];

const CATEGORIES = [
  { value: "semillas",        label: "Semillas" },
  { value: "cereales",        label: "Cereales" },
  { value: "granola",         label: "Granola" },
  { value: "especias",        label: "Especias" },
  { value: "frutas-desecadas", label: "Frutas desecadas" },
  { value: "snacks-salados",  label: "Snacks salados" },
];

export default function Footer() {
  return (
    <footer className="bg-olive-bg text-cream/80">
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <p className="font-playfair text-2xl text-cream mb-2">Dietética Celina</p>
          <p className="label-tag text-[10px] text-beige-sand mb-4 tracking-widest">
            ROSARIO, ARGENTINA
          </p>
          <p className="text-sm text-cream/60 font-dm-sans leading-relaxed">
            Venta para todas las edades dando los mejores alimentos para una mejor calidad de vida.
          </p>
        </div>

        {/* Categories */}
        <div>
          <p className="label-tag text-[10px] text-beige-sand mb-4">CATEGORÍAS</p>
          <ul className="space-y-2">
            {CATEGORIES.map((cat) => (
              <li key={cat.value}>
                <Link
                  href={`/tienda?categoria=${cat.value}`}
                  className="text-sm text-cream/60 hover:text-cream transition-colors font-dm-sans"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Links & Contact */}
        <div>
          <p className="label-tag text-[10px] text-beige-sand mb-4">NAVEGACIÓN</p>
          <ul className="space-y-2 mb-6">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-cream/60 hover:text-cream transition-colors font-dm-sans"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="label-tag text-[10px] text-beige-sand mb-2">INSTAGRAM</p>
          <p className="text-sm text-cream/40 font-dm-sans">Próximamente</p>
        </div>
      </div>

      <div className="border-t border-olive-mid/40">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-cream/40 font-dm-sans">
            © {new Date().getFullYear()} Dietética Celina. Todos los derechos reservados.
          </p>
          <p className="text-xs text-cream/30 font-dm-sans">
            alimentos que nutren tu bienestar
          </p>
        </div>
      </div>
    </footer>
  );
}
