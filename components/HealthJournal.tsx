
import React, { useState, useEffect } from 'react';
import type { HealthJournalData } from '../types';
import { JournalIcon } from '../constants';

interface HealthJournalProps {
  journal: HealthJournalData;
  setHealthJournal: React.Dispatch<React.SetStateAction<HealthJournalData>>;
  onValidationChange: (isValid: boolean) => void;
}

const MAX_SYMPTOMS_LENGTH = 200;

export const HealthJournal: React.FC<HealthJournalProps> = ({ journal, setHealthJournal, onValidationChange }) => {
  const [error, setError] = useState('');

  useEffect(() => {
    const symptomsLength = journal.notableSymptoms.trim().length;
    let newError = '';
    if (symptomsLength > MAX_SYMPTOMS_LENGTH) {
      newError = `Symptoms cannot exceed ${MAX_SYMPTOMS_LENGTH} characters.`;
    }
    setError(newError);
    onValidationChange(newError === '');
  }, [journal.notableSymptoms, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setHealthJournal(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (name === 'energyLevel' ? parseInt(value, 10) || 0 : value),
    }));
  };

  const inputStyles = "mt-1 block w-full px-3 py-2 bg-bg-white dark:bg-gray-800 border border-border-color dark:border-border-color-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary dark:focus:ring-brand-secondary-dark dark:focus:border-brand-secondary-dark";
  const errorInputStyles = "border-accent-red dark:border-accent-red-dark focus:ring-accent-red focus:border-accent-red dark:focus:ring-accent-red-dark dark:focus:border-accent-red-dark";


  return (
    <div className="bg-bg-white dark:bg-bg-white-dark p-6 rounded-xl shadow-lg h-full transition-colors duration-300">
      <div className="flex items-center mb-4">
        <JournalIcon />
        <h2 className="text-xl font-bold text-brand-primary dark:text-brand-primary-dark ml-4">Daily Health Journal</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Today's Date</label>
          <input
            type="date"
            name="date"
            value={journal.date}
            onChange={handleChange}
            className={inputStyles}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Energy Level (1-10)</label>
          <input
            type="range"
            name="energyLevel"
            min="1"
            max="10"
            value={journal.energyLevel}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
           <div className="text-center font-semibold text-brand-secondary dark:text-brand-secondary-dark">{journal.energyLevel}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Notable Symptoms Today</label>
          <textarea
            name="notableSymptoms"
            value={journal.notableSymptoms}
            onChange={handleChange}
            rows={2}
            className={`${inputStyles} ${error ? errorInputStyles : ''}`}
          />
          <div className="flex justify-between items-center text-xs mt-1">
            {error && <p className="text-accent-red dark:text-accent-red-dark">{error}</p>}
            <p className={`ml-auto ${journal.notableSymptoms.length > MAX_SYMPTOMS_LENGTH ? 'text-accent-red' : 'text-text-secondary'}`}>
                {journal.notableSymptoms.length}/{MAX_SYMPTOMS_LENGTH}
            </p>
          </div>
        </div>
         <div className="flex items-center gap-2">
            <input
                type="checkbox"
                id="medicationAdherence"
                name="medicationAdherence"
                checked={journal.medicationAdherence}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
            />
            <label htmlFor="medicationAdherence" className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Took all prescribed medication today</label>
        </div>
      </div>
    </div>
  );
};
