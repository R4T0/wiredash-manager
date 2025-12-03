# Instalação Automatizada - Debian/Ubuntu

Este script automatiza completamente a instalação do WireGuard Multi-Router Manager em sistemas baseados em Debian/Ubuntu.

## Variáveis de Ambiente

### APP_URL (Obrigatório para recuperação de senha)

A variável `APP_URL` define a URL completa do sistema, usada para gerar links de recuperação de senha nos e-mails.

### VITE_API_URL (Configuração do Frontend)

A variável `VITE_API_URL` define a URL da API do backend que o frontend irá utilizar para comunicação. Se não definida, o frontend tentará conectar automaticamente no mesmo hostname na porta 5000.

**Configuração:**

1. Crie um arquivo `.env` na raiz do projeto:
```bash
APP_URL=https://seu-dominio.com.br
VITE_API_URL=https://seu-dominio.com.br:5000/api
```

2. Ou defina diretamente no docker-compose.yml:
```yaml
environment:
  - APP_URL=https://seu-dominio.com.br
args:
  - VITE_API_URL=https://seu-dominio.com.br:5000/api
```

3. Ou exporte como variável de ambiente antes de executar:
```bash
export APP_URL=https://seu-dominio.com.br
export VITE_API_URL=https://seu-dominio.com.br:5000/api
docker compose up -d --build
```

**Exemplos:**
- Produção: `APP_URL=https://wiredash.minhaempresa.com.br`
- Produção API: `VITE_API_URL=https://wiredash.minhaempresa.com.br:5000/api`
- Desenvolvimento local: `APP_URL=http://localhost:3000`
- Desenvolvimento API: `VITE_API_URL=http://localhost:5000/api`
- Com IP customizado: `VITE_API_URL=http://192.168.1.100:5000/api`

---

## Pré-requisitos

- Sistema Debian/Ubuntu (testado em Ubuntu 20.04+, Debian 11+)
- Usuário com privilégios sudo
- Conexão com a internet
- Pelo menos 2GB de RAM disponível
- 5GB de espaço em disco

## Instalação Rápida

1. **Baixe o repositório:**
   ```bash
   git clone <repository-url>
   cd wireguard-multi-router-manager
   ```

2. **Torne o script executável:**
   ```bash
   chmod +x install-debian.sh
   ```

3. **Execute a instalação:**
   ```bash
   ./install-debian.sh
   ```

4. **Aguarde a conclusão** (processo leva entre 5-15 minutos dependendo da conexão)

5. **Faça logout e login novamente** ou execute:
   ```bash
   newgrp docker
   ```

## O que o Script Faz

### Instalação Automática
- ✅ Atualiza o sistema operacional
- ✅ Instala Docker e Docker Compose
- ✅ Configura firewall (UFW)
- ✅ Cria diretórios de dados persistentes
- ✅ Configura variáveis de ambiente
- ✅ Constrói e inicia os serviços
- ✅ Configura auto-start do sistema
- ✅ Cria backups automáticos diários
- ✅ Instala comandos de gerenciamento

### Estrutura Criada
```
/opt/wireguard-manager/
├── data/
│   ├── db/          # Banco de dados SQLite
│   ├── logs/        # Logs da aplicação
│   └── backups/     # Backups automáticos
├── backend/         # API Python Flask
├── frontend/        # Interface React
└── docker-compose.yml
```

## Acesso ao Sistema

Após a instalação:

- **Interface Web:** `http://SEU_IP:3000`
- **API Backend:** `http://SEU_IP:5000`
- **Login padrão:** admin / admin

⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro login!

## Comandos de Gerenciamento

O script instala o comando `wg-manager` para facilitar o gerenciamento:

```bash
# Iniciar serviços
wg-manager start

# Parar serviços
wg-manager stop

# Reiniciar serviços
wg-manager restart

# Ver logs em tempo real
wg-manager logs

# Verificar status
wg-manager status

# Criar backup manual
wg-manager backup

# Atualizar sistema
wg-manager update
```

## Portas Configuradas

O firewall é automaticamente configurado para permitir:

- **22** - SSH
- **80** - HTTP
- **443** - HTTPS
- **3000** - Interface Web
- **5000** - API Backend

## Backups Automáticos

- ✅ Backup diário às 02:00
- ✅ Armazenados em `/opt/wireguard-manager/data/backups/`
- ✅ Comando manual: `wg-manager backup`

## Logs e Monitoramento

```bash
# Logs em tempo real
wg-manager logs

# Logs específicos do backend
docker-compose logs backend

# Logs específicos do frontend
docker-compose logs frontend

# Status dos containers
docker-compose ps
```

## Solução de Problemas

### Serviços não iniciam
```bash
# Verificar status
wg-manager status

# Ver logs de erro
wg-manager logs

# Reiniciar serviços
wg-manager restart
```

### Erro de permissão Docker
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplicar mudanças
newgrp docker
```

### Portas em uso
```bash
# Verificar portas ocupadas
sudo netstat -tulpn | grep -E ':(3000|5000)'

# Parar outros serviços se necessário
sudo systemctl stop apache2  # ou nginx
```

### Reinstalação
```bash
# Parar serviços
wg-manager stop

# Remover containers
docker-compose down --volumes

# Re-executar instalação
./install-debian.sh
```

## Desinstalação

```bash
# Parar e remover serviços
cd /opt/wireguard-manager
docker-compose down --volumes --remove-orphans

# Remover serviço systemd
sudo systemctl disable wireguard-manager.service
sudo rm /etc/systemd/system/wireguard-manager.service
sudo systemctl daemon-reload

# Remover diretório da aplicação
sudo rm -rf /opt/wireguard-manager

# Remover comandos de gerenciamento
sudo rm /usr/local/bin/wg-manager
sudo rm /usr/local/bin/wireguard-backup.sh

# Remover cron job
crontab -l | grep -v wireguard-backup | crontab -
```

## Atualização

Para atualizar o sistema:

```bash
cd /opt/wireguard-manager
git pull origin main
wg-manager update
```

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `wg-manager logs`
2. Consulte a documentação completa no README.md
3. Verifique o status dos serviços: `wg-manager status`