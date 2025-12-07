export interface ConversionResult {
  fileName: string;
  originalSize: number;
  blob: Blob;
  previewText: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ProcessingError {
  message: string;
  details?: string;
}
