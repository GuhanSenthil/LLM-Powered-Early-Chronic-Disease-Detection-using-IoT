import React from 'react';
import { RiskGauge } from './RiskGauge';
import type { ParsedRisks } from '../types';

interface RiskDashboardProps {
  latestRisks?: ParsedRisks;
}

export const RiskDashboard: React.FC<RiskDashboardProps> = ({ latestRisks }) => {
  if (!latestRisks || !latestRisks.cardiovascular) {
    return (
      <div className="text-center p-8 bg-bg-light dark:bg-bg-light-dark rounded-lg my-4">
        <p className="text-text-secondary dark:text-text-secondary-dark">
          Generate a new health analysis to view your chronic disease risk scores.
        </p>
      </div>
    );
  }

  return (
    <div className="my-4 p-4 border-t border-b border-border-color dark:border-border-color-dark">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RiskGauge label="Cardiovascular" riskDetails={latestRisks.cardiovascular} />
        <RiskGauge label="Respiratory" riskDetails={latestRisks.respiratory} />
        <RiskGauge label="Metabolic" riskDetails={latestRisks.metabolic} />
      </div>
    </div>
  );
};