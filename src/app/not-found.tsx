import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-olive-bg flex flex-col items-center justify-center text-center px-4">
      <p className="label-tag text-beige-sand tracking-widest mb-4">ERROR 404</p>
      <h1 className="font-playfair text-7xl text-cream mb-6">
        Página no encontrada
      </h1>
      <p className="text-cream/60 max-w-md font-dm-sans mb-10">
        La página que buscás no existe o fue movida.
      </p>
      <Link
        href="/"
        className="inline-block bg-cream text-olive-bg px-10 py-4 label-tag text-[11px] hover:bg-beige-sand transition-colors"
      >
        VOLVER AL INICIO
      </Link>
    </div>
  );
}
