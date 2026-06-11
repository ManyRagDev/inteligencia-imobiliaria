import { Link } from "react-router-dom";
import LegalLayout from "@/components/legal/LegalLayout";
import LegalSection from "@/components/legal/LegalSection";

export default function Privacy() {
  return (
    <LegalLayout
      eyebrow="Aviso de privacidade"
      title="Como cuidamos das informações que você compartilha."
      description="Este aviso explica o tratamento realizado pela Pinheiro Azul no site, nos formulários, nas simulações e no atendimento por WhatsApp."
    >
      <div className="space-y-8">
        <LegalSection number="01" title="Quem controla os dados" tone="yellow">
          <p>
            A <strong>Pinheiro Azul</strong>, operação imobiliária apresentada neste site, decide as finalidades e os meios dos tratamentos descritos aqui e atua como controladora desses dados.
          </p>
          <p>
            O canal para assuntos de privacidade e exercício de direitos é o WhatsApp{" "}
            <a className="font-bold underline" href="https://wa.me/5511930418684" target="_blank" rel="noopener noreferrer">
              (11) 93041-8684
            </a>.
          </p>
        </LegalSection>

        <LegalSection number="02" title="Dados que podemos receber">
          <ul className="list-disc space-y-2 pl-5">
            <li>nome, e-mail, telefone e WhatsApp informados em formulários;</li>
            <li>mensagens, objetivo de compra ou venda, região, prazo, faixa de preço, tipo e características do imóvel;</li>
            <li>valores aproximados de imóvel, entrada e renda usados em simuladores;</li>
            <li>respostas fornecidas em diagnósticos e preferências de atendimento;</li>
            <li>dados técnicos necessários à operação e segurança do site, como endereço IP, registros de acesso e informações do dispositivo, quando gerados pela infraestrutura.</li>
          </ul>
          <p>Não solicitamos CPF, documentos bancários ou senhas nos formulários públicos atualmente disponíveis.</p>
        </LegalSection>

        <LegalSection number="03" title="Por que usamos esses dados">
          <p>
            Usamos os dados para responder contatos, entregar materiais e diagnósticos solicitados, preparar atendimento imobiliário, gerar estimativas preliminares, prevenir abuso, manter registros necessários e cumprir obrigações legais ou regulatórias.
          </p>
          <p>
            Conforme o contexto, o tratamento pode se apoiar em procedimentos preliminares solicitados por você, consentimento, legítimo interesse, cumprimento de obrigação legal ou exercício regular de direitos.
          </p>
        </LegalSection>

        <LegalSection number="04" title="Fornecedores e compartilhamentos" tone="teal">
          <p>Podemos usar fornecedores estritamente relacionados à operação, incluindo:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Supabase</strong>, para banco de dados e armazenamento de leads;</li>
            <li><strong>Groq</strong>, para redigir o mini relatório a partir de dados de cenário e respostas do diagnóstico;</li>
            <li><strong>WhatsApp/Meta</strong>, quando você decide iniciar uma conversa pelo botão disponível no site;</li>
            <li><strong>provedores de hospedagem e infraestrutura</strong>, para disponibilizar e proteger a aplicação.</li>
          </ul>
          <p>
            Alguns fornecedores podem processar informações em outros países. Nesses casos, buscamos usar serviços reconhecidos e aplicar as salvaguardas contratuais e legais cabíveis. Também pode haver compartilhamento por obrigação legal, ordem de autoridade ou defesa de direitos.
          </p>
        </LegalSection>

        <LegalSection number="05" title="IA, cálculos e decisões automatizadas">
          <p>
            As simulações usam regras matemáticas e respostas fornecidas por você. A IA é usada para organizar essas conclusões em texto, não para aprovar financiamento, definir crédito ou tomar uma decisão jurídica sobre você.
          </p>
          <p>
            O resultado é educativo e preliminar. Você pode solicitar explicações ou revisão humana pelo canal de privacidade. Veja os detalhes em{" "}
            <Link to="/tratamento-de-dados" className="font-bold underline">Tratamento de dados</Link>.
          </p>
        </LegalSection>

        <LegalSection number="06" title="Retenção, segurança e seus direitos">
          <p>
            Mantemos os dados pelo período necessário para atender a finalidade informada, acompanhar a relação, cumprir deveres legais e proteger direitos. Depois, os dados são eliminados, anonimizados ou conservados apenas quando a lei permitir.
          </p>
          <p>
            Adotamos medidas técnicas e administrativas proporcionais ao risco. Nenhum sistema é absolutamente invulnerável; se ocorrer um incidente relevante, serão tomadas as providências exigidas pela legislação.
          </p>
          <p>
            Você pode pedir confirmação, acesso, correção, eliminação quando aplicável, informação sobre compartilhamento, oposição, revogação de consentimento e revisão de tratamento automatizado. Consulte a página{" "}
            <Link to="/direitos-lgpd" className="font-bold underline">Seus direitos LGPD</Link>.
          </p>
        </LegalSection>

        <LegalSection number="07" title="Atualizações e referências">
          <p>Este aviso pode mudar para refletir alterações no site, nos fornecedores ou na legislação. A data da versão vigente aparece no topo.</p>
          <p>
            Referências oficiais:{" "}
            <a className="font-bold underline" href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" target="_blank" rel="noopener noreferrer">Lei nº 13.709/2018</a>
            {" "}e{" "}
            <a className="font-bold underline" href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares" target="_blank" rel="noopener noreferrer">orientações da ANPD</a>.
          </p>
        </LegalSection>
      </div>
    </LegalLayout>
  );
}
