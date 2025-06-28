import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Router, Shield, Network, Menu, X, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApiLogsContext } from '@/contexts/ApiLogsContext';

const MikrotikConnectionTab = () => {
  const [formData, setFormData] = useState({
    endpoint: '',
    port: '',
    user: '',
    password: '',
    useHttps: false
  });
  const [selectedRouter, setSelectedRouter] = useState('mikrotik');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();
  const { addLog } = useApiLogsContext();

  // Carregar dados salvos do localStorage quando o componente é montado
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

  const routerTypes = [
    {
      id: 'mikrotik',
      name: 'Mikrotik',
      icon: Router
    },
    {
      id: 'opnsense',
      name: 'OPNsense',
      icon: Shield
    },
    {
      id: 'pfsense',
      name: 'Pfsense',
      icon: Network
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} to:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    console.log('Updating HTTPS to:', checked);
    setFormData(prev => ({
      ...prev,
      useHttps: checked
    }));
  };

  const handleTestConnection = async () => {
    if (!formData.endpoint || !formData.user || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o endereço, usuário e senha antes de testar a conexão.",
        variant: "destructive"
      });
      return;
    }

    if (selectedRouter !== 'mikrotik') {
      toast({
        title: "Teste não disponível",
        description: "O teste de conexão está disponível apenas para roteadores Mikrotik.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    console.log('Testing connection to Mikrotik router...');

    const startTime = Date.now();
    const protocol = formData.useHttps ? 'https' : 'http';
    const port = formData.port ? `:${formData.port}` : '';
    const url = `${protocol}://${formData.endpoint}${port}/rest/system/resource`;
    
    // Criar credenciais Basic Auth
    const credentials = btoa(`${formData.user}:${formData.password}`);
    
    const requestHeaders = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };

    try {
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: requestHeaders,
        signal: AbortSignal.timeout(10000)
      });

      const duration = Date.now() - startTime;
      const responseText = await response.text();
      
      console.log('Response status:', response.status);

      // Registrar log da requisição
      addLog({
        method: 'GET',
        url,
        status: response.status,
        requestHeaders,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseBody: responseText,
        duration
      });

      if (response.status === 200) {
        toast({
          title: "✅ Conexão bem-sucedida!",
          description: "A conexão com o roteador Mikrotik foi estabelecida com sucesso.",
        });
      } else {
        toast({
          title: "❌ Falha na conexão",
          description: `Erro ${response.status}: Verifique as credenciais e configurações.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.error('Connection test failed:', error);
      
      // Registrar log do erro
      addLog({
        method: 'GET',
        url,
        requestHeaders,
        error: errorMessage,
        duration
      });

      toast({
        title: "❌ Erro de conexão",
        description: "Não foi possível conectar ao roteador. Verifique o endereço e configurações de rede.",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = () => {
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
  };

  return (
    <div className="p-6 space-y-6">
      {/* Router Type Selection */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
        {/* Mobile Menu Button */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full bg-gray-700/50 border-gray-600 text-gray-300"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
            Tipo de Roteador
          </Button>
        </div>

        {/* Desktop Menu or Mobile Expanded Menu */}
        <div className={`flex flex-wrap gap-2 ${isMobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
          {routerTypes.map(router => {
            const IconComponent = router.icon;
            return (
              <button
                key={router.id}
                onClick={() => {
                  setSelectedRouter(router.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
                  ${selectedRouter === router.id 
                    ? 'bg-gray-700/50 border-gray-500 text-white shadow-md shadow-gray-500/20' 
                    : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700/30 hover:border-gray-500 hover:text-gray-300 hover:shadow-sm hover:shadow-gray-500/10'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{router.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Conexão API do Roteador</h2>
        <p className="text-gray-400 mb-6">
          Configure os parâmetros de conexão para a API-REST do roteador {routerTypes.find(r => r.id === selectedRouter)?.name}
        </p>
      </div>

      {/* Connection Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="endpoint" className="text-gray-300">
            Endereço do Roteador
          </Label>
          <Input
            id="endpoint"
            name="endpoint"
            type="text"
            value={formData.endpoint}
            onChange={handleInputChange}
            placeholder="Ex: 192.168.1.1"
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="port" className="text-gray-300">
            Porta API
          </Label>
          <Input
            id="port"
            name="port"
            type="text"
            value={formData.port}
            onChange={handleInputChange}
            placeholder="Ex: 80"
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="user" className="text-gray-300">
            Usuário
          </Label>
          <Input
            id="user"
            name="user"
            type="text"
            value={formData.user}
            onChange={handleInputChange}
            placeholder="Ex: admin"
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Digite sua senha"
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Switch
          id="https"
          checked={formData.useHttps}
          onCheckedChange={handleSwitchChange}
        />
        <Label htmlFor="https" className="text-gray-300">
          Usar HTTPS para conexões API
        </Label>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button
          onClick={handleTestConnection}
          disabled={isTestingConnection}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 shadow-md shadow-blue-500/15"
        >
          <Wifi className="w-4 h-4 mr-2" />
          {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
        </Button>
        
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 shadow-md shadow-green-500/15"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default MikrotikConnectionTab;
