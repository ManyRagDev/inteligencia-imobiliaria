import type { ReactNode } from "react";

type LegalSectionProps = {
  number?: string;
  title: string;
  children: ReactNode;
  tone?: "light" | "yellow" | "teal";
};

const toneClasses = {
  light: "bg-[#fffdf7]",
  yellow: "bg-[#f3d35b]",
  teal: "bg-[#bce9e4]",
};

export default function LegalSection({ number, title, children, tone = "light" }: LegalSectionProps) {
  return (
    <section className={`border border-[#06192c] p-6 shadow-[6px_6px_0_#06192c] sm:p-8 ${toneClasses[tone]}`}>
      <div className="flex items-start gap-4">
        {number && <span className="shrink-0 text-xs font-black uppercase tracking-[0.2em] text-[#e43d30]">{number}</span>}
        <div className="min-w-0">
          <h2 className="text-2xl font-black uppercase leading-tight">{title}</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#33465a] sm:text-base">{children}</div>
        </div>
      </div>
    </section>
  );
}
