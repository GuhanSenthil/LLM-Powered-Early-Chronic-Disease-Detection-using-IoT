import React from 'react';
import type { RiskLevel, RiskDetails } from '../types';

interface RiskGaugeProps {
  label: string;
  riskDetails: RiskDetails;
}

const riskConfig: Record<RiskLevel, { color: string; textColor: string }> = {
  Low: { color: 'var(--color-accent-green)', textColor: 'text-accent-green dark:text-accent-green-dark' },
  Moderate: { color: 'var(--color-accent-yellow)', textColor: 'text-accent-yellow dark:text-accent-yellow-dark' },
  High: { color: 'var(--color-accent-red)', textColor: 'text-accent-red dark:text-accent-red-dark' },
  Unknown: { color: 'var(--color-border-color)', textColor: 'text-text-secondary dark:text-text-secondary-dark' },
};

export const RiskGauge: React.FC<RiskGaugeProps> = ({ label, riskDetails }) => {
  const { level, score, factors } = riskDetails;
  const config = riskConfig[level];
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  // Score is 0-10, so percentage is 0-100.
  const percentage = score > 0 ? score * 10 : 0;
  const offset = circumference - (percentage / 100) * circumference;
  
  const tooltipId = `gauge-tooltip-${label.replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col items-center justify-center text-center p-2 group relative">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            className="text-bg-light dark:text-bg-light-dark"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke={config.color}
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            transform="rotate(-90 60 60)"
            className="transition-all duration-1000 ease-in-out"
            role="meter"
            aria-label={`${label} risk score`}
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={10}
            aria-describedby={tooltipId}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold font-mono ${config.textColor}`}>{score > 0 ? `${score}/10` : 'N/A'}</span>
          <span className={`text-xs font-semibold ${config.textColor}`}>{level}</span>
        </div>
      </div>
      <p className="mt-2 font-semibold text-sm text-text-primary dark:text-text-primary-dark">{label}</p>
      {factors && factors.length > 0 && (
          <div id={tooltipId} role="tooltip" className="absolute bottom-full mb-2 w-56 p-3 bg-bg-white dark:bg-bg-white-dark text-text-secondary dark:text-text-secondary-dark text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-border-color dark:border-border-color-dark">
              <h4 className="font-bold text-text-primary dark:text-text-primary-dark mb-1">Key Factors:</h4>
              <ul className="list-disc list-inside text-left space-y-1">
                  {factors.map((factor, index) => <li key={index}>{factor}</li>)}
              </ul>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-bg-white dark:border-t-bg-white-dark"></div>
          </div>
      )}
    </div>
  );
};