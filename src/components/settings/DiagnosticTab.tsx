
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, RefreshCw, Download, Activity } from 'lucide-react';
import { useApiLogsContext } from '@/contexts/ApiLogsContext';
import { format } from 'date-fns';

const DiagnosticTab = () => {
  const { logs, clearLogs } = useApiLogsContext();
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const getStatusBadgeVariant = (status?: number) => {
    if (!status) return 'secondary';
    if (status >= 200 && status < 300) return 'default';
    if (status >= 400 && status < 500) return 'destructive';
    if (status >= 500) return 'destructive';
    return 'secondary';
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `api-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const selectedLogDetails = logs.find(log => log.id === selectedLog);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Diagnóstico - Logs da API</h2>
          </div>
          <p className="text-gray-400">
            Visualize e monitore todas as requisições da API para depuração
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={exportLogs}
            disabled={logs.length === 0}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            onClick={clearLogs}
            disabled={logs.length === 0}
            variant="outline"
            size="sm"
            className="border-red-600 text-red-400 hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Logs
          </Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <Alert className="bg-gray-800/50 border-gray-700">
          <Activity className="h-4 w-4" />
          <AlertDescription className="text-gray-300">
            Nenhum log de API registrado ainda. Os logs aparecerão aqui quando você fizer requisições para os roteadores.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Logs */}
          <Card className="bg-gray-800/50 border-gray-700">
            <div className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">
                Requisições ({logs.length})
              </h3>
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Horário</TableHead>
                      <TableHead className="text-gray-300">Método</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow 
                        key={log.id}
                        className="border-gray-700 hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => setSelectedLog(log.id)}
                      >
                        <TableCell className="text-gray-300 text-xs">
                          {format(log.timestamp, 'HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {log.method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.status ? (
                            <Badge variant={getStatusBadgeVariant(log.status)} className="text-xs">
                              {log.status}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              ERRO
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300 text-xs truncate max-w-48">
                          {log.url}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>

          {/* Detalhes do Log Selecionado */}
          <Card className="bg-gray-800/50 border-gray-700">
            <div className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">
                Detalhes da Requisição
              </h3>
              {selectedLogDetails ? (
                <div className="space-y-4 max-h-96 overflow-auto">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Informações Gerais</h4>
                    <div className="bg-gray-900/50 p-3 rounded text-xs">
                      <p className="text-gray-300"><span className="text-white">Horário:</span> {format(selectedLogDetails.timestamp, 'dd/MM/yyyy HH:mm:ss')}</p>
                      <p className="text-gray-300"><span className="text-white">Método:</span> {selectedLogDetails.method}</p>
                      <p className="text-gray-300"><span className="text-white">URL:</span> {selectedLogDetails.url}</p>
                      {selectedLogDetails.status && (
                        <p className="text-gray-300"><span className="text-white">Status:</span> {selectedLogDetails.status}</p>
                      )}
                      {selectedLogDetails.duration && (
                        <p className="text-gray-300"><span className="text-white">Duração:</span> {selectedLogDetails.duration}ms</p>
                      )}
                    </div>
                  </div>

                  {selectedLogDetails.requestHeaders && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Headers da Requisição</h4>
                      <div className="bg-gray-900/50 p-3 rounded text-xs">
                        <pre className="text-gray-300 whitespace-pre-wrap">
                          {JSON.stringify(selectedLogDetails.requestHeaders, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedLogDetails.requestBody && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Body da Requisição</h4>
                      <div className="bg-gray-900/50 p-3 rounded text-xs">
                        <pre className="text-gray-300 whitespace-pre-wrap">
                          {selectedLogDetails.requestBody}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedLogDetails.responseBody && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Resposta</h4>
                      <div className="bg-gray-900/50 p-3 rounded text-xs">
                        <pre className="text-gray-300 whitespace-pre-wrap">
                          {selectedLogDetails.responseBody}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedLogDetails.error && (
                    <div>
                      <h4 className="text-sm font-medium text-red-400 mb-2">Erro</h4>
                      <div className="bg-red-900/20 border border-red-800 p-3 rounded text-xs">
                        <pre className="text-red-300 whitespace-pre-wrap">
                          {selectedLogDetails.error}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma requisição na lista para ver os detalhes</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DiagnosticTab;
