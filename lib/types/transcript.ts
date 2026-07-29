export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

export interface TranscriptState {
  transcript?: TranscriptSegment[];
  error?: string;
}

export interface SummaryState {
  summary?: string;
  error?: string;
  loading?: boolean;
  progress?: {
    current: number;
    total: number;
  };
}

export interface SummaryResponse {
  summary?: string;
  error?: string;
}