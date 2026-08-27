import React from "react";

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}

function PhoneIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.031 0C5.463 0 .14 5.32.14 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.304-1.653a11.86 11.86 0 0 0 5.723 1.457h.005c6.568 0 11.891-5.32 11.891-11.892C23.923 5.34 18.6.02 12.031 0zm0 21.75h-.005a9.85 9.85 0 0 1-5.023-1.375l-.36-.214-3.741.981.998-3.648-.235-.374a9.831 9.831 0 0 1-1.507-5.228c0-5.438 4.427-9.865 9.878-9.865 2.638 0 5.117 1.03 6.982 2.898a9.798 9.798 0 0 1 2.892 6.976c0 5.438-4.427 9.849-9.879 9.849z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/balbali.store?igsi=MXBpcjVoMDEyam40Mw==",
    icon: <InstagramIcon />,
    className: "site-footer__social--instagram",
  },
  {
    name: "Facebook",
    href: "#",
    icon: <FacebookIcon />,
    className: "site-footer__social--facebook",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@balbalistor?_r=1&_t=ZS-996luBNuR7d",
    icon: <TikTokIcon />,
    className: "site-footer__social--tiktok",
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__row">
        <div className="site-footer__brand">
          <div className="logo-badge site-footer__logo">BALBALI</div>
          <p>Téléphones, accessoires et pièces de réparation — livrés partout en Tunisie.</p>
        </div>

        <div>
          <h4>Service client</h4>
          <ul>
            <li>Infos de livraison</li>
            <li>Retours</li>
            <li>
              <a href="https://wa.me/21650519451" target="_blank" rel="noopener noreferrer">
                Contactez-nous
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>
              <a href="tel:+21625286880" className="site-footer__contact-link">
                <span className="site-footer__social-icon site-footer__social-icon--plain">
                  <PhoneIcon />
                </span>
                <span>25 286 880</span>
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/21650519451"
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer__contact-link"
              >
                <span className="site-footer__social-icon site-footer__social-icon--whatsapp">
                  <WhatsAppIcon />
                </span>
                <span>+216 50 519 451</span>
              </a>
            </li>
          </ul>

          <ul className="site-footer__socials">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`site-footer__contact-link ${s.className}`}
                >
                  <span className="site-footer__social-icon">{s.icon}</span>
                  <span>{s.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Balbali Store. Tous droits réservés.</span>
      </div>
    </footer>
  );
}