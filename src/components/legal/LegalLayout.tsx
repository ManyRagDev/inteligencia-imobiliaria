import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";

const legalLinks = [
  { href: "/privacidade", label: "Privacidade" },
  { href: "/tratamento-de-dados", label: "Tratamento de dados" },
  { href: "/direitos-lgpd", label: "Seus direitos" },
  { href: "/cookies", label: "Cookies" },
  { href: "/termos", label: "Termos de uso" },
] as const;

type LegalLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function LegalLayout({ eyebrow, title, description, children }: LegalLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#06192c]">
      <header className="border-b border-[#06192c] bg-[#f4f0e8]">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Voltar para a página inicial">
            <img src={logo} alt="" className="h-11 w-11 object-contain" />
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.2em]">Pinheiro Azul</span>
              <span className="block text-xs text-[#5a6472]">Privacidade e dados</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-[#06192c] px-3 py-2 text-xs font-black uppercase transition hover:bg-[#06192c] hover:text-white"
            >
              <ArrowLeft size={15} />
              Início
            </Link>
            <a
              href="https://wa.me/5511930418684?text=Ol%C3%A1%2C%20quero%20falar%20sobre%20meus%20dados%20pessoais."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#e43d30] px-3 py-2 text-xs font-black uppercase text-white"
            >
              <MessageCircle size={15} />
              Canal de privacidade
            </a>
          </div>
        </div>
      </header>

      <nav aria-label="Páginas de privacidade" className="border-b border-[#06192c]/20 bg-[#fffdf7]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/legal"
            className={`shrink-0 px-3 py-2 text-xs font-black uppercase ${
              location.pathname === "/legal" ? "bg-[#06192c] text-white" : "border border-[#06192c]/20"
            }`}
          >
            Central
          </Link>
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`shrink-0 px-3 py-2 text-xs font-black uppercase ${
                location.pathname === link.href ? "bg-[#06192c] text-white" : "border border-[#06192c]/20"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <main>
        <section className="border-b border-[#06192c] bg-[#06192c] px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 text-[#28c7ba]">
              <ShieldCheck size={22} />
              <p className="text-xs font-black uppercase tracking-[0.25em]">{eyebrow}</p>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black uppercase leading-[0.95] sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/72 sm:text-lg">{description}</p>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-[#f3d35b]">
              Última atualização: 9 de junho de 2026
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">{children}</div>
      </main>

      <footer className="border-t border-[#06192c] bg-[#e7e0d4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 text-sm text-[#415064] sm:flex-row sm:items-center sm:justify-between">
          <span>Pinheiro Azul · Serviços imobiliários na Zona Leste de São Paulo</span>
          <Link to="/legal" className="font-black uppercase text-[#06192c] hover:underline">
            Central de privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}
