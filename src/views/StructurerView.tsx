import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
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
  FlaskConical,
  Eraser,
} from 'lucide-react';
import { apiClient } from '../services/api';
import {
  GENERIC_LEL_TEMPLATE,
  JUZGADO_CASE_STUDY_PRESET,
} from '../services/presets';
import {
  CandidateScenarioRole,
  StructureScenarioRequest,
  StructureScenarioResponse,
  ValidationReport,
} from '../types/api';
import { ValidationFindingsTable } from '../components/ValidationFindingsTable';
import { useProject } from '../context/ProjectContext';

export interface StructurerPrefill {
  projectName: string;
  scenarioNumber: number;
  scenarioTitle: string;
  scenarioRole: CandidateScenarioRole;
  rawContextText: string;
  lelMarkdown?: string;
}

interface StructurerViewProps {
  prefill: StructurerPrefill | null;
  onOpenInAudit: (payload: {
    rawMarkdown: string;
    validationReport: ValidationReport;
    projectName: string;
  }) => void;
}

export const StructurerView: React.FC<StructurerViewProps> = ({
  prefill,
  onOpenInAudit,
}) => {
  const {
    activeProject,
    setActiveProject,
    demoActionCounter,
    lastDemoAction,
    triggerLoadJuzgadoDemo,
    triggerClearBlankProject,
  } = useProject();

  const [scenarioNumber, setScenarioNumber] = useState<number>(1);
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [scenarioRole, setScenarioRole] =
    useState<CandidateScenarioRole>('Particular');
  const [scenarioTimeframe, setScenarioTimeframe] = useState<'FUTURO' | 'ACTUAL'>(
    'FUTURO'
  );
  const [enableSemanticValidation, setEnableSemanticValidation] = useState(true);
  const [rawContextText, setRawContextText] = useState('');
  const [lelMarkdown, setLelMarkdown] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StructureScenarioResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prefill) {
      if (prefill.projectName) {
        setActiveProject(prefill.projectName);
      }
      setScenarioNumber(prefill.scenarioNumber || 1);
      setScenarioTitle(prefill.scenarioTitle);
      setScenarioRole(prefill.scenarioRole);
      setRawContextText(prefill.rawContextText);
      if (prefill.lelMarkdown !== undefined) {
        setLelMarkdown(prefill.lelMarkdown);
      }
      setError(null);
    }
  }, [prefill, setActiveProject]);

  useEffect(() => {
    if (demoActionCounter === 0) return;
    if (lastDemoAction === 'LOAD_JUZGADO') {
      const sample = JUZGADO_CASE_STUDY_PRESET.structurerSample;
      setScenarioNumber(sample.scenarioNumber);
      setScenarioTitle(sample.scenarioTitle);
      setScenarioRole(sample.scenarioRole);
      setScenarioTimeframe(sample.scenarioTimeframe);
      setRawContextText(sample.rawContextText);
      setLelMarkdown(JUZGADO_CASE_STUDY_PRESET.lelMarkdown);
      setError(null);
      setResult(null);
    } else if (lastDemoAction === 'CLEAR_BLANK') {
      setScenarioNumber(1);
      setScenarioTitle('');
      setScenarioRole('Particular');
      setScenarioTimeframe('FUTURO');
      setRawContextText('');
      setLelMarkdown('');
      setError(null);
      setResult(null);
    }
  }, [demoActionCounter, lastDemoAction]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioTitle.trim() || !rawContextText.trim()) {
      setError('El título del escenario y el texto de contexto son obligatorios.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: StructureScenarioRequest = {
        projectName: activeProject.trim() || 'Mi Proyecto de Software',
        scenarioNumber: Number(scenarioNumber) || 1,
        scenarioTitle: scenarioTitle.trim(),
        scenarioRole,
        scenarioTimeframe,
        rawContextText: rawContextText.trim(),
        lelMarkdown: lelMarkdown.trim() ? lelMarkdown.trim() : undefined,
        enableSemanticValidation,
      };
      const res = await apiClient.structureScenario(payload);
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al generar la plantilla formal del escenario.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!result?.formattedDescriptionMarkdown) return;
    await navigator.clipboard.writeText(result.formattedDescriptionMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadMarkdown = () => {
    if (!result?.formattedDescriptionMarkdown) return;
    const blob = new Blob([result.formattedDescriptionMarkdown], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = result.scenarioTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    a.href = url;
    a.download = `escenario-${result.scenarioNumber}-${safeName || 'formal'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Etapa 2 · Estructuración BNF
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Estructurador Formal de Escenarios (Gramática Hadad / Calegari)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Transforma una narrativa informal en la plantilla formal normalizada (Título, Tipo, Objetivo, Contexto, Actores, Recursos, Episodios secuenciales con restricciones y Excepciones Causa/Tratamiento) y ejecuta la validación híbrida automática.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {prefill && (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
              Pre-cargado: <strong>Escenario #{prefill.scenarioNumber}</strong>
            </span>
          )}

          <button
            type="button"
            onClick={triggerLoadJuzgadoDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors shadow-sm"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Demo: Caso Judicial</span>
          </button>

          <button
            type="button"
            onClick={triggerClearBlankProject}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-xs font-medium transition-colors"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleGenerate}
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Proyecto / Dominio Activo
            </label>
            <input
              type="text"
              value={activeProject}
              onChange={(e) => setActiveProject(e.target.value)}
              placeholder="Ej: Sistema de Gestión Comercial"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Escenario Nº
            </label>
            <input
              type="number"
              min={1}
              value={scenarioNumber}
              onChange={(e) => setScenarioNumber(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Rol Jerárquico
            </label>
            <select
              value={scenarioRole}
              onChange={(e) =>
                setScenarioRole(e.target.value as CandidateScenarioRole)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="Particular">Particular</option>
              <option value="Sub-Escenario">Sub-Escenario</option>
              <option value="Integrador">Integrador</option>
              <option value="Excepción">Excepción</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Marco Temporal (Tipo)
            </label>
            <select
              value={scenarioTimeframe}
              onChange={(e) =>
                setScenarioTimeframe(e.target.value as 'FUTURO' | 'ACTUAL')
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="FUTURO">FUTURO (Sistema propuesto)</option>
              <option value="ACTUAL">ACTUAL (Relevamiento actual)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Título Formal del Escenario (Verbo en Infinitivo + Objeto LEL)
            </label>
            <input
              type="text"
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              placeholder="Ej: REGISTRAR PEDIDO DE COMPRA"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div className="pt-4 lg:pt-5">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-indigo-50/70 border border-indigo-200 px-3.5 py-2 rounded-lg w-full">
              <input
                type="checkbox"
                checked={enableSemanticValidation}
                onChange={(e) => setEnableSemanticValidation(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-indigo-950">
                Ejecutar Auditoría Semántica RAG post-generación
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Narrativa / Contexto Operativo de Entrada (rawContextText)
            </label>
            <textarea
              rows={7}
              value={rawContextText}
              onChange={(e) => setRawContextText(e.target.value)}
              placeholder="Describa el flujo operativo del caso, los actores que intervienen, las reglas del dominio y las posibles situaciones de excepción..."
              className="w-full rounded-lg border border-slate-300 p-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 leading-relaxed"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Glosario LEL de Referencia (Opcional)</span>
              </label>
              <button
                type="button"
                onClick={() => setLelMarkdown(GENERIC_LEL_TEMPLATE)}
                className="text-[11px] text-indigo-600 hover:underline font-medium"
              >
                Insertar plantilla LEL de ejemplo
              </button>
            </div>
            <textarea
              rows={7}
              value={lelMarkdown}
              onChange={(e) => setLelMarkdown(e.target.value)}
              placeholder="Pegue el glosario LEL en formato Markdown para asegurar consistencia terminológica..."
              className="w-full rounded-lg border border-slate-300 p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600 leading-relaxed"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Endpoint destino:{' '}
            <code className="font-mono text-indigo-700">POST /scenarios/structure</code> · Proyecto:{' '}
            <strong className="text-slate-700">{activeProject}</strong>
          </span>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Estructurando y Validando Escenario...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generar Plantilla Formal</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Output Section */}
      {result && (
        <div className="space-y-6">
          {/* Action & Status Bar */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold">
                    Escenario Nº {result.scenarioNumber}: {result.scenarioTitle}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      result.validationReport.isValid
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {result.validationReport.isValid ? 'Válido' : 'Con Observaciones'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Proyecto: {result.projectName} · Rol: {result.scenarioRole} · Tipo:{' '}
                  {result.parsedScenario.type}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .md</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onOpenInAudit({
                    rawMarkdown: result.formattedDescriptionMarkdown,
                    validationReport: result.validationReport,
                    projectName: result.projectName,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Abrir en Auditoría</span>
              </button>
            </div>
          </div>

          {/* 2-Column Split: Parsed Structure Preview + Raw Formal Markdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Structured BNF Anatomy Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2.5">
                Anatomía Estructural BNF Parseada
              </h4>

              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                  Objetivo del Escenario
                </span>
                <p className="text-sm text-slate-900 font-medium mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {result.parsedScenario.objective || '—'}
                </p>
              </div>

              {/* Contexto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-600" />
                    Ubicación Geográfica
                  </span>
                  <p className="text-xs text-slate-800 mt-1">
                    {result.parsedScenario.contextGeo || 'No especificada'}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    Ubicación Temporal
                  </span>
                  <p className="text-xs text-slate-800 mt-1">
                    {result.parsedScenario.contextTime || 'No especificada'}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                    <ListChecks className="w-3 h-3 text-indigo-600" />
                    Precondiciones
                  </span>
                  <p className="text-xs text-slate-800 mt-1">
                    {result.parsedScenario.contextPrecond || 'Ninguna'}
                  </p>
                </div>
              </div>

              {/* Actors & Resources */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Actores ({result.parsedScenario.actors.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.parsedScenario.actors.map((actor, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-mono"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                    <Boxes className="w-3.5 h-3.5 text-cyan-600" />
                    Recursos ({result.parsedScenario.resources.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.parsedScenario.resources.map((res, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-900 border border-cyan-200 text-xs font-mono"
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Episodes */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Secuencia de Episodios ({result.parsedScenario.episodes.length})
                </span>
                <ol className="space-y-2">
                  {result.parsedScenario.episodes.map((ep) => (
                    <li
                      key={ep.number}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-start gap-2.5"
                    >
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
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

              {/* Exceptions */}
              <div>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                  Excepciones ({result.parsedScenario.exceptions.length})
                </span>
                {result.parsedScenario.exceptions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Sin excepciones declaradas
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {result.parsedScenario.exceptions.map((ex, i) => (
                      <li
                        key={i}
                        className="text-xs bg-amber-50/60 border border-amber-200 rounded-lg p-2.5 space-y-1"
                      >
                        <p className="text-slate-900">
                          <strong className="font-semibold text-amber-900">Causa:</strong>{' '}
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
                )}
              </div>
            </div>

            {/* Raw Markdown Output Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Plantilla Markdown Generada (formattedDescriptionMarkdown)
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Gramática Formal BNF
                </span>
              </div>
              <pre className="p-4 text-xs font-mono bg-slate-950 text-slate-100 overflow-x-auto flex-1 leading-relaxed whitespace-pre-wrap">
                {result.formattedDescriptionMarkdown}
              </pre>
            </div>
          </div>

          {/* Immediate Validation Findings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Reporte de Validación Inmediata del Escenario Generado
                </h4>
                <p className="text-xs text-slate-500">
                  Errores sintácticos: {result.validationReport.summary.syntaxErrorsCount} ·
                  Errores estructurales: {result.validationReport.summary.structuralErrorsCount} ·
                  Advertencias: {result.validationReport.summary.warningsCount} ·
                  Hallazgos semánticos RAG: {result.validationReport.summary.semanticIssuesCount}
                </p>
              </div>
            </div>

            <ValidationFindingsTable
              deterministic={result.validationReport.validations.deterministic}
              semantic={result.validationReport.validations.semantic}
              ragContextUsed={result.validationReport.ragContextUsed}
            />
          </div>
        </div>
      )}
    </div>
  );
};
