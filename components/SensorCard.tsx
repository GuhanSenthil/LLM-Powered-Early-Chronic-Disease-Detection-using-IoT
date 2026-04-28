
import React, { useEffect, useRef, useState } from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SensorStatus } from '../types';
import { StatusOkIcon, StatusWarningIcon, ExpandIcon, EditIcon } from '../constants';

interface SensorCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  status: SensorStatus;
  data: number[];
  accuracy: string;
  thresholds: { warn: number; high: number };
  onClick: () => void;
  onThresholdsChange: (newThresholds: { warn: number; high: number }) => void;
  onValueChange: (newValue: number) => void;
  loading?: boolean;
}

const useAnimateValue = (endValue: number) => {
    const [currentValue, setCurrentValue] = React.useState(endValue);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = currentValue;
        const duration = 500; // ms
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const nextValue = startValue + (endValue - startValue) * percentage;
            setCurrentValue(nextValue);

            if (progress < duration) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [endValue]);

    return currentValue;
}


const statusStyles: Record<SensorStatus, { bg: string; text: string; ring: string; iconBg: string }> = {
  normal: { 
    bg: 'dark:bg-green-900/50', 
    text: 'text-accent-green dark:text-accent-green-dark', 
    ring: 'dark:ring-green-700',
    iconBg: 'bg-green-100 dark:bg-green-800/50'
  },
  warning: { 
    bg: 'dark:bg-yellow-900/50', 
    text: 'text-accent-yellow dark:text-accent-yellow-dark', 
    ring: 'dark:ring-yellow-600',
    iconBg: 'bg-yellow-100 dark:bg-yellow-800/50'
  },
  high: { 
    bg: 'dark:bg-red-900/50', 
    text: 'text-accent-red dark:text-accent-red-dark', 
    ring: 'dark:ring-red-600',
    iconBg: 'bg-red-100 dark:bg-red-800/50'
  },
};

const statusIcons: Record<SensorStatus, React.ReactNode> = {
    normal: <StatusOkIcon />,
    warning: <StatusWarningIcon />,
    high: <StatusWarningIcon />, // Using the same icon for high/warning
};


export const SensorCard: React.FC<SensorCardProps> = ({ title, value, unit, icon, status, data, accuracy, thresholds, onClick, onThresholdsChange, onValueChange, loading }) => {
  const chartData = data.map((val, index) => ({ name: `T-${data.length - index}`, value: val }));
  const style = statusStyles[status];
  
  const numericValue = parseFloat(value);
  const animatedValue = useAnimateValue(isNaN(numericValue) ? 0 : numericValue);
  const displayValue = numericValue % 1 !== 0 ? animatedValue.toFixed(1) : Math.round(animatedValue).toString();

  const prevStatus = useRef(status);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // State for editing thresholds
  const [isEditing, setIsEditing] = useState(false);
  const [editedThresholds, setEditedThresholds] = useState(thresholds);
  const [validationError, setValidationError] = useState('');
  
  // New states for value editing
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [valueValidationError, setValueValidationError] = useState('');
  
  useEffect(() => {
    if (!isEditing) {
      setEditedThresholds(thresholds);
    }
  }, [thresholds, isEditing]);

  useEffect(() => {
    if (prevStatus.current !== status && status !== 'normal') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 700);
      return () => clearTimeout(timer);
    }
    prevStatus.current = status;
  }, [status]);
  
  useEffect(() => {
    if (!isEditingValue) {
        setEditedValue(value);
    }
  }, [value, isEditingValue]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(false);
      setEditedThresholds(thresholds);
      setValidationError('');
  };

  const handleSave = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (editedThresholds.warn >= editedThresholds.high && title !== 'Blood Oxygen') {
           setValidationError('Warning level must be less than High level.');
           return;
      }
      if (editedThresholds.warn <= editedThresholds.high && title === 'Blood Oxygen') {
           setValidationError('Warning level must be greater than High level for SpO2.');
           return;
      }
      onThresholdsChange(editedThresholds);
      setIsEditing(false);
      setValidationError('');
  };

  const handleThresholdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditedThresholds(prev => ({
          ...prev,
          [name]: parseFloat(value) || 0,
      }));
  };

  const handleValueEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingValue(true);
  };
  
  const handleValueCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingValue(false);
    setValueValidationError('');
    setEditedValue(value);
  };

  const handleValueSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const numericVal = parseFloat(editedValue);
    if (isNaN(numericVal)) {
        setValueValidationError('Please enter a valid number.');
        return;
    }
    onValueChange(numericVal);
    setIsEditingValue(false);
    setValueValidationError('');
  };

  const handleValueInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!isEditing && !isEditingValue) {
        e.preventDefault();
        onClick();
      }
    }
  };


  if (loading) {
    return (
        <div className="bg-bg-white dark:bg-bg-white-dark p-4 rounded-xl shadow-lg flex flex-col justify-between animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-1"></div>
            <div className="h-20 mt-8 -mb-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    );
  }

  return (
    <div 
      onClick={isEditing || isEditingValue ? (e) => e.preventDefault() : onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={`w-full text-left bg-bg-white dark:bg-bg-white-dark p-4 rounded-xl shadow-lg flex flex-col justify-between ring-2 ring-transparent transition-all duration-300 ${!isEditing && !isEditingValue && 'hover:shadow-2xl hover:-translate-y-1'} focus:outline-none focus:ring-brand-secondary dark:focus:ring-brand-secondary-dark ${style.ring} ${isAnimating ? 'animate-status-change' : ''}`}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-brand-primary dark:text-brand-primary-dark">{title}</h3>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button onClick={handleEditClick} aria-label={`Edit ${title} thresholds`} className="p-1 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700">
                <EditIcon />
              </button>
            )}
            <span className="text-gray-400 dark:text-gray-500"><ExpandIcon /></span>
            <div className={`${style.iconBg} ${style.text} p-2 rounded-full`}>{icon}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-2 min-h-[52px]">
          {isEditingValue ? (
            <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
              <input
                type="number"
                step={title === 'Body Temperature' ? "0.1" : "1"}
                value={editedValue}
                onChange={handleValueInputChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
                        handleValueSave(mockEvent);
                    } else if (e.key === 'Escape') {
                        const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
                        handleValueCancel(mockEvent);
                    }
                }}
                className={`w-full p-1 rounded bg-bg-light dark:bg-gray-700 text-4xl font-mono font-extrabold border border-border-color dark:border-border-color-dark focus:ring-1 focus:ring-brand-secondary text-text-primary dark:text-text-primary-dark ${valueValidationError ? 'border-accent-red' : ''}`}
                autoFocus
              />
              <button onClick={handleValueSave} aria-label="Save value" className="p-1 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button onClick={handleValueCancel} aria-label="Cancel edit" className="p-1 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
            </div>
          ) : (
            <>
              <p className={`text-4xl font-mono font-extrabold ${style.text}`}>{displayValue}</p>
              <p className="text-text-secondary dark:text-text-secondary-dark">{unit}</p>
              <button onClick={handleValueEditClick} aria-label={`Edit ${title} value`} className="p-1 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700">
                <EditIcon />
              </button>
            </>
          )}
        </div>
        {valueValidationError && <p className="text-xs text-accent-red dark:text-accent-red-dark -mt-1">{valueValidationError}</p>}
         <div className={`flex items-center space-x-1 text-sm font-semibold capitalize ${style.text}`}>
            {statusIcons[status]}
            <span>{status}</span>
        </div>
         <div className="mt-2 pt-2 border-t border-border-color dark:border-border-color-dark">
            {isEditing ? (
                 <div className="space-y-2 text-sm text-text-primary dark:text-text-primary-dark" onClick={e => e.stopPropagation()}>
                    <p className="font-semibold text-xs text-text-secondary dark:text-text-secondary-dark">Set Custom Thresholds</p>
                    <div className="flex justify-between items-center">
                        <label htmlFor={`warn-${title}`} className="font-medium">Warn Level:</label>
                        <input
                            id={`warn-${title}`}
                            name="warn"
                            type="number"
                            value={editedThresholds.warn}
                            onChange={handleThresholdInputChange}
                            className="w-24 p-1 rounded bg-bg-light dark:bg-gray-700 text-right border border-border-color dark:border-border-color-dark focus:ring-1 focus:ring-brand-secondary"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <label htmlFor={`high-${title}`} className="font-medium">High Level:</label>
                        <input
                            id={`high-${title}`}
                            name="high"
                            type="number"
                            value={editedThresholds.high}
                            onChange={handleThresholdInputChange}
                            className="w-24 p-1 rounded bg-bg-light dark:bg-gray-700 text-right border border-border-color dark:border-border-color-dark focus:ring-1 focus:ring-brand-secondary"
                        />
                    </div>
                    {validationError && <p className="text-xs text-accent-red dark:text-accent-red-dark">{validationError}</p>}
                    <div className="flex justify-end space-x-2 pt-1">
                        <button onClick={handleCancel} className="px-3 py-1 text-xs font-semibold rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1 text-xs font-semibold rounded bg-brand-secondary text-white hover:bg-brand-primary transition-colors">Save</button>
                    </div>
                </div>
            ) : (
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                    <strong>Accuracy:</strong> {accuracy}
                </p>
            )}
         </div>
      </div>
      <div className="h-20 mt-4 -mb-2 -mr-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <Line type="monotone" dataKey="value" stroke="var(--color-brand-secondary)" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={500} />
             <ReferenceLine y={thresholds.warn} stroke="var(--color-accent-yellow)" strokeDasharray="3 3" strokeWidth={1} />
             <ReferenceLine y={thresholds.high} stroke="var(--color-accent-red)" strokeDasharray="3 3" strokeWidth={1} />
             <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #ccc',
                    borderRadius: '8px'
                }}
                 wrapperClassName="dark:!bg-gray-800/90 dark:!border-gray-600"
                 labelStyle={{ fontWeight: 'bold' }}
                 formatter={(value: number) => [`${value} ${unit}`, 'Value']}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
