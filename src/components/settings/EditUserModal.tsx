
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  enabled: boolean;
  createdAt: string;
}

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    enabled: true
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: user.password,
        enabled: user.enabled
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.name || !formData.email || !formData.password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    updateUser(user.id, formData);
    onClose();
    alert('Usuário atualizado com sucesso!');
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Usuário</DialogTitle>
          <DialogDescription className="text-gray-400">
            Edite os dados do usuário abaixo
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Nome</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Digite o nome completo"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Digite uma senha segura"
              value={formData.password}
              onChange={handleInputChange}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
            <Label htmlFor="enabled" className="text-gray-300">
              Usuário ativo
            </Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md shadow-green-500/15"
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
