import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { apiClient } from '../services/api';
import {
  DEFAULT_BLANK_PROJECT_NAME,
  JUZGADO_DEMO_PROJECT_NAME,
} from '../services/presets';
import { IndexedLelProjectStat, RagStatsResponse } from '../types/api';

const ACTIVE_PROJECT_STORAGE_KEY = 'rag_active_project';
const LOCAL_PROJECTS_STORAGE_KEY = 'rag_known_local_projects';
const ENABLE_SEMANTIC_STORAGE_KEY = 'rag_enable_semantic';
const DARK_MODE_STORAGE_KEY = 'reqstudio_dark_mode';

export type DemoActionType = 'LOAD_JUZGADO' | 'CLEAR_BLANK' | null;

export interface ProjectContextValue {
  activeProject: string;
  setActiveProject: (name: string) => void;
  enableSemantic: boolean;
  setEnableSemantic: (enabled: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  ragStats: RagStatsResponse | null;
  dbConnected: boolean | null;
  knownProjects: IndexedLelProjectStat[];
  refreshProjects: () => Promise<void>;
  demoActionCounter: number;
  lastDemoAction: DemoActionType;
  triggerLoadJuzgadoDemo: () => void;
  triggerClearBlankProject: () => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

function getStoredLocalProjects(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_STORAGE_KEY);
    if (!raw) return [DEFAULT_BLANK_PROJECT_NAME];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(Boolean)
      : [DEFAULT_BLANK_PROJECT_NAME];
  } catch {
    return [DEFAULT_BLANK_PROJECT_NAME];
  }
}

function saveLocalProjectName(name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const current = getStoredLocalProjects();
  if (!current.includes(trimmed)) {
    const updated = [trimmed, ...current].slice(0, 20);
    localStorage.setItem(LOCAL_PROJECTS_STORAGE_KEY, JSON.stringify(updated));
  }
}

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeProject, setActiveProjectState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
      return saved && saved.trim() ? saved.trim() : DEFAULT_BLANK_PROJECT_NAME;
    } catch {
      return DEFAULT_BLANK_PROJECT_NAME;
    }
  });

  const [enableSemantic, setEnableSemanticState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(ENABLE_SEMANTIC_STORAGE_KEY);
      if (saved === null) return true;
      return saved === 'true';
    } catch {
      return true;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
      if (saved === null) return true;
      return saved === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDarkMode));
    } catch {
      // Ignore storage errors
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const [ragStats, setRagStats] = useState<RagStatsResponse | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbProjects, setDbProjects] = useState<IndexedLelProjectStat[]>([]);
  const [demoActionCounter, setDemoActionCounter] = useState<number>(0);
  const [lastDemoAction, setLastDemoAction] = useState<DemoActionType>(null);

  const setActiveProject = useCallback((name: string) => {
    const value = name || DEFAULT_BLANK_PROJECT_NAME;
    setActiveProjectState(value);
    try {
      localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, value);
      if (value.trim()) {
        saveLocalProjectName(value.trim());
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setEnableSemantic = useCallback((enabled: boolean) => {
    setEnableSemanticState(enabled);
    try {
      localStorage.setItem(ENABLE_SEMANTIC_STORAGE_KEY, String(enabled));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      const stats = await apiClient.getRagStats();
      setRagStats(stats);
      setDbConnected(true);
      if (Array.isArray(stats.projects)) {
        setDbProjects(stats.projects);
      }
    } catch {
      setDbConnected(false);
    }
  }, []);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  const triggerLoadJuzgadoDemo = useCallback(() => {
    setActiveProject(JUZGADO_DEMO_PROJECT_NAME);
    setLastDemoAction('LOAD_JUZGADO');
    setDemoActionCounter((c) => c + 1);
  }, [setActiveProject]);

  const triggerClearBlankProject = useCallback(() => {
    setActiveProject(DEFAULT_BLANK_PROJECT_NAME);
    setLastDemoAction('CLEAR_BLANK');
    setDemoActionCounter((c) => c + 1);
  }, [setActiveProject]);

  const knownProjects: IndexedLelProjectStat[] = React.useMemo(() => {
    const map = new Map<string, IndexedLelProjectStat>();
    for (const p of dbProjects) {
      map.set(p.projectName, p);
    }
    const localNames = getStoredLocalProjects();
    for (const localName of localNames) {
      if (!map.has(localName)) {
        map.set(localName, {
          projectName: localName,
          documentId: `local-${localName}`,
          title: 'Proyecto local',
          symbolsCount: 0,
          uploadedAt: new Date().toISOString(),
        });
      }
    }
    return Array.from(map.values());
  }, [dbProjects, activeProject]);

  return (
    <ProjectContext.Provider
      value={{
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
        demoActionCounter,
        lastDemoAction,
        triggerLoadJuzgadoDemo,
        triggerClearBlankProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return ctx;
}
