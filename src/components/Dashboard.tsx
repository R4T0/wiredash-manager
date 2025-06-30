
import React from 'react';
import { Users, Network, Activity, Plus, Download, QrCode } from 'lucide-react';
import StatsCard from './StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total de Peers',
      value: 24,
      subtitle: 'Peers ativos',
      icon: Users,
      trend: { value: 12, isPositive: true },
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Interfaces WG',
      value: 3,
      subtitle: 'Interfaces ativas',
      icon: Network,
      gradient: 'from-green-600 to-green-700'
    },
    {
      title: 'Última Atividade',
      value: '2min',
      subtitle: 'Peer conectado',
      icon: Activity,
      gradient: 'from-purple-600 to-purple-700'
    }
  ];

  const recentPeers = [
    { name: 'client-001', interface: 'wg-main', ip: '10.0.0.10', status: 'online' },
    { name: 'client-002', interface: 'wg-main', ip: '10.0.0.11', status: 'online' },
    { name: 'client-003', interface: 'wg-branch', ip: '10.1.0.5', status: 'offline' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Manager</h1>
          <p className="text-gray-400 text-lg">Gerencie Interfaces e peers do seu Wireguard</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Novo Peer
        </Button>
      </div>

      {/* Stats Grid */}
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

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Peers */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Peers Recentes</CardTitle>
              <CardDescription>Últimos peers criados e seu status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPeers.map((peer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`status-indicator ${peer.status === 'online' ? 'status-online' : 'status-offline'}`}></div>
                      <div>
                        <p className="font-medium text-white">{peer.name}</p>
                        <p className="text-sm text-gray-400">{peer.interface} • {peer.ip}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
              <CardDescription>Ferramentas mais utilizadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-600/30">
                <Plus className="w-4 h-4 mr-2" />
                Criar Peer
              </Button>
              <Button className="w-full justify-start bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-600/30">
                <QrCode className="w-4 h-4 mr-2" />
                Gerar QR Code
              </Button>
              <Button className="w-full justify-start bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border-purple-600/30">
                <Network className="w-4 h-4 mr-2" />
                Ver Interfaces
              </Button>
              <Button className="w-full justify-start bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border-orange-600/30">
                <Download className="w-4 h-4 mr-2" />
                Backup Config
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
