import React, { useState, useRef, useEffect } from 'react';
import {
  FileSearch,
  Upload,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  BookOpen,
  Quote,
  AlertCircle,
  Loader2,
  FlaskConical,
  Eraser,
} from 'lucide-react';
import { apiClient } from '../services/api';
import {
  GENERIC_LEL_TEMPLATE,
  JUZGADO_CASE_STUDY_PRESET,
} from '../services/presets';
import {
  CandidateScenario,
  CandidateScenarioRole,
  ExtractScenariosResponse,
} from '../types/api';
import { useProject } from '../context/ProjectContext';

interface ExtractionViewProps {
  onSendToStructurer: (payload: {
    projectName: string;
    scenario: CandidateScenario;
    rawContextText: string;
    lelMarkdown: string;
  }) => void;
}

const ROLE_BADGE_STYLES: Record<CandidateScenarioRole, string> = {
  Integrador: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Particular: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Sub-Escenario': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Excepción: 'bg-amber-100 text-amber-800 border-amber-200',
};

export const ExtractionView: React.FC<ExtractionViewProps> = ({
  onSendToStructurer,
}) => {
  const {
    activeProject,
    setActiveProject,
    demoActionCounter,
    lastDemoAction,
    triggerLoadJuzgadoDemo,
    triggerClearBlankProject,
  } = useProject();

  const [rawText, setRawText] = useState('');
  const [lelMarkdown, setLelMarkdown] = useState('');
  const [showLelInput, setShowLelInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractScenariosResponse | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (demoActionCounter === 0) return;
    if (lastDemoAction === 'LOAD_JUZGADO') {
      setRawText(JUZGADO_CASE_STUDY_PRESET.transcriptMarkdown);
      setLelMarkdown(JUZGADO_CASE_STUDY_PRESET.lelMarkdown);
      setShowLelInput(true);
      setError(null);
      setResult(null);
    } else if (lastDemoAction === 'CLEAR_BLANK') {
      setRawText('');
      setLelMarkdown('');
      setShowLelInput(false);
      setError(null);
      setResult(null);
    }
  }, [demoActionCounter, lastDemoAction]);

  const handleFileUpload = async (file: File) => {
    try {
      const content = await file.text();
      setRawText(content);
      setError(null);
    } catch {
      setError('No fue posible leer el archivo seleccionado.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFileUpload(file);
    }
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError(
        'Por favor ingrese o cargue un documento de relevamiento, transcripción de entrevista o especificación funcional.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.extractScenarios({
        projectName: activeProject.trim() || 'Mi Proyecto de Software',
        rawText: rawText.trim(),
        lelMarkdown: lelMarkdown.trim() ? lelMarkdown.trim() : undefined,
      });
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error inesperado al extraer escenarios candidatos.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!result?.formattedListMarkdown) return;
    await navigator.clipboard.writeText(result.formattedListMarkdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Academic Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Etapa 1 · Relevamiento y Elicitación
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Extracción de Candidatos a Escenarios desde Texto Desestructurado
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Identifica escenarios candidatos (<span className="font-medium">Integrador, Particular, Sub-Escenario, Excepción</span>) a partir de entrevistas, minutas de reunión o descripciones funcionales de cualquier dominio de software, con trazabilidad hacia las citas fuente y el Léxico Extendido del Lenguaje (LEL).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={triggerLoadJuzgadoDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors shadow-sm"
            title="Cargar las transcripciones anonimizadas y los 17 símbolos LEL del Caso de Estudio Judicial"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Demo: Caso de Estudio Judicial</span>
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

      {/* Extraction Form */}
      <form
        onSubmit={handleExtract}
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Nombre del Proyecto / Dominio Activo
            </label>
            <input
              type="text"
              value={activeProject}
              onChange={(e) => setActiveProject(e.target.value)}
              placeholder="Ej: Sistema de Turnos Clínicos, E-Commerce B2B..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowLelInput((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {showLelInput
                  ? 'Ocultar Glosario LEL Contextual'
                  : 'Añadir Glosario LEL Contextual (Opcional)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Subir archivo (.md / .txt)</span>
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

        {/* Drag & Drop or Paste Narrative Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed transition-colors p-1 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/40'
              : 'border-slate-300 bg-slate-50/50'
          }`}
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Texto de Relevamiento (Entrevistas, Actas de Reunión o Especificación Funcional)
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                {rawText.length} caracteres · Arrastre un archivo .md / .txt o pegue el texto
              </span>
            </div>
            <textarea
              rows={9}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Pegue transcripciones de entrevistas, minutas de relevamiento o especificaciones funcionales del sistema..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Optional Contextual LEL */}
        {showLelInput && (
          <div className="bg-indigo-50/40 border border-indigo-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Léxico Extendido del Lenguaje (LEL) Contextual (Opcional)</span>
              </label>
              <button
                type="button"
                onClick={() => setLelMarkdown(GENERIC_LEL_TEMPLATE)}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-medium underline"
              >
                Insertar plantilla LEL de ejemplo
              </button>
            </div>
            <textarea
              rows={6}
              value={lelMarkdown}
              onChange={(e) => setLelMarkdown(e.target.value)}
              placeholder="Pegue el glosario LEL en formato Markdown (Sujetos, Objetos, Verbos, Estados) para alinear los títulos de los escenarios candidatos..."
              className="w-full rounded-lg border border-indigo-200 bg-white p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Endpoint destino:{' '}
            <code className="font-mono text-indigo-700">POST /scenarios/extract</code> · Proyecto:{' '}
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
                <span>Analizando Relevamiento con LLM...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extraer Candidatos a Escenarios</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <FileSearch className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-semibold">
                    Candidatos a Escenarios Identificados ({result.scenarios.length})
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Proyecto: {result.projectName} · Proveedor: {result.llmProvider} ({result.llmModel})
                  </p>
                </div>
              </div>

              <span className="text-xs text-indigo-300">
                Seleccione &ldquo;Enviar a Estructurar&rdquo; para construir la plantilla BNF en la Pestaña 2
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-16">Nº</th>
                    <th className="px-4 py-3">Título Propuesto (Verbo Infinitivo + Objeto LEL)</th>
                    <th className="px-4 py-3 w-36">Rol / Tipo</th>
                    <th className="px-4 py-3">Justificación Metodológica y Cita Fuente</th>
                    <th className="px-4 py-3 w-48 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {result.scenarios.map((scen) => (
                    <tr key={scen.number} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 align-top font-mono font-bold text-slate-900">
                        #{scen.number}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="font-mono font-semibold text-slate-900 text-xs sm:text-sm block">
                          {scen.title}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            ROLE_BADGE_STYLES[scen.type] ||
                            'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {scen.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top space-y-2">
                        <p className="text-slate-800 leading-relaxed">{scen.justification}</p>
                        {scen.sourceQuote && (
                          <div className="flex items-start gap-2 bg-slate-50 border-l-2 border-indigo-400 px-3 py-1.5 rounded-r text-slate-600 italic">
                            <Quote className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>&ldquo;{scen.sourceQuote}&rdquo;</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            onSendToStructurer({
                              projectName: result.projectName || activeProject,
                              scenario: scen,
                              rawContextText: rawText,
                              lelMarkdown,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          <span>Enviar a Estructurar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Copyable Markdown Preview */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Vista Previa Markdown Oficial (formattedListMarkdown)
              </span>
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700"
              >
                {copiedMd ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado al portapapeles</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Tabla Markdown</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono bg-slate-900 text-slate-100 overflow-x-auto leading-relaxed">
              {result.formattedListMarkdown}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
