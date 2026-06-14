export default function AboutSection() {
  return (
    <section className="bg-olive-bg py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <p className="label-tag text-[10px] text-beige-sand tracking-widest mb-6">NUESTRA HISTORIA</p>
        <h2 className="font-playfair text-4xl text-cream mb-6 leading-tight">
          Alimentos para todas las edades
        </h2>
        <p className="text-cream/70 font-dm-sans text-lg leading-relaxed mb-8">
          En Dietética Celina creemos que comer bien es la base de una vida plena. Por eso ofrecemos
          los mejores alimentos naturales de Rosario: semillas, cereales, granola, especias y mucho
          más, para que cada etapa de tu vida esté bien nutrida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/tienda"
            className="inline-block bg-cream text-olive-dark px-10 py-4 label-tag text-[11px] hover:bg-beige-sand transition-colors"
          >
            VER PRODUCTOS
          </a>
          <a
            href="/contacto"
            className="inline-block border border-cream/40 text-cream px-10 py-4 label-tag text-[11px] hover:bg-cream/10 transition-colors"
          >
            CONTACTARNOS
          </a>
        </div>
      </div>
    </section>
  );
}
