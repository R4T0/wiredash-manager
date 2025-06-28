
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Save, Settings } from 'lucide-react';

const SettingsForm = () => {
  const [formData, setFormData] = useState({
    endpoint: '',
    port: '',
    user: '',
    password: '',
    ipRange: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving global configuration:', formData);
    // Here you would typically save to your backend/database
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações Globais</h1>
          <p className="text-gray-400">Configure os parâmetros padrão do sistema</p>
        </div>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="endpoint" className="text-gray-300">
                Endpoint
              </Label>
              <Input
                id="endpoint"
                name="endpoint"
                type="text"
                placeholder="vpn.company.com"
                value={formData.endpoint}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port" className="text-gray-300">
                Port
              </Label>
              <Input
                id="port"
                name="port"
                type="number"
                placeholder="51820"
                value={formData.port}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="user" className="text-gray-300">
                User
              </Label>
              <Input
                id="user"
                name="user"
                type="text"
                placeholder="admin"
                value={formData.user}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipRange" className="text-gray-300">
              IP Range
            </Label>
            <Input
              id="ipRange"
              name="ipRange"
              type="text"
              placeholder="10.0.0.0/24"
              value={formData.ipRange}
              onChange={handleInputChange}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500">
              Intervalo de IPs privados para uso automático
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsForm;
