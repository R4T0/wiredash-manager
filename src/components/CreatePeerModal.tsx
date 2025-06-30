
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface CreatePeerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    name: string;
    interface: string; 
    'allowed-address': string;
    'endpoint-address': string;
  }) => Promise<boolean>;
  isCreating: boolean;
}

interface WireguardInterface {
  id: string;
  name: string;
  'listen-port'?: number;
}

interface WireguardConfig {
  endpointPadrao: string;
  portaPadrao: string;
  rangeIpsPermitidos: string;
  dnsCliente: string;
}

const CreatePeerModal: React.FC<CreatePeerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isCreating
}) => {
  const [formData, setFormData] = useState({
    name: '',
    interface: '',
    'allowed-address': '',
    'endpoint-address': ''
  });
  const [interfaces, setInterfaces] = useState<WireguardInterface[]>([]);
  const [isLoadingInterfaces, setIsLoadingInterfaces] = useState(false);
  const [wireguardConfig, setWireguardConfig] = useState<WireguardConfig>({
    endpointPadrao: '',
    portaPadrao: '',
    rangeIpsPermitidos: '',
    dnsCliente: ''
  });
  const [existingPeers, setExistingPeers] = useState<any[]>([]);

  // Load WireGuard default configuration
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('wireguardConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setWireguardConfig(config);
        
        // Set endpoint address from default config
        if (config.endpointPadrao) {
          setFormData(prev => ({
            ...prev,
            'endpoint-address': config.endpointPadrao
          }));
        }
      }
    } catch (error) {
      console.error('Error loading WireGuard config:', error);
    }
  }, []);

  // Fetch existing peers to calculate next available IP
  useEffect(() => {
    if (isOpen) {
      fetchExistingPeers();
    }
  }, [isOpen]);

  const fetchExistingPeers = async () => {
    const savedConfig = localStorage.getItem('routerConfig');
    if (!savedConfig) return;

    const config = JSON.parse(savedConfig);
    if (config.routerType !== 'mikrotik') return;

    const proxyUrl = 'http://localhost:5000/api/router/proxy';

    const requestBody = {
      routerType: config.routerType,
      endpoint: config.endpoint,
      port: config.port,
      user: config.user,
      password: config.password,
      useHttps: config.useHttps,
      path: '/rest/interface/wireguard/peers',
      method: 'GET'
    };

    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000)
      });

      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        const peersData = Array.isArray(responseData.data) ? responseData.data : [];
        setExistingPeers(peersData);
      }
    } catch (error) {
      console.error('Failed to fetch existing peers:', error);
    }
  };

  // Calculate next available IP in the range
  const getNextAvailableIP = (range: string): string => {
    if (!range) return '';

    try {
      // Parse CIDR notation (e.g., "10.0.0.0/24")
      const [baseIP, subnet] = range.split('/');
      const ipParts = baseIP.split('.').map(Number);
      
      // Get all used IPs from existing peers
      const usedIPs = new Set<string>();
      existingPeers.forEach(peer => {
        if (peer['allowed-address']) {
          const allowedIP = peer['allowed-address'].split('/')[0];
          usedIPs.add(allowedIP);
        }
      });

      // Find next available IP (starting from x.x.x.10 to avoid common network addresses)
      for (let i = 10; i < 254; i++) {
        const testIP = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${i}`;
        if (!usedIPs.has(testIP)) {
          return `${testIP}/32`;
        }
      }

      return `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.10/32`; // fallback
    } catch (error) {
      console.error('Error calculating next IP:', error);
      return '';
    }
  };

  // Update allowed address when range changes or peers are loaded
  useEffect(() => {
    if (wireguardConfig.rangeIpsPermitidos && existingPeers.length >= 0) {
      const nextIP = getNextAvailableIP(wireguardConfig.rangeIpsPermitidos);
      setFormData(prev => ({
        ...prev,
        'allowed-address': nextIP
      }));
    }
  }, [wireguardConfig.rangeIpsPermitidos, existingPeers]);

  // Fetch WireGuard interfaces when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchWireguardInterfaces();
    }
  }, [isOpen]);

  const fetchWireguardInterfaces = async () => {
    const savedConfig = localStorage.getItem('routerConfig');
    if (!savedConfig) return;

    const config = JSON.parse(savedConfig);
    if (config.routerType !== 'mikrotik') return;

    setIsLoadingInterfaces(true);
    const proxyUrl = 'http://localhost:5000/api/router/proxy';

    const requestBody = {
      routerType: config.routerType,
      endpoint: config.endpoint,
      port: config.port,
      user: config.user,
      password: config.password,
      useHttps: config.useHttps,
      path: '/rest/interface/wireguard',
      method: 'GET'
    };

    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000)
      });

      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        const interfacesData = Array.isArray(responseData.data) ? responseData.data : [];
        setInterfaces(interfacesData);
      }
    } catch (error) {
      console.error('Failed to fetch WireGuard interfaces:', error);
    } finally {
      setIsLoadingInterfaces(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.interface || !formData['allowed-address'] || !formData['endpoint-address']) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        name: '',
        interface: '',
        'allowed-address': '',
        'endpoint-address': ''
      });
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterfaceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      interface: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Plus className="w-5 h-5 mr-2" />
            Criar Novo Peer WireGuard
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Nome do Usuário *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: João Silva"
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interface" className="text-gray-300">
              Interface WireGuard *
            </Label>
            <Select 
              value={formData.interface} 
              onValueChange={handleInterfaceChange}
              disabled={isLoadingInterfaces}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder={isLoadingInterfaces ? "Carregando..." : "Selecione uma interface"} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {interfaces.map((iface) => (
                  <SelectItem key={iface.id} value={iface.name} className="text-white hover:bg-gray-700">
                    {iface.name}
                    {iface['listen-port'] && ` (Porta: ${iface['listen-port']})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowed-address" className="text-gray-300">
              Allowed Address *
            </Label>
            <Input
              id="allowed-address"
              name="allowed-address"
              value={formData['allowed-address']}
              onChange={handleInputChange}
              placeholder="Ex: 10.0.0.10/32"
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
            {wireguardConfig.rangeIpsPermitidos && (
              <p className="text-xs text-gray-500">
                Próximo IP disponível no range: {wireguardConfig.rangeIpsPermitidos}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint-address" className="text-gray-300">
              Endpoint Address *
            </Label>
            <Input
              id="endpoint-address"
              name="endpoint-address"
              value={formData['endpoint-address']}
              onChange={handleInputChange}
              placeholder="Ex: vpn.stacasa.local"
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
            {wireguardConfig.endpointPadrao && (
              <p className="text-xs text-gray-500">
                Configuração padrão: {wireguardConfig.endpointPadrao}
              </p>
            )}
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">
              <strong>Nota:</strong> Os campos são preenchidos automaticamente com base nas configurações padrão do WireGuard. A chave pública e porta do endpoint serão gerados automaticamente.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.name || !formData.interface || !formData['allowed-address'] || !formData['endpoint-address']}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isCreating ? 'Criando...' : 'Criar Peer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePeerModal;
