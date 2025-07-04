import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Sparkles } from 'lucide-react';

const Automacao = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Wrench className="w-16 h-16 text-primary" />
                <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Em Construção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-lg">
              Algo incrível está sendo construído aqui!
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Em breve você terá acesso a funcionalidades de automação avançadas para o WireDash.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Automacao;