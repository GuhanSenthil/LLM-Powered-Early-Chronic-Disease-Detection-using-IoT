import React, { useState, useEffect } from 'react';
import type { PhysicianNotesData } from '../types';
import { PhysicianIcon } from '../constants';

interface PhysicianNotesProps {
  notes: PhysicianNotesData;
  setNotes: React.Dispatch<React.SetStateAction<PhysicianNotesData>>;
  onValidationChange: (isValid: boolean) => void;
}

const MAX_NOTES_LENGTH = 500;

export const PhysicianNotes: React.FC<PhysicianNotesProps> = ({ notes, setNotes, onValidationChange }) => {
  const [error, setError] = useState('');

  useEffect(() => {
      const notesLength = notes.notes.trim().length;
      let newError = '';
      if (notesLength > MAX_NOTES_LENGTH) {
          newError = `Notes cannot exceed ${MAX_NOTES_LENGTH} characters.`;
      }
      setError(newError);
      onValidationChange(newError === '');
  }, [notes.notes, onValidationChange]);


  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes({ notes: e.target.value });
  };

  const inputStyles = "mt-1 block w-full px-3 py-2 bg-bg-white dark:bg-gray-800 border border-border-color dark:border-border-color-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary dark:focus:ring-brand-secondary-dark dark:focus:border-brand-secondary-dark";
  const errorInputStyles = "border-accent-red dark:border-accent-red-dark focus:ring-accent-red focus:border-accent-red dark:focus:ring-accent-red-dark dark:focus:border-accent-red-dark";

  return (
    <div className="bg-bg-white dark:bg-bg-white-dark p-6 rounded-xl shadow-lg h-full transition-colors duration-300">
      <div className="flex items-center mb-4">
        <PhysicianIcon />
        <h2 className="text-xl font-bold text-brand-primary dark:text-brand-primary-dark ml-4">Physician Notes</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="physician-notes" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
            Enter clinical observations or feedback.
          </label>
          <textarea
            id="physician-notes"
            name="notes"
            value={notes.notes}
            onChange={handleChange}
            rows={4}
            className={`${inputStyles} ${error ? errorInputStyles : ''}`}
          />
           <div className="flex justify-between items-center text-xs mt-1">
            {error && <p className="text-accent-red dark:text-accent-red-dark">{error}</p>}
            <p className={`ml-auto ${notes.notes.length > MAX_NOTES_LENGTH ? 'text-accent-red' : 'text-text-secondary'}`}>
                {notes.notes.length}/{MAX_NOTES_LENGTH}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};