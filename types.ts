export type SensorStatus = 'normal' | 'warning' | 'high';

export type SensorKey = 'heartRate' | 'spO2' | 'temperature' | 'bloodGlucose' | 'respiratoryRate';

export interface SensorMetric {
  value: number;
  status: SensorStatus;
  history: number[];
  loading?: boolean;
}

export interface SensorData {
  heartRate: SensorMetric;
  spO2: SensorMetric;
  temperature: SensorMetric;
  bloodGlucose: SensorMetric;
  respiratoryRate: SensorMetric;
}

// Custom thresholds for sensors
export type SensorThresholds = Record<SensorKey, { warn: number; high: number }>;


// Expanded Patient Profile
export interface Demographics {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    height: number; // in cm
    weight: number; // in kg
}

export interface FamilyHistory {
    diabetes: boolean;
    heartDisease: boolean;

    hypertension: boolean;
}

export interface Lifestyle {
    smoking: {
        status: 'never' | 'current' | 'former';
        packYears: number;
    };
    alcohol: {
        frequency: 'never' | 'occasional' | 'daily';
        unitsPerWeek: number;
    };
    exercise: {
        frequency: string; // e.g., "3x/week"
        intensity: 'low' | 'moderate' | 'high';
    };
    diet: 'vegetarian' | 'vegan' | 'mixed' | 'other';
}

export interface PatientProfileData {
  demographics: Demographics;
  familyHistory: FamilyHistory;
  lifestyle: Lifestyle;
}

// Health Journal
export interface HealthJournalData {
    date: string;
    energyLevel: number; // 1-10 scale
    notableSymptoms: string;
    medicationAdherence: boolean;
}

// Symptom Checklist
export type SymptomCategory = 'cardiovascular' | 'metabolic' | 'respiratory';
export type SymptomChecklistData = Record<SymptomCategory, string[]>;

// Physician Notes
export interface PhysicianNotesData {
    notes: string;
}

// Environmental Data
export interface EnvironmentalData {
    location: {
        airQualityIndex: number;
        pollenCount: 'low' | 'moderate' | 'high';
    };
    activity: {
        steps: number;
        sleep: {
            duration: number; // hours
            quality: number; // 1-10 scale
        };
    };
}


export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'info';
}

export interface ExtractedReportData {
  heartRate?: number | null;
  spO2?: number | null;
  temperature?: number | null;
  bloodGlucose?: number | null;
  respiratoryRate?: number | null;
}

export type Theme = 'light' | 'dark';

// Data for historical chart modal
export interface ModalData {
  title: string;
  data: number[];
  thresholds: { warn: number; high: number };
  unit: string;
}

// Data structure for AI analysis payload
export interface ComprehensiveHealthData {
    profile: PatientProfileData;
    sensors: SensorData;
    journal: HealthJournalData;
    symptoms: SymptomChecklistData;
    environment: EnvironmentalData;
    physicianNotes: PhysicianNotesData;
}

// Risk analysis types
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Unknown';
export type HealthCategory = 'cardiovascular' | 'respiratory' | 'metabolic' | 'general';

export interface RiskDetails {
  level: RiskLevel;
  score: number;
  factors: string[];
}

export type ParsedRisks = Record<HealthCategory, RiskDetails>;


// For Analysis History
export interface AnalysisRecord {
  timestamp: string;
  result: string;
  risks: ParsedRisks;
}