import React from 'react';
import { Spinner } from './Spinner';
import { RiskDashboard } from './RiskDashboard';
import type { AnalysisRecord } from '../types';

interface AnalysisPanelProps {
  onAnalyze: () => void;
  result: string;
  setResult: (result: string) => void;
  isLoading: boolean;
  error: string;
  history: AnalysisRecord[];
  isAnalysisDisabled: boolean;
  latestAnalysisRecord?: AnalysisRecord;
}

const FormattedResult: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    const elements: string[] = [];
    let inList = false;
    let listType = ''; // 'disc' or 'decimal'

    const closeList = () => {
        if (inList) {
            elements.push('</ul>');
            inList = false;
        }
    };
    
    const formatLine = (line: string) => line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    lines.forEach((line) => {
        const trimmedLine = line.trim();

        const isListItemDisc = trimmedLine.startsWith('* ');
        const isListItemDecimal = trimmedLine.match(/^\d+\.\s/);
        
        if (isListItemDisc || isListItemDecimal) {
            const currentListType = isListItemDisc ? 'disc' : 'decimal';
            if (!inList || listType !== currentListType) {
                closeList();
                elements.push(`<ul class="list-outside ml-5 list-${currentListType}">`);
                inList = true;
                listType = currentListType;
            }
            const content = isListItemDisc ? trimmedLine.substring(2) : trimmedLine.replace(/^\d+\.\s/, '');
            elements.push(`<li>${formatLine(content)}</li>`);
        } else {
            closeList();
            if (trimmedLine.startsWith('###')) {
                elements.push(`<h3 class="text-lg font-semibold text-brand-primary dark:text-brand-primary-dark mt-4 mb-1">${formatLine(trimmedLine.substring(3).trim())}</h3>`);
            } else if (trimmedLine.startsWith('##')) {
                elements.push(`<h2 class="text-xl font-bold text-brand-primary dark:text-brand-primary-dark mt-4 mb-2">${formatLine(trimmedLine.substring(2).trim())}</h2>`);
            } else if (trimmedLine.startsWith('#')) {
                elements.push(`<h1 class="text-2xl font-bold text-brand-primary dark:text-brand-primary-dark mt-4 mb-2">${formatLine(trimmedLine.substring(1).trim())}</h1>`);
            } else if (trimmedLine.includes('Disclaimer:')) {
                elements.push(`<p class="mt-4 p-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-accent-yellow-dark rounded-md font-semibold">${formatLine(trimmedLine)}</p>`);
            } else if (trimmedLine.length > 0) {
                elements.push(`<p>${formatLine(trimmedLine)}</p>`);
            }
        }
    });

    closeList(); // Close any list that's still open at the end.

    const html = elements.join('');

    return <div className="prose prose-sm max-w-none text-text-secondary dark:text-text-secondary-dark" dangerouslySetInnerHTML={{ __html: html }} />;
};


export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onAnalyze, result, setResult, isLoading, error, history, isAnalysisDisabled, latestAnalysisRecord }) => {
  
  const handleHistorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTimestamp = e.target.value;
    if (selectedTimestamp === "") {
        setResult("");
        return;
    }
    const selectedRecord = history.find(record => record.timestamp === selectedTimestamp);
    if (selectedRecord) {
        setResult(selectedRecord.result);
    }
  };

  return (
    <div className="bg-bg-white dark:bg-bg-white-dark p-6 rounded-xl shadow-lg transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-xl font-bold text-brand-primary dark:text-brand-primary-dark">AI Health Analysis</h2>
        {history.length > 0 && (
            <select
                onChange={handleHistorySelect}
                className="w-full md:w-auto px-3 py-2 bg-bg-white dark:bg-gray-800 border border-border-color dark:border-border-color-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
            >
                <option value="">View Latest / New Analysis</option>
                {history.map(record => (
                    <option key={record.timestamp} value={record.timestamp}>
                        {new Date(record.timestamp).toLocaleString()}
                    </option>
                ))}
            </select>
        )}
        <div className="flex flex-col items-end">
            <button
              onClick={onAnalyze}
              disabled={isLoading || isAnalysisDisabled}
              className="w-full md:w-auto bg-accent-green dark:bg-accent-green-dark text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading && <Spinner />}
              {isLoading ? 'Analyzing Data...' : 'Generate Health Analysis'}
            </button>
            {isAnalysisDisabled && <p className="text-xs text-accent-red dark:text-accent-red-dark mt-1">Please fix errors in forms before analyzing.</p>}
        </div>
      </div>
      
      <RiskDashboard latestRisks={latestAnalysisRecord?.risks} />

      <div className="mt-4 p-4 bg-bg-light dark:bg-bg-light-dark rounded-lg min-h-[200px]" aria-live="polite">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary dark:text-text-secondary-dark">
            <Spinner />
            <p className="mt-2">The AI is analyzing the sensor data. Please wait...</p>
          </div>
        )}
        {error && <div className="text-accent-red dark:text-accent-red-dark font-semibold bg-red-100 dark:bg-red-900/50 p-4 rounded-md">{error}</div>}
        {result && !isLoading && (
           <div className="space-y-2">
            <FormattedResult text={result} />
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="flex items-center justify-center h-full text-text-secondary dark:text-text-secondary-dark">
            <p>Click the "Generate Health Analysis" button to get AI-powered insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};