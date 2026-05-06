import { Link } from "wouter";
import {
  Facebook,
  Instagram,
  MessageCircle,
  Youtube,
  MapPin,
  Phone,
  Clock,
  Mail,
} from "lucide-react";
import toodlesLogo from "@assets/Logo Toodles - Edited (1)_1753203790787.png";

export function Footer() {
  return (
    <footer className="relative overflow-hidden text-white">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #1f1730 0%, #2a1942 50%, #21253b 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-[var(--toodles-primary)] blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-[var(--toodles-secondary)] blur-3xl opacity-25" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <img
              src={toodlesLogo}
              alt="Toodles Funzone"
              className="h-20 w-auto mb-4 toodles-logo-hover"
            />
            <p className="text-white/75 mb-5 text-sm leading-relaxed">
              Bengaluru's most-loved indoor play zone for children aged 2–8 —
              where safety, imagination and joy come together.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: Facebook, label: "Facebook", href: "#" },
                { icon: Instagram, label: "Instagram", href: "#" },
                { icon: MessageCircle, label: "WhatsApp", href: "#" },
                { icon: Youtube, label: "YouTube", href: "#" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid place-items-center h-9 w-9 rounded-full bg-white/10 hover:bg-toodles-primary text-white transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* About links */}
          <div>
            <h3 className="text-base font-display text-toodles-accent mb-4 uppercase tracking-wider">
              About Toodles
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Activities", href: "/activities" },
                { label: "Packages", href: "/packages" },
                { label: "Birthday Parties", href: "/birthday" },
                { label: "Gallery", href: "/gallery" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href}>
                    <span className="text-white/75 hover:text-toodles-accent hover:translate-x-0.5 inline-block transition-all cursor-pointer">
                      {l.label}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <span className="text-white/75 hover:text-toodles-accent transition-colors cursor-pointer">
                  Safety Guidelines
                </span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base font-display text-toodles-accent mb-4 uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact">
                  <span className="text-white/75 hover:text-toodles-accent hover:translate-x-0.5 inline-block transition-all cursor-pointer">
                    Contact us
                  </span>
                </Link>
              </li>
              {["FAQ", "Booking Help", "Privacy Policy", "Terms & Conditions"].map(
                (l) => (
                  <li key={l}>
                    <span className="text-white/75 hover:text-toodles-accent transition-colors cursor-pointer">
                      {l}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-display text-toodles-accent mb-4 uppercase tracking-wider">
              Get in touch
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href="https://maps.google.com/?q=Sarjapur+Main+Road+Bengaluru"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-white/80 hover:text-toodles-accent transition-colors"
              >
                <MapPin className="h-4 w-4 mt-0.5 text-toodles-primary shrink-0" />
                <span>Sarjapur Main Rd, Bengaluru, Karnataka</span>
              </a>
              <a
                href="tel:+919901218980"
                className="flex items-center gap-3 text-white/80 hover:text-toodles-accent transition-colors"
              >
                <Phone className="h-4 w-4 text-toodles-primary shrink-0" />
                <span>+91 99012 18980</span>
              </a>
              <a
                href="mailto:hello@toodlesfunzone.com"
                className="flex items-center gap-3 text-white/80 hover:text-toodles-accent transition-colors"
              >
                <Mail className="h-4 w-4 text-toodles-primary shrink-0" />
                <span>hello@toodlesfunzone.com</span>
              </a>
              <div className="flex items-center gap-3 text-white/80">
                <Clock className="h-4 w-4 text-toodles-primary shrink-0" />
                <span>11 AM – 8:30 PM Daily</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-white/60 relative">
          <p>© {new Date().getFullYear()} Toodles Funzone. All rights reserved.</p>
          <p className="font-medium text-white/70">
            Built with care for the families we host.
          </p>
          {/* Discreet admin access */}
          <Link href="/admin/login">
            <div
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-white/15 hover:bg-toodles-primary transition-colors duration-300 cursor-pointer"
              title="Admin Access"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
