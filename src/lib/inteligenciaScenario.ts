export type PurchaseMoment =
  | "entendendo"
  | "organizando"
  | "proximos_meses"
  | "procurando"
  | "negociando";

export type MainNeed =
  | "financiamento"
  | "custos"
  | "documentos"
  | "processo"
  | "capacidade"
  | "formar_entrada"
  | "mcmv"
  | "comecar"
  | "seguir_sozinho"
  | "montar_plano"
  | "busca_visitas"
  | "pesquisando"
  | "agendando_visitas"
  | "visitou_opcoes"
  | "custos_documentos"
  | "proposta_clausulas"
  | "credito_final"
  | "orientacao_geral";

export type SupportPreference = "autonomia" | "orientacao" | "acompanhamento";
export type ScenarioLevel = "exploratorio" | "preparacao" | "busca";
export type RecommendationClass =
  | "exploracao"
  | "formacao_entrada"
  | "ajuste_orcamento"
  | "preparacao_assistida"
  | "pronto_para_confirmar"
  | "busca_autonoma"
  | "busca_orientada"
  | "acompanhamento"
  | "negociacao";

export interface ScenarioInput {
  propertyValue: number;
  downPayment: number;
  monthlyIncome: number;
}

export interface DiagnosticAnswers {
  moment: PurchaseMoment;
  mainNeed: MainNeed;
  supportPreference?: SupportPreference;
}

export interface ScenarioResult extends ScenarioInput {
  consideredDownPayment: number;
  downPaymentPercent: number;
  financedValue: number;
  initialCosts: number;
  estimatedFirstPayment: number;
  incomeCommitment: number;
  downPaymentGap: number;
  level: ScenarioLevel;
  levelLabel: string;
  levelSummary: string;
  attentionPoints: string[];
  clearPoints: string[];
}

export interface ServiceOption {
  id: "gratuito" | "guia" | "consultoria" | "assessoria";
  label: string;
  description: string;
  cta: string;
  emphasis: "recommended" | "accessible" | "personalized" | "complete";
}

export interface RecommendationDecision {
  recommendationClass: RecommendationClass;
  primaryStrength: string;
  mainBottleneck: string;
  recommended: ServiceOption;
  accessibleAlternative: ServiceOption;
  personalizedOption: ServiceOption;
  completeOption: ServiceOption;
  nextSteps: [string, string, string];
}

export interface QuestionOption<T extends string> {
  id: T;
  label: string;
  description?: string;
}

export const REFERENCE_CONTEXT = {
  referenceDate: "2026-06-09",
  calculationMethod: "Primeira parcela estimada pelo sistema SAC em 360 meses",
  annualRatePercent: 10.5,
  initialCostPercent: 4.5,
  downPaymentPercent: 20,
  incomeCommitmentPercent: 30,
} as const;

export const momentOptions: Array<QuestionOption<PurchaseMoment>> = [
  { id: "entendendo", label: "Só quero entender como funciona" },
  { id: "organizando", label: "Quero me organizar antes de procurar" },
  { id: "proximos_meses", label: "Quero comprar nos próximos meses" },
  { id: "procurando", label: "Já estou procurando imóveis" },
  { id: "negociando", label: "Já encontrei um imóvel" },
];

export const momentLabels: Record<PurchaseMoment, string> = Object.fromEntries(
  momentOptions.map((option) => [option.id, option.label])
) as Record<PurchaseMoment, string>;

const needsByMoment: Record<
  PurchaseMoment,
  { question: string; lead: string; options: Array<QuestionOption<MainNeed>> }
> = {
  entendendo: {
    question: "O que você mais quer entender primeiro?",
    lead: "Escolha o assunto que hoje parece mais confuso.",
    options: [
      { id: "financiamento", label: "Financiamento ou Minha Casa Minha Vida" },
      { id: "custos", label: "Entrada e outros custos" },
      { id: "documentos", label: "Documentação necessária" },
      { id: "processo", label: "O processo inteiro, do começo ao fim" },
    ],
  },
  organizando: {
    question: "O que mais impede você de avançar hoje?",
    lead: "Isso ajuda a separar informação geral de orientação aplicada ao seu caso.",
    options: [
      { id: "capacidade", label: "Não sei quanto posso pagar" },
      { id: "formar_entrada", label: "Ainda preciso formar a entrada" },
      { id: "mcmv", label: "Tenho dúvidas sobre o MCMV" },
      { id: "documentos", label: "Não sei quais documentos organizar" },
      { id: "comecar", label: "Não sei por onde começar" },
    ],
  },
  proximos_meses: {
    question: "Como você gostaria de conduzir a compra?",
    lead: "Não existe um formato certo: existe o nível de apoio que combina com você.",
    options: [
      { id: "seguir_sozinho", label: "Quero conduzir por conta própria" },
      { id: "montar_plano", label: "Quero montar um plano com orientação" },
      { id: "busca_visitas", label: "Quero ajuda na busca e nas visitas" },
    ],
  },
  procurando: {
    question: "Em que ponto da busca você está?",
    lead: "Uma busca no início pede um apoio diferente de uma busca que já chegou às visitas.",
    options: [
      { id: "pesquisando", label: "Ainda estou pesquisando e comparando anúncios" },
      { id: "agendando_visitas", label: "Já estou agendando visitas" },
      { id: "visitou_opcoes", label: "Já visitei algumas opções" },
    ],
  },
  negociando: {
    question: "Qual cuidado mais preocupa você agora?",
    lead: "A orientação aqui é sobre organização da reta final, não uma avaliação independente do imóvel.",
    options: [
      { id: "custos_documentos", label: "Custos e documentos da compra" },
      { id: "proposta_clausulas", label: "Proposta, prazos e cláusulas" },
      { id: "credito_final", label: "Financiamento e condições finais" },
      { id: "orientacao_geral", label: "Quero organizar todas as perguntas antes de assinar" },
    ],
  },
};

export const supportOptions: Array<QuestionOption<SupportPreference>> = [
  {
    id: "autonomia",
    label: "Quero seguir sozinho",
    description: "Prefiro receber um roteiro e organizar no meu ritmo.",
  },
  {
    id: "orientacao",
    label: "Quero orientação para o meu caso",
    description: "Quero cruzar os dados com alguém antes de decidir.",
  },
  {
    id: "acompanhamento",
    label: "Quero acompanhamento mais próximo",
    description: "Prefiro apoio também na busca, visitas ou propostas.",
  },
];

export const needLabels = Object.values(needsByMoment)
  .flatMap((entry) => entry.options)
  .reduce<Record<string, string>>((labels, option) => {
    labels[option.id] = option.label;
    return labels;
  }, {}) as Record<MainNeed, string>;

export const supportLabels: Record<SupportPreference, string> = Object.fromEntries(
  supportOptions.map((option) => [option.id, option.label])
) as Record<SupportPreference, string>;

export function getAdaptiveQuestion(moment: PurchaseMoment) {
  return needsByMoment[moment];
}

export function needsSupportQuestion(moment: PurchaseMoment, mainNeed: MainNeed) {
  if (moment === "negociando") return false;
  if (moment === "proximos_meses") return mainNeed === "seguir_sozinho";
  if (moment === "procurando") return true;
  if (moment === "organizando") {
    return mainNeed === "capacidade" || mainNeed === "mcmv" || mainNeed === "comecar";
  }
  return mainNeed === "processo";
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

export function calculateScenario({
  propertyValue,
  downPayment,
  monthlyIncome,
}: ScenarioInput): ScenarioResult {
  const consideredDownPayment = Math.min(Math.max(downPayment, 0), propertyValue);
  const downPaymentPercent = propertyValue > 0 ? (consideredDownPayment / propertyValue) * 100 : 0;
  const financedValue = Math.max(propertyValue - consideredDownPayment, 0);
  const initialCosts = propertyValue * (REFERENCE_CONTEXT.initialCostPercent / 100);
  const estimatedFirstPayment =
    financedValue / 360 + financedValue * (REFERENCE_CONTEXT.annualRatePercent / 100 / 12);
  const incomeCommitment = monthlyIncome > 0 ? (estimatedFirstPayment / monthlyIncome) * 100 : 0;
  const referenceDownPayment = propertyValue * (REFERENCE_CONTEXT.downPaymentPercent / 100);
  const downPaymentGap = Math.max(referenceDownPayment - consideredDownPayment, 0);

  let level: ScenarioLevel = "busca";
  if (downPaymentPercent < 10 || incomeCommitment > 40) {
    level = "exploratorio";
  } else if (downPaymentPercent < 20 || incomeCommitment > REFERENCE_CONTEXT.incomeCommitmentPercent) {
    level = "preparacao";
  }

  const levelContent: Record<ScenarioLevel, { label: string; summary: string }> = {
    exploratorio: {
      label: "Cenário para organizar",
      summary:
        "Os números já mostram por onde começar: ajustar a relação entre entrada, valor do imóvel e parcela antes de avançar para uma busca mais intensa.",
    },
    preparacao: {
      label: "Cenário em preparação",
      summary:
        "Existe uma base concreta, mas alguns pontos ainda merecem organização e confirmação antes de transformar a intenção em propostas.",
    },
    busca: {
      label: "Cenário para confirmar",
      summary:
        "A composição inicial está mais próxima das referências educativas usadas aqui. O próximo passo é confirmar crédito, custos e critérios de busca.",
    },
  };

  const clearPoints = [
    `A entrada informada representa ${downPaymentPercent.toFixed(0)}% do valor do imóvel.`,
    `O valor restante a financiar seria de aproximadamente ${formatCurrency(financedValue)}.`,
    `A primeira parcela estimada ficaria perto de ${formatCurrency(estimatedFirstPayment)}.`,
  ];

  const attentionPoints: string[] = [];
  if (downPaymentGap > 0) {
    attentionPoints.push(
      `Faltam cerca de ${formatCurrency(downPaymentGap)} para alcançar a referência inicial de ${REFERENCE_CONTEXT.downPaymentPercent}% de entrada.`
    );
  }
  if (incomeCommitment > REFERENCE_CONTEXT.incomeCommitmentPercent) {
    attentionPoints.push(
      `A primeira parcela estimada compromete ${incomeCommitment.toFixed(0)}% da renda, acima da referência educativa de ${REFERENCE_CONTEXT.incomeCommitmentPercent}%.`
    );
  }
  attentionPoints.push(
    `Reserve aproximadamente ${formatCurrency(initialCosts)} para ITBI, registro e escritura; o valor real pode variar.`
  );

  return {
    propertyValue,
    downPayment,
    monthlyIncome,
    consideredDownPayment,
    downPaymentPercent,
    financedValue,
    initialCosts,
    estimatedFirstPayment,
    incomeCommitment,
    downPaymentGap,
    level,
    levelLabel: levelContent[level].label,
    levelSummary: levelContent[level].summary,
    attentionPoints,
    clearPoints,
  };
}

const serviceCatalog = {
  gratuito: {
    id: "gratuito",
    label: "Mapa e conteúdo gratuito",
    description: "Use a leitura inicial e um roteiro objetivo para avançar no seu ritmo.",
    cta: "Usar meu mapa gratuito",
  },
  guia: {
    id: "guia",
    label: "Guia Prático",
    description: "Checklists e organização para quem prefere conduzir a preparação com autonomia.",
    cta: "Conhecer o Guia Prático",
  },
  consultoria: {
    id: "consultoria",
    label: "Consultoria Online",
    description: "Uma conversa aplicada ao seu caso para cruzar números, dúvidas e próximos passos.",
    cta: "Conversar sobre a consultoria",
  },
  assessoria: {
    id: "assessoria",
    label: "Assessoria Completa",
    description: "Acompanhamento desde a preparação até busca, visitas, propostas e decisão.",
    cta: "Conhecer a assessoria completa",
  },
} as const;

function option(
  id: keyof typeof serviceCatalog,
  emphasis: ServiceOption["emphasis"]
): ServiceOption {
  return { ...serviceCatalog[id], emphasis };
}

const decisionContent: Record<
  RecommendationClass,
  {
    strength: (result: ScenarioResult) => string;
    bottleneck: (result: ScenarioResult, answers: DiagnosticAnswers) => string;
    recommended: keyof typeof serviceCatalog;
    accessible: keyof typeof serviceCatalog;
    steps: (result: ScenarioResult, answers: DiagnosticAnswers) => [string, string, string];
  }
> = {
  exploracao: {
    strength: () => "Você começou pelo ponto certo: entender antes de assumir compromissos.",
    bottleneck: (_result, answers) =>
      `Sua principal necessidade agora é ${needLabels[answers.mainNeed].toLowerCase()}.`,
    recommended: "gratuito",
    accessible: "gratuito",
    steps: () => [
      "Ler o conteúdo indicado para a sua principal dúvida.",
      "Separar entrada, custos iniciais e reserva de segurança.",
      "Refazer o mapa quando sua faixa de imóvel estiver mais definida.",
    ],
  },
  formacao_entrada: {
    strength: (result) =>
      result.incomeCommitment <= REFERENCE_CONTEXT.incomeCommitmentPercent
        ? "A renda informada comporta a primeira parcela estimada dentro da referência utilizada."
        : "Você já transformou a intenção em números concretos para poder ajustar o plano.",
    bottleneck: (result) =>
      result.downPaymentGap > 0
        ? `A entrada está ${formatCurrency(result.downPaymentGap)} abaixo da referência educativa utilizada.`
        : "A entrada alcança a referência educativa, mas você indicou que ainda precisa entender como formá-la ou preservá-la junto da reserva de custos.",
    recommended: "gratuito",
    accessible: "gratuito",
    steps: (result) =>
      result.downPaymentGap > 0
        ? [
            "Consultar o saldo de FGTS que poderia compor a entrada.",
            `Criar uma meta para os ${formatCurrency(result.downPaymentGap)} que faltam na referência inicial.`,
            `Separar a entrada da reserva estimada de ${formatCurrency(result.initialCosts)} para custos iniciais.`,
          ]
        : [
            "Confirmar quanto da entrada realmente estará disponível na data da compra.",
            "Consultar o saldo de FGTS que poderia preservar parte dos recursos próprios.",
            `Manter separada a reserva estimada de ${formatCurrency(result.initialCosts)} para custos iniciais.`,
          ],
  },
  ajuste_orcamento: {
    strength: () => "Os dados informados já permitem identificar o ajuste mais importante antes da busca.",
    bottleneck: (result) =>
      `A primeira parcela estimada representa cerca de ${result.incomeCommitment.toFixed(0)}% da renda informada.`,
    recommended: "gratuito",
    accessible: "gratuito",
    steps: (result) => [
      "Testar uma faixa de imóvel menor no próprio mapa.",
      "Simular quanto uma entrada maior reduziria o valor financiado.",
      `Preservar uma reserva separada de aproximadamente ${formatCurrency(result.initialCosts)} para custos iniciais.`,
    ],
  },
  preparacao_assistida: {
    strength: () => "Você já sabe qual dúvida precisa resolver para transformar os números em plano.",
    bottleneck: (_result, answers) =>
      `O próximo ganho de clareza está em aplicar ${needLabels[answers.mainNeed].toLowerCase()} ao seu caso.`,
    recommended: "consultoria",
    accessible: "guia",
    steps: () => [
      "Listar compromissos mensais que não aparecem nesta estimativa.",
      "Separar dúvidas sobre entrada, crédito e custos.",
      "Definir uma faixa de imóvel para validar em simulação oficial.",
    ],
  },
  pronto_para_confirmar: {
    strength: () => "Entrada, primeira parcela estimada e renda formam uma base inicial mais próxima das referências usadas.",
    bottleneck: () => "O cenário ainda precisa ser confirmado por simulação oficial e critérios de compra.",
    recommended: "guia",
    accessible: "gratuito",
    steps: () => [
      "Solicitar uma simulação oficial de financiamento.",
      "Definir critérios mínimos para imóvel, localização e deslocamento.",
      "Manter a reserva de custos iniciais separada da entrada.",
    ],
  },
  busca_autonoma: {
    strength: () => "Você já está em movimento e prefere manter o controle direto da busca.",
    bottleneck: () => "O risco agora é comparar anúncios sem um critério financeiro e documental comum.",
    recommended: "guia",
    accessible: "gratuito",
    steps: () => [
      "Definir um teto de custo total, não apenas de preço anunciado.",
      "Usar o mesmo checklist em todas as visitas.",
      "Registrar diferenças de proposta, condomínio e documentação.",
    ],
  },
  busca_orientada: {
    strength: () => "Você já tem opções reais para comparar, o que torna a orientação mais objetiva.",
    bottleneck: (_result, answers) =>
      `Sua necessidade principal é ${needLabels[answers.mainNeed].toLowerCase()} com critérios mais claros.`,
    recommended: "consultoria",
    accessible: "guia",
    steps: () => [
      "Organizar as opções encontradas em uma comparação única.",
      "Separar preço anunciado de custo total da compra.",
      "Preparar perguntas para proposta, crédito e documentação.",
    ],
  },
  acompanhamento: {
    strength: () => "Você já identificou que prefere dividir decisões e etapas da busca.",
    bottleneck: () => "A necessidade não é apenas informação: é apoio durante busca, visitas ou propostas.",
    recommended: "assessoria",
    accessible: "consultoria",
    steps: () => [
      "Definir critérios de busca e limites de orçamento.",
      "Organizar um roteiro consistente para visitas.",
      "Comparar propostas antes de assumir compromissos.",
    ],
  },
  negociacao: {
    strength: () => "Você já chegou a uma opção concreta e consegue concentrar a análise na reta final.",
    bottleneck: (_result, answers) =>
      `O ponto de atenção declarado foi ${needLabels[answers.mainNeed].toLowerCase()}.`,
    recommended: "consultoria",
    accessible: "gratuito",
    steps: () => [
      "Organizar todas as condições recebidas por escrito.",
      "Separar custos imediatos, prazos e documentos pendentes.",
      "Evitar assinatura ou pagamento antes de esclarecer as dúvidas principais.",
    ],
  },
};

export function classifyRecommendation(
  result: ScenarioResult,
  answers: DiagnosticAnswers
): RecommendationClass {
  const { moment, mainNeed, supportPreference } = answers;

  if (moment === "negociando") return "negociacao";
  if (result.incomeCommitment > 40) return "ajuste_orcamento";
  if (mainNeed === "formar_entrada" || result.downPaymentPercent < 10) return "formacao_entrada";
  if (supportPreference === "acompanhamento" || mainNeed === "busca_visitas") return "acompanhamento";

  if (moment === "entendendo") {
    return mainNeed === "processo" && supportPreference === "orientacao"
      ? "preparacao_assistida"
      : "exploracao";
  }

  if (moment === "organizando") {
    if (supportPreference === "orientacao") return "preparacao_assistida";
    if (mainNeed === "capacidade" && result.incomeCommitment > 30) return "ajuste_orcamento";
    if (mainNeed === "documentos") return "exploracao";
    return supportPreference === "autonomia" ? "exploracao" : "preparacao_assistida";
  }

  if (moment === "proximos_meses") {
    if (mainNeed === "montar_plano") return "preparacao_assistida";
    return result.level === "busca" ? "pronto_para_confirmar" : "formacao_entrada";
  }

  if (moment === "procurando") {
    if (supportPreference === "autonomia") return "busca_autonoma";
    return "busca_orientada";
  }

  return "exploracao";
}

export function getRecommendationDecision(
  result: ScenarioResult,
  answers: DiagnosticAnswers
): RecommendationDecision {
  const recommendationClass = classifyRecommendation(result, answers);
  const content = decisionContent[recommendationClass];
  const recommended = option(content.recommended, "recommended");
  const accessibleId =
    content.accessible === content.recommended
      ? content.recommended === "gratuito"
        ? "guia"
        : "gratuito"
      : content.accessible;

  return {
    recommendationClass,
    primaryStrength: content.strength(result),
    mainBottleneck: content.bottleneck(result, answers),
    recommended,
    accessibleAlternative: option(accessibleId, "accessible"),
    personalizedOption: option("consultoria", "personalized"),
    completeOption: option("assessoria", "complete"),
    nextSteps: content.steps(result, answers),
  };
}

export function buildWhatsAppMessage(
  result: ScenarioResult,
  answers?: Partial<DiagnosticAnswers>
) {
  const lines = [
    "Olá! Comecei meu diagnóstico na /3inteligencia.",
    "",
    `Imóvel: ${formatCurrency(result.propertyValue)}`,
    `Entrada: ${formatCurrency(result.consideredDownPayment)}`,
    `Renda familiar: ${formatCurrency(result.monthlyIncome)}`,
  ];

  if (answers?.moment) lines.push(`Momento: ${momentLabels[answers.moment]}`);
  if (answers?.mainNeed) lines.push(`Principal necessidade: ${needLabels[answers.mainNeed]}`);
  if (answers?.supportPreference) {
    lines.push(`Preferência de apoio: ${supportLabels[answers.supportPreference]}`);
  }

  lines.push("", "Preferi conversar com vocês a partir daqui.");
  return lines.join("\n");
}
