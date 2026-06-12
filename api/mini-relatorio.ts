import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  calculateScenario,
  getRecommendationDecision,
  type DiagnosticAnswers,
} from "../src/lib/inteligenciaScenario.ts";
import {
  AiReportCopySchema,
  REPORT_SYSTEM_PROMPT,
  buildDeterministicReport,
  buildModelContext,
  getAiCopySemanticError,
  mergeAiCopy,
  type ReportFallbackReason,
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
    propertyValue: z.number().finite().positive().max(100_000_000),
    downPayment: z.number().finite().min(0).max(100_000_000),
    monthlyIncome: z.number().finite().positive().max(10_000_000),
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
  .strict()
  .superRefine((value, context) => {
    if (value.downPayment > value.propertyValue) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["downPayment"],
        message: "A entrada não pode superar o valor do imóvel.",
      });
    }
  });

const aiCopyJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string" },
    opening: { type: "string" },
    autonomy_message: { type: "string" },
  },
  required: ["headline", "opening", "autonomy_message"],
} as const;

const requestsByIp = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;
const MAX_REQUEST_BYTES = 5_000;
const MAX_PROVIDER_RESPONSE_BYTES = 20_000;

function firstHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getClientIp(request: ApiRequest) {
  return (
    firstHeader(request.headers["x-vercel-forwarded-for"])?.split(",")[0]?.trim() ||
    firstHeader(request.headers["x-real-ip"])?.trim() ||
    "unknown"
  );
}

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

function hasAllowedOrigin(request: ApiRequest) {
  const origin = firstHeader(request.headers.origin);
  if (!origin) return true;

  const forwardedHost = firstHeader(request.headers["x-forwarded-host"]);
  const host = forwardedHost || firstHeader(request.headers.host);
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function parseBody(body: unknown) {
  if (typeof body === "string") return JSON.parse(body);
  return body;
}

class ReportGenerationError extends Error {
  readonly reason: ReportFallbackReason;
  readonly providerStatus?: number;

  constructor(reason: ReportFallbackReason, message: string, providerStatus?: number) {
    super(message);
    this.reason = reason;
    this.providerStatus = providerStatus;
  }
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Request-Id", requestId);
  response.setHeader("Vary", "Origin");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Método não permitido." });
  }

  if (!hasAllowedOrigin(request)) {
    return response.status(403).json({ error: "Origem não permitida." });
  }

  const contentType = firstHeader(request.headers["content-type"])?.toLowerCase() || "";
  if (!contentType.startsWith("application/json")) {
    return response.status(415).json({ error: "Use Content-Type application/json." });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    response.setHeader("Retry-After", "60");
    return response.status(429).json({ error: "Muitas tentativas. Aguarde um minuto." });
  }

  let parsedBody: unknown;
  try {
    if (typeof request.body === "string" && Buffer.byteLength(request.body, "utf8") > MAX_REQUEST_BYTES) {
      return response.status(413).json({ error: "Corpo da requisição muito grande." });
    }
    parsedBody = parseBody(request.body);
  } catch {
    return response.status(400).json({ error: "JSON inválido." });
  }

  const validation = RequestSchema.safeParse(parsedBody);
  if (!validation.success) {
    console.warn(JSON.stringify({ event: "mini_report_invalid_input", requestId, ip }));
    return response.status(400).json({ error: "Dados do diagnóstico inválidos." });
  }

  const { propertyValue, downPayment, monthlyIncome, ...answerData } = validation.data;
  const answers = answerData as DiagnosticAnswers;
  const scenario = calculateScenario({ propertyValue, downPayment, monthlyIncome });
  const decision = getRecommendationDecision(scenario, answers);
  const fallback = buildDeterministicReport(scenario, answers, decision);
  const context = buildModelContext(scenario, answers, decision);
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    const durationMs = Date.now() - startedAt;
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
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  const groqPayload = {
    model,
    temperature: 0.2,
    reasoning_effort: "low",
    max_completion_tokens: 800,
    messages: [
      { role: "system", content: REPORT_SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({ controlled_context: context }),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pinheiro_azul_safe_copy",
        strict: true,
        schema: aiCopyJsonSchema,
      },
    },
  };

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

    if (!groqResponse.ok) {
      throw new ReportGenerationError(
        "groq_http_error",
        `Groq respondeu ${groqResponse.status}`,
        groqResponse.status
      );
    }

    const groqResponseText = await groqResponse.text();
    if (Buffer.byteLength(groqResponseText, "utf8") > MAX_PROVIDER_RESPONSE_BYTES) {
      throw new ReportGenerationError("invalid_json", "Resposta do provedor excedeu o limite.");
    }

    let groqResponseBody: unknown;
    try {
      groqResponseBody = JSON.parse(groqResponseText);
    } catch {
      throw new ReportGenerationError("invalid_json", "JSON inválido retornado pela Groq.");
    }

    const completion = groqResponseBody as {
      choices?: Array<{ message?: { content?: string | null } }>;
      usage?: unknown;
    };
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new ReportGenerationError("empty_response", "Resposta vazia.");
    }

    let parsedCopy: unknown;
    try {
      parsedCopy = JSON.parse(content);
    } catch {
      throw new ReportGenerationError("invalid_json", "Conteúdo inválido retornado pela Groq.");
    }

    const copyValidation = AiReportCopySchema.safeParse(parsedCopy);
    if (!copyValidation.success) {
      throw new ReportGenerationError(
        "invalid_report_schema",
        "Resposta fora do contrato de redação."
      );
    }

    const semanticError = getAiCopySemanticError(copyValidation.data, context);
    if (semanticError) {
      console.warn(
        JSON.stringify({
          event: "mini_report_guardrail",
          requestId,
          reason: semanticError,
          feasibility: scenario.feasibility,
        })
      );
      throw new ReportGenerationError(
        "semantic_guardrail",
        `Redação externa reprovada: ${semanticError}`
      );
    }

    const report = mergeAiCopy(fallback, copyValidation.data);
    const durationMs = Date.now() - startedAt;
    console.info(
      JSON.stringify({
        event: "mini_report_success",
        requestId,
        source: "groq",
        model,
        durationMs,
        feasibility: scenario.feasibility,
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

    console.error(
      JSON.stringify({
        event: "mini_report_fallback",
        requestId,
        reason,
        providerStatus,
        durationMs,
        feasibility: scenario.feasibility,
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
    });
  } finally {
    clearTimeout(timeout);
  }
}
