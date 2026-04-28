import React, { useState, useEffect } from 'react';
import type { PatientProfileData, Demographics, FamilyHistory, Lifestyle } from '../types';
import { PatientAvatarIcon } from '../constants';

interface PatientProfileProps {
  profile: PatientProfileData;
  setProfile: React.Dispatch<React.SetStateAction<PatientProfileData>>;
  onValidationChange: (isValid: boolean) => void;
}

const inputStyles = "mt-1 block w-full px-3 py-2 bg-bg-white dark:bg-gray-800 border border-border-color dark:border-border-color-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary dark:focus:ring-brand-secondary-dark dark:focus:border-brand-secondary-dark";
const errorInputStyles = "border-accent-red dark:border-accent-red-dark focus:ring-accent-red focus:border-accent-red dark:focus:ring-accent-red-dark dark:focus:border-accent-red-dark";
const checkboxStyles = "h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary";

export const PatientProfile: React.FC<PatientProfileProps> = ({ profile, setProfile, onValidationChange }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const { demographics, lifestyle } = profile;
    if (!demographics.name.trim()) newErrors.name = 'Name is required.';
    if (demographics.age < 1 || demographics.age > 120) newErrors.age = 'Age must be 1-120.';
    if (demographics.height < 50 || demographics.height > 250) newErrors.height = 'Height must be 50-250 cm.';
    if (demographics.weight < 10 || demographics.weight > 300) newErrors.weight = 'Weight must be 10-300 kg.';
    if (lifestyle.smoking.packYears < 0) newErrors.packYears = 'Pack years cannot be negative.';
    if (lifestyle.alcohol.unitsPerWeek < 0) newErrors.unitsPerWeek = 'Units cannot be negative.';
    if (!lifestyle.exercise.frequency.trim()) newErrors.exerciseFrequency = 'Exercise frequency is required.';

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [profile, onValidationChange]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, category: keyof PatientProfileData, subkey?: keyof any) => {
    const { name, value, type } = e.target;
    const isNumeric = ['age', 'height', 'weight', 'packYears', 'unitsPerWeek'].includes(name);
    const parsedValue = isNumeric ? parseInt(value, 10) || 0 : value;

    setProfile(prev => {
        const newProfile = { ...prev };
        if (subkey) {
            (newProfile[category] as any)[subkey][name] = parsedValue;
        } else {
            (newProfile[category] as any)[name] = parsedValue;
        }
        return newProfile;
    });
  };

  const handleFamilyHistoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      familyHistory: { ...prev.familyHistory, [name]: checked }
    }));
  };
  
  const handleLifestyleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [field, subfield] = name.split('.');

    setProfile(prev => {
        const newLifestyle = { ...prev.lifestyle };
        if (subfield) {
            const isNumeric = ['packYears', 'unitsPerWeek'].includes(subfield);
            (newLifestyle[field as keyof Lifestyle] as any)[subfield] = isNumeric ? parseInt(value, 10) || 0 : value;
        } else {
            (newLifestyle as any)[field] = value;
        }
        return { ...prev, lifestyle: newLifestyle };
    });
  };

  return (
    <div className="bg-bg-white dark:bg-bg-white-dark p-6 rounded-xl shadow-lg h-full transition-colors duration-300">
        <div className="flex items-center mb-4">
            <PatientAvatarIcon />
            <h2 className="text-xl font-bold text-brand-primary dark:text-brand-primary-dark ml-4">Patient Profile</h2>
        </div>
        <form className="space-y-6">
            <fieldset>
                <legend className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Demographics</legend>
                <div className="space-y-4 mt-2">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Name</label>
                        <input type="text" name="name" value={profile.demographics.name} onChange={(e) => handleChange(e, 'demographics')} className={`${inputStyles} ${errors.name ? errorInputStyles : ''}`} />
                         {errors.name && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Age</label>
                            <input type="number" name="age" value={profile.demographics.age} onChange={(e) => handleChange(e, 'demographics')} className={`${inputStyles} ${errors.age ? errorInputStyles : ''}`} />
                            {errors.age && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">{errors.age}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Gender</label>
                            <select name="gender" value={profile.demographics.gender} onChange={(e) => handleChange(e, 'demographics')} className={inputStyles}>
                                <option>Female</option><option>Male</option><option>Other</option>
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Height (cm)</label>
                            <input type="number" name="height" value={profile.demographics.height} onChange={(e) => handleChange(e, 'demographics')} className={`${inputStyles} ${errors.height ? errorInputStyles : ''}`} />
                            {errors.height && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">{errors.height}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Weight (kg)</label>
                            <input type="number" name="weight" value={profile.demographics.weight} onChange={(e) => handleChange(e, 'demographics')} className={`${inputStyles} ${errors.weight ? errorInputStyles : ''}`} />
                             {errors.weight && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">{errors.weight}</p>}
                        </div>
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Family History</legend>
                <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2"><input type="checkbox" id="diabetes" name="diabetes" checked={profile.familyHistory.diabetes} onChange={handleFamilyHistoryChange} className={checkboxStyles} /><label htmlFor="diabetes" className="text-sm font-medium">Diabetes</label></div>
                    <div className="flex items-center gap-2"><input type="checkbox" id="heartDisease" name="heartDisease" checked={profile.familyHistory.heartDisease} onChange={handleFamilyHistoryChange} className={checkboxStyles} /><label htmlFor="heartDisease" className="text-sm font-medium">Heart Disease</label></div>
                    <div className="flex items-center gap-2"><input type="checkbox" id="hypertension" name="hypertension" checked={profile.familyHistory.hypertension} onChange={handleFamilyHistoryChange} className={checkboxStyles} /><label htmlFor="hypertension" className="text-sm font-medium">Hypertension</label></div>
                </div>
            </fieldset>

             <fieldset>
                <legend className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Lifestyle</legend>
                 <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Smoking Status</label>
                            <select name="smoking.status" value={profile.lifestyle.smoking.status} onChange={handleLifestyleChange} className={inputStyles}>
                                <option value="never">Never</option><option value="former">Former</option><option value="current">Current</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Pack Years</label>
                            <input type="number" name="smoking.packYears" value={profile.lifestyle.smoking.packYears} onChange={handleLifestyleChange} className={`${inputStyles} ${errors.packYears ? errorInputStyles : ''}`} />
                            {errors.packYears && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">{errors.packYears}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Exercise Frequency</label>
                        <input type="text" name="exercise.frequency" value={profile.lifestyle.exercise.frequency} onChange={handleLifestyleChange} className={`${inputStyles} ${errors.exerciseFrequency ? errorInputStyles : ''}`} placeholder="e.g., 3x/week"/>
                        {errors.exerciseFrequency && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">{errors.exerciseFrequency}</p>}
                    </div>
                 </div>
            </fieldset>
        </form>
    </div>
  );
};
