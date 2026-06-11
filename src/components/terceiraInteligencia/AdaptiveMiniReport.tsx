import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  LoaderCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  buildWhatsAppMessage,
  getAdaptiveQuestion,
  getRecommendationDecision,
  momentLabels,
  momentOptions,
  needLabels,
  needsSupportQuestion,
  supportLabels,
  supportOptions,
  type DiagnosticAnswers,
  type MainNeed,
  type PurchaseMoment,
  type ScenarioResult,
  type ServiceOption,
  type SupportPreference,
} from "@/lib/inteligenciaScenario";
import {
  buildDeterministicReport,
  type MiniReport,
  type MiniReportAudit,
  type MiniReportResponse,
  type ReportDebugTrace,
  type ReportSource,
} from "@/lib/inteligenciaReport";

const WHATSAPP = "5511930418684";

interface AdaptiveMiniReportProps {
  result: ScenarioResult;
  reduceMotion: boolean;
}

type FlowStep = "moment" | "need" | "support" | "report";
type GenerationState = "idle" | "generating" | "success" | "fallback";
const reportDebugEnabled = import.meta.env.DEV || import.meta.env.VITE_REPORT_DEBUG === "1";

// TEMP_GROQ_DEBUG_START: remove this component with the temporary on-page Groq inspector.
function GroqDebugPanel({ traces }: { traces: ReportDebugTrace[] }) {
  if (!reportDebugEnabled || traces.length === 0) return null;

  return (
    <section className="border-2 border-dashed border-[#e43d30] bg-[#fff7f5] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e43d30]">
            TEMP_GROQ_DEBUG
          </p>
          <h4 className="mt-2 text-lg font-black uppercase">Log temporário da Groq</h4>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#415064]">
            Exibe dados financeiros informados, prompt, payload e resposta do provedor.
            A chave de API permanece removida.
          </p>
        </div>
        <span className="border border-[#06192c] bg-white px-3 py-2 font-mono text-[10px]">
          {traces.length} chamada{traces.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {traces.map((trace, traceIndex) => {
          const lastStep = trace.steps[trace.steps.length - 1];
          return (
            <details
              key={trace.requestId}
              open={traceIndex === 0}
              className="border border-[#06192c] bg-white"
            >
              <summary className="cursor-pointer list-none px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold">
                    #{traces.length - traceIndex} · {trace.requestId}
                  </span>
                  <span
                    className={`px-2 py-1 text-[9px] font-black uppercase ${
                      lastStep?.status === "success"
                        ? "bg-[#28c7ba]"
                        : lastStep?.status === "error"
                          ? "bg-[#e43d30] text-white"
                          : "bg-[#f3d35b]"
                    }`}
                  >
                    {lastStep?.label || "Em processamento"}
                  </span>
                </div>
                <p className="mt-2 font-mono text-[9px] text-[#415064]">
                  {trace.startedAt} · {trace.steps.length} etapas
                </p>
              </summary>

              <div className="border-t border-[#06192c] p-3 sm:p-4">
                <ol className="space-y-3">
                  {trace.steps.map((debugStep, stepIndex) => (
                    <li key={`${debugStep.atMs}-${debugStep.label}-${stepIndex}`}>
                      <details className="border border-[#aab3bd] bg-[#f8f8f6]">
                        <summary className="cursor-pointer px-3 py-2 font-mono text-[10px]">
                          <span className="font-black">+{debugStep.atMs}ms</span>
                          {" · "}
                          <span
                            className={
                              debugStep.status === "success"
                                ? "text-[#08776e]"
                                : debugStep.status === "error"
                                  ? "text-[#c02d23]"
                                  : "text-[#415064]"
                            }
                          >
                            {debugStep.label}
                          </span>
                        </summary>
                        {debugStep.data !== undefined && (
                          <pre className="max-h-[420px] overflow-auto border-t border-[#aab3bd] bg-[#06192c] p-3 text-[10px] leading-relaxed text-[#dce8f2]">
                            {JSON.stringify(debugStep.data, null, 2)}
                          </pre>
                        )}
                      </details>
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
// TEMP_GROQ_DEBUG_END

function SelectionCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 border border-[#06192c] px-4 py-3.5 text-left transition ${
        selected
          ? "bg-[#f3d35b] shadow-[4px_4px_0_#06192c]"
          : "bg-white hover:bg-[#f4f0e8]"
      }`}
    >
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border border-[#06192c] ${
          selected ? "bg-[#e43d30] text-white" : "bg-white"
        }`}
      >
        {selected && <Check size={13} />}
      </span>
      <span>
        <span className="block text-xs font-black leading-snug">{label}</span>
        {description && (
          <span className="mt-1 block text-[11px] leading-relaxed text-[#415064]">{description}</span>
        )}
      </span>
    </button>
  );
}

function ServiceCard({ option, href }: { option: ServiceOption; href: string }) {
  const styles: Record<ServiceOption["emphasis"], string> = {
    recommended: "bg-[#28c7ba] shadow-[5px_5px_0_#e43d30]",
    accessible: "bg-[#f3d35b] shadow-[4px_4px_0_#06192c]",
    personalized: "bg-[#fffdf7]",
    complete: "bg-[#06192c] text-white",
  };
  const labels: Record<ServiceOption["emphasis"], string> = {
    recommended: "Recomendado para seu momento",
    accessible: "Alternativa para começar",
    personalized: "Orientação personalizada",
    complete: "Acompanhamento completo disponível",
  };

  return (
    <article className={`border border-[#06192c] p-4 ${styles[option.emphasis]}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.16em] opacity-65">
        {labels[option.emphasis]}
      </p>
      <h5 className="mt-3 text-lg font-black uppercase leading-tight">{option.label}</h5>
      <p className="mt-2 text-xs leading-relaxed opacity-75">{option.description}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase underline-offset-4 hover:underline ${
          option.emphasis === "complete" ? "text-[#f3d35b]" : "text-[#06192c]"
        }`}
      >
        {option.cta}
        <ArrowRight size={13} />
      </a>
    </article>
  );
}

export function AdaptiveMiniReport({ result, reduceMotion }: AdaptiveMiniReportProps) {
  const [step, setStep] = useState<FlowStep>("moment");
  const [moment, setMoment] = useState<PurchaseMoment>();
  const [mainNeed, setMainNeed] = useState<MainNeed>();
  const [supportPreference, setSupportPreference] = useState<SupportPreference>();
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [report, setReport] = useState<MiniReport>();
  const [reportSource, setReportSource] = useState<ReportSource>("deterministic");
  const [reportAudit, setReportAudit] = useState<MiniReportAudit>();
  // TEMP_GROQ_DEBUG: remove this state with the temporary on-page Groq inspector.
  const [groqDebugTraces, setGroqDebugTraces] = useState<ReportDebugTrace[]>([]);
  const generationIdRef = useRef(0);

  useEffect(() => {
    generationIdRef.current += 1;
    setStep("moment");
    setMoment(undefined);
    setMainNeed(undefined);
    setSupportPreference(undefined);
    setGenerationState("idle");
    setReport(undefined);
    setReportAudit(undefined);
  }, [result.propertyValue, result.consideredDownPayment, result.monthlyIncome]);

  const partialAnswers = { moment, mainNeed, supportPreference };
  const contextualWhatsApp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    buildWhatsAppMessage(result, partialAnswers)
  )}`;

  const generateReport = async (answers: DiagnosticAnswers) => {
    const generationId = ++generationIdRef.current;
    const localDecision = getRecommendationDecision(result, answers);
    const localReport = buildDeterministicReport(result, answers, localDecision);

    setStep("report");
    setGenerationState("generating");
    setReport(undefined);
    setReportAudit(undefined);

    try {
      const requestPayload = {
        propertyValue: result.propertyValue,
        downPayment: result.consideredDownPayment,
        monthlyIncome: result.monthlyIncome,
        ...answers,
      };
      const response = await fetch("/api/mini-relatorio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(reportDebugEnabled ? { "X-Report-Debug": "1" } : {}),
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) throw new Error("Falha ao gerar relatório");
      const data = (await response.json()) as MiniReportResponse;
      if (generationId !== generationIdRef.current) return;
      console.info("[mini-relatorio]", data.audit);
      setReport(data.report);
      setReportSource(data.source);
      setReportAudit(data.audit);
      // TEMP_GROQ_DEBUG: remove this history update with the temporary inspector.
      if (data.debug) {
        setGroqDebugTraces((current) => [data.debug!, ...current].slice(0, 10));
      }
      setGenerationState(data.source === "groq" ? "success" : "fallback");
    } catch (error) {
      if (generationId !== generationIdRef.current) return;
      const clientAudit: MiniReportAudit = {
        requestId: crypto.randomUUID(),
        source: "deterministic",
        durationMs: 0,
        fallbackReason: "client_request_error",
      };
      console.error("[mini-relatorio]", clientAudit, error);
      // TEMP_GROQ_DEBUG_START: preserve client-side failures in the temporary inspector.
      if (reportDebugEnabled) {
        const clientDebugTrace: ReportDebugTrace = {
          temporaryMarker: "TEMP_GROQ_DEBUG",
          requestId: clientAudit.requestId,
          startedAt: new Date().toISOString(),
          steps: [
            {
              atMs: 0,
              label: "Falha no navegador antes de receber resposta válida da API",
              status: "error",
              data: {
                endpoint: "/api/mini-relatorio",
                message: error instanceof Error ? error.message : "Erro desconhecido",
              },
            },
          ],
        };
        setGroqDebugTraces((current) =>
          [clientDebugTrace, ...current].slice(0, 10)
        );
      }
      // TEMP_GROQ_DEBUG_END
      setReport(localReport);
      setReportSource("deterministic");
      setReportAudit(clientAudit);
      setGenerationState("fallback");
    }
  };

  const selectMoment = (value: PurchaseMoment) => {
    setMoment(value);
    setMainNeed(undefined);
    setSupportPreference(undefined);
    setStep("need");
  };

  const selectNeed = (value: MainNeed) => {
    if (!moment) return;
    setMainNeed(value);
    setSupportPreference(undefined);

    if (needsSupportQuestion(moment, value)) {
      setStep("support");
      return;
    }

    void generateReport({ moment, mainNeed: value });
  };

  const selectSupport = (value: SupportPreference) => {
    if (!moment || !mainNeed) return;
    setSupportPreference(value);
    void generateReport({ moment, mainNeed, supportPreference: value });
  };

  const goBack = () => {
    if (step === "need") setStep("moment");
    if (step === "support") setStep("need");
    if (step === "report") {
      setGenerationState("idle");
      setReport(undefined);
      setReportAudit(undefined);
      setStep(supportPreference ? "support" : "need");
    }
  };

  const completeAnswers =
    moment && mainNeed
      ? ({ moment, mainNeed, supportPreference } satisfies DiagnosticAnswers)
      : undefined;
  const decision = completeAnswers
    ? getRecommendationDecision(result, completeAnswers)
    : undefined;
  const finalWhatsApp =
    completeAnswers && decision
      ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
          `${buildWhatsAppMessage(result, completeAnswers)}\n\nRecomendação exibida: ${decision.recommended.label}.`
        )}`
      : contextualWhatsApp;

  const progress =
    step === "moment"
      ? "1 de até 3"
      : step === "need"
        ? "2 de até 3"
        : step === "support"
          ? "3 de 3"
          : "Mapa pronto";

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e43d30]">
            {progress}
          </span>
          {step !== "moment" && generationState !== "generating" && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase hover:underline"
            >
              <ArrowLeft size={13} />
              Voltar
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === "moment" && (
            <motion.div
              key="moment"
              initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduceMotion ? 0 : -16 }}
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e43d30]">
                Seu momento
              </p>
              <h3 className="mt-3 text-3xl font-black uppercase leading-none">
                Qual frase parece mais com você hoje?
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#415064]">
                São poucas perguntas. Cada resposta substitui a anterior e muda o seu encaminhamento.
              </p>
              <div className="mt-6 space-y-2.5">
                {momentOptions.map((option) => (
                  <SelectionCard
                    key={option.id}
                    label={option.label}
                    selected={moment === option.id}
                    onClick={() => selectMoment(option.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === "need" && moment && (
            <motion.div
              key={`need-${moment}`}
              initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduceMotion ? 0 : -16 }}
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e43d30]">
                {momentLabels[moment]}
              </p>
              <h3 className="mt-3 text-3xl font-black uppercase leading-none">
                {getAdaptiveQuestion(moment).question}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#415064]">
                {getAdaptiveQuestion(moment).lead}
              </p>
              <div className="mt-6 space-y-2.5">
                {getAdaptiveQuestion(moment).options.map((option) => (
                  <SelectionCard
                    key={option.id}
                    label={option.label}
                    description={option.description}
                    selected={mainNeed === option.id}
                    onClick={() => selectNeed(option.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === "support" && moment && mainNeed && (
            <motion.div
              key={`support-${mainNeed}`}
              initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduceMotion ? 0 : -16 }}
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e43d30]">
                Só quando faz diferença
              </p>
              <h3 className="mt-3 text-3xl font-black uppercase leading-none">
                Como você prefere seguir?
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#415064]">
                A resposta define o tamanho do apoio, sem esconder as alternativas.
              </p>
              <div className="mt-6 space-y-2.5">
                {supportOptions.map((option) => (
                  <SelectionCard
                    key={option.id}
                    label={option.label}
                    description={option.description}
                    selected={supportPreference === option.id}
                    onClick={() => selectSupport(option.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === "report" && generationState === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid min-h-[360px] place-items-center border border-[#06192c] bg-[#f4f0e8] p-8 text-center"
            >
              <div>
                <LoaderCircle
                  className={`mx-auto text-[#e43d30] ${reduceMotion ? "" : "animate-spin"}`}
                  size={34}
                />
                <h3 className="mt-5 text-2xl font-black uppercase">
                  Organizando seu mini mapa
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#415064]">
                  Cruzando os cálculos com o seu momento para escrever uma leitura inicial.
                </p>
              </div>
            </motion.div>
          )}

          {step === "report" && report && decision && generationState !== "generating" && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border border-[#06192c] bg-[#f3d35b] p-5 shadow-[6px_6px_0_#e43d30] sm:p-7">
                <span className="inline-flex items-center gap-2 border border-[#06192c] bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.17em]">
                  {reportSource === "groq" && <Sparkles size={13} />}
                  Seu mini relatório gratuito
                </span>
                {reportDebugEnabled && reportAudit && (
                  <div className="mt-3 border border-[#06192c] bg-white/80 px-3 py-2 font-mono text-[9px] leading-relaxed">
                    Origem: {reportAudit.source}
                    {" | "}ID: {reportAudit.requestId}
                    {" | "}{reportAudit.durationMs}ms
                    {reportAudit.fallbackReason && (
                      <>
                        {" | "}Fallback: {reportAudit.fallbackReason}
                      </>
                    )}
                    {reportAudit.providerStatus && (
                      <>
                        {" | "}HTTP Groq: {reportAudit.providerStatus}
                      </>
                    )}
                  </div>
                )}
                <h3 className="mt-6 text-3xl font-black uppercase leading-[0.95]">
                  {report.headline}
                </h3>
                <p className="mt-5 text-sm font-bold leading-relaxed">{report.opening}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <article className="border border-[#06192c] bg-white p-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e43d30]">
                    Leitura financeira
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#27394d]">
                    {report.financial_reading}
                  </p>
                </article>
                <article className="border border-[#06192c] bg-[#28c7ba] p-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em]">
                    Principal descoberta
                  </p>
                  <p className="mt-3 text-sm font-bold leading-relaxed">{report.main_discovery}</p>
                </article>
              </div>

              <article className="border border-[#06192c] bg-[#06192c] p-5 text-white">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#28c7ba]">
                  O que uma análise individual investigaria
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {report.variables_to_investigate}
                </p>
              </article>

              <article className="border border-[#06192c] bg-white p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e43d30]">
                  Três próximos passos
                </p>
                <ol className="mt-4 space-y-3">
                  {report.next_steps.map((item, index) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed">
                      <span className="grid h-6 w-6 shrink-0 place-items-center border border-[#06192c] bg-[#f3d35b] text-[10px] font-black">
                        {index + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </article>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#28c7ba]" />
                  <h4 className="text-sm font-black uppercase">Sua escada de atendimento</h4>
                </div>
                <p className="mb-5 text-sm leading-relaxed text-[#415064]">
                  {report.recommendation_reason} {report.autonomy_message}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ServiceCard option={decision.recommended} href={finalWhatsApp} />
                  <ServiceCard option={decision.accessibleAlternative} href={finalWhatsApp} />
                  {decision.personalizedOption.id !== decision.recommended.id && (
                    <ServiceCard option={decision.personalizedOption} href={finalWhatsApp} />
                  )}
                  {decision.completeOption.id !== decision.recommended.id && (
                    <ServiceCard option={decision.completeOption} href={finalWhatsApp} />
                  )}
                </div>
              </div>

              <div className="flex gap-3 border border-[#06192c] bg-[#f4f0e8] p-4 text-xs leading-relaxed">
                <FileText className="mt-0.5 shrink-0" size={17} />
                <div>
                  <p>{report.educational_notice}</p>
                  {reportSource === "deterministic" && (
                    <p className="mt-2 font-bold">
                      A leitura segura local foi usada; seu mapa continua completo mesmo sem geração externa.
                    </p>
                  )}
                </div>
              </div>

              {/* TEMP_GROQ_DEBUG: remove this panel when the Groq audit is no longer needed. */}
              <GroqDebugPanel traces={groqDebugTraces} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <aside className="self-start border border-[#06192c] bg-[#06192c] p-5 text-white lg:sticky lg:top-24">
        <MessageSquare className="text-[#28c7ba]" size={24} />
        <h4 className="mt-5 text-xl font-black uppercase leading-tight">
          Prefere conversar agora?
        </h4>
        <p className="mt-3 text-xs leading-relaxed text-white/70">
          Você não precisa concluir o diagnóstico. A mensagem leva os números e as respostas que já informou.
        </p>
        <a
          href={step === "report" ? finalWhatsApp : contextualWhatsApp}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex w-full items-center justify-between border border-white bg-[#f3d35b] px-4 py-3 text-xs font-black uppercase text-[#06192c] transition hover:bg-white"
        >
          Chamar no WhatsApp
          <ArrowRight size={16} />
        </a>
        <div className="mt-5 border-t border-white/20 pt-4">
          <p className="flex items-start gap-2 text-[10px] leading-relaxed text-white/55">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[#28c7ba]" size={14} />
            Sem formulário de contato e sem obrigação de contratar.
          </p>
        </div>
      </aside>
    </div>
  );
}
