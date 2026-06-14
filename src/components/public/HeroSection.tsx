export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] bg-olive-bg flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, #FBF3E8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <p className="label-tag text-beige-sand mb-6 tracking-[0.4em]">
          Dietética Celina · Rosario
        </p>
        <h1 className="font-playfair text-[clamp(40px,8vw,80px)] text-cream leading-tight font-normal">
          Alimentos que nutren
          <br />
          tu bienestar
        </h1>
        <p className="mt-6 text-cream/75 text-lg max-w-md mx-auto font-dm-sans">
          Semillas, cereales, especias y productos naturales para una vida más plena.
        </p>
        <div className="mt-10">
          <a
            href="/tienda"
            className="inline-block bg-cream text-olive-dark px-10 py-4 font-medium tracking-widest text-sm hover:bg-beige-sand transition-colors duration-200"
          >
            VER PRODUCTOS
          </a>
        </div>
      </div>
    </section>
  );
}
