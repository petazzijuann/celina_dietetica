import type { Metadata } from "next";
import ContactHero from "@/components/public/ContactHero";
import ContactInfo from "@/components/public/ContactInfo";
import ContactForm from "@/components/public/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactate con Dietética Celina. Estamos en Rosario, Argentina.",
};

export default function ContactoPage() {
  return (
    <>
      <ContactHero />
      <section className="bg-cream py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <ContactInfo />
          <ContactForm />
        </div>
      </section>
    </>
  );
}
