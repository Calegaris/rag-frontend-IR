import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Wand2,
  BookOpen,
  Upload,
  ArrowRight,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { Navbar, ScreenMode } from './components/Navbar';
import { AuditBenchmarkView, AuditPrefill } from './views/AuditBenchmarkView';
import { ElicitationWizardView } from './views/ElicitationWizardView';
import { RagVectorView } from './views/RagVectorView';
import { ValidationReport } from './types/api';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { JUZGADO_CASE_STUDY_PRESET } from './services/presets';

const MainWorkspace: React.FC = () => {
  const { activeProject, triggerLoadJuzgadoDemo } = useProject();
  const [screen, setScreen] = useState<ScreenMode>('landing');
  const [auditPrefill, setAuditPrefill] = useState<AuditPrefill | null>(null);
  const [isDraggingDoor1, setIsDraggingDoor1] = useState(false);

  const door1FileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLoadJuzgadoDemoAndAudit = () => {
    triggerLoadJuzgadoDemo();
    setAuditPrefill({
      rawMarkdown: JUZGADO_CASE_STUDY_PRESET.scenariosMarkdown,
      projectName: JUZGADO_CASE_STUDY_PRESET.projectName,
      autoRun: true,
    });
    setScreen('audit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDoor1FileDropOrSelect = async (file: File) => {
    try {
      const content = await file.text();
      setAuditPrefill({
        rawMarkdown: content,
        projectName: activeProject,
        autoRun: true,
      });
      setScreen('audit');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Fallback to opening audit screen
      setScreen('audit');
    }
  };

  const handleOpenInAuditFromWizard = (payload: {
    rawMarkdown: string;
    validationReport: ValidationReport;
    projectName: string;
  }) => {
    setAuditPrefill({
      rawMarkdown: payload.rawMarkdown,
      validationReport: payload.validationReport,
      projectName: payload.projectName,
    });
    setScreen('audit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentScreen={screen}
        onNavigate={(next) => {
          if (next === 'landing') {
            setAuditPrefill(null);
          }
          setScreen(next);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLoadJuzgadoDemoAndAudit={handleLoadJuzgadoDemoAndAudit}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* 3-Door Minimalist Landing Screen */}
        {screen === 'landing' && (
          <div className="space-y-10 py-4">
            {/* Hero Introduction */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ingeniería de Requisitos · Escenarios &amp; LEL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                ¿Qué desea realizar en <span className="text-indigo-600">{activeProject}</span>?
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Seleccione una de las tres herramientas principales o ejecute la demostración precargada del Caso de Estudio Juzgado.
              </p>
            </div>

            {/* 3 Primary Doors Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* DOOR 1: Auditar Especificación de Escenarios */}
              <div className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      1. Auditar Especificación de Escenarios
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Evalúa reglas formales BNF y consistencia semántica RAG sobre un documento <code className="font-mono text-indigo-600">.md</code> con uno o varios escenarios.
                    </p>
                  </div>

                  {/* Inline Drag & Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingDoor1(true);
                    }}
                    onDragLeave={() => setIsDraggingDoor1(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingDoor1(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) void handleDoor1FileDropOrSelect(file);
                    }}
                    onClick={() => door1FileInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                      isDraggingDoor1
                        ? 'border-indigo-500 bg-indigo-50/60'
                        : 'border-slate-200 hover:border-indigo-300 bg-slate-50/70'
                    }`}
                  >
                    <input
                      ref={door1FileInputRef}
                      type="file"
                      accept=".md,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleDoor1FileDropOrSelect(file);
                      }}
                    />
                    <Upload className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
                    <span className="text-xs font-semibold text-slate-800 block">
                      Arrastre su archivo .md aquí
                    </span>
                    <span className="text-[11px] text-slate-400">
                      o haga clic para seleccionar
                    </span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleLoadJuzgadoDemoAndAudit}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Demo Juzgado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuditPrefill(null);
                      setScreen('audit');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                  >
                    <span>Abrir Auditor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* DOOR 2: Asistente de Relevamiento a Escenario */}
              <div className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <Wand2 className="w-6 h-6" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      2. Asistente de Relevamiento a Escenario
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Convierta entrevistas o narrativas informales en escenarios formales estructurados mediante un flujo guiado de 3 pasos.
                    </p>
                  </div>

                  <ol className="space-y-2 text-xs text-slate-600 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-[11px] font-bold flex items-center justify-center text-slate-700">
                        1
                      </span>
                      <span>Pegar entrevista o minuta de relevamiento</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-[11px] font-bold flex items-center justify-center text-slate-700">
                        2
                      </span>
                      <span>Seleccionar escenario candidato detectado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-[11px] font-bold flex items-center justify-center text-slate-700">
                        3
                      </span>
                      <span>Obtener plantilla formal BNF validada</span>
                    </li>
                  </ol>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setScreen('wizard')}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <span>Iniciar Asistente Paso a Paso</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* DOOR 3: Explorador de Glosario LEL */}
              <div className="bg-white border border-slate-200 hover:border-cyan-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      3. Explorador de Glosario LEL
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Consulte el catálogo de símbolos del Léxico Extendido del Lenguaje (Sujetos, Objetos, Verbos y Estados) o indexe un nuevo glosario.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-[11px] font-medium">
                      Sujetos
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-medium">
                      Objetos
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 text-[11px] font-medium">
                      Verbos
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-medium">
                      Estados
                    </span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setScreen('lel')}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <span>Explorar Catálogo LEL</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Door 1: Audit View */}
        {screen === 'audit' && (
          <AuditBenchmarkView
            prefill={auditPrefill}
            onResetToLanding={() => {
              setAuditPrefill(null);
              setScreen('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Door 2: 3-Step Elicitation Wizard */}
        {screen === 'wizard' && (
          <ElicitationWizardView
            onOpenInAudit={handleOpenInAuditFromWizard}
          />
        )}

        {/* Door 3: LEL Catalog Explorer */}
        {screen === 'lel' && <RagVectorView />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ProjectProvider>
      <MainWorkspace />
    </ProjectProvider>
  );
};

export default App;
