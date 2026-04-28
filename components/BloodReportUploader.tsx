import React, { useState, useCallback } from 'react';
import { analyzeBloodReport } from '../services/geminiService';
import { Spinner } from './Spinner';
import { UploadIcon } from '../constants';
import type { ExtractedReportData } from '../types';

interface BloodReportUploaderProps {
  onAnalysisComplete: (data: ExtractedReportData) => void;
}

export const BloodReportUploader: React.FC<BloodReportUploaderProps> = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setError('');
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setError('Please upload a valid image file (PNG, JPG).');
        setFile(null);
        setPreview(null);
      }
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!file || !preview) return;

    setIsLoading(true);
    setError('');

    try {
      // The preview is already a base64 data URL, we need to strip the prefix
      const base64Data = preview.split(',')[1];
      const result = await analyzeBloodReport(base64Data, file.type);
      onAnalysisComplete(result);
      setFile(null); // Reset after successful analysis
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze the report.');
    } finally {
      setIsLoading(false);
    }
  }, [file, preview, onAnalysisComplete]);

  return (
    <div className="bg-bg-white dark:bg-bg-white-dark p-6 rounded-xl shadow-lg transition-colors duration-300">
      <h2 className="text-xl font-bold text-brand-primary dark:text-brand-primary-dark mb-4">Upload Blood Report</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="report-upload" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
            Upload an image of a report to update metrics.
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-color dark:border-border-color-dark border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {preview ? (
                <img src={preview} alt="Report preview" className="mx-auto h-32 w-auto object-contain" />
              ) : (
                <UploadIcon />
              )}
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white dark:bg-bg-white-dark rounded-md font-medium text-brand-secondary dark:text-brand-secondary-dark hover:text-brand-primary dark:hover:text-brand-primary-dark focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
            </div>
          </div>
        </div>
        {file && !isLoading && (
          <div className="text-sm">
            <strong>Selected file:</strong> {file.name}
          </div>
        )}
        {error && <div className="text-sm text-accent-red dark:text-accent-red-dark font-semibold">{error}</div>}
        <button
          onClick={handleAnalyze}
          disabled={!file || isLoading}
          className="w-full bg-brand-secondary dark:bg-brand-secondary-dark text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary dark:hover:bg-brand-primary-dark transition duration-300 ease-in-out shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading && <Spinner />}
          {isLoading ? 'Analyzing Report...' : 'Analyze and Update Metrics'}
        </button>
      </div>
    </div>
  );
};