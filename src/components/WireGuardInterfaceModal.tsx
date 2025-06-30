
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface WireGuardInterfaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WireGuardInterfaceModal = ({ isOpen, onClose, onSuccess }: WireGuardInterfaceModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    listenPort: '51820',
    privateKey: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.privateKey) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e chave privada são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
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
      const proxyUrl = 'http://localhost:5000/api/router/proxy';
      
      const requestBody = {
        routerType: config.routerType || 'mikrotik',
        endpoint: config.endpoint,
        port: config.port,
        user: config.user,
        password: config.password,
        useHttps: config.useHttps,
        path: '/rest/interface/wireguard',
        method: 'PUT',
        body: {
          name: formData.name,
          'listen-port': parseInt(formData.listenPort),
          'private-key': formData.privateKey
        }
      };

      console.log('Creating WireGuard interface...', requestBody);

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000)
      });

      const responseData = await response.json();
      console.log('Create interface response:', responseData);

      if (responseData.success && (responseData.status === 200 || responseData.status === 201)) {
        toast({
          title: "Interface criada",
          description: `Interface ${formData.name} foi criada com sucesso.`,
        });
        setFormData({ name: '', listenPort: '51820', privateKey: '' });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Erro ao criar interface",
          description: responseData.error || "Falha ao criar a interface.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating interface:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao backend.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFormData({ name: '', listenPort: '51820', privateKey: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Criar Nova Interface</DialogTitle>
          <DialogDescription className="text-gray-400">
            Adicione uma nova interface WireGuard ao roteador.
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
              disabled={isCreating}
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
              disabled={isCreating}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="privateKey" className="text-right text-white">
              Chave Privada
            </Label>
            <Input
              id="privateKey"
              name="privateKey"
              value={formData.privateKey}
              onChange={handleInputChange}
              placeholder="Chave privada WireGuard"
              className="col-span-3 bg-gray-800 border-gray-700 text-white"
              disabled={isCreating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Interface'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WireGuardInterfaceModal;
