import React from 'react';
import {
  CheckCircle2,
  BookOpen,
  Tag,
  Wrench,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import {
  DeterministicIssue,
  RagContextUsed,
  SemanticValidationIssue,
} from '../types/api';

interface ValidationFindingsTableProps {
  deterministic: DeterministicIssue[];
  semantic: SemanticValidationIssue[];
  ragContextUsed?: RagContextUsed;
}

const DEFECT_TYPE_LABELS: Record<string, string> = {
  O: 'Omisión (O)',
  E: 'Exceso / Comisión (E)',
  D: 'Discrepancia (D)',
  A: 'Ambigüedad (A)',
};

export const ValidationFindingsTable: React.FC<ValidationFindingsTableProps> = ({
  deterministic,
  semantic,
  ragContextUsed,
}) => {
  const totalIssues = deterministic.length + semantic.length;

  return (
    <div className="space-y-4">
      {/* Subtle RAG Traceability Pills */}
      {ragContextUsed &&
        (ragContextUsed.marcoTeoricoChunks > 0 ||
          ragContextUsed.lelSymbols.length > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>
                Contexto RAG consultado:{' '}
                <strong className="text-slate-900">
                  {ragContextUsed.marcoTeoricoChunks} reglas teóricas
                </strong>
              </span>
            </div>

            {ragContextUsed.lelSymbols.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  Símbolos LEL:
                </span>
                {ragContextUsed.lelSymbols.map((sym, i) => (
                  <span
                    key={`${sym}-${i}`}
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    {sym}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Zero Defects State */}
      {totalIssues === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              Escenario aprobado sin observaciones
            </p>
            <p className="text-xs text-emerald-700">
              Cumple con la estructura formal BNF y las pautas metodológicas del dominio.
            </p>
          </div>
        </div>
      )}

      {/* Observation Cards Grid */}
      {totalIssues > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {/* 1. Deterministic Observation Cards */}
          {deterministic.map((issue, idx) => {
            const isError = issue.severity === 'ERROR';
            return (
              <div
                key={`det-${issue.ruleId}-${idx}`}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isError
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <ShieldAlert className="w-3 h-3" />
                      {isError ? 'Error Estructural' : 'Advertencia BNF'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
                      Componente: {issue.field}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[11px] text-slate-600 bg-slate-50 border border-slate-200">
                      {DEFECT_TYPE_LABELS[issue.defectType] || issue.defectType}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px]">
                    Regla {issue.ruleId} ({issue.itemControl})
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                  {issue.message}
                </p>

                {issue.suggestion && (
                  <div className="flex items-start gap-2 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-700">
                    <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold text-slate-900">
                        Sugerencia de corrección:
                      </strong>{' '}
                      {issue.suggestion}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* 2. Semantic RAG Observation Cards */}
          {semantic.map((issue, idx) => {
            const sevStyles =
              issue.severity === 'ERROR'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : issue.severity === 'WARNING'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200';

            const sevLabel =
              issue.severity === 'ERROR'
                ? 'Desvío Crítico RAG'
                : issue.severity === 'WARNING'
                ? 'Observación Semántica'
                : 'Recomendación Metodológica';

            return (
              <div
                key={`sem-${issue.code}-${idx}`}
                className="bg-white border border-indigo-200/80 rounded-xl p-4 shadow-sm space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sevStyles}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {sevLabel}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200/60 text-xs font-semibold">
                      Componente: {issue.component}
                      {issue.episodeNumber !== undefined &&
                      issue.episodeNumber !== null
                        ? ` (Episodio #${issue.episodeNumber})`
                        : ''}
                    </span>
                  </div>

                  {issue.ragReference && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50/90 text-indigo-800 border border-indigo-200 text-[11px] font-medium">
                      <BookOpen className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span>Cita: {issue.ragReference}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                  {issue.message}
                </p>

                {issue.suggestion && (
                  <div className="flex items-start gap-2 bg-indigo-50/40 border border-indigo-100 rounded-lg p-2.5 text-xs text-slate-700">
                    <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold text-indigo-950">
                        Sugerencia de corrección:
                      </strong>{' '}
                      {issue.suggestion}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
