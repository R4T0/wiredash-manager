import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Router, Shield, Network } from 'lucide-react';
const MikrotikConnectionTab = () => {
  const [formData, setFormData] = useState({
    endpoint: '189.17.83.228',
    port: '80',
    user: 'admin',
    password: '',
    useHttps: false
  });
  const [selectedRouter, setSelectedRouter] = useState('mikrotik');
  const routerTypes = [{
    id: 'mikrotik',
    name: 'Mikrotik',
    icon: Router
  }, {
    id: 'opnsense',
    name: 'OPNsense',
    icon: Shield
  }, {
    id: 'pfsense',
    name: 'Pfsense',
    icon: Network
  }];
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      useHttps: checked
    }));
  };
  const handleSave = () => {
    console.log('Saving global configuration:', formData);
    alert('Configurações salvas com sucesso!');
  };
  return <div className="p-6 space-y-6">
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
        
        <div className="flex flex-wrap gap-2">
          {routerTypes.map(router => {
          const IconComponent = router.icon;
          return <button key={router.id} onClick={() => setSelectedRouter(router.id)} className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
                  ${selectedRouter === router.id ? 'bg-gray-700/50 border-gray-500 text-white shadow-md shadow-gray-500/20' : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700/30 hover:border-gray-500 hover:text-gray-300 hover:shadow-sm hover:shadow-gray-500/10'}
                `}>
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{router.name}</span>
              </button>;
        })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Conexão API do Roteador</h2>
        <p className="text-gray-400 mb-6">Configure os parâmetros de conexão para a API-REST do roteador {routerTypes.find(r => r.id === selectedRouter)?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="endpoint" className="text-gray-300">
            Endereço do Roteador
          </Label>
          <Input id="endpoint" name="endpoint" type="text" value={formData.endpoint} onChange={handleInputChange} className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="port" className="text-gray-300">
            Porta API
          </Label>
          <Input id="port" name="port" type="text" value={formData.port} onChange={handleInputChange} className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="user" className="text-gray-300">
            Usuário
          </Label>
          <Input id="user" name="user" type="text" value={formData.user} onChange={handleInputChange} className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300">
            Senha
          </Label>
          <Input id="password" name="password" type="password" placeholder="••••••••••••" value={formData.password} onChange={handleInputChange} className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Switch id="https" checked={formData.useHttps} onCheckedChange={handleSwitchChange} />
        <Label htmlFor="https" className="text-gray-300">
          Usar HTTPS para conexões API
        </Label>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 shadow-md shadow-green-500/15">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>;
};
export default MikrotikConnectionTab;