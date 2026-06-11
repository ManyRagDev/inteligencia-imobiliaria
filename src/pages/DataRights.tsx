import LegalLayout from "@/components/legal/LegalLayout";
import LegalSection from "@/components/legal/LegalSection";

export default function DataRights() {
  return (
    <LegalLayout
      eyebrow="Direitos do titular"
      title="Você continua no controle dos seus dados."
      description="A LGPD permite entender, corrigir e contestar diferentes usos de informações pessoais. O atendimento é gratuito."
    >
      <div className="space-y-8">
        <LegalSection title="O que você pode solicitar" tone="yellow">
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Confirmação de tratamento e acesso",
              "Correção de dados incompletos ou incorretos",
              "Anonimização, bloqueio ou eliminação quando cabível",
              "Informações sobre compartilhamentos",
              "Portabilidade, conforme regulamentação aplicável",
              "Revogação do consentimento e informação sobre consequências",
              "Oposição a tratamento irregular",
              "Revisão e explicação de tratamento automatizado",
            ].map((right) => (
              <li key={right} className="border border-[#06192c] bg-[#fffdf7] p-4 font-bold">{right}</li>
            ))}
          </ul>
        </LegalSection>

        <LegalSection title="Como fazer o pedido">
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              Envie uma mensagem ao WhatsApp{" "}
              <a className="font-bold underline" href="https://wa.me/5511930418684?text=Ol%C3%A1%2C%20quero%20exercer%20um%20direito%20sobre%20meus%20dados." target="_blank" rel="noopener noreferrer">
                (11) 93041-8684
              </a>{" "}
              informando que se trata de uma solicitação LGPD.
            </li>
            <li>Diga qual direito deseja exercer e qual contato ou formulário utilizou.</li>
            <li>Para proteger você, podemos solicitar dados mínimos para confirmar a identidade. Não envie senha ou dados bancários.</li>
            <li>Responderemos dentro dos prazos aplicáveis e explicaremos eventual impossibilidade legal ou técnica.</li>
          </ol>
        </LegalSection>

        <LegalSection title="Revisão do diagnóstico e da IA" tone="teal">
          <p>
            Você pode pedir uma explicação sobre os critérios de cálculo, a recomendação comercial exibida ou o texto produzido pela IA. Também pode solicitar que uma pessoa revise o resultado.
          </p>
          <p>O diagnóstico do site não decide aprovação de crédito nem produz efeito contratual por si só.</p>
        </LegalSection>

        <LegalSection title="Reclamação a autoridades">
          <p>
            Se entender que o pedido não foi atendido adequadamente, você pode procurar os órgãos de defesa do consumidor e a Autoridade Nacional de Proteção de Dados.
          </p>
          <p>
            Consulte o canal oficial da{" "}
            <a className="font-bold underline" href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1" target="_blank" rel="noopener noreferrer">
              ANPD para titulares de dados
            </a>.
          </p>
        </LegalSection>
      </div>
    </LegalLayout>
  );
}
