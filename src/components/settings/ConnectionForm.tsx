
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Wifi } from 'lucide-react';

interface ConnectionFormData {
  endpoint: string;
  port: string;
  user: string;
  password: string;
  useHttps: boolean;
}

interface ConnectionFormProps {
  formData: ConnectionFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchChange: (checked: boolean) => void;
  onTestConnection: () => void;
  onSave: () => void;
  isTestingConnection: boolean;
  selectedRouterName: string;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({
  formData,
  onInputChange,
  onSwitchChange,
  onTestConnection,
  onSave,
  isTestingConnection,
  selectedRouterName
}) => {
  return (
    <>
      {/* Configuration Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Conexão API do Roteador</h2>
        <p className="text-gray-400 mb-6">
          Configure os parâmetros de conexão para a API-REST do roteador {selectedRouterName}
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
            onChange={onInputChange}
            placeholder="192.168.1.1"
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
            onChange={onInputChange}
            placeholder="Para 80 ou 443 deixe em branco"
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
            onChange={onInputChange}
            placeholder="admin"
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
            onChange={onInputChange}
            placeholder="Digite sua senha"
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Switch
          id="https"
          checked={formData.useHttps}
          onCheckedChange={onSwitchChange}
        />
        <Label htmlFor="https" className="text-gray-300">
          Use HTTPS
        </Label>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button
          onClick={onTestConnection}
          disabled={isTestingConnection}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 shadow-md shadow-blue-500/15"
        >
          <Wifi className="w-4 h-4 mr-2" />
          {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
        </Button>
        
        <Button
          onClick={onSave}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 shadow-md shadow-green-500/15"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </>
  );
};

export default ConnectionForm;
