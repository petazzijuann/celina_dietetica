import { Mail, Phone } from "lucide-react";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "";
const CONTACT_PHONE = process.env.CONTACT_PHONE ?? "";

export default function ContactInfo() {
  return (
    <div>
      <p className="label-tag text-[10px] text-muted-foreground mb-6 tracking-widest">NUESTROS DATOS</p>
      <div className="space-y-6">
        {CONTACT_EMAIL && (
          <div className="flex items-start gap-4">
            <Mail size={18} className="text-olive-dark mt-0.5 shrink-0" />
            <div>
              <p className="label-tag text-[10px] text-muted-foreground mb-1">EMAIL</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-sm hover:text-olive-dark transition-colors font-dm-sans"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        )}

        {CONTACT_PHONE && (
          <div className="flex items-start gap-4">
            <Phone size={18} className="text-olive-dark mt-0.5 shrink-0" />
            <div>
              <p className="label-tag text-[10px] text-muted-foreground mb-1">WHATSAPP</p>
              <a
                href={`https://wa.me/${CONTACT_PHONE.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-olive-dark transition-colors font-dm-sans"
              >
                {CONTACT_PHONE}
              </a>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-beige-sand">
          <p className="label-tag text-[10px] text-muted-foreground mb-2">HORARIO</p>
          <p className="text-sm font-dm-sans text-muted-foreground">
            Lunes a Viernes · 9 a 18 hs
          </p>
          <p className="label-tag text-[10px] text-muted-foreground mt-3 mb-1">UBICACIÓN</p>
          <p className="text-sm font-dm-sans text-muted-foreground">Rosario, Santa Fe, Argentina</p>
        </div>
      </div>
    </div>
  );
}
