
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const WireGuardTab = () => {
  const [wireguardConfig, setWireguardConfig] = useState({
    endpointPadrao: '',
    portaPadrao: '',
    rangeIpsPermitidos: '',
    dnsCliente: ''
  });
  const { toast } = useToast();

  // Load data from SQLite database via API
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('Loading WireGuard configuration from SQLite database...');
        const response = await apiService.getWireguardConfig();
        
        if (response.success && response.data) {
          const config = response.data;
          console.log('WireGuard configuration loaded from SQLite database');
          setWireguardConfig({
            endpointPadrao: config.endpoint_padrao || '',
            portaPadrao: config.porta_padrao || '',
            rangeIpsPermitidos: config.range_ips_permitidos || '',
            dnsCliente: config.dns_cliente || ''
          });
        } else {
          console.log('No WireGuard configuration found in SQLite database');
        }
      } catch (error) {
        console.error('Failed to load WireGuard config from SQLite database:', error);
        // Fallback temporário para localStorage apenas se API falhar completamente
        try {
          const savedConfig = localStorage.getItem('wireguardConfig');
          if (savedConfig) {
            const config = JSON.parse(savedConfig);
            console.log('Fallback: Loading WireGuard configuration from localStorage');
            setWireguardConfig({
              endpointPadrao: config.endpointPadrao || '',
              portaPadrao: config.portaPadrao || '',
              rangeIpsPermitidos: config.rangeIpsPermitidos || '',
              dnsCliente: config.dnsCliente || ''
            });
          }
        } catch (localError) {
          console.error('Error loading from localStorage fallback:', localError);
        }
      }
    };

    loadConfig();
  }, []);

  const handleWireguardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating WG ${name} to:`, value);
    setWireguardConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWireguardSave = async () => {
    console.log('Saving WireGuard configuration to SQLite database');
    
    try {
      const response = await apiService.saveWireguardConfig(wireguardConfig);
      if (response.success) {
        console.log('WireGuard configuration saved successfully to SQLite database');
        toast({
          title: "✅ Configurações salvas",
          description: "As configurações WireGuard foram salvas com sucesso no banco de dados SQLite!",
        });
      } else {
        throw new Error('Failed to save to SQLite database');
      }
    } catch (error) {
      console.error('Failed to save to SQLite database:', error);
      // Fallback temporário para localStorage apenas se API falhar
      localStorage.setItem('wireguardConfig', JSON.stringify(wireguardConfig));
      console.log('Fallback: WireGuard configuration saved to localStorage');
      toast({
        title: "⚠️ Configurações salvas temporariamente",
        description: "As configurações foram salvas localmente. Verifique a conexão com o banco de dados.",
        variant: "destructive"
      });
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
