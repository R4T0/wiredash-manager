
import { useState, useCallback } from 'react';

export interface ApiLog {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  status?: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  error?: string;
  duration?: number;
}

const useApiLogs = () => {
  const [logs, setLogs] = useState<ApiLog[]>([]);

  const addLog = useCallback((log: Omit<ApiLog, 'id' | 'timestamp'>) => {
    const newLog: ApiLog = {
      ...log,
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      timestamp: new Date(),
    };
    
    setLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs];
      // Manter apenas os últimos 100 logs
      return updatedLogs.slice(0, 100);
    });
    
    console.log('API Log added:', newLog);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    console.log('API logs cleared');
  }, []);

  return {
    logs,
    addLog,
    clearLogs
  };
};

export default useApiLogs;
