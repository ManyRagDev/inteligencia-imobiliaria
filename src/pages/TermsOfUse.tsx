import LegalLayout from "@/components/legal/LegalLayout";
import LegalSection from "@/components/legal/LegalSection";

export default function TermsOfUse() {
  return (
    <LegalLayout
      eyebrow="Termos de uso"
      title="Regras claras para usar este site."
      description="Ao navegar ou enviar informações, você concorda em usar os recursos de forma lícita e reconhece os limites das simulações e conteúdos."
    >
      <div className="space-y-8">
        <LegalSection number="01" title="Finalidade do site" tone="yellow">
          <p>
            O site apresenta serviços imobiliários, conteúdos educativos, formulários de contato, diagnósticos e estimativas preliminares. O acesso ao conteúdo público é gratuito, salvo quando uma oferta indicar expressamente outra condição.
          </p>
        </LegalSection>

        <LegalSection number="02" title="Simulações não são aprovação">
          <p>
            Valores de parcela, comprometimento de renda, custos e cenários são aproximações baseadas nas informações fornecidas e em premissas apresentadas na interface. Não constituem proposta, aprovação de crédito, avaliação oficial de imóvel, garantia de financiamento ou recomendação jurídica.
          </p>
          <p>Instituições financeiras, cartórios, vendedores e autoridades podem aplicar critérios e custos próprios.</p>
        </LegalSection>

        <LegalSection number="03" title="Responsabilidade do usuário">
          <p>
            Você se compromete a fornecer informações que acredita serem corretas, não se passar por outra pessoa, não tentar comprometer o site e não usar conteúdos ou canais para atividades ilícitas.
          </p>
          <p>Decisões imobiliárias relevantes devem considerar documentos, condições contratuais e análise profissional adequada ao caso concreto.</p>
        </LegalSection>

        <LegalSection number="04" title="Conteúdo, marca e links">
          <p>
            Textos, identidade visual, metodologia, software e materiais da Pinheiro Azul são protegidos pela legislação aplicável. O uso pessoal e informativo não transfere direitos de propriedade intelectual.
          </p>
          <p>Links externos são oferecidos por conveniência. A Pinheiro Azul não controla a disponibilidade, segurança ou políticas desses serviços.</p>
        </LegalSection>

        <LegalSection number="05" title="Disponibilidade e alterações" tone="teal">
          <p>
            Podemos corrigir, atualizar, suspender ou descontinuar partes do site. Buscamos manter informações úteis e o serviço disponível, mas não garantimos operação ininterrupta ou ausência absoluta de falhas.
          </p>
          <p>Alterações relevantes nestes termos serão publicadas nesta página com nova data de atualização.</p>
        </LegalSection>

        <LegalSection number="06" title="Privacidade, contato e legislação">
          <p>
            O tratamento de dados segue o Aviso de Privacidade e a legislação brasileira. Dúvidas sobre estes termos podem ser enviadas ao WhatsApp{" "}
            <a className="font-bold underline" href="https://wa.me/5511930418684" target="_blank" rel="noopener noreferrer">(11) 93041-8684</a>.
          </p>
          <p>Estes termos são interpretados conforme as leis da República Federativa do Brasil, preservados os direitos do consumidor e as regras legais de competência.</p>
        </LegalSection>
      </div>
    </LegalLayout>
  );
}
