
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Router, Shield, Network, Menu, X } from 'lucide-react';

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

  const handleSave = () => {
    console.log('Saving router configuration:', {
      routerType: selectedRouter,
      ...formData
    });
    
    try {
      localStorage.setItem('routerConfig', JSON.stringify({
        routerType: selectedRouter,
        ...formData
      }));
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações!');
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

      <div className="flex justify-end pt-4">
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
