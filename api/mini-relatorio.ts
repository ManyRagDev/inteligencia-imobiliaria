import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  calculateScenario,
  getRecommendationDecision,
  type DiagnosticAnswers,
} from "../src/lib/inteligenciaScenario.ts";
import {
  MiniReportSchema,
  REPORT_SYSTEM_PROMPT,
  buildDeterministicReport,
  buildModelContext,
  getReportSemanticError,
  getUnexpectedReportNumbers,
  type ReportFallbackReason,
  type ReportDebugStep,
  type ReportDebugTrace,
} from "../src/lib/inteligenciaReport.ts";

interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

const RequestSchema = z
  .object({
    propertyValue: z.number().min(150000).max(1200000),
    downPayment: z.number().min(0).max(1200000),
    monthlyIncome: z.number().min(3000).max(50000),
    moment: z.enum(["entendendo", "organizando", "proximos_meses", "procurando", "negociando"]),
    mainNeed: z.enum([
      "financiamento",
      "custos",
      "documentos",
      "processo",
      "capacidade",
      "formar_entrada",
      "mcmv",
      "comecar",
      "seguir_sozinho",
      "montar_plano",
      "busca_visitas",
      "pesquisando",
      "agendando_visitas",
      "visitou_opcoes",
      "custos_documentos",
      "proposta_clausulas",
      "credito_final",
      "orientacao_geral",
    ]),
    supportPreference: z.enum(["autonomia", "orientacao", "acompanhamento"]).optional(),
  })
  .strict();

const reportJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string" },
    opening: { type: "string" },
    financial_reading: { type: "string" },
    main_discovery: { type: "string" },
    variables_to_investigate: { type: "string" },
    next_steps: {
      type: "array",
      items: { type: "string" },
    },
    recommendation_reason: { type: "string" },
    autonomy_message: { type: "string" },
    educational_notice: { type: "string" },
  },
  required: [
    "headline",
    "opening",
    "financial_reading",
    "main_discovery",
    "variables_to_investigate",
    "next_steps",
    "recommendation_reason",
    "autonomy_message",
    "educational_notice",
  ],
} as const;

const requestsByIp = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = requestsByIp.get(ip);
  if (!current || current.resetAt <= now) {
    requestsByIp.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
}

function parseBody(body: unknown) {
  if (typeof body === "string") return JSON.parse(body);
  return body;
}

class ReportGenerationError extends Error {
  readonly reason: ReportFallbackReason;
  readonly providerStatus?: number;

  constructor(
    reason: ReportFallbackReason,
    message: string,
    providerStatus?: number
  ) {
    super(message);
    this.reason = reason;
    this.providerStatus = providerStatus;
  }
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  // TEMP_GROQ_DEBUG_START: remove this trace block with the temporary on-page inspector.
  const debugHeader = request.headers["x-report-debug"];
  const debugEnabled =
    process.env.GROQ_DEBUG === "1" ||
    (Array.isArray(debugHeader) ? debugHeader[0] : debugHeader) === "1";
  const debugSteps: ReportDebugStep[] = [];
  const addDebugStep = (
    label: string,
    status: ReportDebugStep["status"],
    data?: unknown
  ) => {
    if (!debugEnabled) return;
    debugSteps.push({
      atMs: Date.now() - startedAt,
      label,
      status,
      data,
    });
  };
  const getDebugTrace = (): ReportDebugTrace | undefined =>
    debugEnabled
      ? {
          temporaryMarker: "TEMP_GROQ_DEBUG",
          requestId,
          startedAt: new Date(startedAt).toISOString(),
          steps: debugSteps,
        }
      : undefined;
  // TEMP_GROQ_DEBUG_END
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Request-Id", requestId);

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Método não permitido." });
  }

  const forwarded = request.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return response.status(429).json({ error: "Muitas tentativas. Aguarde um minuto." });
  }

  let parsedBody: unknown;
  try {
    if (typeof request.body === "string" && request.body.length > 5_000) {
      return response.status(413).json({ error: "Corpo da requisição muito grande." });
    }
    parsedBody = parseBody(request.body);
  } catch {
    return response.status(400).json({ error: "JSON inválido." });
  }

  const validation = RequestSchema.safeParse(parsedBody);
  if (!validation.success) {
    return response.status(400).json({ error: "Dados do diagnóstico inválidos." });
  }
  addDebugStep("Requisição recebida pelo endpoint", "info", {
    method: request.method,
    path: "/api/mini-relatorio",
    body: validation.data,
  });

  const { propertyValue, downPayment, monthlyIncome, ...answerData } = validation.data;
  const answers = answerData as DiagnosticAnswers;
  const scenario = calculateScenario({ propertyValue, downPayment, monthlyIncome });
  const decision = getRecommendationDecision(scenario, answers);
  const fallback = buildDeterministicReport(scenario, answers, decision);
  const context = buildModelContext(scenario, answers, decision);
  const apiKey = process.env.GROQ_API_KEY;
  addDebugStep("Cenário e recomendação calculados localmente", "success", {
    scenario,
    decision,
    deterministicFallback: fallback,
  });

  if (!apiKey) {
    const durationMs = Date.now() - startedAt;
    addDebugStep("Chamada à Groq não realizada", "error", {
      reason: "missing_api_key",
    });
    console.warn(
      JSON.stringify({
        event: "mini_report_fallback",
        requestId,
        reason: "missing_api_key",
        durationMs,
      })
    );
    return response.status(200).json({
      report: fallback,
      source: "deterministic",
      decision,
      scenario,
      audit: {
        requestId,
        source: "deterministic",
        durationMs,
        fallbackReason: "missing_api_key",
      },
      debug: getDebugTrace(),
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  const groqPayload = {
    model,
    temperature: 0.35,
    reasoning_effort: "low",
    max_completion_tokens: 3000,
    messages: [
      { role: "system", content: REPORT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Escreva o relatório usando somente este contexto:\n${JSON.stringify(context)}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pinheiro_azul_mini_report",
        strict: true,
        schema: reportJsonSchema,
      },
    },
  };
  addDebugStep("Payload preparado para a Groq", "info", {
    url: "https://api.groq.com/openai/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "[REDACTED]",
    },
    body: groqPayload,
  });

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(groqPayload),
    });

    const groqResponseText = await groqResponse.text();
    let groqResponseBody: unknown = groqResponseText;
    try {
      groqResponseBody = JSON.parse(groqResponseText);
    } catch {
      // Keep the raw provider response in the temporary trace.
    }
    addDebugStep(
      "Resposta HTTP recebida da Groq",
      groqResponse.ok ? "success" : "error",
      {
        status: groqResponse.status,
        statusText: groqResponse.statusText,
        body: groqResponseBody,
      }
    );

    if (!groqResponse.ok) {
      throw new ReportGenerationError(
        "groq_http_error",
        `Groq respondeu ${groqResponse.status}`,
        groqResponse.status
      );
    }

    const completion = groqResponseBody as {
      choices?: Array<{ message?: { content?: string | null } }>;
      usage?: unknown;
    };
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new ReportGenerationError("empty_response", "Resposta vazia");
    }

    let parsedReport: unknown;
    try {
      parsedReport = JSON.parse(content);
      addDebugStep("Conteúdo JSON da resposta interpretado", "success", parsedReport);
    } catch {
      addDebugStep("Falha ao interpretar o conteúdo como JSON", "error", {
        content,
      });
      throw new ReportGenerationError("invalid_json", "JSON inválido retornado pela Groq");
    }

    const reportValidation = MiniReportSchema.safeParse(parsedReport);
    if (!reportValidation.success) {
      addDebugStep("Validação estrutural Zod reprovada", "error", {
        issues: reportValidation.error.issues,
      });
      throw new ReportGenerationError(
        "invalid_report_schema",
        "Resposta fora do contrato do relatório"
      );
    }
    const report = reportValidation.data;
    addDebugStep("Validação estrutural Zod aprovada", "success");
    const semanticError = getReportSemanticError(report, context);
    if (semanticError) {
      addDebugStep("Guardrails semânticos reprovaram a resposta", "error", {
        reason: semanticError,
        unexpectedNumbers: getUnexpectedReportNumbers(report, context),
      });
      if (process.env.GROQ_DEBUG === "1") {
        console.error(
          "[mini-relatorio] Números inesperados:",
          getUnexpectedReportNumbers(report, context)
        );
      }
      throw new ReportGenerationError(
        "semantic_guardrail",
        `Resposta reprovada pelos guardrails semânticos: ${semanticError}`
      );
    }
    addDebugStep("Guardrails semânticos aprovados", "success");

    const durationMs = Date.now() - startedAt;
    addDebugStep("Relatório Groq entregue ao frontend", "success", {
      source: "groq",
      durationMs,
      usage: completion.usage,
    });
    console.info(
      JSON.stringify({
        event: "mini_report_success",
        requestId,
        source: "groq",
        model,
        durationMs,
      })
    );
    return response.status(200).json({
      report,
      source: "groq",
      decision,
      scenario,
      audit: {
        requestId,
        source: "groq",
        model,
        durationMs,
      },
      debug: getDebugTrace(),
    });
  } catch (error) {
    const reason: ReportFallbackReason =
      error instanceof ReportGenerationError
        ? error.reason
        : error instanceof Error && error.name === "AbortError"
          ? "timeout"
          : error instanceof TypeError
            ? "network_error"
            : "unknown_error";
    const providerStatus =
      error instanceof ReportGenerationError ? error.providerStatus : undefined;
    const durationMs = Date.now() - startedAt;
    addDebugStep("Fallback determinístico entregue ao frontend", "error", {
      reason,
      providerStatus,
      durationMs,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
    console.error(
      JSON.stringify({
        event: "mini_report_fallback",
        requestId,
        reason,
        providerStatus,
        durationMs,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      })
    );
    return response.status(200).json({
      report: fallback,
      source: "deterministic",
      decision,
      scenario,
      audit: {
        requestId,
        source: "deterministic",
        durationMs,
        model,
        fallbackReason: reason,
        providerStatus,
      },
      debug: getDebugTrace(),
    });
  } finally {
    clearTimeout(timeout);
  }
}
