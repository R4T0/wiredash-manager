
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

## Instalação com LVM (Linux Volume Manager)

Para ambientes de produção em Linux, recomenda-se usar LVM para gerenciar os volumes de dados:

### 1. Criar Volume Lógico
```bash
# Criar volume grupo (substitua /dev/sdX pelo seu disco)
sudo pvcreate /dev/sdX
sudo vgcreate wireguard-vg /dev/sdX

# Criar volume lógico de 10GB para dados
sudo lvcreate -L 10G -n wireguard-data wireguard-vg

# Formatar o volume
sudo mkfs.ext4 /dev/wireguard-vg/wireguard-data
```

### 2. Montar o Volume
```bash
# Criar ponto de montagem
sudo mkdir -p /opt/wireguard-data

# Montar o volume
sudo mount /dev/wireguard-vg/wireguard-data /opt/wireguard-data

# Adicionar ao fstab para montagem automática
echo "/dev/wireguard-vg/wireguard-data /opt/wireguard-data ext4 defaults 0 2" | sudo tee -a /etc/fstab
```

### 3. Configurar Docker Compose com LVM
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
      - /opt/wireguard-data:/app/data  # Volume LVM
    networks:
      - wireguard-network
```

### 4. Executar
```bash
# Dar permissões ao diretório
sudo chown -R 1000:1000 /opt/wireguard-data

# Executar Docker Compose
docker-compose up -d --build
```

## Backup e Restauração

### Backup do Banco de Dados
```bash
# Copiar banco do container
docker cp wireguard-backend:/app/wireguard_manager.db ./backup_$(date +%Y%m%d_%H%M%S).db

# Ou se estiver usando volume persistente
cp ./data/wireguard_manager.db ./backup_$(date +%Y%m%d_%H%M%S).db
```

### Restauração
```bash
# Restaurar para volume persistente
cp ./backup_YYYYMMDD_HHMMSS.db ./data/wireguard_manager.db

# Reiniciar o container
docker-compose restart backend
```

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
