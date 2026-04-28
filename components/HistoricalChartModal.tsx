import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ModalData } from '../types';

interface HistoricalChartModalProps {
  modalData: ModalData;
  onClose: () => void;
}

export const HistoricalChartModal: React.FC<HistoricalChartModalProps> = ({ modalData, onClose }) => {
  const chartData = modalData.data.map((val, index) => ({ name: `t-${modalData.data.length - index}`, value: val }));

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-bg-white dark:bg-bg-white-dark w-full max-w-4xl h-full max-h-[70vh] rounded-2xl shadow-2xl p-6 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-2xl font-bold text-brand-primary dark:text-brand-primary-dark">{modalData.title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)' }} />
              <YAxis tick={{ fill: 'var(--color-text-secondary)' }} unit={modalData.unit} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'var(--color-bg-white)',
                    border: '1px solid var(--color-border-color)',
                    borderRadius: '8px'
                }}
                wrapperClassName="dark:!bg-bg-white-dark dark:!border-border-color-dark"
                labelStyle={{ fontWeight: 'bold' }}
                formatter={(value: number) => [`${value} ${modalData.unit}`, 'Value']}
              />
              <Legend />
              <ReferenceLine y={modalData.thresholds.warn} label="Warning" stroke="var(--color-accent-yellow)" strokeWidth={2} strokeDasharray="3 3" />
              <ReferenceLine y={modalData.thresholds.high} label="High" stroke="var(--color-accent-red)" strokeWidth={2} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="value" name={modalData.title} stroke="var(--color-brand-primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
