import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Tag,
  FlaskConical,
} from 'lucide-react';
import { apiClient } from '../services/api';
import {
  GENERIC_LEL_TEMPLATE,
  JUZGADO_CASE_STUDY_PRESET,
} from '../services/presets';
import { IngestLelResponse, RagSearchResponse } from '../types/api';
import { useProject } from '../context/ProjectContext';

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  Sujeto: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Objeto: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Verbo: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Estado: 'bg-amber-100 text-amber-800 border-amber-200',
};

export const RagVectorView: React.FC = () => {
  const {
    activeProject,
    setActiveProject,
    knownProjects,
    refreshProjects,
    demoActionCounter,
    lastDemoAction,
    triggerLoadJuzgadoDemo,
  } = useProject();

  // Search state
  const [searchQuery, setSearchQuery] = useState(
    'Sujetos, Objetos, Verbos y Estados del dominio'
  );
  const [scopeFilter, setScopeFilter] = useState<
    'LEL_ACTIVE' | 'LEL_ALL' | 'MARCO_TEORICO'
  >('LEL_ACTIVE');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searching, setSearching] = useState(false);
  const [searchResponse, setSearchResponse] =
    useState<RagSearchResponse | null>(null);

  // Upload LEL Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [lelMarkdown, setLelMarkdown] = useState('');
  const [ingestingLel, setIngestingLel] = useState(false);
  const [lelResult, setLelResult] = useState<IngestLelResponse | null>(null);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runCatalogSearch = async (
    queryText: string,
    scope: 'LEL_ACTIVE' | 'LEL_ALL' | 'MARCO_TEORICO',
    projectName: string
  ) => {
    if (!queryText.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await apiClient.searchRag({
        query: queryText.trim(),
        type: scope === 'MARCO_TEORICO' ? 'MARCO_TEORICO' : 'LEL',
        projectName: scope === 'LEL_ACTIVE' ? projectName : undefined,
        topK: 15,
      });
      setSearchResponse(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al consultar el catálogo vectorial.'
      );
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    void runCatalogSearch(searchQuery, scopeFilter, activeProject);
  }, [activeProject, scopeFilter]);

  useEffect(() => {
    if (demoActionCounter === 0) return;
    if (lastDemoAction === 'LOAD_JUZGADO') {
      setLelMarkdown(JUZGADO_CASE_STUDY_PRESET.lelMarkdown);
      setScopeFilter('LEL_ACTIVE');
      void runCatalogSearch(
        'Expediente Despachar Escribiente Juez Fiscal Documento Sentencia',
        'LEL_ACTIVE',
        JUZGADO_CASE_STUDY_PRESET.projectName
      );
    } else if (lastDemoAction === 'CLEAR_BLANK') {
      setLelMarkdown('');
      setSearchResponse(null);
    }
  }, [demoActionCounter, lastDemoAction]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runCatalogSearch(searchQuery, scopeFilter, activeProject);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      setLelMarkdown(text);
    } catch {
      setError('No se pudo leer el archivo seleccionado.');
    }
  };

  const handleIngestLelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject.trim() || !lelMarkdown.trim()) return;

    setIngestingLel(true);
    setError(null);
    setLelResult(null);
    try {
      const res = await apiClient.ingestLel({
        projectName: activeProject.trim(),
        title: `LEL - ${activeProject.trim()}`,
        lelMarkdown: lelMarkdown.trim(),
      });
      setLelResult(res);
      await refreshProjects();
      await runCatalogSearch(searchQuery, 'LEL_ACTIVE', activeProject.trim());
      setTimeout(() => {
        setIsUploadModalOpen(false);
      }, 900);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al indexar el glosario LEL.'
      );
    } finally {
      setIngestingLel(false);
    }
  };

  const filteredResults = (searchResponse?.results || []).filter((item) => {
    if (categoryFilter === 'ALL') return true;
    const cat = String(item.metadata?.category || '').toLowerCase();
    return cat === categoryFilter.toLowerCase();
  });

  const activeProjectStats = knownProjects.find(
    (p) => p.projectName === activeProject
  );

  return (
    <div className="space-y-6">
      {/* Top Catalog Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Explorador de Glosario LEL
              </h2>
              <p className="text-xs text-slate-500">
                Proyecto activo:{' '}
                <strong className="text-slate-900">{activeProject}</strong>
                {activeProjectStats && activeProjectStats.symbolsCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {activeProjectStats.symbolsCount} símbolos indexados
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerLoadJuzgadoDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Ver LEL Demo Juzgado</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLelResult(null);
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Subir / Actualizar LEL</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar término del dominio, noción, impacto o regla metodológica..."
              className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Buscar</span>
          </button>
        </form>

        {/* Scope & Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Alcance:</span>
            <button
              type="button"
              onClick={() => setScopeFilter('LEL_ACTIVE')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                scopeFilter === 'LEL_ACTIVE'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              LEL de &ldquo;{activeProject}&rdquo;
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('LEL_ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                scopeFilter === 'LEL_ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos los Proyectos
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('ALL');
                setScopeFilter('MARCO_TEORICO');
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                scopeFilter === 'MARCO_TEORICO'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Marco Teórico (Hadad / Calegari)
            </button>
          </div>

          {scopeFilter !== 'MARCO_TEORICO' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1">Categoría:</span>
              {['ALL', 'Sujeto', 'Objeto', 'Verbo', 'Estado'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'Todas' : cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Catalog Grid */}
      {filteredResults.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <Tag className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">
            No se encontraron símbolos LEL para &ldquo;{activeProject}&rdquo;
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Puede cargar la demostración del Caso Judicial o subir el glosario LEL de su propio proyecto con el botón superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map((item) => {
            const meta = item.metadata || {};
            const symbolName = String(meta.symbolName || item.documentTitle);
            const category = String(meta.category || '');
            const projectName = String(meta.projectName || '');
            const similarityPct = Math.round(item.similarity * 100);

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">
                        {symbolName}
                      </h3>
                      {category && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            CATEGORY_BADGE_STYLES[category] ||
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {category}
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0">
                      {similarityPct}% afín
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl p-3 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </div>
                </div>

                {projectName && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Proyecto: {projectName}</span>
                    {projectName !== activeProject && (
                      <button
                        type="button"
                        onClick={() => setActiveProject(projectName)}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        Activar este proyecto
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload / Index New LEL Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Subir e Indexar Glosario LEL
                </h3>
                <p className="text-xs text-slate-500">
                  Los símbolos se vectorizarán en pgvector bajo el proyecto{' '}
                  <strong className="text-slate-900">{activeProject}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIngestLelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proyecto Destino
                </label>
                <input
                  type="text"
                  value={activeProject}
                  onChange={(e) => setActiveProject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Contenido del Glosario LEL (.md)
                  </label>
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cargar archivo .md</span>
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
                    <button
                      type="button"
                      onClick={() => setLelMarkdown(GENERIC_LEL_TEMPLATE)}
                      className="text-slate-600 hover:underline"
                    >
                      Insertar ejemplo
                    </button>
                  </div>
                </div>

                <textarea
                  rows={9}
                  value={lelMarkdown}
                  onChange={(e) => setLelMarkdown(e.target.value)}
                  placeholder="### Símbolo Nº 1: Nombre..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600 leading-relaxed"
                  required
                />
              </div>

              {lelResult && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Se vectorizaron {lelResult.lelSymbolsCount} símbolos LEL
                    correctamente.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={ingestingLel}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold shadow-sm"
                >
                  {ingestingLel ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Indexando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Indexar Glosario LEL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
