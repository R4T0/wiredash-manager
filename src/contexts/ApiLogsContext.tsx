
import React, { createContext, useContext, ReactNode } from 'react';
import useApiLogs, { ApiLog } from '../hooks/useApiLogs';

interface ApiLogsContextType {
  logs: ApiLog[];
  addLog: (log: Omit<ApiLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const ApiLogsContext = createContext<ApiLogsContextType | undefined>(undefined);

export const useApiLogsContext = () => {
  const context = useContext(ApiLogsContext);
  if (!context) {
    throw new Error('useApiLogsContext must be used within an ApiLogsProvider');
  }
  return context;
};

interface ApiLogsProviderProps {
  children: ReactNode;
}

export const ApiLogsProvider: React.FC<ApiLogsProviderProps> = ({ children }) => {
  const apiLogs = useApiLogs();

  return (
    <ApiLogsContext.Provider value={apiLogs}>
      {children}
    </ApiLogsContext.Provider>
  );
};
