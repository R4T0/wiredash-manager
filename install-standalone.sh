#!/bin/bash

# ==============================================================================
# Script de Instalação Wiredash Manager v6 - Com Configuração de URLs
# ==============================================================================
#
# Este script é destinado a sistemas baseados em Debian/Ubuntu.
#
# Execute este script com privilégios de sudo.
#

# --- Configurações Iniciais ---
set -e # Aborta o script se qualquer comando falhar
GIT_REPO_URL="https://github.com/R4T0/wiredash-manager.git"
INSTALL_DIR="/opt/wiredash-manager"
NODE_VERSION="18"

# --- Funções Auxiliares ---
print_info() {
    echo -e "\n\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCESSO]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[AVISO]\033[0m $1"
}

# --- Coleta de Informações do Usuário ---
echo ""
echo "=============================================="
echo "   Wiredash Manager - Instalação Standalone"
echo "=============================================="
echo ""

# Detectar IP público automaticamente
DETECTED_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

print_info "Configuração do domínio/IP do sistema"
echo ""
echo "Este valor será usado para:"
echo "  - Links de recuperação de senha nos e-mails"
echo "  - Comunicação entre frontend e backend"
echo "  - Configuração do Nginx"
echo ""
echo "IP detectado automaticamente: ${DETECTED_IP}"
echo ""
read -p "Digite o domínio ou IP do servidor (ou pressione Enter para usar ${DETECTED_IP}): " USER_DOMAIN

# Usar valor detectado se usuário não informar nada
if [ -z "$USER_DOMAIN" ]; then
    USER_DOMAIN="${DETECTED_IP}"
fi

# Perguntar sobre HTTPS
read -p "Usar HTTPS? (s/N): " USE_HTTPS
if [[ "$USE_HTTPS" =~ ^[Ss]$ ]]; then
    PROTOCOL="https"
else
    PROTOCOL="http"
fi

# Definir URLs baseadas nas configurações
APP_URL="${PROTOCOL}://${USER_DOMAIN}"
VITE_API_URL="${PROTOCOL}://${USER_DOMAIN}:5000/api"

print_info "Configuração definida:"
echo "  APP_URL: ${APP_URL}"
echo "  VITE_API_URL: ${VITE_API_URL}"
echo ""
read -p "Confirmar e continuar com a instalação? (S/n): " CONFIRM
if [[ "$CONFIRM" =~ ^[Nn]$ ]]; then
    echo "Instalação cancelada pelo usuário."
    exit 0
fi

# --- 1. Instalação de Dependências do Sistema ---
print_info "Atualizando a lista de pacotes do sistema..."
apt-get update

print_info "Instalando dependências base: git, python3, pip, nginx e curl..."
apt-get install -y git python3-pip python3-venv nginx curl sudo

print_info "Removendo versões antigas do Node.js e npm para evitar conflitos..."
apt-get remove -y nodejs npm || true
apt-get autoremove -y

print_info "Configurando o repositório do Node.js v${NODE_VERSION} e instalando..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
apt-get install -y nodejs

# --- 2. Clonar o Repositório e Corrigir Permissões ---
print_info "Clonando o repositório do projeto para ${INSTALL_DIR}..."
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
fi
git clone "$GIT_REPO_URL" "$INSTALL_DIR"

print_info "Ajustando permissões do diretório da aplicação..."
chown -R www-data:www-data ${INSTALL_DIR}
cd "$INSTALL_DIR"

# --- 3. Criar arquivo .env para o Frontend ---
print_info "Criando arquivo .env com configurações do frontend..."
cat > ${INSTALL_DIR}/.env <<EOL
# Configuração gerada automaticamente pelo instalador
# Data: $(date)

# URL da API do backend
VITE_API_URL=${VITE_API_URL}
EOL
chown www-data:www-data ${INSTALL_DIR}/.env

# --- 4. Configuração do Backend (Python Flask API) ---
print_info "Configurando o backend Python..."
sudo -u www-data python3 -m venv venv
sudo -u www-data /bin/bash -c "source venv/bin/activate && pip install -r backend/requirements.txt"

# --- 5. Configuração do Systemd para o Backend (Porta 5000) ---
print_info "Criando serviço systemd para o backend (gunicorn na porta 5000)..."
cat > /etc/systemd/system/wiredash-backend.service <<EOL
[Unit]
Description=Gunicorn instance to serve Wiredash Manager Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=${INSTALL_DIR}/backend
Environment="APP_URL=${APP_URL}"
ExecStart=${INSTALL_DIR}/venv/bin/gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
EOL

print_info "Iniciando e habilitando o serviço do backend..."
systemctl daemon-reload
systemctl start wiredash-backend
systemctl enable wiredash-backend

# --- 6. Configuração do Frontend (React + Vite) ---
print_info "Configurando o frontend React..."

# Corrige o problema de permissão do cache do NPM
print_info "Corrigindo permissões do cache do NPM para o usuário www-data..."
mkdir -p /var/www/.npm
chown -R www-data:www-data /var/www/.npm

print_info "Instalando dependências do Node.js como usuário www-data..."
sudo -u www-data npm install

print_info "Construindo a aplicação frontend como usuário www-data..."
sudo -u www-data npm run build

# --- 7. Configuração do Nginx ---
print_info "Configurando o Nginx para servir o frontend..."
cat > /etc/nginx/sites-available/wiredash-manager <<EOL
server {
    listen 80;
    server_name ${USER_DOMAIN};

    root ${INSTALL_DIR}/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy para o backend (opcional, para usar mesma porta)
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

if [ -L "/etc/nginx/sites-enabled/wiredash-manager" ]; then
    rm /etc/nginx/sites-enabled/wiredash-manager
fi
ln -s /etc/nginx/sites-available/wiredash-manager /etc/nginx/sites-enabled/

if [ -L "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
fi

print_info "Reiniciando o Nginx..."
nginx -t
systemctl restart nginx

# --- 8. Criar script de reconfiguração ---
print_info "Criando script de reconfiguração..."
cat > /usr/local/bin/wiredash-config <<'SCRIPT'
#!/bin/bash

echo "=============================================="
echo "   Wiredash Manager - Reconfiguração"
echo "=============================================="

read -p "Digite o novo domínio ou IP: " NEW_DOMAIN
read -p "Usar HTTPS? (s/N): " USE_HTTPS

if [[ "$USE_HTTPS" =~ ^[Ss]$ ]]; then
    PROTOCOL="https"
else
    PROTOCOL="http"
fi

APP_URL="${PROTOCOL}://${NEW_DOMAIN}"
VITE_API_URL="${PROTOCOL}://${NEW_DOMAIN}:5000/api"

echo ""
echo "Atualizando configurações..."

# Atualizar .env do frontend
cat > /opt/wiredash-manager/.env <<EOL
VITE_API_URL=${VITE_API_URL}
EOL

# Atualizar serviço do backend
sed -i "s|Environment=\"APP_URL=.*\"|Environment=\"APP_URL=${APP_URL}\"|" /etc/systemd/system/wiredash-backend.service

# Atualizar Nginx
sed -i "s|server_name .*;|server_name ${NEW_DOMAIN};|" /etc/nginx/sites-available/wiredash-manager

# Rebuild frontend
cd /opt/wiredash-manager
sudo -u www-data npm run build

# Reiniciar serviços
systemctl daemon-reload
systemctl restart wiredash-backend
systemctl restart nginx

echo ""
echo "Configuração atualizada!"
echo "  APP_URL: ${APP_URL}"
echo "  VITE_API_URL: ${VITE_API_URL}"
SCRIPT
chmod +x /usr/local/bin/wiredash-config

# --- Finalização ---
print_success "Instalação concluída com sucesso!"
echo ""
echo "================================================================"
echo "                    CONFIGURAÇÃO FINAL"
echo "================================================================"
echo ""
echo "URLs configuradas:"
echo "  Frontend:  ${APP_URL}"
echo "  Backend:   ${APP_URL}:5000"
echo "  API:       ${VITE_API_URL}"
echo ""
echo "Arquivos de configuração:"
echo "  Frontend .env:     ${INSTALL_DIR}/.env"
echo "  Backend service:   /etc/systemd/system/wiredash-backend.service"
echo "  Nginx config:      /etc/nginx/sites-available/wiredash-manager"
echo ""
echo "Comandos úteis:"
echo "  sudo wiredash-config          - Reconfigurar domínio/IP"
echo "  sudo systemctl status wiredash-backend"
echo "  sudo systemctl status nginx"
echo "  sudo journalctl -u wiredash-backend -f"
echo ""
if [ "$PROTOCOL" = "https" ]; then
    print_warning "Você selecionou HTTPS mas o certificado SSL não foi configurado."
    echo "  Para configurar SSL com Let's Encrypt:"
    echo "  sudo apt install certbot python3-certbot-nginx"
    echo "  sudo certbot --nginx -d ${USER_DOMAIN}"
fi
echo "================================================================"
