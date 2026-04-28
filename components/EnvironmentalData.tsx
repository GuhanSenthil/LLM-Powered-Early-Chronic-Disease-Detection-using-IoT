import React, { useState, useEffect } from 'react';
import type { EnvironmentalData as EnvironmentalDataType } from '../types';
import { EnvironmentIcon } from '../constants';

interface EnvironmentalDataProps {
  data: EnvironmentalDataType;
  setData: React.Dispatch<React.SetStateAction<EnvironmentalDataType>>;
  onValidationChange: (isValid: boolean) => void;
}

const inputStyles = "mt-1 block w-full px-3 py-2 bg-bg-white dark:bg-gray-800 border border-border-color dark:border-border-color-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary dark:focus:ring-brand-secondary-dark dark:focus:border-brand-secondary-dark";
const errorInputStyles = "border-accent-red dark:border-accent-red-dark focus:ring-accent-red focus:border-accent-red dark:focus:ring-accent-red-dark dark:focus:border-accent-red-dark";


export const EnvironmentalData: React.FC<EnvironmentalDataProps> = ({ data, setData, onValidationChange }) => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const newErrors: Record<string, string> = {};
        if (data.location.airQualityIndex < 0) newErrors.airQualityIndex = 'AQI cannot be negative.';
        if (data.activity.steps < 0) newErrors.steps = 'Steps cannot be negative.';
        if (data.activity.sleep.duration < 0 || data.activity.sleep.duration > 24) newErrors.sleepDuration = 'Hours must be 0-24.';
        if (data.activity.sleep.quality < 1 || data.activity.sleep.quality > 10) newErrors.sleepQuality = 'Quality must be 1-10.';

        setErrors(newErrors);
        onValidationChange(Object.keys(newErrors).length === 0);
    }, [data, onValidationChange]);


  const handleNestedChange = (category: 'location' | 'activity', key: string, value: any) => {
    const numericValue = parseInt(value, 10);
    setData(prev => ({
        ...prev,
        [category]: {
            ...prev[category],
            [key]: isNaN(numericValue) ? value : numericValue
        }
    }));
  };
  
   const handleSleepChange = (key: 'duration' | 'quality', value: any) => {
    setData(prev => ({
        ...prev,
        activity: {
            ...prev.activity,
            sleep: {
                ...prev.activity.sleep,
                [key]: parseFloat(value) || 0
            }
        }
    }));
  };

  return (
    <div className="bg-bg-white dark:bg-bg-white-dark p-6 rounded-xl shadow-lg h-full transition-colors duration-300">
      <div className="flex items-center mb-4">
        <EnvironmentIcon />
        <h2 className="text-xl font-bold text-brand-primary dark:text-brand-primary-dark ml-4">Environmental & Activity</h2>
      </div>
      <div className="space-y-6">
        <fieldset>
          <legend className="text-md font-semibold text-text-primary dark:text-text-primary-dark">Location</legend>
          <div className="mt-2 space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Air Quality Index (AQI)</label>
                <input type="number" name="location.airQualityIndex" value={data.location.airQualityIndex} onChange={(e) => handleNestedChange('location', 'airQualityIndex', e.target.value)} className={`${inputStyles} ${errors.airQualityIndex ? errorInputStyles : ''}`}/>
                {errors.airQualityIndex && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">{errors.airQualityIndex}</p>}
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Pollen Count</label>
                <select name="location.pollenCount" value={data.location.pollenCount} onChange={(e) => handleNestedChange('location', 'pollenCount', e.target.value)} className={inputStyles}>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-md font-semibold text-text-primary dark:text-text-primary-dark">Activity & Sleep</legend>
           <div className="mt-2 space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Steps Today</label>
                <input type="number" name="activity.steps" value={data.activity.steps} onChange={(e) => handleNestedChange('activity', 'steps', e.target.value)} className={`${inputStyles} ${errors.steps ? errorInputStyles : ''}`} />
                {errors.steps && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">{errors.steps}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Sleep (hrs)</label>
                    <input type="number" step="0.5" name="activity.sleep.duration" value={data.activity.sleep.duration} onChange={(e) => handleSleepChange('duration', e.target.value)} className={`${inputStyles} ${errors.sleepDuration ? errorInputStyles : ''}`} />
                    {errors.sleepDuration && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">{errors.sleepDuration}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Quality (1-10)</label>
                    <input type="number" name="activity.sleep.quality" min="1" max="10" value={data.activity.sleep.quality} onChange={(e) => handleSleepChange('quality', e.target.value)} className={`${inputStyles} ${errors.sleepQuality ? errorInputStyles : ''}`} />
                    {errors.sleepQuality && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">{errors.sleepQuality}</p>}
                </div>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};