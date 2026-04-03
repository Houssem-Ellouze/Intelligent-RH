// ─── Request Models ───────────────────────────────────────────────────────────

export interface RecommendRequest {
  file: File;
  question: string;
}

// ─── Response Models ──────────────────────────────────────────────────────────

export interface RecommendResponse {
  question: string;
  answer: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface ApiError {
  error: string;
}

// ─── UI State Models ──────────────────────────────────────────────────────────

export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export interface AnalyzerState {
  uploadState: UploadState;
  selectedFile: File | null;
  questions: string[];
  result: RecommendResponse | null;
  errorMessage: string | null;
}
