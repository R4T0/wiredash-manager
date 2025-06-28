
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

const WireGuardTab = () => {
  const [wireguardConfig, setWireguardConfig] = useState({
    endpointPadrao: '',
    portaPadrao: '',
    rangeIpsPermitidos: '',
    dnsCliente: ''
  });

  const handleWireguardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating WG ${name} to:`, value);
    setWireguardConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWireguardSave = () => {
    console.log('Saving WireGuard configuration:', wireguardConfig);
    
    try {
      localStorage.setItem('wireguardConfig', JSON.stringify(wireguardConfig));
      alert('Configurações WireGuard salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações WireGuard:', error);
      alert('Erro ao salvar configurações WireGuard!');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Configuração Padrão</h2>
        <p className="text-gray-400 mb-6">Configure os valores padrão para novos peers e interfaces</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="endpointPadrao" className="text-gray-300">
            Endpoint Padrão
          </Label>
          <Input
            id="endpointPadrao"
            name="endpointPadrao"
            type="text"
            placeholder="Ex: vpn.minhaempresa.com"
            value={wireguardConfig.endpointPadrao}
            onChange={handleWireguardChange}
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portaPadrao" className="text-gray-300">
            Porta Padrão
          </Label>
          <Input
            id="portaPadrao"
            name="portaPadrao"
            type="text"
            placeholder="Ex: 51820"
            value={wireguardConfig.portaPadrao}
            onChange={handleWireguardChange}
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="rangeIpsPermitidos" className="text-gray-300">
            Range de IPs Permitidos
          </Label>
          <Input
            id="rangeIpsPermitidos"
            name="rangeIpsPermitidos"
            type="text"
            placeholder="Ex: 10.0.0.0/24"
            value={wireguardConfig.rangeIpsPermitidos}
            onChange={handleWireguardChange}
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dnsCliente" className="text-gray-300">
            DNS do Cliente
          </Label>
          <Input
            id="dnsCliente"
            name="dnsCliente"
            type="text"
            placeholder="Ex: 1.1.1.1, 8.8.8.8"
            value={wireguardConfig.dnsCliente}
            onChange={handleWireguardChange}
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleWireguardSave}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 shadow-md shadow-green-500/15"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações Padrão
        </Button>
      </div>
    </div>
  );
};

export default WireGuardTab;
