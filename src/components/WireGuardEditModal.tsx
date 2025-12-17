
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';

interface WireGuardInterface {
  '.id': string;
  'disabled': string;
  'listen-port': string;
  'mtu': string;
  'name': string;
  'private-key': string;
  'public-key': string;
  'running': string;
}

interface WireGuardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  interface: WireGuardInterface | null;
}

const WireGuardEditModal = ({ isOpen, onClose, onSuccess, interface: iface }: WireGuardEditModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    listenPort: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (iface) {
      setFormData({
        name: iface.name,
        listenPort: iface['listen-port']
      });
    }
  }, [iface]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.listenPort) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e porta são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!iface) {
      toast({
        title: "Erro",
        description: "Interface não encontrada.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Load router configuration from API instead of localStorage
      const configResponse = await apiService.getRouterConfig();
      if (!configResponse.success || !configResponse.data) {
        toast({
          title: "Configuração não encontrada",
          description: "Configure a conexão com o roteador primeiro.",
          variant: "destructive"
        });
        setIsUpdating(false);
        return;
      }

      const config = configResponse.data;
      
      // Helper function to get the correct backend URL
      const getBackendUrl = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:5000';
        }
        // In Docker/production, use same-origin /api (nginx proxy)
        return '';
      };

      const backendUrl = getBackendUrl();
      
      const requestBody = {
        routerType: config.router_type || 'mikrotik',
        endpoint: config.endpoint,
        port: config.port,
        user: config.user,
        password: config.password,
        useHttps: config.use_https,
        path: `/rest/interface/wireguard/${iface['.id']}`,
        method: 'PATCH',
        body: {
          name: formData.name,
          'listen-port': parseInt(formData.listenPort)
        }
      };

      console.log('Updating WireGuard interface via backend proxy...');

      const response = await fetch(`${backendUrl}/api/router/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000)
      });

      const responseData = await response.json();
      console.log('Update interface response:', responseData);

      if (responseData.success) {
        toast({
          title: "Interface atualizada",
          description: `Interface ${formData.name} foi atualizada com sucesso.`,
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Erro ao atualizar interface",
          description: responseData.error || "Falha ao atualizar a interface.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating interface:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao backend.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Interface</DialogTitle>
          <DialogDescription className="text-gray-400">
            Edite as configurações da interface WireGuard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-white">
              Nome
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="wg1"
              className="col-span-3 bg-gray-800 border-gray-700 text-white"
              disabled={isUpdating}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="listenPort" className="text-right text-white">
              Porta
            </Label>
            <Input
              id="listenPort"
              name="listenPort"
              type="number"
              value={formData.listenPort}
              onChange={handleInputChange}
              placeholder="51820"
              className="col-span-3 bg-gray-800 border-gray-700 text-white"
              disabled={isUpdating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUpdating}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              'Atualizar Interface'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WireGuardEditModal;
