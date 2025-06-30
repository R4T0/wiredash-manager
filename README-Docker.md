
# WireGuard Mikrotik Manager - Docker Setup

## Pré-requisitos

- Docker
- Docker Compose

## Como executar

### 1. Clonar o repositório
```bash
git clone <seu-repositorio>
cd wireguard-mikrotik-manager
```

### 2. Executar com Docker Compose
```bash
# Construir e executar todos os serviços
docker-compose up --build

# Executar em background
docker-compose up -d --build
```

### 3. Acessar a aplicação
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Comandos úteis

### Parar os serviços
```bash
docker-compose down
```

### Ver logs
```bash
# Logs de todos os serviços
docker-compose logs

# Logs do frontend
docker-compose logs frontend

# Logs do backend
docker-compose logs backend
```

### Reconstruir apenas um serviço
```bash
# Reconstruir frontend
docker-compose build frontend

# Reconstruir backend
docker-compose build backend
```

### Executar comandos dentro dos containers
```bash
# Acessar terminal do frontend
docker-compose exec frontend sh

# Acessar terminal do backend
docker-compose exec backend bash
```

## Estrutura dos serviços

- **Frontend**: React/Vite servido via Nginx na porta 3000
- **Backend**: Flask API na porta 5000
- **Rede**: Ambos os serviços se comunicam via rede Docker interna

## Configuração de proxy

O Nginx está configurado para fazer proxy das requisições `/api/*` para o backend automaticamente, então não é necessário alterar as URLs da API no frontend.

## Desenvolvimento

Para desenvolvimento, recomenda-se executar os serviços separadamente:

```bash
# Frontend (na raiz do projeto)
npm run dev

# Backend (na pasta backend)
cd backend
python app.py
```

## Produção

Para produção, o Docker Compose está configurado para:
- Servir arquivos estáticos otimizados via Nginx
- Fazer proxy das requisições API para o backend
- Configurar redes isoladas entre os serviços
