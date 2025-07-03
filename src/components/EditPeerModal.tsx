
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Edit, Loader2 } from 'lucide-react';

interface EditPeerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  peer: any;
  isUpdating: boolean;
}

interface WireguardInterface {
  id: string;
  name: string;
  'listen-port'?: number;
}

const EditPeerModal: React.FC<EditPeerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  peer,
  isUpdating
}) => {
  const [formData, setFormData] = useState({
    name: '',
    interface: '',
    'endpoint-address': '',
    'allowed-address': '',
    disabled: false
  });
  const [interfaces, setInterfaces] = useState<WireguardInterface[]>([]);
  const [isLoadingInterfaces, setIsLoadingInterfaces] = useState(false);
  const { toast } = useToast();

  // Initialize form data when peer changes
  useEffect(() => {
    if (peer) {
      setFormData({
        name: peer.name || '',
        interface: peer.interface || '',
        'endpoint-address': peer['endpoint-address'] || '',
        'allowed-address': peer['allowed-address'] || '',
        disabled: peer.disabled === 'true' || peer.disabled === true
      });
    }
  }, [peer]);

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
    const proxyUrl = `${window.location.protocol}//${window.location.hostname}:5000/api/router/proxy`;

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
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!peer?.id && !peer?.['.id']) {
      toast({
        title: "Erro",
        description: "ID do peer não encontrado.",
        variant: "destructive"
      });
      return;
    }

    const savedConfig = localStorage.getItem('routerConfig');
    if (!savedConfig) {
      toast({
        title: "Configuração não encontrada",
        description: "Configure a conexão com o roteador primeiro.",
        variant: "destructive"
      });
      return;
    }

    const config = JSON.parse(savedConfig);
    const proxyUrl = `${window.location.protocol}//${window.location.hostname}:5000/api/router/proxy`;
    const peerId = peer.id || peer['.id'];

    const requestBody = {
      routerType: config.routerType,
      endpoint: config.endpoint,
      port: config.port,
      user: config.user,
      password: config.password,
      useHttps: config.useHttps,
      path: `/rest/interface/wireguard/peers/${peerId}`,
      method: 'PATCH',
      body: {
        name: formData.name,
        interface: formData.interface,
        'endpoint-address': formData['endpoint-address'],
        'allowed-address': formData['allowed-address'],
        disabled: formData.disabled ? 'true' : 'false'
      }
    };

    try {
      console.log('Updating peer...', requestBody);

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000)
      });

      const responseData = await response.json();
      console.log('Update peer response:', responseData);

      if (responseData.success) {
        toast({
          title: "✅ Peer atualizado",
          description: `O peer ${formData.name} foi atualizado com sucesso.`,
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Erro ao atualizar peer",
          description: responseData.data?.detail || responseData.error || "Falha ao atualizar o peer.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating peer:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao backend.",
        variant: "destructive"
      });
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

  const handleDisabledChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      disabled: checked
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit className="w-5 h-5 mr-2" />
            Editar Peer WireGuard
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
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="disabled"
              checked={formData.disabled}
              onCheckedChange={handleDisabledChange}
            />
            <Label htmlFor="disabled" className="text-gray-300">
              Peer Desabilitado
            </Label>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !formData.name || !formData.interface || !formData['allowed-address'] || !formData['endpoint-address']}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Peer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPeerModal;
