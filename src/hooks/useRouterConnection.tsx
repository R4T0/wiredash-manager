
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useApiLogsContext } from '@/contexts/ApiLogsContext';

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

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('routerConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        console.log('Loading saved router configuration:', config);
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
    } catch (error) {
      console.error('Erro ao carregar configurações salvas:', error);
    }
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
    console.log(`Testing connection with ${selectedRouter} router via backend proxy...`);

    const startTime = Date.now();
    const proxyUrl = 'http://localhost:5000/api/router/test-connection';
    
    const requestBody = {
      routerType: selectedRouter,
      endpoint: formData.endpoint,
      port: formData.port,
      user: formData.user,
      password: formData.password,
      useHttps: formData.useHttps
    };

    try {
      console.log(`Making request to backend proxy for ${selectedRouter}...`, requestBody);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000)
      });

      const duration = Date.now() - startTime;
      const responseData = await response.json();
      
      console.log('Backend proxy response:', responseData);

      addLog({
        method: 'POST',
        url: proxyUrl,
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
          description: `A conexão ${formData.useHttps ? 'HTTPS' : 'HTTP'} com o roteador ${routerName} foi estabelecida com sucesso via proxy.`,
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
      
      console.error('Backend proxy request failed:', error);
      
      addLog({
        method: 'POST',
        url: proxyUrl,
        requestHeaders: { 'Content-Type': 'application/json' },
        error: errorMessage,
        duration
      });

      toast({
        title: "❌ Erro de conexão",
        description: `Não foi possível conectar ao backend proxy. Verifique se o serviço está executando em localhost:5000.`,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  }, [formData, selectedRouter, toast, addLog]);

  const handleSave = useCallback(() => {
    console.log('Saving router configuration:', {
      routerType: selectedRouter,
      ...formData
    });
    
    try {
      const configToSave = {
        routerType: selectedRouter,
        ...formData
      };
      localStorage.setItem('routerConfig', JSON.stringify(configToSave));
      console.log('Configuration saved successfully to localStorage');
      toast({
        title: "✅ Configurações salvas",
        description: "As configurações foram salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
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
