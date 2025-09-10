
import React, { useState, useEffect } from 'react';

interface LoadingIndicatorProps {
  message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="relative h-20 w-20">
            <div className="absolute inset-0 border-4 border-t-purple-500 border-r-purple-500/30 border-b-purple-500/30 border-l-purple-500/30 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-indigo-500 border-r-indigo-500/30 border-b-indigo-500/30 border-l-indigo-500/30 rounded-full animate-spin [animation-direction:reverse]"></div>
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-200 animate-pulse">{message}{dots}</p>
        <p className="mt-2 text-sm text-gray-400">This can take up to a few minutes. Please don't close this window.</p>
    </div>
  );
};

export default LoadingIndicator;
