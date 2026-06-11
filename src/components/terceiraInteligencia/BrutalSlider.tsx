import { Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/inteligenciaScenario";

interface BrutalSliderProps {
  id: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  quickStep: number;
  accent: "coral" | "teal" | "yellow";
  onChange: (value: number) => void;
}

const accentClasses = {
  coral: "bg-[#e43d30] text-white",
  teal: "bg-[#28c7ba] text-[#06192c]",
  yellow: "bg-[#f3d35b] text-[#06192c]",
} as const;

export function BrutalSlider({
  id,
  label,
  hint,
  value,
  min,
  max,
  step,
  quickStep,
  accent,
  onChange,
}: BrutalSliderProps) {
  const update = (nextValue: number) => {
    onChange(Math.min(max, Math.max(min, nextValue)));
  };

  return (
    <div className="min-w-0 border border-[#06192c] bg-[#fffdf7] p-4 shadow-[5px_5px_0_#06192c] sm:p-5">
      <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <label htmlFor={id} className="block text-xs font-black uppercase tracking-[0.18em] text-[#06192c]">
            {label}
          </label>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#415064]">{hint}</p>
        </div>
        <output
          htmlFor={id}
          aria-live="polite"
          className={`shrink-0 border border-[#06192c] px-3 py-2 text-sm font-black tabular-nums shadow-[3px_3px_0_#06192c] ${accentClasses[accent]}`}
        >
          {formatCurrency(value)}
        </output>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`inteligencia3-range inteligencia3-range-${accent} mt-6 w-full`}
      />

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <span className="min-w-0 text-[9px] font-bold uppercase tracking-wide text-[#5a6472] sm:text-[10px] sm:tracking-wider">
          {formatCurrency(min)}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update(value - quickStep)}
            disabled={value <= min}
            aria-label={`Diminuir ${label.toLowerCase()} em ${formatCurrency(quickStep)}`}
            className="grid h-9 w-11 place-items-center border border-[#06192c] bg-white text-[#06192c] transition hover:bg-[#06192c] hover:text-white active:translate-x-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            onClick={() => update(value + quickStep)}
            disabled={value >= max}
            aria-label={`Aumentar ${label.toLowerCase()} em ${formatCurrency(quickStep)}`}
            className="grid h-9 w-11 place-items-center border border-[#06192c] bg-white text-[#06192c] transition hover:bg-[#06192c] hover:text-white active:translate-x-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="min-w-0 text-right text-[9px] font-bold uppercase tracking-wide text-[#5a6472] sm:text-[10px] sm:tracking-wider">
          {formatCurrency(max)}
        </span>
      </div>
    </div>
  );
}
