
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, Plus, Edit, Trash2, Power, PowerOff, Activity, Clock, CheckCircle } from 'lucide-react';
import StatsCard from '../components/StatsCard';

const Interfaces = () => {
  const interfaces = [
    { id: 1, name: 'wg-main', port: 51820, peers: 8, status: 'active', created: '2 days ago' },
    { id: 2, name: 'wg-mobile-clients', port: 51821, peers: 12, status: 'active', created: '1 week ago' },
    { id: 3, name: 'wg-branch-office', port: 51822, peers: 3, status: 'inactive', created: '3 days ago' },
    { id: 4, name: 'wg-backup', port: 51823, peers: 0, status: 'active', created: '1 day ago' },
  ];

  const totalInterfaces = interfaces.length;
  const activeInterfaces = interfaces.filter(iface => iface.status === 'active').length;
  const recentInterfaces = interfaces.filter(iface => {
    return ['2 days ago', '1 day ago', '3 days ago'].includes(iface.created);
  }).length;

  const stats = [
    {
      title: 'Total de Interfaces',
      value: totalInterfaces,
      subtitle: 'Interfaces configuradas',
      icon: Network,
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Interfaces Ativas',
      value: activeInterfaces,
      subtitle: 'Em funcionamento',
      icon: CheckCircle,
      trend: { value: 15, isPositive: true },
      gradient: 'from-green-600 to-green-700'
    },
    {
      title: 'Criadas Recentemente',
      value: recentInterfaces,
      subtitle: 'Últimos 7 dias',
      icon: Clock,
      gradient: 'from-purple-600 to-purple-700'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Interfaces</h1>
            <p className="text-gray-400 text-lg">Visualize e gerencie todas as interfaces WireGuard</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Interface
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              trend={stat.trend}
              gradient={stat.gradient}
            />
          ))}
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Network className="w-5 h-5 mr-2" />
              Lista de Interfaces
            </CardTitle>
            <CardDescription>Todas as interfaces WireGuard configuradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interfaces.map((iface) => (
                <div key={iface.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {iface.status === 'active' ? (
                        <div className="flex items-center text-green-400">
                          <Activity className="w-4 h-4" />
                          <span className="text-xs ml-1 font-medium">Ativo</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-400">
                          <Activity className="w-4 h-4" />
                          <span className="text-xs ml-1 font-medium">Inativo</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-white">{iface.name}</h3>
                          <p className="text-sm text-gray-400">Porta: {iface.port} • {iface.peers} peers conectados</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Criada: {iface.created}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    {iface.status === 'active' ? (
                      <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 hover:bg-orange-600/20 h-8 w-8 p-0">
                        <PowerOff className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-600/20 h-8 w-8 p-0">
                        <Power className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-600/20 h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Interfaces;
