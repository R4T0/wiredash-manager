#!/bin/bash

# WireGuard Multi-Router Manager - Installation Script for Debian/Ubuntu
# This script automates the complete installation process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if user has sudo privileges
if ! sudo -n true 2>/dev/null; then
    print_error "This script requires sudo privileges. Please run: sudo visudo and add your user to sudoers."
    exit 1
fi

print_header "WireGuard Multi-Router Manager Installer"
print_status "Starting installation process..."

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    htop \
    wget \
    unzip

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_status "Docker installed successfully!"
else
    print_status "Docker is already installed"
fi

# Install Docker Compose (standalone)
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully!"
else
    print_status "Docker Compose is already installed"
fi

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Development port
sudo ufw allow 5000/tcp  # Backend API port

# Create application directory
APP_DIR="/opt/wireguard-manager"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or copy application (assuming current directory contains the source)
if [[ -f "docker-compose.yml" ]]; then
    print_status "Copying application files..."
    cp -r . $APP_DIR/
    cd $APP_DIR
else
    print_error "docker-compose.yml not found in current directory."
    print_status "Please run this script from the project root directory."
    exit 1
fi

# Create necessary directories for persistent data
print_status "Creating persistent data directories..."
mkdir -p $APP_DIR/data/db
mkdir -p $APP_DIR/data/logs
mkdir -p $APP_DIR/data/backups

# Set proper permissions
sudo chown -R $USER:$USER $APP_DIR

# Create environment file for backend
print_status "Creating backend environment configuration..."
cat > $APP_DIR/backend/.env << EOF
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=$(openssl rand -hex 32)
DATABASE_URL=sqlite:///data/wireguard_manager.db
LOG_LEVEL=INFO
EOF

# Build and start services
print_status "Building and starting services..."
cd $APP_DIR
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 10

# Check service status
print_status "Checking service status..."
if docker-compose ps | grep -q "Up"; then
    print_status "Services are running!"
else
    print_error "Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Create systemd service for auto-start
print_status "Creating systemd service for auto-start..."
sudo tee /etc/systemd/system/wireguard-manager.service > /dev/null << EOF
[Unit]
Description=WireGuard Multi-Router Manager
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable wireguard-manager.service

# Create backup script
print_status "Creating backup script..."
sudo tee /usr/local/bin/wireguard-backup.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/wireguard-manager/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cd /opt/wireguard-manager
docker-compose exec -T backend python -c "
import sqlite3, shutil, os
from datetime import datetime
db_path = '/app/data/wireguard_manager.db'
backup_path = f'/app/data/backups/backup_{datetime.now().strftime(\"%Y%m%d_%H%M%S\")}.db'
if os.path.exists(db_path):
    shutil.copy2(db_path, backup_path)
    print(f'Backup created: {backup_path}')
else:
    print('Database not found')
"
EOF

sudo chmod +x /usr/local/bin/wireguard-backup.sh

# Setup daily backup cron job
print_status "Setting up daily backup..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/wireguard-backup.sh") | crontab -

# Create management script
print_status "Creating management script..."
sudo tee /usr/local/bin/wg-manager > /dev/null << EOF
#!/bin/bash
cd $APP_DIR
case \$1 in
    start)
        docker-compose up -d
        ;;
    stop)
        docker-compose down
        ;;
    restart)
        docker-compose restart
        ;;
    logs)
        docker-compose logs -f
        ;;
    status)
        docker-compose ps
        ;;
    backup)
        /usr/local/bin/wireguard-backup.sh
        ;;
    update)
        docker-compose pull
        docker-compose up -d
        ;;
    *)
        echo "Usage: \$0 {start|stop|restart|logs|status|backup|update}"
        exit 1
        ;;
esac
EOF

sudo chmod +x /usr/local/bin/wg-manager

print_header "Installation Complete!"
print_status "WireGuard Multi-Router Manager has been installed successfully!"
echo
print_status "Application URL: http://$(hostname -I | awk '{print $1}'):3000"
print_status "Backend API: http://$(hostname -I | awk '{print $1}'):5000"
echo
print_status "Management commands:"
echo "  wg-manager start    - Start services"
echo "  wg-manager stop     - Stop services"
echo "  wg-manager restart  - Restart services"
echo "  wg-manager logs     - View logs"
echo "  wg-manager status   - Check status"
echo "  wg-manager backup   - Create backup"
echo "  wg-manager update   - Update services"
echo
print_status "Default login credentials:"
echo "  Username: admin"
echo "  Password: admin"
echo "  (Please change these after first login)"
echo
print_warning "IMPORTANT: You need to log out and log back in for Docker group permissions to take effect"
print_warning "Or run: newgrp docker"
echo
print_status "Installation log saved to: /tmp/wireguard-install.log"