export interface User {
  id: string;
  username: string;
  name?: string;
}

export interface EnvData {
  soilMoisture: number; // percentage
  soilTemperature: number; // celsius
  soilPh: number; // pH value
  airTemperature: number; // celsius
  airHumidity: number; // percentage
  timestamp: Date;
}

export interface DiagnosisResult {
  name: string;
  description: string;
  confidence: number;
  treatments: Treatment[];
}

export interface Treatment {
  method: string;
  cost: 'low' | 'medium' | 'high';
  effectiveness: 'low' | 'medium' | 'high';
  estimatedPrice: string;
  description: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: Date;
  imageUrl: string;
  plantType?: string;
  envData?: EnvData;
  diagnosis: DiagnosisResult;
}

export type AnalysisMode = 'image-only' | 'image-and-env';

export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

export interface PlantType {
  id: string;
  name: string;
  category: string;
}
