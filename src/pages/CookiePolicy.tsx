import LegalLayout from "@/components/legal/LegalLayout";
import LegalSection from "@/components/legal/LegalSection";

export default function CookiePolicy() {
  return (
    <LegalLayout
      eyebrow="Cookies e navegador"
      title="Tecnologia necessária, sem rastreamento escondido."
      description="Esta página descreve cookies e formas semelhantes de armazenamento que podem participar da operação do site."
    >
      <div className="space-y-8">
        <LegalSection title="Situação atual" tone="yellow">
          <p>
            O site não implementa atualmente cookies próprios de publicidade comportamental nem uma ferramenta própria de analytics. Por isso, não exibimos um banner para aceitar publicidade que o site não utiliza.
          </p>
          <p>
            A infraestrutura e bibliotecas técnicas podem usar registros ou armazenamento local estritamente necessários para segurança, estabilidade, preferências temporárias e funcionamento de recursos.
          </p>
        </LegalSection>

        <LegalSection title="Serviços de terceiros">
          <p>
            Ao clicar em links externos, como WhatsApp, o serviço de destino passa a operar sob seus próprios termos e políticas. A geração do mini relatório também envolve comunicação do servidor com a Groq, conforme explicado no mapa de tratamento.
          </p>
          <p>Conteúdo externo incorporado ou novas ferramentas de medição, se adicionados no futuro, poderão exigir atualização desta política e mecanismo de escolha antes da ativação.</p>
        </LegalSection>

        <LegalSection title="Como controlar">
          <p>
            Você pode apagar ou bloquear cookies e dados de sites nas configurações do navegador. Bloquear tecnologias estritamente necessárias pode impedir que algumas funções operem corretamente.
          </p>
          <p>
            Consulte também o{" "}
            <a className="font-bold underline" href="https://www.gov.br/anpd/pt-br/assuntos/noticias-periodo-eleitoral/anpd-lanca-guia-orientativo-201ccookies-e-protecao-de-dados-pessoais201d" target="_blank" rel="noopener noreferrer">
              guia oficial de cookies da ANPD
            </a>.
          </p>
        </LegalSection>
      </div>
    </LegalLayout>
  );
}
