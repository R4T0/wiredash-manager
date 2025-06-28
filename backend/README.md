
# Mikrotik API Proxy Backend

Backend Flask que atua como proxy para acessar a API REST dos roteadores Mikrotik, resolvendo problemas de CORS.

## Funcionalidades

- Proxy transparente para API REST do Mikrotik
- Suporte a HTTPS/HTTP
- Tratamento de erros robusto
- Logs detalhados
- Health check endpoint
- Suporte a Docker

## Endpoints

### Health Check
```
GET /health
```

### Proxy Genérico
```
POST /api/mikrotik/proxy
Content-Type: application/json

{
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
POST /api/mikrotik/test-connection
Content-Type: application/json

{
  "endpoint": "192.168.1.1",
  "port": "80", 
  "user": "admin",
  "password": "senha",
  "useHttps": false
}
```

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

## Logs

O backend registra todas as requisições e erros para facilitar o debug.
