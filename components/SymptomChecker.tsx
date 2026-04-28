import React from 'react';
import type { SymptomChecklistData, SymptomCategory } from '../types';
import { SymptomIcon } from '../constants';

interface SymptomCheckerProps {
  symptoms: SymptomChecklistData;
  setSymptoms: React.Dispatch<React.SetStateAction<SymptomChecklistData>>;
}

const symptomOptions: Record<SymptomCategory, string[]> = {
    cardiovascular: ["Chest Pain", "Shortness of Breath", "Palpitations", "Leg Swelling"],
    metabolic: ["Increased Thirst", "Frequent Urination", "Unexplained Weight Loss", "Fatigue"],
    respiratory: ["Chronic Cough", "Wheezing", "Sputum Production"],
};

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ symptoms, setSymptoms }) => {
  const handleCheckboxChange = (category: SymptomCategory, symptom: string) => {
    setSymptoms(prev => {
      const currentSymptoms = prev[category];
      const newSymptoms = currentSymptoms.includes(symptom)
        ? currentSymptoms.filter(s => s !== symptom)
        : [...currentSymptoms, symptom];
      return { ...prev, [category]: newSymptoms };
    });
  };

  const checkboxStyles = "h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary";

  return (
    <div className="bg-bg-white dark:bg-bg-white-dark p-6 rounded-xl shadow-lg h-full transition-colors duration-300">
      <div className="flex items-center mb-4">
        <SymptomIcon />
        <h2 className="text-xl font-bold text-brand-primary dark:text-brand-primary-dark ml-4">Symptom Checker</h2>
      </div>
      <div className="space-y-4">
        {(Object.keys(symptomOptions) as SymptomCategory[]).map(category => (
          <fieldset key={category}>
            <legend className="text-md font-semibold capitalize text-text-primary dark:text-text-primary-dark">{category}</legend>
            <div className="mt-2 space-y-2">
              {symptomOptions[category].map(symptom => (
                <div key={symptom} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`${category}-${symptom}`}
                    name={symptom}
                    checked={symptoms[category].includes(symptom)}
                    onChange={() => handleCheckboxChange(category, symptom)}
                    className={checkboxStyles}
                  />
                  <label htmlFor={`${category}-${symptom}`} className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{symptom}</label>
                </div>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
};