
import { GoogleGenAI, Type } from "@google/genai";
import type { ComprehensiveHealthData, ExtractedReportData, SensorMetric } from '../types';

// Fix: Initialize the GoogleGenAI client instance to be used by API calls.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSensorHistorySummary = (metric: SensorMetric): string => {
    const history = metric.history;
    if (history.length < 20) return `Current: ${metric.value} (Not enough data for trend analysis)`;
    
    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    const min = Math.min(...history);
    const max = Math.max(...history);
    
    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.ceil(history.length / 2));
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    let trend = 'Stable';
    // Use a threshold to avoid flagging minor fluctuations as trends
    if (secondHalfAvg > firstHalfAvg * 1.05) trend = 'Increasing'; 
    if (secondHalfAvg < firstHalfAvg * 0.95) trend = 'Decreasing';

    return `Current: ${metric.value}, Avg: ${avg.toFixed(1)}, Range: ${min}-${max}, Trend: ${trend}`;
};


export async function getHealthAnalysis(
  data: ComprehensiveHealthData
): Promise<string> {
  const systemInstruction = `You are an expert AI health analyst. Your purpose is to provide a clear, structured, and cautious analysis by synthesizing data from multiple sources. You must not provide a medical diagnosis. Your tone should be supportive and informative, encouraging proactive health management and consultation with healthcare professionals. Adhere strictly to the requested Markdown format.`;
  
  const contents = `
**AI Analysis Request: Holistic Health Review**

Please perform a comprehensive health analysis based on the complete data provided below. Correlate information across all sections to identify potential risks, trends, and areas for proactive management.

---

### **1. Patient Profile & History**
- **Demographics:** ${data.profile.demographics.age}-year-old ${data.profile.demographics.gender}, ${data.profile.demographics.height} cm, ${data.profile.demographics.weight} kg.
- **Family History:** 
  - Diabetes: ${data.profile.familyHistory.diabetes ? 'Yes' : 'No'}
  - Heart Disease: ${data.profile.familyHistory.heartDisease ? 'Yes' : 'No'}
  - Hypertension: ${data.profile.familyHistory.hypertension ? 'Yes' : 'No'}
- **Lifestyle:**
  - Smoking: ${data.profile.lifestyle.smoking.status} (${data.profile.lifestyle.smoking.packYears} pack-years)
  - Alcohol: ${data.profile.lifestyle.alcohol.frequency} (${data.profile.lifestyle.alcohol.unitsPerWeek} units/week)
  - Exercise: ${data.profile.lifestyle.exercise.frequency}, ${data.profile.lifestyle.exercise.intensity} intensity
  - Diet: ${data.profile.lifestyle.diet}

---

### **2. IoT Sensor Data & Trends**
- **Heart Rate:** ${getSensorHistorySummary(data.sensors.heartRate)} BPM
- **Blood Oxygen (SpO₂):** ${getSensorHistorySummary(data.sensors.spO2)}%
- **Body Temperature:** ${getSensorHistorySummary(data.sensors.temperature)}°C
- **Blood Glucose:** ${getSensorHistorySummary(data.sensors.bloodGlucose)} mg/dL
- **Respiratory Rate:** ${getSensorHistorySummary(data.sensors.respiratoryRate)} breaths/min

---

### **3. Patient-Reported Information & Context**
- **Reported Symptoms:**
  - Cardiovascular: ${data.symptoms.cardiovascular.join(', ') || 'None'}
  - Metabolic: ${data.symptoms.metabolic.join(', ') || 'None'}
  - Respiratory: ${data.symptoms.respiratory.join(', ') || 'None'}
- **Daily Journal Entry (${data.journal.date}):**
  - Energy Level: ${data.journal.energyLevel}/10
  - Notable Symptoms: ${data.journal.notableSymptoms}
  - Medication Adherence: ${data.journal.medicationAdherence ? 'Yes' : 'No'}
- **Environmental & Activity Data (User-Reported):**
  - Air Quality Index: ${data.environment.location.airQualityIndex}
  - Pollen Count: ${data.environment.location.pollenCount}
  - Steps Today: ${data.environment.activity.steps} steps
  - Sleep: ${data.environment.activity.sleep.duration} hours (Quality: ${data.environment.activity.sleep.quality}/10)

---

### **4. Clinical Context**
- **Physician Notes:** ${data.physicianNotes.notes}

---

**Analysis Task:**

Provide a health risk analysis in Markdown, strictly following the format below.

### **Overall Health Summary**
A brief, high-level synthesis of the patient's current health status, considering all data points, especially sensor trends.

### **Lifestyle Impact Analysis**
Provide a brief evaluation of each lifestyle factor's potential impact on long-term health.
- **Smoking:** Comment on the patient's smoking status and pack-years, linking it to potential cardiovascular and respiratory risks.
- **Alcohol:** Analyze the reported alcohol consumption in the context of general health guidelines.
- **Exercise:** Evaluate the frequency and intensity of exercise relative to recommendations for cardiovascular and metabolic health.
- **Diet:** Comment on the patient's reported diet type and its general implications.

### **Integrated Risk Analysis**
For each category, provide a risk level, a numerical score, key factors, and a detailed interpretation that **deeply correlates sensor data trends with lifestyle, family history, and symptoms.**

**1. Cardiovascular Health**
- **Risk Level:** **Low**, **Moderate**, or **High**.
- **Risk Score:** **(1-10)/10**.
- **Key Contributing Factors:**
  * [Factor 1]
  * [Factor 2]
- **Interpretation:** Analyze heart rate trends in the context of symptoms and family history. **Explicitly connect this to the findings from the lifestyle analysis above.**

**2. Respiratory Health**
- **Risk Level:** **Low**, **Moderate**, or **High**.
- **Risk Score:** **(1-10)/10**.
- **Key Contributing Factors:**
  * [Factor 1]
  * [Factor 2]
- **Interpretation:** Connect SpO₂ and respiratory rate trends with symptoms, lifestyle (smoking), and environmental factors.

**3. Metabolic Health**
- **Risk Level:** **Low**, **Moderate**, or **High**.
- **Risk Score:** **(1-10)/10**.
- **Key Contributing Factors:**
  * [Factor 1]
  * [Factor 2]
- **Interpretation:** Evaluate blood glucose trends in light of family history, diet, and exercise habits.

**4. General Wellness**
- **Risk Level:** **Low**, **Moderate**, or **High**.
- **Risk Score:** **(1-10)/10**.
- **Key Contributing Factors:**
  * [Factor 1]
  * [Factor 2]
- **Interpretation:** Comment on overall wellness based on temperature trends, sleep quality, energy levels, and activity.

### **Actionable Recommendations**
Provide 2-3 **specific and actionable** wellness tips directly linked to the **Key Contributing Factors** identified above. For example, if a key factor is "sedentary activity level," a recommendation should be about incorporating specific, manageable physical activities.

### **IMPORTANT DISCLAIMER**
Conclude with this exact, bolded disclaimer: **This is an AI-generated analysis and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any health concerns.**`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis from AI service. Please check your connection and API key.");
    }
}

export async function analyzeBloodReport(
    base64ImageData: string,
    mimeType: string
): Promise<ExtractedReportData> {
    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType,
        },
    };

    const textPart = {
        text: `Analyze the provided image of a blood test report. Extract the values for the following metrics: 
- Heart Rate (in BPM)
- Blood Oxygen / SpO2 (as a percentage)
- Body Temperature (in Celsius)
- Blood Glucose (in mg/dL)
- Respiratory Rate (in breaths/min)
If a value for a specific metric is not present in the report, return null for that field. Provide the output in the specified JSON format.`
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        heartRate: { type: Type.NUMBER, description: "Heart rate in BPM." },
                        spO2: { type: Type.NUMBER, description: "Blood oxygen saturation in %." },
                        temperature: { type: Type.NUMBER, description: "Body temperature in Celsius." },
                        bloodGlucose: { type: Type.NUMBER, description: "Blood glucose in mg/dL." },
                        respiratoryRate: { type: Type.NUMBER, description: "Respiratory rate in breaths per minute." },
                    },
                },
            },
        });
        const jsonStr = response.text.trim();
        const parsedJson = JSON.parse(jsonStr);
        return parsedJson as ExtractedReportData;
    } catch (error) {
        console.error("Error analyzing blood report with Gemini API:", error);
        throw new Error("Failed to analyze the report image. The AI service could not process the request.");
    }
}
