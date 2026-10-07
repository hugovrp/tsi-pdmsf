import React from "react";

export interface TaskProps {
  id: number;
  description: string;
  checked: boolean;
  onCheck?: (id: number) => void;
}

export function Task({ id, description, checked, onCheck }: TaskProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onCheck?.(id);
  }

  return (
    <label
      htmlFor={`task-checkbox-${id}`}
      className={`group relative flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
        checked
          ? "neu-pressed bg-[#e9edf2]/80 opacity-90"
          : "neu-flat hover:-translate-y-0.5 active:translate-y-0"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Accessible hidden checkbox input */}
        <input
          type="checkbox"
          id={`task-checkbox-${id}`}
          checked={checked}
          onChange={handleChange}
          className="peer sr-only"
        />

        {/* Custom Neumorphic Checkbox */}
        <div
          className={`relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-xl shrink-0 transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#e9edf2] ${
            checked
              ? "neu-pressed bg-emerald-500 text-white shadow-inner"
              : "neu-flat-sm text-transparent group-hover:scale-105"
          }`}
          aria-hidden="true"
        >
          <svg
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] transition-transform duration-200 ${
              checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Task description */}
        <p
          className={`text-[15px] sm:text-base font-medium break-words leading-snug transition-all duration-200 flex-1 ${
            checked
              ? "text-slate-400 line-through decoration-slate-400/80 decoration-1"
              : "text-slate-800"
          }`}
        >
          {description}
        </p>
      </div>

      {/* Status Pill Badge */}
      <div className="shrink-0">
        {checked ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-500/10 neu-pill-inset">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="hidden sm:inline">Concluída</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-500/10 neu-pill-inset">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="hidden sm:inline">Pendente</span>
          </span>
        )}
      </div>
    </label>
  );
}