import LegalLayout from "@/components/legal/LegalLayout";
import LegalSection from "@/components/legal/LegalSection";

const rows = [
  ["Contato e diagnóstico", "Nome, e-mail, WhatsApp, objetivo, faixa, região, prazo e perfil", "Responder, classificar o perfil e entregar o material solicitado", "Procedimentos preliminares, consentimento ou legítimo interesse", "Supabase, infraestrutura e equipe de atendimento"],
  ["Avaliação de imóvel", "Contato, endereço ou bairro, tipo do imóvel e objetivo da venda", "Analisar a solicitação e preparar o atendimento imobiliário", "Procedimentos preliminares solicitados pelo titular", "Supabase, infraestrutura e equipe de atendimento"],
  ["Scanner /3inteligencia", "Valor do imóvel, entrada, renda e respostas de jornada", "Calcular indicadores e gerar relatório educativo", "Execução da funcionalidade solicitada e legítimo interesse", "Groq recebe o contexto necessário à redação; WhatsApp/Meta somente quando acionado"],
  ["Mensagens pelo site", "Nome, contato, assunto e conteúdo da mensagem", "Responder e manter histórico do atendimento", "Procedimentos preliminares, legítimo interesse e exercício de direitos", "Supabase, infraestrutura e equipe de atendimento"],
  ["Operação e segurança", "IP, data, hora, navegador e registros técnicos quando gerados", "Disponibilidade, diagnóstico de falhas, prevenção de fraude e segurança", "Legítimo interesse e cumprimento de obrigação legal", "Hospedagem, infraestrutura e fornecedores técnicos"],
] as const;

export default function DataProcessing() {
  return (
    <LegalLayout
      eyebrow="Mapa de tratamento"
      title="O caminho dos dados dentro do site."
      description="Uma visão prática das atividades atuais. A Pinheiro Azul aplica minimização: cada fluxo deve usar apenas o necessário para a finalidade declarada."
    >
      <div className="space-y-8">
        <div className="overflow-x-auto border border-[#06192c] bg-[#fffdf7] shadow-[6px_6px_0_#06192c]">
          <table className="min-w-[980px] w-full border-collapse text-left text-sm">
            <thead className="bg-[#06192c] text-white">
              <tr>
                {["Atividade", "Dados", "Finalidade", "Base possível", "Destinatários"].map((heading) => (
                  <th key={heading} className="border-r border-white/20 p-4 font-black uppercase last:border-r-0">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row[0]} className={index % 2 === 0 ? "bg-[#fffdf7]" : "bg-[#e7e0d4]"}>
                  {row.map((cell) => <td key={cell} className="border-r border-t border-[#06192c]/20 p-4 align-top last:border-r-0">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <LegalSection title="Como funciona o mini relatório" tone="yellow">
          <ol className="list-decimal space-y-2 pl-5">
            <li>O navegador envia os valores e respostas escolhidos ao endpoint da Pinheiro Azul.</li>
            <li>O servidor executa cálculos determinísticos e define limites comerciais antes de chamar o modelo.</li>
            <li>A Groq recebe contexto estruturado para redigir o texto em português brasileiro.</li>
            <li>O texto retorna ao navegador. Ele não substitui análise bancária, jurídica ou consultoria individual.</li>
          </ol>
          <p>Nome, e-mail e telefone não são necessários para gerar esse relatório e não devem ser enviados ao modelo por esse fluxo.</p>
        </LegalSection>

        <LegalSection title="Retenção e eliminação">
          <p>
            Não aplicamos um prazo único a todos os dados. Contatos e históricos são mantidos enquanto necessários ao atendimento, à relação comercial, ao cumprimento de obrigações ou à defesa de direitos. Registros técnicos seguem os prazos legais e operacionais aplicáveis.
          </p>
          <p>Quando a conservação deixa de ser necessária ou permitida, os dados são eliminados ou anonimizados.</p>
        </LegalSection>

        <LegalSection title="Dados de terceiros e dados sensíveis" tone="teal">
          <p>
            Evite inserir em mensagens dados sensíveis, documentos, informações bancárias ou dados de outras pessoas sem necessidade e autorização. Se uma etapa futura exigir documentos para uma operação imobiliária, a finalidade e o canal adequado devem ser informados separadamente.
          </p>
        </LegalSection>
      </div>
    </LegalLayout>
  );
}
