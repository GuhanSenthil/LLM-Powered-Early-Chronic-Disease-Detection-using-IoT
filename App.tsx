``

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PatientProfile } from './components/PatientProfile';
import { SensorCard } from './components/SensorCard';
import { ECGChart } from './components/ECGChart';
import { AnalysisPanel } from './components/AnalysisPanel';
import { BloodReportUploader } from './components/BloodReportUploader';
import { AlertBanner } from './components/AlertBanner';
import { HealthJournal } from './components/HealthJournal';
import { SymptomChecker } from './components/SymptomChecker';
import { EnvironmentalData } from './components/EnvironmentalData';
import { PhysicianNotes } from './components/PhysicianNotes';
import { HistoricalChartModal } from './components/HistoricalChartModal';
import { usePersistentState } from './hooks/usePersistentState';
import type { PatientProfileData, SensorData, SensorStatus, SensorKey, ToastMessage, ExtractedReportData, Theme, HealthJournalData, SymptomChecklistData, PhysicianNotesData, EnvironmentalData as EnvironmentalDataType, ModalData, AnalysisRecord, SensorThresholds, ParsedRisks, RiskLevel, HealthCategory, RiskDetails } from './types';
import { HeartbeatIcon, DropletIcon, TemperatureIcon, GlucoseIcon, LungsIcon, SuccessIcon, InfoIcon } from './constants';
import { getHealthAnalysis } from './services/geminiService';
import { database } from './services/firebase';
// Fix: Removed incorrect Firebase v9 imports. The functions will be called using v8 namespaced syntax.

const HISTORY_LENGTH = 50;
const ANALYSIS_HISTORY_LENGTH = 10;

// Initial state before Firebase connects, with realistic defaults and loading indicators
const getInitialSensorData = (): SensorData => ({
    heartRate: { value: 72, status: 'normal', history: Array(HISTORY_LENGTH).fill(72), loading: true },
    spO2: { value: 98, status: 'normal', history: Array(HISTORY_LENGTH).fill(98), loading: true },
    temperature: { value: 36.8, status: 'normal', history: Array(HISTORY_LENGTH).fill(36.8), loading: true },
    bloodGlucose: { value: 90, status: 'normal', history: Array(HISTORY_LENGTH).fill(90), loading: true },
    respiratoryRate: { value: 16, status: 'normal', history: Array(HISTORY_LENGTH).fill(16), loading: true },
});


const initialSensorThresholds: SensorThresholds = {
    heartRate: { warn: 100, high: 120 },
    spO2: { warn: 95, high: 92 }, // Note: spO2 is reversed
    temperature: { warn: 37.5, high: 38.5 },
    bloodGlucose: { warn: 125, high: 180 },
    respiratoryRate: { warn: 20, high: 24 },
};

const parseAnalysisResult = (analysisText: string): ParsedRisks => {
    const categories: HealthCategory[] = ['cardiovascular', 'respiratory', 'metabolic', 'general'];
    const parsedRisks: Partial<ParsedRisks> = {};

    const categoryTitles: Record<HealthCategory, string> = {
        cardiovascular: 'Cardiovascular Health',
        respiratory: 'Respiratory Health',
        metabolic: 'Metabolic Health',
        general: 'General Wellness',
    };

    categories.forEach(category => {
        const title = categoryTitles[category];
        const regex = new RegExp(
            `\\*\\*${title}\\*\\*[\\s\\S]*?` +
            `- \\*\\*Risk Level:\\*\\* \\*\\*(Low|Moderate|High)\\*\\*[\\s\\S]*?` +
            `- \\*\\*Risk Score:\\*\\* \\*\\*(\\d+)\\/10\\*\\*[\\s\\S]*?` +
            `- \\*\\*Key Contributing Factors:\\*\\*([\\s\\S]*?)(?=\\n- \\*\\*Interpretation|\\n###|$)`
        , 'i');

        const match = analysisText.match(regex);

        if (match) {
            const level = (match[1] as RiskLevel) || 'Unknown';
            const score = parseInt(match[2], 10) || 0;
            const factorsText = match[3] || '';
            const factors = factorsText
                .split(/\n\s*[\*\-]\s*/)
                .map(f => f.trim().replace(/\[|\]/g, '')) // Also remove brackets
                .filter(Boolean);

            parsedRisks[category] = { level, score, factors };
        } else {
            parsedRisks[category] = { level: 'Unknown', score: 0, factors: [] };
        }
    });

    return parsedRisks as ParsedRisks;
};

const checkForAnalysisTrends = (history: AnalysisRecord[]): string | null => {
    if (history.length < 3) return null;

    const recentHistory = history.slice(0, 5);
    const categories: HealthCategory[] = ['cardiovascular', 'respiratory', 'metabolic'];

    for (const category of categories) {
        const moderateOrHighCount = recentHistory.filter(record => 
            record.risks[category] && (record.risks[category].level === 'Moderate' || record.risks[category].level === 'High')
        ).length;

        if (moderateOrHighCount >= 3) {
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            return `Persistent Trend Alert: The last several AI analyses have consistently identified a 'Moderate' or 'High' risk in your ${categoryName} Health. It is strongly recommended to discuss these findings with your healthcare provider.`;
        }
    }

    return null;
};


const Toast: React.FC<{ message: ToastMessage; onDismiss: () => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const toastStyles = {
    success: { bg: 'bg-green-500', icon: <SuccessIcon /> },
    info: { bg: 'bg-blue-500', icon: <InfoIcon /> },
  };

  const style = toastStyles[message.type];

  return (
    <div className={`flex items-center p-3 rounded-lg shadow-2xl text-white ${style.bg} animate-fade-in-up`}>
      {style.icon}
      <span className="ml-2 font-semibold">{message.text}</span>
    </div>
  );
};

const App: React.FC = () => {
    const [patientProfile, setPatientProfile] = usePersistentState<PatientProfileData>('patientProfile', {
        demographics: { name: 'Jane Doe', age: 45, gender: "Female", height: 165, weight: 70, },
        familyHistory: { diabetes: true, heartDisease: true, hypertension: false, },
        lifestyle: { smoking: { status: "never", packYears: 0 }, alcohol: { frequency: "occasional", unitsPerWeek: 2 }, exercise: { frequency: "3x/week", intensity: "moderate" }, diet: "mixed", },
    });

    const [healthJournal, setHealthJournal] = usePersistentState<HealthJournalData>('healthJournal', {
        date: '2025-09-17', energyLevel: 8, notableSymptoms: "None", medicationAdherence: true,
    });
    
    const [symptomChecklist, setSymptomChecklist] = usePersistentState<SymptomChecklistData>('symptomChecklist', {
        cardiovascular: [], metabolic: [], respiratory: [],
    });

    const [physicianNotes, setPhysicianNotes] = usePersistentState<PhysicianNotesData>('physicianNotes', {
        notes: "Patient is being monitored for family history of heart disease. Vitals appear stable.",
    });

    const [environmentalData, setEnvironmentalData] = usePersistentState<EnvironmentalDataType>('environmentalData', {
        location: { airQualityIndex: 45, pollenCount: "low" },
        activity: { steps: 8542, sleep: { duration: 7.5, quality: 8 } },
    });
  
  const [sensorThresholds, setSensorThresholds] = usePersistentState<SensorThresholds>('sensorThresholds', initialSensorThresholds);
  const [sensorData, setSensorData] = useState<SensorData>(getInitialSensorData());
  const [isSimulatingAll, setIsSimulatingAll] = useState<boolean>(false);

  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [analysisHistory, setAnalysisHistory] = usePersistentState<AnalysisRecord[]>('analysisHistory', []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = usePersistentState<Theme>('theme', 'light');
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
  const [trendAlert, setTrendAlert] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  // Validation States
  const [isProfileValid, setIsProfileValid] = useState(true);
  const [isJournalValid, setIsJournalValid] = useState(true);
  const [isEnvironmentValid, setIsEnvironmentValid] = useState(true);
  const [isNotesValid, setIsNotesValid] = useState(true);
  const isAnalysisDisabled = !isProfileValid || !isJournalValid || !isEnvironmentValid || !isNotesValid;


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const addToast = useCallback((text: string, type: ToastMessage['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
  }, []);
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleAnalysis = useCallback(async () => {
    if (isAnalysisDisabled) {
        addToast('Please fix validation errors before generating analysis.', 'info');
        return;
    }
    setIsLoading(true);
    setError('');
    setAnalysisResult('');
    try {
      const result = await getHealthAnalysis({
        profile: patientProfile,
        sensors: sensorData,
        journal: healthJournal,
        symptoms: symptomChecklist,
        environment: environmentalData,
        physicianNotes: physicianNotes,
      });
      setAnalysisResult(result);
      
      const parsedRisks = parseAnalysisResult(result);
      const newRecord: AnalysisRecord = { timestamp: new Date().toISOString(), result, risks: parsedRisks };
      
      setAnalysisHistory(prev => {
          const newHistory = [newRecord, ...prev.slice(0, ANALYSIS_HISTORY_LENGTH - 1)];
          const trendMessage = checkForAnalysisTrends(newHistory);
          if (trendMessage) {
              setTrendAlert(trendMessage);
          }
          return newHistory;
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [isAnalysisDisabled, patientProfile, sensorData, healthJournal, symptomChecklist, environmentalData, physicianNotes, setAnalysisHistory, addToast]);

  const getStatus = useCallback((value: number, thresholds: { warn: number; high: number }, reverse: boolean = false): SensorStatus => {
    if (reverse) {
      if (value < thresholds.high) return 'high';
      if (value < thresholds.warn) return 'warning';
      return 'normal';
    }
    if (value > thresholds.high) return 'high';
    if (value > thresholds.warn) return 'warning';
    return 'normal';
  }, []);
  
  useEffect(() => {
    // Fix: Use Firebase v8 syntax for database reference and listeners
    const sensorsRef = database.ref('sensors/latest');
    
    // Set a timeout to handle cases where Firebase connection fails silently
    const loadingTimeout = setTimeout(() => {
        setSensorData(prev => {
            // Check if any sensor is still in loading state
// Fix: Use Object.keys with type assertion to safely access properties on sensor objects.
            if ((Object.keys(prev) as SensorKey[]).some(key => prev[key].loading)) {
                addToast("Could not connect to live data feed. Displaying static data.", "info");
                const clearedData = { ...prev };
                (Object.keys(clearedData) as SensorKey[]).forEach(key => {
                    clearedData[key].loading = false;
                });
                return clearedData;
            }
            return prev; // No changes if not loading
        });
    }, 8000); // 8-second timeout

    const listener = (snapshot: any) => {
      clearTimeout(loadingTimeout); // Clear timeout if we get a response
      const data = snapshot.val();
      if (data) {
        setSensorData(prev => {
           const newSensorData: SensorData = {
                heartRate: {
                    value: data.heartRate, status: getStatus(data.heartRate, sensorThresholds.heartRate), history: [...prev.heartRate.history.slice(1), data.heartRate], loading: false,
                },
                spO2: {
                    value: data.spO2, status: getStatus(data.spO2, sensorThresholds.spO2, true), history: [...prev.spO2.history.slice(1), data.spO2], loading: false,
                },
                temperature: {
                    value: data.temperature, status: getStatus(data.temperature, sensorThresholds.temperature), history: [...prev.temperature.history.slice(1), data.temperature], loading: false,
                },
                bloodGlucose: {
                    value: data.bloodGlucose, status: getStatus(data.bloodGlucose, sensorThresholds.bloodGlucose), history: [...prev.bloodGlucose.history.slice(1), data.bloodGlucose], loading: false,
                },
                respiratoryRate: {
                    value: data.respiratoryRate, status: getStatus(data.respiratoryRate, sensorThresholds.respiratoryRate), history: [...prev.respiratoryRate.history.slice(1), data.respiratoryRate], loading: false,
                },
           };

           const highAlerts = Object.entries(newSensorData).filter(([, metric]) => metric.status === 'high').map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
            
            if (highAlerts.length > 0) {
                setCriticalAlert(`Critical Alert: ${highAlerts.join(', ')} out of normal range!`);
            }
           
           // Fix: Corrected typo in variable name from 'newSensor-data' to 'newSensorData'.
           return newSensorData;
        });
      } else {
        // Handle case where no data exists in Firebase at this path
        // This stops the initial loading state and shows the cards with default values
        setSensorData(prev => {
          const clearedData = { ...prev };
          (Object.keys(clearedData) as SensorKey[]).forEach(key => {
            clearedData[key].loading = false;
          });
          return clearedData;
        });
      }
    };
    
    sensorsRef.on('value', listener);

    return () => {
        sensorsRef.off('value', listener);
        clearTimeout(loadingTimeout);
    };
  }, [addToast, getStatus, sensorThresholds]);

  const toggleAllSimulations = () => {
    const nextState = !isSimulatingAll;
    setIsSimulatingAll(nextState);
    addToast(`All simulations have been ${nextState ? 'started' : 'stopped'}.`, nextState ? 'success' : 'info');
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isSimulatingAll) return;

      // Fix: Use Firebase v8 syntax for database reference and updates
      const sensorsRef = database.ref('sensors/latest');
      const updates: Partial<Record<SensorKey, number>> = {
        heartRate: Math.floor(Math.random() * 60 + 55),
        spO2: Math.floor(Math.random() * 7 + 94),
        temperature: parseFloat((Math.random() * 2 + 36).toFixed(1)),
        bloodGlucose: Math.floor(Math.random() * 80 + 70),
        respiratoryRate: Math.floor(Math.random() * 10 + 12),
      };
      
      sensorsRef.update(updates).catch(error => console.error("Error updating Firebase:", error));

    }, 2000);

    return () => clearInterval(intervalId);
  }, [isSimulatingAll]);

  const handleReportAnalysis = (data: ExtractedReportData) => {
    setSensorData(prev => {
        const newData = { ...prev };
        (Object.keys(data) as Array<keyof ExtractedReportData>).forEach(key => {
            const value = data[key];
            if (value !== null && value !== undefined && key in newData) {
                const typedKey = key as SensorKey;
                newData[typedKey] = {
                    ...newData[typedKey],
                    value: value,
                    status: getStatus(value, sensorThresholds[typedKey], typedKey === 'spO2'),
                    history: [...newData[typedKey].history.slice(1), value],
                };
            }
        });
        return newData;
    });
    addToast('Sensor data updated from blood report.', 'success');
  };

  const handleThresholdsUpdate = (key: SensorKey, newThresholds: { warn: number, high: number }) => {
    setSensorThresholds(prev => ({
        ...prev,
        [key]: newThresholds,
    }));
    const friendlyName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    addToast(`${friendlyName} thresholds updated.`, 'success');
  };
  
  const handleSensorValueUpdate = (key: SensorKey, newValue: number) => {
    // Fix: Use Firebase v8 syntax for database reference and updates
    const sensorsRef = database.ref('sensors/latest');
    sensorsRef.update({ [key]: newValue })
        .then(() => {
            const friendlyName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            addToast(`${friendlyName} value updated.`, 'success');
        })
        .catch(error => {
            console.error("Error updating sensor value in Firebase:", error);
            addToast('Failed to update sensor value.', 'info');
        });
  };


  const handleOpenModal = (title: string, data: number[], thresholds: {warn: number, high: number}, unit: string) => {
    setModalData({ title, data, thresholds, unit });
  };


  return (
    <div className="min-h-screen bg-bg-light text-text-primary dark:bg-bg-light-dark transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} />
      {criticalAlert && <AlertBanner message={criticalAlert} type="critical" onDismiss={() => setCriticalAlert(null)} />}
      {trendAlert && <AlertBanner message={trendAlert} type="trend" onDismiss={() => setTrendAlert(null)} />}
      {modalData && <HistoricalChartModal modalData={modalData} onClose={() => setModalData(null)} />}

      <main className="p-4 md:p-8">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-3 flex flex-col gap-6">
                <PatientProfile profile={patientProfile} setProfile={setPatientProfile} onValidationChange={setIsProfileValid} />
                <BloodReportUploader onAnalysisComplete={handleReportAnalysis} />
                <PhysicianNotes notes={physicianNotes} setNotes={setPhysicianNotes} onValidationChange={setIsNotesValid} />
            </div>

            <div className="lg:col-span-6 flex flex-col gap-6">
                <div className="flex justify-center">
                    <button
                        onClick={toggleAllSimulations}
                        className={`w-full md:w-auto px-6 py-3 text-lg font-bold rounded-lg text-white transition-colors shadow-md ${
                        isSimulatingAll ? 'bg-accent-red dark:bg-accent-red-dark hover:bg-red-600' : 'bg-accent-green dark:bg-accent-green-dark hover:bg-green-600'
                        }`}
                    >
                        {isSimulatingAll ? 'Stop All Simulations' : 'Start All Simulations'}
                    </button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SensorCard
                      title="Heart Rate"
                      value={sensorData.heartRate.value.toString()}
                      unit="BPM"
                      icon={<HeartbeatIcon />}
                      status={sensorData.heartRate.status}
                      data={sensorData.heartRate.history}
                      accuracy="±2-5 BPM (vs. clinical ECG)"
                      thresholds={sensorThresholds.heartRate}
                      loading={sensorData.heartRate.loading}
                      onClick={() => handleOpenModal('Heart Rate History', sensorData.heartRate.history, sensorThresholds.heartRate, 'BPM')}
                      onThresholdsChange={(newThresholds) => handleThresholdsUpdate('heartRate', newThresholds)}
                      onValueChange={(newValue) => handleSensorValueUpdate('heartRate', newValue)}
                    />
                    <SensorCard
                      title="Blood Oxygen"
                      value={sensorData.spO2.value.toString()}
                      unit="% SpO₂"
                      icon={<DropletIcon />}
                      status={sensorData.spO2.status}
                      data={sensorData.spO2.history}
                      accuracy="96-98% (MAX30102)"
                      thresholds={sensorThresholds.spO2}
                      loading={sensorData.spO2.loading}
                      onClick={() => handleOpenModal('Blood Oxygen History', sensorData.spO2.history, sensorThresholds.spO2, '%')}
                      onThresholdsChange={(newThresholds) => handleThresholdsUpdate('spO2', newThresholds)}
                      onValueChange={(newValue) => handleSensorValueUpdate('spO2', newValue)}
                    />
                    <SensorCard
                      title="Body Temperature"
                      value={sensorData.temperature.value.toString()}
                      unit="°C"
                      icon={<TemperatureIcon />}
                      status={sensorData.temperature.status}
                      data={sensorData.temperature.history}
                      accuracy="±0.5°C (MLX90614)"
                      thresholds={sensorThresholds.temperature}
                      loading={sensorData.temperature.loading}
                      onClick={() => handleOpenModal('Body Temperature History', sensorData.temperature.history, sensorThresholds.temperature, '°C')}
                      onThresholdsChange={(newThresholds) => handleThresholdsUpdate('temperature', newThresholds)}
                      onValueChange={(newValue) => handleSensorValueUpdate('temperature', newValue)}
                    />
                    <SensorCard
                      title="Blood Glucose"
                      value={sensorData.bloodGlucose.value.toString()}
                      unit="mg/dL"
                      icon={<GlucoseIcon />}
                      status={sensorData.bloodGlucose.status}
      
                      data={sensorData.bloodGlucose.history}
                      accuracy="±15% (ISO 15197:2013)"
                      thresholds={sensorThresholds.bloodGlucose}
                      loading={sensorData.bloodGlucose.loading}
                      onClick={() => handleOpenModal('Blood Glucose History', sensorData.bloodGlucose.history, sensorThresholds.bloodGlucose, 'mg/dL')}
                      onThresholdsChange={(newThresholds) => handleThresholdsUpdate('bloodGlucose', newThresholds)}
                      onValueChange={(newValue) => handleSensorValueUpdate('bloodGlucose', newValue)}
                    />
                    <div className="md:col-span-2">
                        <SensorCard
                          title="Respiratory Rate"
                          value={sensorData.respiratoryRate.value.toString()}
                          unit="breaths/min"
                          icon={<LungsIcon />}
                          status={sensorData.respiratoryRate.status}
                          data={sensorData.respiratoryRate.history}
                          accuracy="±1-3 breaths/min (Piezo)"
                          thresholds={sensorThresholds.respiratoryRate}
                          loading={sensorData.respiratoryRate.loading}
                          onClick={() => handleOpenModal('Respiratory Rate History', sensorData.respiratoryRate.history, sensorThresholds.respiratoryRate, 'breaths/min')}
                          onThresholdsChange={(newThresholds) => handleThresholdsUpdate('respiratoryRate', newThresholds)}
                          onValueChange={(newValue) => handleSensorValueUpdate('respiratoryRate', newValue)}
                        />
                    </div>
                </div>
                <div>
                  <ECGChart heartRate={sensorData.heartRate.value} isPlaying={isSimulatingAll} />
                </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-6">
                 <HealthJournal journal={healthJournal} setHealthJournal={setHealthJournal} onValidationChange={setIsJournalValid} />
                 <SymptomChecker symptoms={symptomChecklist} setSymptoms={setSymptomChecklist} />
                 <EnvironmentalData data={environmentalData} setData={setEnvironmentalData} onValidationChange={setIsEnvironmentValid} />
            </div>
        </div>

        <div className="mt-6">
          <AnalysisPanel
            onAnalyze={handleAnalysis}
            result={analysisResult}
            setResult={setAnalysisResult}
            isLoading={isLoading}
            error={error}
            history={analysisHistory}
            isAnalysisDisabled={isAnalysisDisabled}
            latestAnalysisRecord={analysisHistory[0]}
          />
        </div>
      </main>

       <div className="fixed bottom-4 right-4 z-50 space-y-2">
         {toasts.map(toast => (
          <Toast key={toast.id} message={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default App;