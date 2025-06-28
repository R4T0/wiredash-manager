
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const UsersTab = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      createdAt: '2024-01-15'
    }
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', email: '', password: '' });
    setIsDialogOpen(false);
    alert('Usuário cadastrado com sucesso!');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

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
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600"
              >
                <div className="space-y-1">
                  <h3 className="font-medium text-white">{user.name}</h3>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <p className="text-xs text-gray-500">Cadastrado em: {user.createdAt}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
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
    </div>
  );
};

export default UsersTab;
