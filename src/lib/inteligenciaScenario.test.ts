import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateScenario,
  getRecommendationDecision,
  type DiagnosticAnswers,
  type ScenarioInput,
} from "./inteligenciaScenario.ts";
import {
  MiniReportSchema,
  buildDeterministicReport,
  buildModelContext,
  validateReportSemantics,
} from "./inteligenciaReport.ts";

function decide(input: ScenarioInput, answers: DiagnosticAnswers) {
  return getRecommendationDecision(calculateScenario(input), answers);
}

test("entrada baixa com renda compatível prioriza formação da entrada, não consultoria", () => {
  const decision = decide(
    { propertyValue: 225000, downPayment: 20000, monthlyIncome: 9000 },
    { moment: "organizando", mainNeed: "formar_entrada" }
  );

  assert.equal(decision.recommendationClass, "formacao_entrada");
  assert.equal(decision.recommended.id, "gratuito");
  assert.equal(decision.completeOption.id, "assessoria");
});

test("formação de entrada declarada não produz meta de R$ 0 quando a referência já foi alcançada", () => {
  const decision = decide(
    { propertyValue: 350000, downPayment: 70000, monthlyIncome: 9000 },
    { moment: "organizando", mainNeed: "formar_entrada" }
  );

  assert.equal(decision.recommendationClass, "formacao_entrada");
  assert.ok(!decision.mainBottleneck.includes("R$ 0"));
  assert.ok(decision.nextSteps.every((step) => !step.includes("R$ 0")));
});

test("comprometimento muito alto prioriza ajuste de orçamento", () => {
  const decision = decide(
    { propertyValue: 600000, downPayment: 30000, monthlyIncome: 5000 },
    { moment: "organizando", mainNeed: "capacidade", supportPreference: "orientacao" }
  );

  assert.equal(decision.recommendationClass, "ajuste_orcamento");
  assert.equal(decision.recommended.id, "gratuito");
});

test("autonomia durante a busca favorece guia", () => {
  const decision = decide(
    { propertyValue: 300000, downPayment: 80000, monthlyIncome: 12000 },
    { moment: "procurando", mainNeed: "pesquisando", supportPreference: "autonomia" }
  );

  assert.equal(decision.recommendationClass, "busca_autonoma");
  assert.equal(decision.recommended.id, "guia");
});

test("orientação durante a busca favorece consultoria", () => {
  const decision = decide(
    { propertyValue: 300000, downPayment: 80000, monthlyIncome: 12000 },
    { moment: "procurando", mainNeed: "visitou_opcoes", supportPreference: "orientacao" }
  );

  assert.equal(decision.recommendationClass, "busca_orientada");
  assert.equal(decision.recommended.id, "consultoria");
});

test("pedido explícito de acompanhamento favorece assessoria", () => {
  const decision = decide(
    { propertyValue: 350000, downPayment: 90000, monthlyIncome: 14000 },
    { moment: "proximos_meses", mainNeed: "busca_visitas" }
  );

  assert.equal(decision.recommendationClass, "acompanhamento");
  assert.equal(decision.recommended.id, "assessoria");
});

test("risco financeiro alto vence preferência pelo serviço mais caro", () => {
  const decision = decide(
    { propertyValue: 650000, downPayment: 30000, monthlyIncome: 5000 },
    {
      moment: "procurando",
      mainNeed: "agendando_visitas",
      supportPreference: "acompanhamento",
    }
  );

  assert.equal(decision.recommendationClass, "ajuste_orcamento");
  assert.equal(decision.recommended.id, "gratuito");
  assert.equal(decision.completeOption.id, "assessoria");
});

test("negociação sempre recebe orientação de reta final", () => {
  const decision = decide(
    { propertyValue: 350000, downPayment: 90000, monthlyIncome: 14000 },
    { moment: "negociando", mainNeed: "proposta_clausulas" }
  );

  assert.equal(decision.recommendationClass, "negociacao");
  assert.equal(decision.recommended.id, "consultoria");
});

test("a escada completa permanece disponível em todos os cenários", () => {
  const cases: Array<[ScenarioInput, DiagnosticAnswers]> = [
    [
      { propertyValue: 225000, downPayment: 20000, monthlyIncome: 9000 },
      { moment: "organizando", mainNeed: "formar_entrada" },
    ],
    [
      { propertyValue: 300000, downPayment: 80000, monthlyIncome: 12000 },
      { moment: "procurando", mainNeed: "pesquisando", supportPreference: "autonomia" },
    ],
    [
      { propertyValue: 350000, downPayment: 90000, monthlyIncome: 14000 },
      { moment: "proximos_meses", mainNeed: "busca_visitas" },
    ],
  ];

  for (const [input, answers] of cases) {
    const decision = decide(input, answers);
    assert.equal(decision.personalizedOption.id, "consultoria");
    assert.equal(decision.completeOption.id, "assessoria");
  }
});

test("matriz básica não concentra todas as recomendações no mesmo produto", () => {
  const decisions = [
    decide(
      { propertyValue: 225000, downPayment: 20000, monthlyIncome: 9000 },
      { moment: "organizando", mainNeed: "formar_entrada" }
    ),
    decide(
      { propertyValue: 300000, downPayment: 80000, monthlyIncome: 12000 },
      { moment: "procurando", mainNeed: "pesquisando", supportPreference: "autonomia" }
    ),
    decide(
      { propertyValue: 300000, downPayment: 80000, monthlyIncome: 12000 },
      { moment: "procurando", mainNeed: "visitou_opcoes", supportPreference: "orientacao" }
    ),
    decide(
      { propertyValue: 350000, downPayment: 90000, monthlyIncome: 14000 },
      { moment: "proximos_meses", mainNeed: "busca_visitas" }
    ),
  ];

  assert.ok(new Set(decisions.map((decision) => decision.recommended.id)).size >= 4);
});

test("relatório local obedece ao mesmo contrato e guardrails da saída Groq", () => {
  const answers: DiagnosticAnswers = {
    moment: "organizando",
    mainNeed: "formar_entrada",
  };
  const scenario = calculateScenario({
    propertyValue: 225000,
    downPayment: 20000,
    monthlyIncome: 9000,
  });
  const decision = getRecommendationDecision(scenario, answers);
  const report = buildDeterministicReport(scenario, answers, decision);
  const context = buildModelContext(scenario, answers, decision);

  assert.ok(MiniReportSchema.safeParse(report).success);
  assert.ok(validateReportSemantics(report, context));
});

test("guardrail aceita percentual equivalente com formatação brasileira", () => {
  const answers: DiagnosticAnswers = {
    moment: "organizando",
    mainNeed: "formar_entrada",
  };
  const scenario = calculateScenario({
    propertyValue: 225000,
    downPayment: 20000,
    monthlyIncome: 9000,
  });
  const decision = getRecommendationDecision(scenario, answers);
  const report = buildDeterministicReport(scenario, answers, decision);
  const context = buildModelContext(scenario, answers, decision);

  report.educational_notice += " A referência de custos iniciais usada foi 4,5%.";

  assert.ok(validateReportSemantics(report, context));
});

test("guardrail rejeita percentual ausente do contexto", () => {
  const answers: DiagnosticAnswers = {
    moment: "organizando",
    mainNeed: "formar_entrada",
  };
  const scenario = calculateScenario({
    propertyValue: 225000,
    downPayment: 20000,
    monthlyIncome: 9000,
  });
  const decision = getRecommendationDecision(scenario, answers);
  const report = buildDeterministicReport(scenario, answers, decision);
  const context = buildModelContext(scenario, answers, decision);

  report.educational_notice += " Uma taxa hipotética seria 99,9%.";

  assert.equal(validateReportSemantics(report, context), false);
});
