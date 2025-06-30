
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Edit, Trash2, UserX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import EditUserModal from './EditUserModal';

const UsersTab = () => {
  const { users, addUser, updateUser, deleteUser, isLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    enabled: true
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const success = await addUser(newUser);
    if (success) {
      setNewUser({ name: '', email: '', password: '', enabled: true });
      setIsDialogOpen(false);
      toast({
        title: "✅ Usuário criado",
        description: "Usuário cadastrado com sucesso!",
      });
    } else {
      toast({
        title: "❌ Erro ao criar usuário",
        description: "Verifique se o email já não está em uso.",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleToggleUser = async (userId: string, enabled: boolean) => {
    const success = await updateUser(userId, { enabled });
    if (success) {
      toast({
        title: `✅ Usuário ${enabled ? 'ativado' : 'desativado'}`,
        description: `O usuário foi ${enabled ? 'ativado' : 'desativado'} com sucesso!`,
      });
    } else {
      toast({
        title: "❌ Erro",
        description: "Não foi possível alterar o status do usuário.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      const success = await deleteUser(userId);
      if (success) {
        toast({
          title: "✅ Usuário removido",
          description: "Usuário excluído com sucesso!",
        });
      } else {
        toast({
          title: "❌ Erro ao remover usuário",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Carregando usuários...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Gerenciamento de Usuários</h2>
          <p className="text-gray-400">Gerencie os usuários do sistema</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md shadow-green-500/15">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Cadastrar Novo Usuário</DialogTitle>
              <DialogDescription className="text-gray-400">
                Preencha os dados do usuário abaixo
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
                  value={newUser.name}
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
                  value={newUser.email}
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
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={newUser.enabled}
                  onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, enabled: checked }))}
                />
                <Label htmlFor="enabled" className="text-gray-300">
                  Usuário ativo
                </Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md shadow-green-500/15"
                >
                  Cadastrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Usuários Cadastrados ({users.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Lista de todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  user.enabled 
                    ? 'bg-gray-700/30 border-gray-600' 
                    : 'bg-red-900/20 border-red-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-white">{user.name}</h3>
                    {!user.enabled && (
                      <UserX className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <p className="text-xs text-gray-500">Cadastrado em: {user.created_at}</p>
                  <p className={`text-xs ${user.enabled ? 'text-green-400' : 'text-red-400'}`}>
                    Status: {user.enabled ? 'Ativo' : 'Desativado'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={user.enabled}
                    onCheckedChange={(checked) => handleToggleUser(user.id, checked)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditUser(user)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteUser(user.id)}
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <EditUserModal
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
      />
    </div>
  );
};

export default UsersTab;
