
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useApiLogsContext } from '@/contexts/ApiLogsContext';
import { apiService } from '@/services/api';

interface ConnectionFormData {
  endpoint: string;
  port: string;
  user: string;
  password: string;
  useHttps: boolean;
}

const routerTypes = [
  { id: 'mikrotik', name: 'Mikrotik' },
  { id: 'opnsense', name: 'OPNsense' },
  { id: 'pfsense', name: 'Pfsense' }
];

// Helper function to get the correct backend URL
const getBackendUrl = () => {
  // First, check for environment variable (set during build)
  if (import.meta.env.VITE_API_URL) {
    // Remove /api suffix if present to get base URL
    return import.meta.env.VITE_API_URL.replace(/\/api$/, '');
  }
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5000`;
};

export const useRouterConnection = () => {
  const [formData, setFormData] = useState<ConnectionFormData>({
    endpoint: '',
    port: '',
    user: '',
    password: '',
    useHttps: false
  });
  const [selectedRouter, setSelectedRouter] = useState('mikrotik');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [actualPassword, setActualPassword] = useState('');
  const { toast } = useToast();
  const { addLog } = useApiLogsContext();

  // Load saved data from SQLite database via API
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('Loading router configuration from SQLite database...');
        const response = await apiService.getRouterConfig();
        
        if (response.success && response.data) {
          const config = response.data;
          // Don't log sensitive configuration data
          console.log('Router configuration loaded from SQLite database');
          const hasPassword = config.password && config.password.length > 0;
          setHasStoredPassword(hasPassword);
          setActualPassword(hasPassword ? config.password : '');
          setFormData({
            endpoint: config.endpoint || '',
            port: config.port || '',
            user: config.user || '',
            password: hasPassword ? '••••••••' : '', // Mask password in UI
            useHttps: config.use_https || false
          });
          if (config.router_type) {
            setSelectedRouter(config.router_type);
          }
        } else {
          console.log('No router configuration found in SQLite database');
          setHasStoredPassword(false);
          setActualPassword('');
        }
      } catch (error) {
        console.error('Failed to load router config from SQLite database:', error);
        // Fallback temporário para localStorage apenas se API falhar completamente
        try {
          const savedConfig = localStorage.getItem('routerConfig');
          if (savedConfig) {
            const config = JSON.parse(savedConfig);
            console.log('Fallback: Loading configuration from localStorage:', config);
            const hasPassword = config.password && config.password.length > 0;
            setHasStoredPassword(hasPassword);
            setActualPassword(hasPassword ? config.password : '');
            setFormData({
              endpoint: config.endpoint || '',
              port: config.port || '',
              user: config.user || '',
              password: hasPassword ? '••••••••' : '',
              useHttps: config.useHttps || false
            });
            if (config.routerType) {
              setSelectedRouter(config.routerType);
            }
          }
        } catch (localError) {
          console.error('Error loading from localStorage fallback:', localError);
        }
      }
    };

    loadConfig();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} to:`, name === 'password' ? '[REDACTED]' : value);
    
    if (name === 'password') {
      // If user is typing a new password, update the actual password and clear the stored flag
      setActualPassword(value);
      setHasStoredPassword(false);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSwitchChange = useCallback((checked: boolean) => {
    console.log('Updating HTTPS to:', checked);
    setFormData(prev => ({
      ...prev,
      useHttps: checked
    }));
  }, []);

  const handleTestConnection = useCallback(async () => {
    // Use actual password if we have a stored one and user hasn't changed it
    const passwordToUse = hasStoredPassword && formData.password === '••••••••' ? actualPassword : formData.password;
    
    if (!formData.endpoint || !formData.user || !passwordToUse) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o endereço, usuário e senha antes de testar a conexão.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    console.log(`Testing connection with ${selectedRouter} router via backend...`);

    const startTime = Date.now();
    
    const requestData = {
      routerType: selectedRouter,
      endpoint: formData.endpoint,
      port: formData.port,
      user: formData.user,
      password: passwordToUse,
      useHttps: formData.useHttps
    };

    try {
    console.log(`Making request to backend for ${selectedRouter}...`);
    // Note: Password is not logged for security reasons
      
      // Use dynamic backend URL instead of hardcoded localhost
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/router/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(15000)
      });

      const duration = Date.now() - startTime;
      const responseData = await response.json();
      
      console.log('Backend response:', responseData);

      addLog({
        method: 'POST',
        url: '/api/router/test-connection',
        status: response.status,
        requestHeaders: { 'Content-Type': 'application/json' },
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseBody: JSON.stringify(responseData),
        duration
      });

      if (responseData.success && responseData.status === 200) {
        const routerName = routerTypes.find(r => r.id === selectedRouter)?.name || selectedRouter;
        toast({
          title: "✅ Conexão bem-sucedida!",
          description: `A conexão ${formData.useHttps ? 'HTTPS' : 'HTTP'} com o roteador ${routerName} foi estabelecida com sucesso.`,
        });
      } else {
        toast({
          title: "❌ Falha na conexão",
          description: responseData.error || `Erro ${responseData.status}: Verifique as credenciais e configurações.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.error('Backend request failed:', error);
      
      addLog({
        method: 'POST',
        url: '/api/router/test-connection',
        requestHeaders: { 'Content-Type': 'application/json' },
        error: errorMessage,
        duration
      });

      toast({
        title: "❌ Erro de conexão",
        description: `Não foi possível conectar ao backend. Verifique se o backend está executando.`,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  }, [formData, selectedRouter, toast, addLog, hasStoredPassword, actualPassword]);

  const handleSave = useCallback(async () => {
    // Use actual password if we have a stored one and user hasn't changed it
    const passwordToUse = hasStoredPassword && formData.password === '••••••••' ? actualPassword : formData.password;
    
    const configToSave = {
      routerType: selectedRouter,
      endpoint: formData.endpoint,
      port: formData.port,
      user: formData.user,
      password: passwordToUse,
      useHttps: formData.useHttps
    };

    console.log('Saving router configuration to SQLite database');
    // Note: Password is encrypted before storage for security
    
    try {
      const response = await apiService.saveRouterConfig(configToSave);
      if (response.success) {
        console.log('Configuration saved successfully to SQLite database');
        // Update our state to reflect the saved password
        setHasStoredPassword(true);
        setActualPassword(passwordToUse);
        setFormData(prev => ({
          ...prev,
          password: '••••••••'
        }));
        toast({
          title: "✅ Configurações salvas",
          description: "As configurações foram salvas com sucesso no banco de dados SQLite!",
        });
      } else {
        throw new Error('Failed to save to SQLite database');
      }
    } catch (error) {
      console.error('Failed to save to SQLite database:', error);
      // Fallback temporário para localStorage apenas se API falhar
      localStorage.setItem('routerConfig', JSON.stringify(configToSave));
      console.log('Fallback: Configuration saved to localStorage');
      toast({
        title: "⚠️ Configurações salvas temporariamente",
        description: "As configurações foram salvas localmente. Verifique a conexão com o banco de dados.",
        variant: "destructive"
      });
    }
  }, [formData, selectedRouter, toast, hasStoredPassword, actualPassword]);

  return {
    formData,
    selectedRouter,
    isTestingConnection,
    routerTypes,
    setSelectedRouter,
    handleInputChange,
    handleSwitchChange,
    handleTestConnection,
    handleSave
  };
};
