import { Link } from "react-router-dom";
import { ArrowRight, Cookie, FileCheck2, ListChecks, Scale, ShieldCheck } from "lucide-react";
import LegalLayout from "@/components/legal/LegalLayout";

const pages = [
  { href: "/privacidade", title: "Aviso de privacidade", copy: "Visão geral sobre coleta, uso, compartilhamento, retenção e proteção de dados.", icon: ShieldCheck },
  { href: "/tratamento-de-dados", title: "Mapa de tratamento", copy: "Quais dados entram em cada fluxo, por qual motivo, com quem e por quanto tempo.", icon: ListChecks },
  { href: "/direitos-lgpd", title: "Direitos LGPD", copy: "Como pedir acesso, correção, exclusão, oposição ou revisão de uma recomendação automatizada.", icon: Scale },
  { href: "/cookies", title: "Cookies e armazenamento", copy: "Tecnologias usadas no navegador e como controlar preferências.", icon: Cookie },
  { href: "/termos", title: "Termos de uso", copy: "Regras do site, limites das estimativas e responsabilidades no uso dos conteúdos.", icon: FileCheck2 },
] as const;

export default function LegalHub() {
  return (
    <LegalLayout
      eyebrow="Central de transparência"
      title="Seus dados, sem letras miúdas."
      description="Aqui você encontra, em linguagem direta, como a Pinheiro Azul trata informações de contatos, diagnósticos e simulações imobiliárias."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {pages.map(({ href, title, copy, icon: Icon }, index) => (
          <Link
            key={href}
            to={href}
            className={`group border border-[#06192c] p-6 shadow-[6px_6px_0_#06192c] transition hover:-translate-y-1 ${
              index === 0 ? "bg-[#f3d35b] sm:col-span-2" : "bg-[#fffdf7]"
            }`}
          >
            <Icon size={26} className="text-[#e43d30]" />
            <h2 className="mt-8 text-2xl font-black uppercase">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#415064]">{copy}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase">
              Consultar <ArrowRight size={15} className="transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-10 border border-[#06192c] bg-[#06192c] p-6 text-white sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#28c7ba]">Canal do titular</p>
        <h2 className="mt-3 text-2xl font-black uppercase">Quer perguntar ou exercer um direito?</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
          Fale pelo WhatsApp (11) 93041-8684. Podemos solicitar informações mínimas para confirmar sua identidade antes de entregar, alterar ou excluir dados.
        </p>
      </div>
    </LegalLayout>
  );
}
