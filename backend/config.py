
"""
Configurações do backend Multi-Router Proxy
"""
import os

class Config:
    """Configurações básicas"""
    
    # Flask
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = FLASK_ENV == 'development'
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173,https://yourapp.lovable.app').split(',')
    
    # Timeout padrão para requisições
    DEFAULT_TIMEOUT = int(os.getenv('DEFAULT_TIMEOUT', '10'))
    
    # Log level
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Roteadores suportados
    SUPPORTED_ROUTERS = ['mikrotik', 'opnsense', 'unifi']

class DevelopmentConfig(Config):
    """Configurações para desenvolvimento"""
    DEBUG = True

class ProductionConfig(Config):
    """Configurações para produção"""
    DEBUG = False

# Mapeamento de configurações por ambiente
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
