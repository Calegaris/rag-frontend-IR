import {
  BenchmarkRequest,
  BenchmarkSuiteReport,
  ExtractScenariosRequest,
  ExtractScenariosResponse,
  IngestCorpusRequest,
  IngestCorpusResponse,
  IngestLelRequest,
  IngestLelResponse,
  LlmRuntimeConfig,
  RagSearchRequest,
  RagSearchResponse,
  RagStatsResponse,
  ScenarioStructure,
  StructureScenarioRequest,
  StructureScenarioResponse,
  ValidateScenarioRequest,
  ValidationLogRecord,
  ValidationReport,
} from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const LLM_CONFIG_STORAGE_KEY = 'escenarios_rag_llm_config';

export function getStoredLlmConfig(): LlmRuntimeConfig {
  try {
    const raw = localStorage.getItem(LLM_CONFIG_STORAGE_KEY);
    if (!raw) {
      return { apiKey: '', provider: '', model: '' };
    }
    const parsed = JSON.parse(raw) as Partial<LlmRuntimeConfig>;
    return {
      apiKey: parsed.apiKey || '',
      provider: parsed.provider || '',
      model: parsed.model || '',
    };
  } catch {
    return { apiKey: '', provider: '', model: '' };
  }
}

export function saveLlmConfig(config: LlmRuntimeConfig): void {
  localStorage.setItem(LLM_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

function buildHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const llmConfig = getStoredLlmConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (llmConfig.apiKey.trim()) {
    headers['x-llm-api-key'] = llmConfig.apiKey.trim();
  }
  if (llmConfig.provider.trim()) {
    headers['x-llm-provider'] = llmConfig.provider.trim();
  }
  if (llmConfig.model.trim()) {
    headers['x-llm-model'] = llmConfig.model.trim();
  }

  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers as Record<string, string> | undefined),
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} (${response.statusText})`;
    try {
      const errBody = await response.json();
      if (errBody && errBody.message) {
        errorDetail = Array.isArray(errBody.message)
          ? errBody.message.join('; ')
          : String(errBody.message);
      }
    } catch {
      // Fallback to HTTP status text
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  baseUrl: BASE_URL,

  extractScenarios(payload: ExtractScenariosRequest): Promise<ExtractScenariosResponse> {
    return request<ExtractScenariosResponse>('/scenarios/extract', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  structureScenario(payload: StructureScenarioRequest): Promise<StructureScenarioResponse> {
    return request<StructureScenarioResponse>('/scenarios/structure', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  parseScenario(rawMarkdown: string): Promise<ScenarioStructure> {
    return request<ScenarioStructure>('/scenarios/parse', {
      method: 'POST',
      body: JSON.stringify({ rawMarkdown }),
    });
  },

  validateScenario(payload: ValidateScenarioRequest): Promise<ValidationReport> {
    return request<ValidationReport>('/scenarios/validate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  runBenchmark(payload: BenchmarkRequest = {}): Promise<BenchmarkSuiteReport> {
    return request<BenchmarkSuiteReport>('/scenarios/benchmark', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getValidationHistory(limit = 20): Promise<ValidationLogRecord[]> {
    return request<ValidationLogRecord[]>(`/scenarios/validations?limit=${limit}`, {
      method: 'GET',
    });
  },

  getRagStats(): Promise<RagStatsResponse> {
    return request<RagStatsResponse>('/rag/stats', {
      method: 'GET',
    });
  },

  ingestCorpus(payload: IngestCorpusRequest = {}): Promise<IngestCorpusResponse> {
    return request<IngestCorpusResponse>('/rag/ingest/corpus', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  ingestLel(payload: IngestLelRequest): Promise<IngestLelResponse> {
    return request<IngestLelResponse>('/rag/ingest/lel', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  searchRag(payload: RagSearchRequest): Promise<RagSearchResponse> {
    return request<RagSearchResponse>('/rag/search', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
