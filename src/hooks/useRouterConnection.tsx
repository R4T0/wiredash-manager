
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
  const { toast } = useToast();
  const { addLog } = useApiLogsContext();

  // Load saved data from API or localStorage fallback
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('Loading router configuration from API...');
        const response = await apiService.getRouterConfig();
        
        if (response.success && response.data) {
          const config = response.data;
          console.log('Router configuration loaded from API:', config);
          setFormData({
            endpoint: config.endpoint || '',
            port: config.port || '',
            user: config.user || '',
            password: config.password || '',
            useHttps: config.use_https || false
          });
          if (config.router_type) {
            setSelectedRouter(config.router_type);
          }
        }
      } catch (error) {
        console.error('Failed to load router config from API, trying localStorage:', error);
        // Fallback to localStorage
        try {
          const savedConfig = localStorage.getItem('routerConfig');
          if (savedConfig) {
            const config = JSON.parse(savedConfig);
            console.log('Loading saved router configuration from localStorage:', config);
            setFormData({
              endpoint: config.endpoint || '',
              port: config.port || '',
              user: config.user || '',
              password: config.password || '',
              useHttps: config.useHttps || false
            });
            if (config.routerType) {
              setSelectedRouter(config.routerType);
            }
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      }
    };

    loadConfig();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} to:`, value);
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
    if (!formData.endpoint || !formData.user || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o endereço, usuário e senha antes de testar a conexão.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    console.log(`Testing connection with ${selectedRouter} router via API service...`);

    const startTime = Date.now();
    
    const requestData = {
      routerType: selectedRouter,
      endpoint: formData.endpoint,
      port: formData.port,
      user: formData.user,
      password: formData.password,
      useHttps: formData.useHttps
    };

    try {
      console.log(`Making request to API service for ${selectedRouter}...`, requestData);
      
      // Use the API service for test connection
      const response = await fetch('http://localhost:5000/api/router/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(15000)
      });

      const duration = Date.now() - startTime;
      const responseData = await response.json();
      
      console.log('API service response:', responseData);

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
      
      console.error('API service request failed:', error);
      
      addLog({
        method: 'POST',
        url: '/api/router/test-connection',
        requestHeaders: { 'Content-Type': 'application/json' },
        error: errorMessage,
        duration
      });

      toast({
        title: "❌ Erro de conexão",
        description: `Não foi possível conectar ao serviço de API. Verifique se o backend está executando.`,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  }, [formData, selectedRouter, toast, addLog]);

  const handleSave = useCallback(async () => {
    const configToSave = {
      routerType: selectedRouter,
      endpoint: formData.endpoint,
      port: formData.port,
      user: formData.user,
      password: formData.password,
      useHttps: formData.useHttps
    };

    console.log('Saving router configuration:', configToSave);
    
    try {
      const response = await apiService.saveRouterConfig(configToSave);
      if (response.success) {
        console.log('Configuration saved successfully to API');
        toast({
          title: "✅ Configurações salvas",
          description: "As configurações foram salvas com sucesso no banco de dados!",
        });
      }
    } catch (error) {
      console.error('Failed to save to API, falling back to localStorage:', error);
      // Fallback to localStorage
      localStorage.setItem('routerConfig', JSON.stringify(configToSave));
      console.log('Configuration saved to localStorage as fallback');
      toast({
        title: "⚠️ Configurações salvas localmente",
        description: "As configurações foram salvas localmente (API indisponível).",
      });
    }
  }, [formData, selectedRouter, toast]);

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
