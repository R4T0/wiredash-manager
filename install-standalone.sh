#!/bin/bash

# ==============================================================================
# Script de Instalação Wiredash Manager v5 - Corrige Permissões do NPM
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

# --- 1. Instalação de Dependências do Sistema ---
print_info "Atualizando a lista de pacotes do sistema..."
apt-get update

print_info "Instalando dependências base: git, python3, pip, nginx e curl..."
apt-get install -y git python3-pip python3-venv nginx curl

print_info "Removendo versões antigas do Node.js e npm para evitar conflitos..."
apt-get remove -y nodejs npm
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

# --- 3. Configuração do Backend (Python Flask API) ---
print_info "Configurando o backend Python..."
sudo -u www-data python3 -m venv venv
sudo -u www-data /bin/bash -c "source venv/bin/activate && pip install -r backend/requirements.txt"

# --- 4. Configuração do Systemd para o Backend (Porta 5000) ---
print_info "Criando serviço systemd para o backend (gunicorn na porta 5000)..."
cat > /etc/systemd/system/wiredash-backend.service <<EOL
[Unit]
Description=Gunicorn instance to serve Wiredash Manager Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=${INSTALL_DIR}/backend
ExecStart=${INSTALL_DIR}/venv/bin/gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
EOL

print_info "Iniciando e habilitando o serviço do backend..."
systemctl daemon-reload
systemctl start wiredash-backend
systemctl enable wiredash-backend

# --- 5. Configuração do Frontend (React + Vite) ---
print_info "Configurando o frontend React..."

# MODIFICADO: Corrige o problema de permissão do cache do NPM
print_info "Corrigindo permissões do cache do NPM para o usuário www-data..."
mkdir -p /var/www/.npm
chown -R www-data:www-data /var/www/.npm

print_info "Instalando dependências do Node.js como usuário www-data..."
sudo -u www-data npm install

print_info "Construindo a aplicação frontend como usuário www-data..."
sudo -u www-data npm run build

# --- 6. Configuração do Nginx (Simplificado) ---
print_info "Configurando o Nginx para servir o frontend..."
cat > /etc/nginx/sites-available/wiredash-manager <<EOL
server {
    listen 80;
    server_name seu_dominio_ou_ip; # IMPORTANTE: Substitua pelo seu domínio ou IP

    root ${INSTALL_DIR}/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
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

# --- 7. Configuração do Firewall ---
print_info "Configurando o firewall (UFW)..."
ufw allow 'Nginx Full'
ufw allow 5000/tcp
ufw status

# --- Finalização ---
print_success "Instalação concluída com sucesso!"
echo "----------------------------------------------------------------"
echo "O Wiredash Manager foi configurado para acesso direto via porta 5000."
echo "Para acessar, navegue para: http://seu_dominio_ou_ip"
echo "Lembre-se de substituir 'seu_dominio_ou_ip' no arquivo de configuração do Nginx:"
echo "/etc/nginx/sites-available/wiredash-manager"
echo ""
echo "Para verificar o status dos serviços, use:"
echo "sudo systemctl status wiredash-backend"
echo "sudo systemctl status nginx"
echo "----------------------------------------------------------------"
