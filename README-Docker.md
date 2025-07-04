# WireGuard Multi-Router Manager - Documentação de Deploy

## Índice
1. [Visão Geral](#visão-geral)
2. [Requisitos do Sistema](#requisitos-do-sistema)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Instalação Docker (Recomendado)](#instalação-docker-recomendado)
5. [Deploy em VPS Linux](#deploy-em-vps-linux)
6. [Configuração de Produção](#configuração-de-produção)
7. [Backup e Restauração](#backup-e-restauração)
8. [Monitoramento e Logs](#monitoramento-e-logs)
9. [Solução de Problemas](#solução-de-problemas)

## Visão Geral

O WireGuard Multi-Router Manager é uma aplicação web completa para gerenciar conexões WireGuard em múltiplos tipos de roteadores (Mikrotik, OPNsense, pfSense, Unifi).

### Componentes do Sistema:
- **Frontend**: React + TypeScript + Vite (porta 3000/80)
- **Backend**: Python Flask API (porta 5000)
- **Banco de Dados**: SQLite (`wireguard_manager.db`)
- **Proxy Web**: Nginx (produção)

## Requisitos do Sistema

### Desenvolvimento Local:
- Node.js 18+
- Python 3.11+
- 2GB RAM mínimo
- 1GB espaço em disco

### Produção:
- Docker + Docker Compose
- 4GB RAM recomendado
- 10GB espaço em disco
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+

## Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Backend       │────│   Roteadores    │
│   (React/Nginx) │    │   (Flask API)   │    │   (Diversos)    │
│   Porta 80/3000 │    │   Porta 5000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │
          └───────────────────────┼─────────────────┐
                                  │                 │
                        ┌─────────────────┐ ┌─────────────────┐
                        │   SQLite DB     │ │   Volumes       │
                        │   wireguard_    │ │   Persistentes  │
                        │   manager.db    │ │                 │
                        └─────────────────┘ └─────────────────┘
```

## Instalação Docker (Recomendado)

### 1. Pré-requisitos

Instalar Docker e Docker Compose:

#### Ubuntu/Debian:
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Verificar instalação
docker --version
docker compose version
```

#### CentOS/RHEL:
```bash
# Instalar Docker
sudo yum update -y
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar serviços
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/wireguard-mikrotik-manager.git
cd wireguard-mikrotik-manager
```

### 3. Configurar Persistência de Dados

Criar estrutura de diretórios:
```bash
# Criar diretórios para dados persistentes
mkdir -p data/db
mkdir -p data/logs
mkdir -p data/backups

# Definir permissões
sudo chown -R 1000:1000 data/
chmod -R 755 data/
```

### 4. Configurar Docker Compose

Editar `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: wireguard-backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DB_PATH=/app/data/wireguard_manager.db
      - LOG_LEVEL=INFO
    volumes:
      - ./data:/app/data:rw
      - ./data/logs:/app/logs:rw
    networks:
      - wireguard-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  frontend:
    build: .
    container_name: wireguard-frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      backend:
        condition: service_healthy
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./data/logs/nginx:/var/log/nginx:rw
    networks:
      - wireguard-network
    restart: unless-stopped

networks:
  wireguard-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  wireguard-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./data
```

### 5. Executar o Sistema
```bash
# Construir e executar
docker compose up --build -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

### 6. Acessar a Aplicação
- **Interface Web**: http://seu-servidor
- **API Backend**: http://seu-servidor:5000
- **Health Check**: http://seu-servidor:5000/health

## Deploy em VPS Linux

### 1. Preparar o Servidor

#### Atualizar Sistema:
```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

#### Configurar Firewall:
```bash
# Instalar UFW
sudo apt install ufw

# Configurar regras básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH, HTTP e HTTPS
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp

# Ativar firewall
sudo ufw enable
sudo ufw status
```

#### Otimizar Sistema:
```bash
# Aumentar limites de arquivo
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Otimizar kernel para rede
echo "net.core.somaxconn = 65536" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. Configurar SSL/HTTPS (Produção)

#### Instalar Certbot:
```bash
sudo apt install certbot
```

#### Obter Certificado SSL:
```bash
# Parar nginx temporariamente
docker compose stop frontend

# Obter certificado
sudo certbot certonly --standalone -d seu-dominio.com

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### Configurar Nginx com SSL:
Atualizar `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name seu-dominio.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name seu-dominio.com;

        ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;
        
        root /usr/share/nginx/html;
        index index.html;

        # API Proxy
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

## Configuração de Produção

### 1. Variáveis de Ambiente

Criar arquivo `.env`:
```bash
# Backend
FLASK_ENV=production
DB_PATH=/app/data/wireguard_manager.db
LOG_LEVEL=INFO
SECRET_KEY=sua-chave-secreta-muito-forte

# Database
DB_BACKUP_INTERVAL=3600
DB_BACKUP_RETENTION=30

# Security
CORS_ORIGINS=https://seu-dominio.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
```

### 2. Monitoramento com Health Checks

Criar script de monitoramento `/opt/wireguard/monitor.sh`:
```bash
#!/bin/bash

HEALTH_URL="http://localhost:5000/health"
LOG_FILE="/opt/wireguard/logs/monitor.log"

check_health() {
    response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
    
    if [ $response -eq 200 ]; then
        echo "$(date): OK - Application healthy" >> $LOG_FILE
        return 0
    else
        echo "$(date): ERROR - Application unhealthy (HTTP $response)" >> $LOG_FILE
        # Restart containers
        cd /opt/wireguard && docker compose restart
        return 1
    fi
}

check_health
```

Configurar cron:
```bash
# Verificar saúde a cada 5 minutos
*/5 * * * * /opt/wireguard/monitor.sh
```

## Backup e Restauração

### 1. Script de Backup Automatizado

Criar `/opt/wireguard/backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/opt/wireguard/backups"
DB_PATH="/opt/wireguard/data/wireguard_manager.db"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Criar backup
mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/wireguard_manager_$DATE.db

# Comprimir backup
gzip $BACKUP_DIR/wireguard_manager_$DATE.db

# Remover backups antigos
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

# Log
echo "$(date): Backup created: wireguard_manager_$DATE.db.gz" >> /opt/wireguard/logs/backup.log
```

### 2. Configurar Backup Automático
```bash
# Backup diário às 2:00 AM
0 2 * * * /opt/wireguard/backup.sh
```

### 3. Restauração
```bash
#!/bin/bash
# restore.sh

if [ -z "$1" ]; then
    echo "Uso: $0 <arquivo_backup.db.gz>"
    exit 1
fi

BACKUP_FILE=$1
DB_PATH="/opt/wireguard/data/wireguard_manager.db"

# Parar containers
docker compose stop

# Restaurar banco
gunzip -c $BACKUP_FILE > $DB_PATH

# Reiniciar containers
docker compose start

echo "Restauração concluída!"
```

## Monitoramento e Logs

### 1. Comandos Úteis de Monitoramento

```bash
# Ver logs em tempo real
docker compose logs -f

# Ver logs específicos
docker compose logs backend
docker compose logs frontend

# Ver status dos containers
docker compose ps

# Ver uso de recursos
docker stats

# Ver logs do sistema
journalctl -u docker -f
```

### 2. Métricas de Performance

Criar script de métricas `/opt/wireguard/metrics.sh`:
```bash
#!/bin/bash

LOG_FILE="/opt/wireguard/logs/metrics.log"

# CPU e Memória
echo "$(date): $(docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}')" >> $LOG_FILE

# Espaço em disco
echo "$(date): Disk usage: $(df -h /opt/wireguard | tail -1)" >> $LOG_FILE

# Verificar conexões ativas
ACTIVE_CONNECTIONS=$(ss -tuln | grep :5000 | wc -l)
echo "$(date): Active connections: $ACTIVE_CONNECTIONS" >> $LOG_FILE
```

## Solução de Problemas

### 1. Problemas Comuns

#### Container não inicia:
```bash
# Verificar logs
docker compose logs backend

# Verificar permissões
sudo chown -R 1000:1000 /opt/wireguard/data
sudo chmod -R 755 /opt/wireguard/data
```

#### Banco de dados corrompido:
```bash
# Restaurar do backup
cd /opt/wireguard
./restore.sh backups/wireguard_manager_YYYYMMDD_HHMMSS.db.gz
```

#### Performance baixa:
```bash
# Verificar recursos
docker stats
htop

# Otimizar banco SQLite
sqlite3 /opt/wireguard/data/wireguard_manager.db "VACUUM; REINDEX;"
```

### 2. Comandos de Diagnóstico

```bash
# Testar conectividade API
curl -f http://localhost:5000/health

# Verificar portas
netstat -tuln | grep -E '(80|443|5000)'

# Verificar logs de erro
grep -i error /opt/wireguard/logs/*.log

# Verificar espaço em disco
df -h /opt/wireguard/

# Testar DNS
nslookup seu-dominio.com
```

### 3. Recuperação de Emergência

```bash
# Parar tudo
docker compose down

# Limpar volumes órfãos
docker volume prune

# Reconstruir do zero
docker compose up --build --force-recreate -d

# Verificar integridade do banco
sqlite3 /opt/wireguard/data/wireguard_manager.db "PRAGMA integrity_check;"
```

## Conclusão

Este guia fornece uma base sólida para deploy em produção do WireGuard Multi-Router Manager. Para ambientes críticos, considere também:

- **Load Balancer**: HAProxy ou Nginx para múltiplas instâncias
- **Monitoramento**: Prometheus + Grafana
- **Backup Remoto**: AWS S3, Google Cloud Storage
- **Segurança**: WAF, fail2ban, auditoria de logs
- **Alta Disponibilidade**: Clustering Docker Swarm ou Kubernetes
