export interface PredictionResult {
  prediction: string;
  confidence: number; // 0-1
  probabilities?: {
    [key: string]: number;
  };
  inferenceTimeMs?: number;
  timestamp?: string;
  source?: 'api' | 'simulation';
}

export interface SampleCase {
  id: string;
  title: string;
  label: 'glioma' | 'meningioma' | 'pituitary' | 'notumor';
  displayName: string;
  description: string;
  imageSrc: string;
  typicalConfidence: number;
}

export interface ScanHistoryItem {
  id: string;
  fileName: string;
  imageUrl: string;
  prediction: string;
  confidence: number;
  timestamp: string;
  probabilities?: { [key: string]: number };
  source: 'api' | 'simulation';
  notes?: string;
}

export interface TumorDetails {
  name: string;
  category: string;
  severity: 'Safe' | 'Low' | 'Moderate' | 'High';
  description: string;
  characteristics: string[];
  clinicalSteps: string[];
  badgeColor: string;
}
