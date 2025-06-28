
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
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações Globais</h1>
          <p className="text-gray-400 text-lg">Configure os parâmetros padrão do sistema</p>
        </div>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 p-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Label htmlFor="endpoint" className="text-gray-300 text-base font-medium">
                Endpoint
              </Label>
              <Input
                id="endpoint"
                name="endpoint"
                type="text"
                placeholder="vpn.company.com"
                value={formData.endpoint}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="port" className="text-gray-300 text-base font-medium">
                Port
              </Label>
              <Input
                id="port"
                name="port"
                type="number"
                placeholder="51820"
                value={formData.port}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="user" className="text-gray-300 text-base font-medium">
                User
              </Label>
              <Input
                id="user"
                name="user"
                type="text"
                placeholder="admin"
                value={formData.user}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-300 text-base font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="ipRange" className="text-gray-300 text-base font-medium">
                IP Range
              </Label>
              <Input
                id="ipRange"
                name="ipRange"
                type="text"
                placeholder="10.0.0.0/24"
                value={formData.ipRange}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12 text-base"
              />
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-6">
              Intervalo de IPs privados para uso automático
            </p>
          </div>

          <div className="flex justify-center pt-6">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="w-5 h-5 mr-3" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsForm;
