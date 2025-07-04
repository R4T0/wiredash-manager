import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

const SecurityWarning = () => {
  const isHttps = window.location.protocol === 'https:';

  if (isHttps) {
    return (
      <Alert className="border-green-500/20 bg-green-500/10">
        <Shield className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          Conexão segura (HTTPS) detectada. Suas credenciais estão protegidas.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-500/20 bg-amber-500/10">
      <AlertTriangle className="h-4 w-4 text-amber-400" />
      <AlertDescription className="text-amber-300">
        <strong>Aviso de Segurança:</strong> Você está usando HTTP. Para maior segurança das credenciais do roteador, recomendamos o uso de HTTPS.
      </AlertDescription>
    </Alert>
  );
};

export default SecurityWarning;