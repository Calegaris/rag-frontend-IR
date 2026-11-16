import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Upload,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Loader2,
  AlertCircle,
  FlaskConical,
  RotateCcw,
  FileText,
  FileWarning,
} from 'lucide-react';
import { apiClient } from '../services/api';
import {
  DEFECTIVE_SCENARIO_SAMPLE,
  GENERIC_SCENARIO_TEMPLATE,
  JUZGADO_CASE_STUDY_PRESET,
} from '../services/presets';
import {
  BenchmarkScenarioReport,
  BenchmarkSuiteReport,
  ValidationReport,
} from '../types/api';
import { ValidationFindingsTable } from '../components/ValidationFindingsTable';
import { useProject } from '../context/ProjectContext';

export interface AuditPrefill {
  rawMarkdown: string;
  validationReport?: ValidationReport;
  projectName: string;
  autoRun?: boolean;
}

interface AuditBenchmarkViewProps {
  prefill: AuditPrefill | null;
  onResetToLanding: () => void;
}

function detectIsSingleScenario(raw: string): boolean {
  const trimmed = raw.trim();
  const matches = trimmed.match(/#{2,4}\s*Escenario\s+N[º°o]?/gi);
  const count = matches ? matches.length : 0;
  return count <= 1;
}

function convertSingleReportToSuite(
  report: ValidationReport,
  projectName: string,
  executionTimeMs: number
): BenchmarkSuiteReport {
  return {
    projectName,
    totalScenarios: 1,
    validScenariosCount: report.isValid ? 1 : 0,
    invalidScenariosCount: report.isValid ? 0 : 1,
    totalSyntaxErrors: report.summary.syntaxErrorsCount,
    totalStructuralErrors: report.summary.structuralErrorsCount,
    totalWarnings: report.summary.warningsCount,
    totalSemanticIssues: report.summary.semanticIssuesCount,
    executionTimeMs,
    scenarios: [
      {
        scenarioNumber: report.parsedScenario.scenarioNumber || 1,
        title:
          report.scenarioTitle ||
          report.parsedScenario.title ||
          'Escenario #1',
        type:
          report.parsedScenario.rawRole ||
          report.parsedScenario.type ||
          'Particular',
        isValid: report.isValid,
        summary: report.summary,
        validations: report.validations,
        ragContextUsed: report.ragContextUsed,
        executionTimeMs,
      },
    ],
  };
}

export const AuditBenchmarkView: React.FC<AuditBenchmarkViewProps> = ({
  prefill,
  onResetToLanding,
}) => {
  const {
    activeProject,
    setActiveProject,
    enableSemantic,
    demoActionCounter,
    lastDemoAction,
    triggerLoadJuzgadoDemo,
  } = useProject();

  const [rawMarkdown, setRawMarkdown] = useState('');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suiteReport, setSuiteReport] = useState<BenchmarkSuiteReport | null>(
    null
  );
  const [expandedScenarios, setExpandedScenarios] = useState<
    Record<number, boolean>
  >({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const executeAuditOnMarkdown = async (
    markdownToAudit: string,
    targetProjectName: string
  ) => {
    const cleanMd = markdownToAudit.trim();
    if (!cleanMd) {
      setError('Seleccione un archivo Markdown (.md) o pegue los escenarios a auditar.');
      return;
    }

    setLoading(true);
    setError(null);
    const start = Date.now();
    try {
      if (detectIsSingleScenario(cleanMd)) {
        const report = await apiClient.validateScenario({
          rawMarkdown: cleanMd,
          enableSemantic,
          projectName: targetProjectName,
        });
        const suite = convertSingleReportToSuite(
          report,
          targetProjectName,
          Date.now() - start
        );
        setSuiteReport(suite);
        setExpandedScenarios({ [suite.scenarios[0].scenarioNumber]: true });
      } else {
        const res = await apiClient.runBenchmark({
          projectName: targetProjectName,
          rawMarkdown: cleanMd,
          enableSemantic,
        });
        setSuiteReport(res);
        if (res.scenarios.length > 0) {
          setExpandedScenarios({ [res.scenarios[0].scenarioNumber]: true });
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error durante la ejecución de la auditoría.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!prefill) return;
    const proj = prefill.projectName || activeProject;
    if (prefill.projectName) {
      setActiveProject(prefill.projectName);
    }
    setRawMarkdown(prefill.rawMarkdown);

    if (prefill.validationReport) {
      const suite = convertSingleReportToSuite(
        prefill.validationReport,
        proj,
        120
      );
      setSuiteReport(suite);
      setExpandedScenarios({ [suite.scenarios[0].scenarioNumber]: true });
    } else if (prefill.autoRun && prefill.rawMarkdown.trim()) {
      void executeAuditOnMarkdown(prefill.rawMarkdown, proj);
    }
  }, [prefill]);

  useEffect(() => {
    if (demoActionCounter === 0) return;
    if (lastDemoAction === 'LOAD_JUZGADO') {
      const md = JUZGADO_CASE_STUDY_PRESET.scenariosMarkdown;
      setRawMarkdown(md);
      void executeAuditOnMarkdown(md, JUZGADO_CASE_STUDY_PRESET.projectName);
    } else if (lastDemoAction === 'CLEAR_BLANK') {
      setRawMarkdown('');
      setSuiteReport(null);
      setError(null);
    }
  }, [demoActionCounter, lastDemoAction]);

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      setRawMarkdown(text);
      await executeAuditOnMarkdown(text, activeProject);
    } catch {
      setError('No se pudo leer el archivo .md seleccionado.');
    }
  };

  const handleRunJuzgadoDemo = () => {
    triggerLoadJuzgadoDemo();
  };

  const handleRunDefectiveSample = () => {
    setRawMarkdown(DEFECTIVE_SCENARIO_SAMPLE);
    void executeAuditOnMarkdown(DEFECTIVE_SCENARIO_SAMPLE, activeProject);
  };

  const toggleScenarioAccordion = (scenarioNumber: number) => {
    setExpandedScenarios((prev) => ({
      ...prev,
      [scenarioNumber]: !prev[scenarioNumber],
    }));
  };

  const expandAll = (open: boolean) => {
    if (!suiteReport) return;
    const next: Record<number, boolean> = {};
    suiteReport.scenarios.forEach((s) => {
      next[s.scenarioNumber] = open;
    });
    setExpandedScenarios(next);
  };

  const handleExportMarkdownReport = () => {
    if (!suiteReport) return;

    const validityRate =
      suiteReport.totalScenarios > 0
        ? (
            (suiteReport.validScenariosCount / suiteReport.totalScenarios) *
            100
          ).toFixed(1)
        : '0.0';

    const lines: string[] = [
      `# Informe Ejecutivo de Auditoría de Escenarios y Consistencia LEL`,
      ``,
      `- **Proyecto**: ${suiteReport.projectName}`,
      `- **Fecha**: ${new Date().toLocaleString('es-AR')}`,
      `- **Tasa de Aprobación**: ${validityRate}% (${suiteReport.validScenariosCount} de ${suiteReport.totalScenarios} escenarios válidos)`,
      `- **Defectos Determinísticos**: ${
        suiteReport.totalSyntaxErrors + suiteReport.totalStructuralErrors
      } (Advertencias: ${suiteReport.totalWarnings})`,
      `- **Observaciones Semánticas RAG**: ${suiteReport.totalSemanticIssues}`,
      ``,
      `---`,
      ``,
      `## Detalle por Escenario`,
      ``,
    ];

    suiteReport.scenarios.forEach((scen: BenchmarkScenarioReport) => {
      lines.push(
        `### Escenario #${scen.scenarioNumber}: ${scen.title} (${scen.type})`
      );
      lines.push(
        `- **Estado**: ${scen.isValid ? 'VÁLIDO' : 'REQUIERE REVISIÓN'}`
      );
      if (scen.ragContextUsed) {
        lines.push(
          `- **Contexto RAG**: ${
            scen.ragContextUsed.marcoTeoricoChunks
          } reglas teóricas | Símbolos LEL: ${
            scen.ragContextUsed.lelSymbols.join(', ') || 'Ninguno'
          }`
        );
      }
      lines.push(``);

      if (scen.validations.deterministic.length > 0) {
        lines.push(
          `#### Defectos Determinísticos (${scen.validations.deterministic.length})`
        );
        scen.validations.deterministic.forEach((d) => {
          lines.push(
            `- **[${d.ruleId} | ${d.severity} | ${d.field}]**: ${d.message}${
              d.suggestion ? ` *Sugerencia: ${d.suggestion}*` : ''
            }`
          );
        });
        lines.push(``);
      }

      if (scen.validations.semantic.length > 0) {
        lines.push(
          `#### Observaciones Semánticas (${scen.validations.semantic.length})`
        );
        scen.validations.semantic.forEach((s) => {
          lines.push(
            `- **[${s.severity} | ${s.component}${
              s.episodeNumber ? ` Ep.#${s.episodeNumber}` : ''
            }]**: ${s.message} *Sugerencia: ${s.suggestion}*${
              s.ragReference ? ` (Cita: \`${s.ragReference}\`)` : ''
            }`
          );
        });
        lines.push(``);
      }

      if (
        scen.validations.deterministic.length === 0 &&
        scen.validations.semantic.length === 0
      ) {
        lines.push(`*Sin observaciones.*`);
        lines.push(``);
      }
    });

    const blob = new Blob([lines.join('\n')], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-auditoria-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    expandAll(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const approvalPercentage =
    suiteReport && suiteReport.totalScenarios > 0
      ? Math.round(
          (suiteReport.validScenariosCount / suiteReport.totalScenarios) * 100
        )
      : 0;

  const deterministicTotal = suiteReport
    ? suiteReport.totalSyntaxErrors + suiteReport.totalStructuralErrors
    : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Loading Overlay State */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">
            Auditando Especificación de Escenarios...
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Verificando reglas formales BNF y contrastando semántica con el Marco Teórico y los símbolos LEL de &ldquo;{activeProject}&rdquo;.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:underline font-medium"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Input Dropzone State (shown when no report is active and not loading) */}
      {!suiteReport && !loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Auditar Especificación de Escenarios
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Suba un archivo <code className="font-mono text-indigo-600">.md</code> con uno o múltiples escenarios o ejecute un caso de prueba.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRunJuzgadoDemo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Cargar Demo Juzgado (12 Escenarios)</span>
              </button>

              <button
                type="button"
                onClick={handleRunDefectiveSample}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors"
              >
                <FileWarning className="w-3.5 h-3.5 text-amber-600" />
                <span>Probar Escenario con Defectos</span>
              </button>
            </div>
          </div>

          {/* Minimalist Drag & Drop Card */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void handleFileUpload(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
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
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              Arrastre su archivo <span className="text-indigo-600">.md</span> aquí o haga clic para seleccionarlo
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Soporta tanto un escenario individual como un documento completo de múltiples escenarios
            </p>
          </div>

          {/* Optional Paste Markdown Accordion */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowTextEditor((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {showTextEditor
                  ? 'Ocultar editor de texto manual'
                  : '¿Prefiere pegar o editar el Markdown manualmente?'}
              </span>
            </button>

            {showTextEditor && (
              <div className="mt-3 space-y-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setRawMarkdown(GENERIC_SCENARIO_TEMPLATE)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Insertar plantilla BNF de ejemplo
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={rawMarkdown}
                  onChange={(e) => setRawMarkdown(e.target.value)}
                  placeholder="Pegue aquí la especificación de escenarios en formato Markdown..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600 leading-relaxed"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!rawMarkdown.trim()}
                    onClick={() =>
                      void executeAuditOnMarkdown(rawMarkdown, activeProject)
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Auditar Especificación</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print-Only Header */}
      {suiteReport && (
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            ReqStudio — Informe Ejecutivo de Auditoría de Escenarios
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Proyecto: {suiteReport.projectName} · Fecha:{' '}
            {new Date().toLocaleDateString('es-AR')}
          </p>
        </div>
      )}

      {/* Executive Audit Results View */}
      {suiteReport && !loading && (
        <div className="space-y-6">
          {/* Executive Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Informe de Auditoría · {suiteReport.projectName}
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Resultados de Validación de Escenarios ({suiteReport.totalScenarios})
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs print:hidden">
              <button
                type="button"
                onClick={() => expandAll(true)}
                className="text-indigo-600 hover:underline font-medium"
              >
                Expandir todos
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => expandAll(false)}
                className="text-slate-600 hover:underline font-medium"
              >
                Contraer todos
              </button>
            </div>
          </div>

          {/* 3 Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Tasa de Aprobación */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tasa de Aprobación
                </span>
                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="text-3xl font-bold text-slate-900 font-mono">
                    {approvalPercentage}%
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      approvalPercentage === 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {approvalPercentage === 100
                      ? 'Aprobado'
                      : 'Requiere Revisión'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  {suiteReport.validScenariosCount} de{' '}
                  {suiteReport.totalScenarios} escenarios válidos
                </p>
              </div>
              <div
                className={`p-2.5 rounded-xl ${
                  approvalPercentage === 100
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Defectos Determinísticos */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Defectos Determinísticos
                </span>
                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="text-3xl font-bold text-slate-900 font-mono">
                    {deterministicTotal}
                  </span>
                  <span className="text-xs text-slate-500">
                    errores BNF ({suiteReport.totalWarnings} advertencias)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Estructura formal, campos obligatorios y sintaxis
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Observaciones Semánticas */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Observaciones Semánticas
                </span>
                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="text-3xl font-bold text-indigo-700 font-mono">
                    {suiteReport.totalSemanticIssues}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700">
                    {enableSemantic ? 'RAG Activo' : 'RAG Desactivado'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Consistencia con Marco Teórico y Glosario LEL
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Clean Scenarios Accordion List */}
          <div className="space-y-3">
            {suiteReport.scenarios.map((scenario) => {
              const isExpanded = Boolean(
                expandedScenarios[scenario.scenarioNumber]
              );
              const totalFindings =
                scenario.validations.deterministic.length +
                scenario.validations.semantic.length;

              return (
                <div
                  key={scenario.scenarioNumber}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print:break-inside-avoid"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleScenarioAccordion(scenario.scenarioNumber)
                    }
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        #{scenario.scenarioNumber}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {scenario.title}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {scenario.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {totalFindings > 0 && (
                        <span className="text-xs text-slate-500 hidden sm:inline">
                          {totalFindings}{' '}
                          {totalFindings === 1 ? 'observación' : 'observaciones'}
                        </span>
                      )}

                      {scenario.isValid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Válido</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Requiere Revisión</span>
                        </span>
                      )}

                      <span className="text-slate-400 print:hidden">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50">
                      <ValidationFindingsTable
                        deterministic={scenario.validations.deterministic}
                        semantic={scenario.validations.semantic}
                        ragContextUsed={scenario.ragContextUsed}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Executive Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 py-3 px-4 z-30 print:hidden shadow-lg">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSuiteReport(null);
                  setRawMarkdown('');
                  onResetToLanding();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nueva Auditoría</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportMarkdownReport}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Informe (.md)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar en PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
