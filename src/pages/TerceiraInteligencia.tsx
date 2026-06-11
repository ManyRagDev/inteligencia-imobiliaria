import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  Gauge,
  Home,
  Info,
  MessageSquare,
  Route,
  WalletCards,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { AdaptiveMiniReport } from "@/components/terceiraInteligencia/AdaptiveMiniReport";
import { BrutalSlider } from "@/components/terceiraInteligencia/BrutalSlider";
import {
  calculateScenario,
  formatCurrency,
} from "@/lib/inteligenciaScenario";

const WHATSAPP = "5511930418684";

const tabs = [
  { id: "cenario", label: "Seu cenário", shortLabel: "Cenário", icon: Gauge },
  { id: "custos", label: "Custos esquecidos", shortLabel: "Custos", icon: CircleDollarSign },
  { id: "renda", label: "Parcela e renda", shortLabel: "Renda", icon: WalletCards },
  { id: "atencao", label: "Pontos de atenção", shortLabel: "Atenção", icon: AlertTriangle },
  { id: "proximo", label: "Próximo passo", shortLabel: "Próximo", icon: Route },
] as const;

type TabId = (typeof tabs)[number]["id"];

function MetricCard({
  label,
  value,
  note,
  tone = "cream",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "cream" | "yellow" | "teal" | "coral";
}) {
  const tones = {
    cream: "bg-[#fffdf7]",
    yellow: "bg-[#f3d35b]",
    teal: "bg-[#28c7ba]",
    coral: "bg-[#e43d30] text-white",
  };

  return (
    <article className={`border border-[#06192c] p-4 shadow-[4px_4px_0_#06192c] ${tones[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-65">{label}</p>
      <p className="mt-3 text-xl font-black leading-none tabular-nums sm:text-2xl">{value}</p>
      <p className="mt-3 text-xs leading-relaxed opacity-75">{note}</p>
    </article>
  );
}

export default function TerceiraInteligencia() {
  const reduceMotion = Boolean(useReducedMotion());
  const [propertyValue, setPropertyValue] = useState(350000);
  const [downPayment, setDownPayment] = useState(70000);
  const [monthlyIncome, setMonthlyIncome] = useState(9000);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("cenario");
  const resultsRef = useRef<HTMLElement>(null);

  const maximumDownPayment = Math.max(5000, Math.floor(propertyValue / 5000) * 5000);
  const result = useMemo(
    () => calculateScenario({ propertyValue, downPayment, monthlyIncome }),
    [propertyValue, downPayment, monthlyIncome]
  );
  const updatePropertyValue = (value: number) => {
    setPropertyValue(value);
    setDownPayment((current) => Math.min(current, value));
  };

  const revealResults = () => {
    setShowResults(true);
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f0e8] text-[#06192c] selection:bg-[#e43d30] selection:text-white">
      <style>{`
        .inteligencia3-grid {
          background-image:
            linear-gradient(rgba(6, 25, 44, .07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 25, 44, .07) 1px, transparent 1px);
          background-size: 34px 34px;
        }
        .inteligencia3-range {
          appearance: none;
          height: 6px;
          border: 1px solid #06192c;
          background: #f4f0e8;
          cursor: pointer;
        }
        .inteligencia3-range::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border: 2px solid #06192c;
          box-shadow: 3px 3px 0 #06192c;
        }
        .inteligencia3-range::-moz-range-thumb {
          width: 21px;
          height: 21px;
          border: 2px solid #06192c;
          border-radius: 0;
          box-shadow: 3px 3px 0 #06192c;
        }
        .inteligencia3-range-coral::-webkit-slider-thumb { background: #e43d30; }
        .inteligencia3-range-teal::-webkit-slider-thumb { background: #28c7ba; }
        .inteligencia3-range-yellow::-webkit-slider-thumb { background: #f3d35b; }
        .inteligencia3-range-coral::-moz-range-thumb { background: #e43d30; }
        .inteligencia3-range-teal::-moz-range-thumb { background: #28c7ba; }
        .inteligencia3-range-yellow::-moz-range-thumb { background: #f3d35b; }
        .inteligencia3-range:focus-visible {
          outline: 3px solid #28c7ba;
          outline-offset: 5px;
        }
        .inteligencia3-panel {
          width: calc(100% - 1rem);
          max-width: 100%;
        }
        @media (min-width: 640px) {
          .inteligencia3-panel { width: auto; }
        }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-[#06192c] bg-[#f4f0e8]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Voltar para a página inicial">
            <img src={logo} alt="Pinheiro Azul" className="h-11 w-11 object-contain" />
            <span>
              <span className="block text-xs font-black uppercase tracking-[0.22em]">Pinheiro Azul</span>
              <span className="block text-[10px] font-bold text-[#5a6472]">Inteligência imobiliária</span>
            </span>
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-[#06192c] bg-[#06192c] px-3 py-2 text-xs font-black uppercase text-white transition hover:bg-[#e43d30] sm:px-4"
          >
            <MessageSquare size={15} />
            <span className="hidden sm:inline">Falar com a gente</span>
          </a>
        </div>
      </header>

      <main>
        <section className="inteligencia3-grid relative border-b border-[#06192c] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="pointer-events-none absolute right-[-80px] top-[-90px] h-64 w-64 rounded-full border-[28px] border-[#28c7ba]/25" />
          <div className="mx-auto grid min-w-0 max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <span className="inline-flex items-center gap-2 border border-[#06192c] bg-[#f3d35b] px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0_#06192c]">
                <Compass size={14} />
                Diagnóstico inicial · Zona Leste
              </span>
              <h1 className="mt-7 max-w-xl text-[clamp(2.6rem,6vw,5.8rem)] font-black uppercase leading-[0.88] tracking-[-0.055em]">
                Cada número <span className="text-[#e43d30]">importa.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-[#27394d] sm:text-lg">
                Ajuste três valores e entenda como entrada, custos e parcela se relacionam antes de escolher um imóvel.
              </p>
              <div className="mt-8 border-l-4 border-[#28c7ba] bg-[#fffdf7] p-4 text-sm leading-relaxed shadow-[5px_5px_0_#06192c]">
                <strong className="font-black">Sem CPF e sem promessa de aprovação.</strong> Esta leitura é educativa e serve para organizar o próximo passo.
              </div>

              <div className="mt-8 hidden grid-cols-3 border border-[#06192c] bg-[#06192c] text-white lg:grid">
                {[
                  ["01", "Ajuste"],
                  ["02", "Entenda"],
                  ["03", "Decida"],
                ].map(([number, label]) => (
                  <div key={number} className="border-r border-white/20 p-3 last:border-r-0">
                    <span className="block text-[10px] font-black text-[#28c7ba]">{number}</span>
                    <span className="mt-1 block text-xs font-black uppercase">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="inteligencia3-panel relative min-w-0">
              <div className="absolute -left-3 -top-3 h-full w-full border border-[#06192c] bg-[#e43d30] sm:-left-4 sm:-top-4" />
              <div className="relative min-w-0 overflow-hidden border border-[#06192c] bg-[#fffdf7] p-4 sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#06192c] pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e43d30]">Mesa de decisão</p>
                    <h2 className="mt-1 text-xl font-black uppercase sm:text-2xl">Monte seu cenário</h2>
                  </div>
                  <Calculator className="hidden text-[#06192c] sm:block" size={34} strokeWidth={1.7} />
                </div>

                <div className="space-y-5">
                  <BrutalSlider
                    id="property-value"
                    label="Valor do imóvel"
                    hint="Use o valor do imóvel que você imagina procurar."
                    value={propertyValue}
                    min={150000}
                    max={1200000}
                    step={5000}
                    quickStep={25000}
                    accent="coral"
                    onChange={updatePropertyValue}
                  />
                  <BrutalSlider
                    id="down-payment"
                    label="Entrada disponível"
                    hint="Some recursos próprios e o FGTS que poderia usar."
                    value={Math.min(downPayment, maximumDownPayment)}
                    min={0}
                    max={maximumDownPayment}
                    step={5000}
                    quickStep={10000}
                    accent="teal"
                    onChange={setDownPayment}
                  />
                  <BrutalSlider
                    id="monthly-income"
                    label="Renda familiar mensal"
                    hint="Considere a renda bruta de quem participaria do financiamento."
                    value={monthlyIncome}
                    min={3000}
                    max={50000}
                    step={500}
                    quickStep={1000}
                    accent="yellow"
                    onChange={setMonthlyIncome}
                  />
                </div>

                <div className="mt-7 grid gap-3 border-t border-[#06192c] pt-6 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5a6472]">Prévia atual</p>
                    <p className="mt-1 text-lg font-black">{result.levelLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={revealResults}
                    className="inline-flex w-full items-center justify-between gap-5 border border-[#06192c] bg-[#f3d35b] px-5 py-4 text-sm font-black uppercase shadow-[5px_5px_0_#e43d30] transition hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-[3px_3px_0_#e43d30] sm:w-auto"
                  >
                    Entender meu cenário
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence initial={false}>
          {showResults && (
            <motion.section
              ref={resultsRef}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.45 }}
              className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
              aria-labelledby="scenario-title"
            >
              <div className="mx-auto max-w-7xl">
                <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#e43d30]">Seu mapa inicial</p>
                    <h2 id="scenario-title" className="mt-3 text-4xl font-black uppercase leading-[0.95] sm:text-5xl">
                      Números na mesa. Próximo passo com clareza.
                    </h2>
                    <p className="mt-5 max-w-xl leading-relaxed text-[#415064]">{result.levelSummary}</p>
                    <div className="mt-6 flex gap-3 border border-[#06192c] bg-[#06192c] p-4 text-sm text-white">
                      <Info className="mt-0.5 shrink-0 text-[#f3d35b]" size={18} />
                      <p>
                        Esta é uma estimativa educativa. Taxas, subsídios, seguros, perfil de crédito e regras bancárias podem mudar o resultado real.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <MetricCard
                      label="Entrada informada"
                      value={formatCurrency(result.consideredDownPayment)}
                      note={`${result.downPaymentPercent.toFixed(0)}% do valor do imóvel`}
                      tone="teal"
                    />
                    <MetricCard
                      label="Valor estimado a financiar"
                      value={formatCurrency(result.financedValue)}
                      note="Valor antes de juros, seguros e condições bancárias"
                    />
                    <MetricCard
                      label="Custos iniciais estimados"
                      value={formatCurrency(result.initialCosts)}
                      note="Referência de 4,5% para ITBI, registro e escritura"
                      tone="yellow"
                    />
                    <MetricCard
                      label="Primeira parcela estimada"
                      value={formatCurrency(result.estimatedFirstPayment)}
                      note={`${result.incomeCommitment.toFixed(0)}% da renda familiar informada`}
                      tone={result.incomeCommitment > 30 ? "coral" : "cream"}
                    />
                  </div>
                </div>

                <div className="mt-14 border border-[#06192c] bg-[#fffdf7] shadow-[8px_8px_0_#06192c]">
                  <div className="overflow-x-auto border-b border-[#06192c] bg-[#f4f0e8]">
                    <div className="flex min-w-max" role="tablist" aria-label="Detalhes do diagnóstico">
                      {tabs.map(({ id, label, shortLabel, icon: Icon }) => {
                        const active = activeTab === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            aria-controls={`panel-${id}`}
                            id={`tab-${id}`}
                            onClick={() => setActiveTab(id)}
                            className={`flex min-h-16 items-center gap-2 border-r border-[#06192c] px-4 text-xs font-black uppercase transition last:border-r-0 sm:px-6 ${
                              active ? "bg-[#06192c] text-white" : "hover:bg-[#f3d35b]"
                            }`}
                          >
                            <Icon size={16} className={active ? "text-[#28c7ba]" : ""} />
                            <span className="sm:hidden">{shortLabel}</span>
                            <span className="hidden sm:inline">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      id={`panel-${activeTab}`}
                      role="tabpanel"
                      aria-labelledby={`tab-${activeTab}`}
                      initial={{ opacity: 0, x: reduceMotion ? 0 : 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: reduceMotion ? 0 : -14 }}
                      transition={{ duration: reduceMotion ? 0 : 0.2 }}
                      className="min-h-[390px] p-5 sm:p-8"
                    >
                      {activeTab === "cenario" && (
                        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                          <div>
                            <span className="inline-block border border-[#06192c] bg-[#28c7ba] px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#06192c]">
                              {result.levelLabel}
                            </span>
                            <h3 className="mt-6 text-3xl font-black uppercase leading-none">O que os números já mostram</h3>
                            <p className="mt-4 leading-relaxed text-[#415064]">{result.levelSummary}</p>
                          </div>
                          <ul className="space-y-3">
                            {result.clearPoints.map((point) => (
                              <li key={point} className="flex gap-3 border border-[#06192c] bg-[#f4f0e8] p-4 text-sm leading-relaxed">
                                <CheckCircle2 className="mt-0.5 shrink-0 text-[#28c7ba]" size={18} />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeTab === "custos" && (
                        <div className="grid gap-8 lg:grid-cols-2">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e43d30]">Além da entrada</p>
                            <h3 className="mt-3 text-3xl font-black uppercase leading-none">A compra começa antes das chaves.</h3>
                            <p className="mt-5 leading-relaxed text-[#415064]">
                              ITBI, registro e escritura costumam chegar perto do início da operação. Nesta leitura, usamos 4,5% do valor do imóvel como referência simples.
                            </p>
                          </div>
                          <div className="border border-[#06192c] bg-[#f3d35b] p-6 shadow-[6px_6px_0_#e43d30]">
                            <p className="text-xs font-black uppercase tracking-[0.16em]">Reserva inicial estimada</p>
                            <p className="mt-5 text-4xl font-black tabular-nums">{formatCurrency(result.initialCosts)}</p>
                            <p className="mt-5 border-t border-[#06192c] pt-4 text-sm leading-relaxed">
                              O valor real pode variar conforme o imóvel, financiamento e eventuais benefícios. Confirme antes de assumir qualquer compromisso.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === "renda" && (
                        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e43d30]">Estimativa SAC</p>
                            <h3 className="mt-3 text-3xl font-black uppercase leading-none">Parcela é parte da rotina, não apenas da aprovação.</h3>
                            <div className="mt-7 h-8 border border-[#06192c] bg-[#f4f0e8] p-1">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(result.incomeCommitment, 100)}%` }}
                                transition={{ duration: reduceMotion ? 0 : 0.65 }}
                                className={`h-full ${result.incomeCommitment > 30 ? "bg-[#e43d30]" : "bg-[#28c7ba]"}`}
                              />
                            </div>
                            <div className="mt-2 flex justify-between text-[10px] font-black uppercase">
                              <span>0% da renda</span>
                              <span>Referência: 30%</span>
                              <span>100%</span>
                            </div>
                          </div>
                          <div className="border border-[#06192c] bg-[#06192c] p-6 text-white">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#28c7ba]">Comprometimento estimado</p>
                            <p className="mt-4 text-5xl font-black">{result.incomeCommitment.toFixed(0)}%</p>
                            <p className="mt-4 text-sm leading-relaxed text-white/75">
                              Primeira parcela aproximada de {formatCurrency(result.estimatedFirstPayment)}. O banco considera outras obrigações, seguros e regras próprias.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === "atencao" && (
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e43d30]">Sem alarmismo</p>
                          <h3 className="mt-3 max-w-2xl text-3xl font-black uppercase leading-none">
                            Pontos para confirmar antes de transformar intenção em proposta.
                          </h3>
                          <div className="mt-7 grid gap-4 md:grid-cols-2">
                            {result.attentionPoints.map((point, index) => (
                              <article
                                key={point}
                                className={`border border-[#06192c] p-5 shadow-[4px_4px_0_#06192c] ${
                                  index === 0 ? "bg-[#f3d35b]" : "bg-[#fffdf7]"
                                }`}
                              >
                                <span className="text-xs font-black">0{index + 1}</span>
                                <p className="mt-5 text-sm font-bold leading-relaxed">{point}</p>
                              </article>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "proximo" && (
                        <AdaptiveMiniReport result={result} reduceMotion={reduceMotion} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="border-y border-[#06192c] bg-[#06192c] px-4 py-10 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <Home className="mt-1 shrink-0 text-[#f3d35b]" size={28} />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#28c7ba]">Você continua no controle</p>
                <p className="mt-2 max-w-2xl text-xl font-black uppercase leading-tight sm:text-2xl">
                  A Pinheiro Azul orienta. Você decide como seguir, quando avançar e como comprar.
                </p>
              </div>
            </div>
            {!showResults && (
              <button
                type="button"
                onClick={() => document.getElementById("property-value")?.focus()}
                className="inline-flex shrink-0 items-center justify-between gap-5 border border-white bg-[#f3d35b] px-5 py-4 text-sm font-black uppercase text-[#06192c]"
              >
                Ajustar meus números
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </section>
      </main>

      <footer className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-[#06192c] pt-6 text-xs font-bold text-[#415064] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span>Pinheiro Azul · Inteligência imobiliária na Zona Leste de São Paulo</span>
            <span className="mt-1 block">Estimativa educativa, sem promessa de aprovação.</span>
          </div>
          <nav aria-label="Links legais" className="flex flex-wrap gap-3 uppercase">
            <Link to="/privacidade" className="hover:underline">Privacidade</Link>
            <Link to="/tratamento-de-dados" className="hover:underline">Dados e IA</Link>
            <Link to="/direitos-lgpd" className="hover:underline">LGPD</Link>
            <Link to="/termos" className="hover:underline">Termos</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
