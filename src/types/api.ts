export type CandidateScenarioRole =
  | 'Integrador'
  | 'Particular'
  | 'Sub-Escenario'
  | 'Excepción';

export type PrismaScenarioType = 'ACTUAL' | 'FUTURO' | 'INTEGRADOR';

export type TemplateScenarioRole =
  | 'PARTICULAR'
  | 'SUB_ESCENARIO'
  | 'INTEGRADOR'
  | 'EXCEPCION'
  | string;

export type EpisodeType =
  | 'SIMPLE'
  | 'CONDITIONAL'
  | 'OPTIONAL'
  | 'NON_SEQUENTIAL'
  | 'SUB_SCENARIO';

export interface EpisodeParsed {
  number: number;
  text: string;
  restriction?: string;
  type: EpisodeType;
  rawText: string;
}

export interface ScenarioException {
  causa: string;
  tratamiento: string;
  rawText?: string;
}

export interface ScenarioStructure {
  title: string;
  type: PrismaScenarioType;
  rawRole: TemplateScenarioRole;
  scenarioNumber?: number;
  objective: string;
  contextGeo: string | null;
  contextTime: string | null;
  contextPrecond: string | null;
  actors: string[];
  resources: string[];
  episodes: EpisodeParsed[];
  exceptions: ScenarioException[];
  rawMarkdown: string;
}

export type DefectType = 'O' | 'E' | 'D' | 'A';
export type AcademicSeverity = 'A' | 'M' | 'B';
export type IssueSeverity = 'ERROR' | 'WARNING';

export interface DeterministicIssue {
  ruleId: string;
  itemControl: string;
  defectType: DefectType;
  academicSeverity: AcademicSeverity;
  severity: IssueSeverity;
  field: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface SemanticValidationIssue {
  code: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  component: string;
  message: string;
  suggestion: string;
  ragReference?: string;
  episodeNumber?: number;
}

export interface ValidationSummary {
  syntaxErrorsCount: number;
  structuralErrorsCount: number;
  warningsCount: number;
  semanticIssuesCount: number;
}

export interface RagContextUsed {
  marcoTeoricoChunks: number;
  lelSymbols: string[];
}

export interface ValidationReport {
  scenarioTitle: string;
  isValid: boolean;
  summary: ValidationSummary;
  parsedScenario: ScenarioStructure;
  validations: {
    deterministic: DeterministicIssue[];
    semantic: SemanticValidationIssue[];
  };
  ragContextUsed?: RagContextUsed;
}

export interface CandidateScenario {
  number: number;
  title: string;
  type: CandidateScenarioRole;
  justification: string;
  sourceQuote: string;
}

export interface ExtractScenariosRequest {
  projectName: string;
  rawText: string;
  lelMarkdown?: string;
}

export interface ExtractScenariosResponse {
  projectName: string;
  llmProvider: string;
  llmModel: string;
  scenarios: CandidateScenario[];
  formattedListMarkdown: string;
}

export interface StructureScenarioRequest {
  projectName: string;
  scenarioNumber: number;
  scenarioTitle: string;
  scenarioRole: CandidateScenarioRole;
  scenarioTimeframe?: 'ACTUAL' | 'FUTURO';
  rawContextText: string;
  lelMarkdown?: string;
  enableSemanticValidation?: boolean;
}

export interface StructureScenarioResponse {
  projectName: string;
  scenarioNumber: number;
  scenarioTitle: string;
  scenarioRole: CandidateScenarioRole;
  formattedDescriptionMarkdown: string;
  parsedScenario: ScenarioStructure;
  validationReport: ValidationReport;
}

export interface ValidateScenarioRequest {
  rawMarkdown: string;
  enableSemantic?: boolean;
  projectName?: string;
}

export interface BenchmarkRequest {
  projectName?: string;
  rawMarkdown?: string;
  enableSemantic?: boolean;
}

export interface BenchmarkScenarioReport {
  scenarioNumber: number;
  title: string;
  type: string;
  isValid: boolean;
  summary: ValidationSummary;
  validations: {
    deterministic: DeterministicIssue[];
    semantic: SemanticValidationIssue[];
  };
  ragContextUsed?: RagContextUsed;
  executionTimeMs: number;
}

export interface BenchmarkSuiteReport {
  projectName: string;
  totalScenarios: number;
  validScenariosCount: number;
  invalidScenariosCount: number;
  totalSyntaxErrors: number;
  totalStructuralErrors: number;
  totalWarnings: number;
  totalSemanticIssues: number;
  executionTimeMs: number;
  scenarios: BenchmarkScenarioReport[];
}

export interface ValidationLogRecord {
  id: string;
  scenarioId: string | null;
  scenarioTitle: string;
  isValid: boolean;
  syntaxErrors: number;
  structuralErrors: number;
  warningsCount: number;
  semanticIssuesCount: number;
  details: unknown;
  createdAt: string;
}

export interface IndexedLelProjectStat {
  projectName: string;
  documentId: string;
  title: string;
  symbolsCount: number;
  uploadedAt: string;
}

export interface RagStatsResponse {
  totalDocuments: number;
  totalEmbeddings: number;
  byType: {
    MARCO_TEORICO: { documents: number; embeddings: number };
    LEL: { documents: number; embeddings: number };
  };
  projects?: IndexedLelProjectStat[];
}

export interface IngestCorpusRequest {
  projectName?: string;
}

export interface IngestCorpusResponse {
  status: 'ok';
  projectName: string;
  marcoTeoricoFilesProcessed: number;
  marcoTeoricoChunksCount: number;
  lelSymbolsCount: number;
  totalEmbeddingsStored: number;
}

export interface IngestLelRequest {
  projectName: string;
  title?: string;
  lelMarkdown: string;
}

export interface IngestLelResponse {
  status: 'ok';
  projectName: string;
  documentId: string;
  title: string;
  lelSymbolsCount: number;
  embeddingsStored: number;
}

export interface RagSearchRequest {
  query: string;
  type?: 'MARCO_TEORICO' | 'LEL';
  projectName?: string;
  topK?: number;
  minSimilarity?: number;
}

export interface RagSearchResultItem {
  id: string;
  documentId: string;
  documentTitle: string;
  docType: 'MARCO_TEORICO' | 'LEL';
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

export interface RagSearchResponse {
  query: string;
  count: number;
  results: RagSearchResultItem[];
}

export interface LlmRuntimeConfig {
  apiKey: string;
  provider: '' | 'gemini' | 'openai' | 'claude';
  model: string;
}

export type ActiveTabId = 'extraction' | 'structurer' | 'audit' | 'rag';
