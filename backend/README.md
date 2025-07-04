
# Multi-Router API Proxy Backend

Backend Flask que atua como proxy para acessar a API REST de diferentes tipos de roteadores (Mikrotik, OPNsense, Unifi), resolvendo problemas de CORS.

## Funcionalidades

- Suporte a múltiplos tipos de roteadores:
  - **Mikrotik**: RouterOS REST API
  - **OPNsense**: API REST nativa
  - **Unifi**: Controller API
- Proxy transparente para APIs REST
- Suporte a HTTPS/HTTP
- Tratamento de erros robusto
- Logs detalhados
- Health check endpoint
- Suporte a Docker
- Arquitetura modular e extensível
- **Banco de dados SQLite integrado** para persistência de configurações

## Banco de Dados

O sistema utiliza **SQLite** como banco de dados padrão:

- **Arquivo**: `wireguard_manager.db` (criado automaticamente)
- **Localização**: Diretório raiz da aplicação backend
- **Tabelas**:
  - `usuarios`: Gerenciamento de usuários do sistema
  - `configuracoes_roteador`: Configurações de conexão dos roteadores
  - `configuracoes_wireguard`: Configurações padrão do WireGuard

### Persistência em Docker

Para produção, configure um volume Docker para persistir o banco:

```yaml
services:
  backend:
    volumes:
      - ./data:/app/data
    environment:
      - DB_PATH=/app/data/wireguard_manager.db
```

## Estrutura do Projeto

```
backend/
├── app.py              # Aplicação principal Flask
├── config.py           # Configurações
├── requirements.txt    # Dependências Python
├── routers/           # Módulos específicos por roteador
│   ├── base.py        # Classe base para roteadores
│   ├── mikrotik.py    # Implementação Mikrotik
│   ├── opnsense.py    # Implementação OPNsense
│   └── unifi.py       # Implementação Unifi
├── Dockerfile         # Container Docker
├── docker-compose.yml # Orquestração Docker
└── README.md          # Este arquivo
```

## Endpoints

### Health Check
```
GET /health
```

### Proxy Genérico
```
POST /api/router/proxy
Content-Type: application/json

{
  "routerType": "mikrotik",  // mikrotik, opnsense, unifi
  "endpoint": "192.168.1.1",
  "port": "80",
  "user": "admin", 
  "password": "senha",
  "useHttps": false,
  "path": "/rest/system/resource",
  "method": "GET",
  "body": {} // opcional para POST/PUT
}
```

### Teste de Conexão
```
POST /api/router/test-connection
Content-Type: application/json

{
  "routerType": "mikrotik",
  "endpoint": "192.168.1.1",
  "port": "80", 
  "user": "admin",
  "password": "senha",
  "useHttps": false
}
```

## Tipos de Roteadores Suportados

### Mikrotik (RouterOS)
- **API**: RouterOS REST API
- **Porta padrão**: 80 (HTTP) / 443 (HTTPS)
- **Autenticação**: Basic Auth
- **Teste de conexão**: `/rest/system/resource`

### OPNsense
- **API**: OPNsense REST API
- **Porta padrão**: 80 (HTTP) / 443 (HTTPS)
- **Autenticação**: Basic Auth
- **Teste de conexão**: `/api/core/system/status`

### Unifi
- **API**: Unifi Controller API
- **Porta padrão**: 8443 (HTTPS)
- **Autenticação**: Session-based (login + cookies)
- **Teste de conexão**: `/api/self`

## Como usar

### Com Docker (Recomendado)

1. Construir e executar:
```bash
docker-compose up --build
```

### Desenvolvimento Local

1. Instalar dependências:
```bash
pip install -r requirements.txt
```

2. Executar:
```bash
python app.py
```

## Configuração no Frontend

Atualize o frontend para usar `http://localhost:5000` como base URL para as requisições da API.

Exemplo de requisição do frontend:
```javascript
const response = await fetch('http://localhost:5000/api/router/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    routerType: 'mikrotik',
    endpoint: '192.168.1.1',
    port: '80',
    user: 'admin',
    password: 'senha',
    useHttps: false,
    path: '/rest/system/resource',
    method: 'GET'
  })
});
```

## Logs

O backend registra todas as requisições e erros para facilitar o debug. Cada requisição inclui:
- Tipo de roteador utilizado
- URL de destino
- Método HTTP
- Tempo de resposta
- Status da resposta

## Extensibilidade

Para adicionar suporte a novos tipos de roteadores:

1. Crie um novo arquivo em `routers/novo_roteador.py`
2. Herde da classe `BaseRouter`
3. Implemente os métodos abstratos
4. Adicione o novo roteador ao mapeamento em `app.py`

Exemplo:
```python
from .base import BaseRouter

class NovoRoteador(BaseRouter):
    def get_router_type(self):
        return 'novo_roteador'
    
    def get_default_test_path(self):
        return '/api/status'
    
    def test_connection(self):
        return self.make_request(self.get_default_test_path(), 'GET')
```
