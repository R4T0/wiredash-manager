
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Download, QrCode, Trash2, Activity, UserCheck, Clock } from 'lucide-react';
import StatsCard from '../components/StatsCard';

const Peers = () => {
  const peers = [
    { id: 1, name: 'client-001', interface: 'wg-main', ip: '10.0.0.10', status: 'online', lastSeen: '2 min ago' },
    { id: 2, name: 'client-002', interface: 'wg-main', ip: '10.0.0.11', status: 'online', lastSeen: '5 min ago' },
    { id: 3, name: 'mobile-user', interface: 'wg-mobile-clients', ip: '10.1.0.5', status: 'offline', lastSeen: '2 hours ago' },
    { id: 4, name: 'branch-office', interface: 'wg-branch-office', ip: '10.2.0.1', status: 'online', lastSeen: '1 min ago' },
  ];

  const totalPeers = peers.length;
  const onlinePeers = peers.filter(peer => peer.status === 'online').length;
  const recentPeers = peers.filter(peer => {
    // Simulate recent peers (last 24h)
    return ['2 min ago', '5 min ago', '1 min ago'].includes(peer.lastSeen);
  }).length;

  const stats = [
    {
      title: 'Total de Peers',
      value: totalPeers,
      subtitle: 'Peers registrados',
      icon: Users,
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Peers Online',
      value: onlinePeers,
      subtitle: 'Conectados agora',
      icon: UserCheck,
      trend: { value: 25, isPositive: true },
      gradient: 'from-green-600 to-green-700'
    },
    {
      title: 'Criados Recentemente',
      value: recentPeers,
      subtitle: 'Últimas 24h',
      icon: Clock,
      gradient: 'from-purple-600 to-purple-700'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Peers</h1>
            <p className="text-gray-400 text-lg">Visualize e gerencie todos os peers WireGuard</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Novo Peer
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
              <Users className="w-5 h-5 mr-2" />
              Lista de Peers
            </CardTitle>
            <CardDescription>Todos os peers configurados em suas interfaces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peers.map((peer) => (
                <div key={peer.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {peer.status === 'online' ? (
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
                          <h3 className="font-semibold text-white">{peer.name}</h3>
                          <p className="text-sm text-gray-400">{peer.interface} • {peer.ip}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Última atividade: {peer.lastSeen}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 h-8 w-8 p-0">
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-600/20 h-8 w-8 p-0">
                      <Download className="w-4 h-4" />
                    </Button>
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

export default Peers;
