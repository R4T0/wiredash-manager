
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface CreatePeerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { interface: string; 'endpoint-address': string }) => Promise<boolean>;
  isCreating: boolean;
}

const CreatePeerModal: React.FC<CreatePeerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isCreating
}) => {
  const [formData, setFormData] = useState({
    interface: '',
    'endpoint-address': 'vpn.stacasa.local'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.interface || !formData['endpoint-address']) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        interface: '',
        'endpoint-address': 'vpn.stacasa.local'
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
            <Label htmlFor="interface" className="text-gray-300">
              Interface *
            </Label>
            <Input
              id="interface"
              name="interface"
              value={formData.interface}
              onChange={handleInputChange}
              placeholder="Ex: wg-main"
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
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
              placeholder="vpn.stacasa.local"
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">
              <strong>Nota:</strong> A chave pública e o endereço permitido serão gerados automaticamente.
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
              disabled={isCreating || !formData.interface || !formData['endpoint-address']}
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
