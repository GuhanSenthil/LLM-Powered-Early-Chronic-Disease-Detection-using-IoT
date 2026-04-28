import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, CartesianGrid } from 'recharts';

// A single, realistic P-QRS-T cycle for a single lead (like Lead II)
const ecgCycle = [
    { y: 0 }, { y: 2 }, { y: 0 }, // P wave
    { y: 0 }, { y: -2 }, // Q
    { y: 15 }, // R
    { y: -3 }, // S
    { y: 0 }, { y: 0 }, { y: 4 }, { y: 4 }, { y: 0 }, // T wave
    { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 } // Isoelectric line padding
].map((p, i) => ({ x: i, y: p.y }));

const REPETITIONS = 10;
const fullEcgData = Array.from({ length: REPETITIONS }, () => ecgCycle).flat().map((p, i) => ({ ...p, x: i }));

const VISIBLE_POINTS = 200; // Number of points to show on screen
const TOTAL_POINTS = fullEcgData.length;

interface ECGChartProps {
  heartRate: number;
  isPlaying: boolean;
}

export const ECGChart: React.FC<ECGChartProps> = ({ heartRate, isPlaying }) => {
    const [startIndex, setStartIndex] = useState(0);
    const animationFrameRef = useRef<number | null>(null);

    // Creates a "window" of data to display, giving the scrolling effect
    const dataWindow = [];
    for (let i = 0; i < VISIBLE_POINTS; i++) {
        dataWindow.push(fullEcgData[(startIndex + i) % TOTAL_POINTS]);
    }

    useEffect(() => {
        let animationStartTime: number | null = null;
        
        const animate = (currentTime: number) => {
            if (animationStartTime === null) {
                animationStartTime = currentTime;
            }
            // Animate at ~60 frames per second
            if (currentTime - animationStartTime > 16) {
                setStartIndex(prevIndex => (prevIndex + 1) % TOTAL_POINTS);
                animationStartTime = currentTime;
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying]);

    return (
        <div className="bg-bg-white dark:bg-bg-white-dark p-4 rounded-xl shadow-lg h-full flex flex-col transition-colors duration-300">
            <div className="flex justify-between items-center mb-2 border-b border-border-color dark:border-border-color-dark pb-2">
                <h3 className="font-bold text-brand-primary dark:text-brand-primary-dark text-lg">Live ECG Waveform (Lead II Simulation)</h3>
                <span className="font-mono text-sm text-text-secondary dark:text-text-secondary-dark">
                    HR: <strong className="text-text-primary dark:text-text-primary-dark">{heartRate}</strong> bpm
                </span>
            </div>
            <div className="flex-grow w-full mt-2 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataWindow}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-red-500/20 dark:stroke-red-400/20" />
                        <YAxis domain={[-15, 20]} hide />
                        <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} hide />
                        <Line
                            type="monotone"
                            dataKey="y"
                            className="stroke-accent-red dark:stroke-accent-red-dark"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};