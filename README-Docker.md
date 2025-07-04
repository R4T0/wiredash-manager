
# WireGuard Mikrotik Manager - Docker Setup

## Pré-requisitos

- Docker
- Docker Compose

## Banco de Dados

O sistema utiliza **SQLite** como banco de dados padrão. O arquivo do banco é criado automaticamente como `wireguard_manager.db` no diretório do backend.

### Persistência dos Dados

Para garantir que os dados não sejam perdidos quando os containers forem removidos, é importante configurar volumes Docker para persistir o banco de dados.

## Como executar

### 1. Clonar o repositório
```bash
git clone <seu-repositorio>
cd wireguard-mikrotik-manager
```

### 2. Configurar Persistência do Banco (Recomendado)

Antes de executar, configure a persistência do banco de dados editando o `docker-compose.yml`:

```yaml
services:
  backend:
    build: ./backend
    container_name: wireguard-backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    volumes:
      - ./data:/app/data  # Persistir banco de dados
    networks:
      - wireguard-network
```

E modifique o backend para usar o diretório persistente:
```bash
# Criar diretório para dados
mkdir -p data
```

### 3. Executar com Docker Compose
```bash
# Construir e executar todos os serviços
docker-compose up --build

# Executar em background
docker-compose up -d --build
```

### 4. Acessar a aplicação
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

```

## Produção

Para produção, o Docker Compose está configurado para:
- Servir arquivos estáticos otimizados via Nginx
- Fazer proxy das requisições API para o backend
- Configurar redes isoladas entre os serviços
