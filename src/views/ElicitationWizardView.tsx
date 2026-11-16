import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Upload,
  Sparkles,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Users,
  Boxes,
  MapPin,
  Clock,
  ListChecks,
  AlertOctagon,
  Loader2,
  AlertCircle,
  BookOpen,
  Quote,
  ArrowRight,
  ArrowLeft,
  FlaskConical,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { JUZGADO_CASE_STUDY_PRESET } from '../services/presets';
import {
  CandidateScenario,
  CandidateScenarioRole,
  ExtractScenariosResponse,
  StructureScenarioResponse,
  ValidationReport,
} from '../types/api';
import { useProject } from '../context/ProjectContext';

interface ElicitationWizardViewProps {
  onOpenInAudit: (payload: {
    rawMarkdown: string;
    validationReport: ValidationReport;
    projectName: string;
  }) => void;
}

const ROLE_BADGE_STYLES: Record<CandidateScenarioRole, string> = {
  Integrador: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Particular: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Sub-Escenario': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Excepción: 'bg-amber-100 text-amber-800 border-amber-200',
};

export const ElicitationWizardView: React.FC<ElicitationWizardViewProps> = ({
  onOpenInAudit,
}) => {
  const {
    activeProject,
    enableSemantic,
    demoActionCounter,
    lastDemoAction,
    triggerLoadJuzgadoDemo,
  } = useProject();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State
  const [rawText, setRawText] = useState('');
  const [lelMarkdown, setLelMarkdown] = useState('');
  const [showLelAccordion, setShowLelAccordion] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // Step 2 State
  const [extractionResult, setExtractionResult] =
    useState<ExtractScenariosResponse | null>(null);
  const [structuringNumber, setStructuringNumber] = useState<number | null>(
    null
  );

  // Step 3 State
  const [structuredResult, setStructuredResult] =
    useState<StructureScenarioResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (demoActionCounter === 0) return;
    if (lastDemoAction === 'LOAD_JUZGADO') {
      setRawText(JUZGADO_CASE_STUDY_PRESET.transcriptMarkdown);
      setLelMarkdown(JUZGADO_CASE_STUDY_PRESET.lelMarkdown);
      setStep(1);
      setError(null);
    } else if (lastDemoAction === 'CLEAR_BLANK') {
      setRawText('');
      setLelMarkdown('');
      setExtractionResult(null);
      setStructuredResult(null);
      setStep(1);
      setError(null);
    }
  }, [demoActionCounter, lastDemoAction]);

  const handleLoadJuzgadoInterview = () => {
    triggerLoadJuzgadoDemo();
    setRawText(JUZGADO_CASE_STUDY_PRESET.transcriptMarkdown);
    setLelMarkdown(JUZGADO_CASE_STUDY_PRESET.lelMarkdown);
    setError(null);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const content = await file.text();
      setRawText(content);
      setError(null);
    } catch {
      setError('No fue posible leer el archivo seleccionado.');
    }
  };

  const handleStep1Extract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError('Pegue o suba el texto de la entrevista o relevamiento para continuar.');
      return;
    }

    setExtracting(true);
    setError(null);
    try {
      const res = await apiClient.extractScenarios({
        projectName: activeProject.trim() || 'Mi Proyecto de Software',
        rawText: rawText.trim(),
        lelMarkdown: lelMarkdown.trim() ? lelMarkdown.trim() : undefined,
      });
      setExtractionResult(res);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al detectar candidatos a escenarios.'
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleSelectCandidateAndStructure = async (
    candidate: CandidateScenario
  ) => {
    setStructuringNumber(candidate.number);
    setError(null);
    try {
      const res = await apiClient.structureScenario({
        projectName: activeProject.trim() || 'Mi Proyecto de Software',
        scenarioNumber: candidate.number,
        scenarioTitle: candidate.title,
        scenarioRole: candidate.type,
        scenarioTimeframe: 'FUTURO',
        rawContextText: rawText.trim(),
        lelMarkdown: lelMarkdown.trim() ? lelMarkdown.trim() : undefined,
        enableSemanticValidation: enableSemantic,
      });
      setStructuredResult(res);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al generar la plantilla formal del escenario.'
      );
    } finally {
      setStructuringNumber(null);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!structuredResult?.formattedDescriptionMarkdown) return;
    await navigator.clipboard.writeText(
      structuredResult.formattedDescriptionMarkdown
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadMarkdown = () => {
    if (!structuredResult?.formattedDescriptionMarkdown) return;
    const blob = new Blob([structuredResult.formattedDescriptionMarkdown], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escenario-${structuredResult.scenarioNumber}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Clean 3-Step Stepper Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Asistente de Relevamiento a Escenario
              </h2>
              <p className="text-xs text-slate-500">
                Proyecto activo: <strong className="text-slate-800">{activeProject}</strong>
              </p>
            </div>
          </div>

          {/* Stepper Pills */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
                step === 1
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. Relevamiento
            </button>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <button
              type="button"
              disabled={!extractionResult}
              onClick={() => setStep(2)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
                step === 2
                  ? 'bg-slate-900 text-white'
                  : extractionResult
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              2. Candidatos
            </button>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <button
              type="button"
              disabled={!structuredResult}
              onClick={() => setStep(3)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
                step === 3
                  ? 'bg-slate-900 text-white'
                  : structuredResult
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              3. Plantilla Formal
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Paste Narrative / Interview */}
      {step === 1 && (
        <form
          onSubmit={handleStep1Extract}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Paso 1: Ingrese la narrativa o transcripción de entrevista
              </h3>
              <p className="text-xs text-slate-500">
                El asistente analizará el texto e identificará los escenarios candidatos del sistema.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadJuzgadoInterview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Cargar Entrevista Demo Juzgado</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir .md / .txt</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileUpload(file);
                }}
              />
            </div>
          </div>

          <textarea
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Pegue aquí las minutas de entrevista, relevamiento con usuarios o descripción funcional del proceso..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50/40 focus:bg-white p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
            required
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowLelAccordion((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {showLelAccordion
                  ? 'Ocultar glosario LEL de apoyo'
                  : 'Añadir glosario LEL de apoyo (opcional)'}
              </span>
            </button>

            <button
              type="submit"
              disabled={extracting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Detectando Escenarios Candidatos...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Detectar Escenarios Candidatos</span>
                </>
              )}
            </button>
          </div>

          {showLelAccordion && (
            <div className="pt-2">
              <textarea
                rows={5}
                value={lelMarkdown}
                onChange={(e) => setLelMarkdown(e.target.value)}
                placeholder="Pegue aquí los símbolos LEL del dominio (opcional)..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
              />
            </div>
          )}
        </form>
      )}

      {/* STEP 2: Select Candidate Scenario */}
      {step === 2 && extractionResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Paso 2: Seleccione el escenario candidato a estructurar (
                {extractionResult.scenarios.length} detectados)
              </h3>
              <p className="text-xs text-slate-500">
                Haga clic en &ldquo;Generar Plantilla Formal&rdquo; sobre cualquiera de los escenarios propuestos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Editar texto fuente</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {extractionResult.scenarios.map((scen) => {
              const isStructuringThis = structuringNumber === scen.number;
              return (
                <div
                  key={scen.number}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-300 transition-colors"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        #{scen.number}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {scen.title}
                      </h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          ROLE_BADGE_STYLES[scen.type] ||
                          'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        {scen.type}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {scen.justification}
                    </p>

                    {scen.sourceQuote && (
                      <div className="flex items-start gap-2 bg-slate-50 border-l-2 border-indigo-400 px-3 py-1.5 rounded-r text-xs text-slate-600 italic">
                        <Quote className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>&ldquo;{scen.sourceQuote}&rdquo;</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={structuringNumber !== null}
                    onClick={() => void handleSelectCandidateAndStructure(scen)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold shadow-sm shrink-0 transition-colors"
                  >
                    {isStructuringThis ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Estructurando...</span>
                      </>
                    ) : (
                      <>
                        <span>Generar Plantilla Formal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Formal Structured Scenario Preview */}
      {step === 3 && structuredResult && (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-xs font-mono text-indigo-300">
                Paso 3 · Plantilla BNF Generada · Rol: {structuredResult.scenarioRole}
              </span>
              <h3 className="text-base sm:text-lg font-bold mt-0.5">
                Escenario #{structuredResult.scenarioNumber}:{' '}
                {structuredResult.scenarioTitle}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Elegir otro candidato</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar .md</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .md</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onOpenInAudit({
                    rawMarkdown: structuredResult.formattedDescriptionMarkdown,
                    validationReport: structuredResult.validationReport,
                    projectName: structuredResult.projectName,
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ver Informe de Auditoría</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clean Structured Anatomy Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                  Objetivo
                </span>
                <p className="text-sm text-slate-900 font-medium mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {structuredResult.parsedScenario.objective || '—'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-600" />
                    Ubicación Geográfica
                  </span>
                  <p className="text-xs text-slate-800 mt-1">
                    {structuredResult.parsedScenario.contextGeo || 'No especificada'}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    Ubicación Temporal
                  </span>
                  <p className="text-xs text-slate-800 mt-1">
                    {structuredResult.parsedScenario.contextTime || 'No especificada'}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                    <ListChecks className="w-3 h-3 text-indigo-600" />
                    Precondiciones
                  </span>
                  <p className="text-xs text-slate-800 mt-1">
                    {structuredResult.parsedScenario.contextPrecond || 'Ninguna'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Actores ({structuredResult.parsedScenario.actors.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {structuredResult.parsedScenario.actors.map((actor, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-medium"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                    <Boxes className="w-3.5 h-3.5 text-cyan-600" />
                    Recursos ({structuredResult.parsedScenario.resources.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {structuredResult.parsedScenario.resources.map((res, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-200 text-xs font-medium"
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Episodios ({structuredResult.parsedScenario.episodes.length})
                </span>
                <ol className="space-y-2">
                  {structuredResult.parsedScenario.episodes.map((ep) => (
                    <li
                      key={ep.number}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5"
                    >
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        {ep.number}.
                      </span>
                      <div className="flex-1 space-y-1">
                        <p className="text-slate-800 leading-relaxed">{ep.text}</p>
                        {ep.restriction && (
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px]">
                            [Restricción: {ep.restriction}]
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                  Excepciones ({structuredResult.parsedScenario.exceptions.length})
                </span>
                <ul className="space-y-2">
                  {structuredResult.parsedScenario.exceptions.map((ex, i) => (
                    <li
                      key={i}
                      className="text-xs bg-amber-50/60 border border-amber-200 rounded-xl p-3 space-y-1"
                    >
                      <p className="text-slate-900">
                        <strong className="font-semibold text-amber-900">
                          Causa:
                        </strong>{' '}
                        {ex.causa}
                      </p>
                      <p className="text-slate-800">
                        <strong className="font-semibold text-emerald-900">
                          Tratamiento:
                        </strong>{' '}
                        {ex.tratamiento}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Raw Markdown Preview */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Especificación Markdown (.md)
                </span>
              </div>
              <pre className="p-4 text-xs font-mono bg-slate-950 text-slate-100 overflow-x-auto flex-1 leading-relaxed whitespace-pre-wrap">
                {structuredResult.formattedDescriptionMarkdown}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
