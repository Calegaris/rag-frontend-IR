import React, { useState } from 'react';
import {
  Sparkles,
  Settings,
  Check,
  X,
  KeyRound,
  Cpu,
  FolderKanban,
  ChevronDown,
  FlaskConical,
  Database,
  RefreshCw,
  Home,
  ShieldCheck,
  Wand2,
  BookOpen,
  Plus,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react';
import { LlmRuntimeConfig } from '../types/api';
import { getStoredLlmConfig, saveLlmConfig, apiClient } from '../services/api';
import { useProject } from '../context/ProjectContext';
import { JUZGADO_CASE_STUDY_PRESET } from '../services/presets';

export type ScreenMode = 'landing' | 'audit' | 'wizard' | 'lel';

interface NavbarProps {
  currentScreen: ScreenMode;
  onNavigate: (screen: ScreenMode) => void;
  onLoadJuzgadoDemoAndAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onLoadJuzgadoDemoAndAudit,
}) => {
  const {
    activeProject,
    setActiveProject,
    enableSemantic,
    setEnableSemantic,
    isDarkMode,
    toggleDarkMode,
    ragStats,
    dbConnected,
    knownProjects,
    refreshProjects,
    triggerClearBlankProject,
  } = useProject();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectInput, setNewProjectInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [config, setConfig] = useState<LlmRuntimeConfig>(() =>
    getStoredLlmConfig()
  );
  const [savedToast, setSavedToast] = useState(false);
  const [reindexingCorpus, setReindexingCorpus] = useState(false);
  const [reindexSuccess, setReindexSuccess] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveLlmConfig(config);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      setIsSettingsOpen(false);
    }, 800);
  };

  const handleClearConfig = () => {
    const empty: LlmRuntimeConfig = { apiKey: '', provider: '', model: '' };
    setConfig(empty);
    saveLlmConfig(empty);
  };

  const handleCreateOrSwitchProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectInput.trim()) return;
    setActiveProject(newProjectInput.trim());
    setNewProjectInput('');
    setIsProjectModalOpen(false);
  };

  const handleReindexCorpus = async () => {
    setReindexingCorpus(true);
    setReindexSuccess(null);
    try {
      const res = await apiClient.ingestCorpus({
        projectName: JUZGADO_CASE_STUDY_PRESET.projectName,
      });
      await refreshProjects();
      setReindexSuccess(
        `Indexados ${res.totalEmbeddingsStored} vectores (${res.marcoTeoricoChunksCount} teóricos + ${res.lelSymbolsCount} LEL).`
      );
    } catch {
      setReindexSuccess('Error al re-indexar el corpus en pgvector.');
    } finally {
      setReindexingCorpus(false);
    }
  };

  return (
    <header className="bg-slate-900 dark:bg-slate-950 text-slate-50 border-b border-slate-800 sticky top-0 z-40 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Clean Brand & Subtle Navigation */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="Volver a la pantalla principal"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-500 transition-colors shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-sm sm:text-base font-semibold tracking-tight text-white block truncate">
                ReqStudio{' '}
                <span className="text-slate-400 font-normal hidden md:inline">
                  — Asistente &amp; Auditor de Escenarios RAG
                </span>
              </span>
            </div>
          </button>

          {currentScreen !== 'landing' && (
            <nav className="hidden lg:flex items-center gap-1 pl-3 border-l border-slate-800">
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Inicio</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('audit')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  currentScreen === 'audit'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Auditar</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('wizard')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  currentScreen === 'wizard'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Asistente</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('lel')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  currentScreen === 'lel'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Glosario LEL</span>
              </button>
            </nav>
          )}
        </div>

        {/* Right: Active Project Chip + Cargar Demo Juzgado + Dark Mode + Gear Settings */}
        <div className="flex items-center gap-2 relative shrink-0">
          {/* 1. Proyecto Activo Chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProjectModalOpen((prev) => !prev);
                setIsSettingsOpen(false);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-xs text-slate-200 transition-colors"
              title="Cambiar o crear Proyecto Activo"
            >
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400 hidden sm:inline">
                Proyecto Activo:
              </span>
              <span className="font-semibold text-white max-w-[140px] sm:max-w-[180px] truncate">
                {activeProject}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Project Switcher Popover */}
            {isProjectModalOpen && (
              <div className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Proyecto Activo
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* New project input */}
                <form
                  onSubmit={handleCreateOrSwitchProject}
                  className="flex gap-1.5"
                >
                  <input
                    type="text"
                    value={newProjectInput}
                    onChange={(e) => setNewProjectInput(e.target.value)}
                    placeholder="Nuevo proyecto (ej: Clínica Web)..."
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Usar</span>
                  </button>
                </form>

                <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5">
                  <span className="text-[11px] font-medium text-slate-400 block px-1">
                    Proyectos disponibles
                  </span>
                  {knownProjects.map((proj) => {
                    const isCurrent = proj.projectName === activeProject;
                    return (
                      <button
                        key={proj.documentId || proj.projectName}
                        type="button"
                        onClick={() => {
                          setActiveProject(proj.projectName);
                          setIsProjectModalOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-950 dark:text-indigo-200 font-semibold border border-indigo-200 dark:border-indigo-800'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate pr-2">{proj.projectName}</span>
                        {proj.symbolsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                            {proj.symbolsCount} LEL
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      triggerClearBlankProject();
                      setIsProjectModalOpen(false);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white underline"
                  >
                    Reiniciar proyecto en blanco
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Quick Action Button: Cargar Demo Juzgado */}
          <button
            type="button"
            onClick={() => {
              setIsProjectModalOpen(false);
              setIsSettingsOpen(false);
              onLoadJuzgadoDemoAndAudit();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
            title="Cargar el Caso de Estudio Judicial (12 escenarios y 17 símbolos LEL)"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Cargar Demo Juzgado</span>
          </button>

          {/* 3. Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={
              isDarkMode
                ? 'Cambiar a modo claro'
                : 'Cambiar a modo nocturno'
            }
            aria-label="Cambiar a modo claro / modo nocturno"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-300" />
            )}
          </button>

          {/* 4. Gear Icon Settings Modal Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen((prev) => !prev);
                setIsProjectModalOpen(false);
              }}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative"
              title="Configuración técnica (RAG, Motor LLM y Estado pgvector)"
              aria-label="Configuración"
            >
              <Settings className="w-4 h-4" />
              <span
                className={`w-2 h-2 rounded-full absolute top-1 right-1 ${
                  dbConnected === false
                    ? 'bg-rose-500'
                    : dbConnected === true
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
              />
            </button>

            {/* Floating Technical Settings Modal */}
            {isSettingsOpen && (
              <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5 z-50 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Configuración del Sistema
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section A: Semantic RAG Toggle */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      Auditoría Semántica RAG
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">
                      Contrasta escenarios contra el Marco Teórico y el glosario LEL en pgvector
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSemantic}
                    onChange={(e) => setEnableSemantic(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                  />
                </div>

                {/* Section B: PostgreSQL / pgvector Status */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Base Vectorial pgvector
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          dbConnected
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            dbConnected ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {dbConnected ? 'Conectado' : 'Sin conexión'}
                      </span>
                      <button
                        type="button"
                        onClick={() => void refreshProjects()}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        title="Refrescar estado"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {ragStats && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                      <div className="bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block">Marco Teórico</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-100">
                          {ragStats.byType.MARCO_TEORICO.embeddings} vectores
                        </strong>
                      </div>
                      <div className="bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block">Símbolos LEL</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-100">
                          {ragStats.byType.LEL.embeddings} vectores
                        </strong>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={reindexingCorpus}
                    onClick={handleReindexCorpus}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {reindexingCorpus ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>Indexando Corpus Base...</span>
                      </>
                    ) : (
                      <span>Re-indexar Corpus Oficial (Teoría + Caso Juzgado)</span>
                    )}
                  </button>

                  {reindexSuccess && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      {reindexSuccess}
                    </p>
                  )}
                </div>

                {/* Section C: LLM Provider & Credentials */}
                <form onSubmit={handleSaveConfig} className="space-y-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Proveedor y Credenciales LLM</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        Proveedor
                      </label>
                      <select
                        value={config.provider}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            provider: e.target.value as LlmRuntimeConfig['provider'],
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-600"
                      >
                        <option value="">Servidor (.env)</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI</option>
                        <option value="claude">Anthropic Claude</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        Modelo (Opcional)
                      </label>
                      <input
                        type="text"
                        value={config.model}
                        onChange={(e) =>
                          setConfig({ ...config, model: e.target.value })
                        }
                        placeholder="gemini-2.5-flash"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      API Key Override (Opcional)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="password"
                        value={config.apiKey}
                        onChange={(e) =>
                          setConfig({ ...config, apiKey: e.target.value })
                        }
                        placeholder="Usa la clave del servidor si se deja vacío"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-2.5 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleClearConfig}
                      className="text-xs text-slate-400 hover:text-rose-600"
                    >
                      Restablecer
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                    >
                      {savedToast ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Guardado</span>
                        </>
                      ) : (
                        <span>Guardar cambios</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
