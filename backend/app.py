from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import logging

from routes.users import users_bp
from routes.auth import auth_bp
from routes.config import config_bp
from routes.router import router_bp

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Permitir CORS para todas as rotas

# Register blueprints
app.register_blueprint(users_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(config_bp, url_prefix='/api')
app.register_blueprint(router_bp, url_prefix='/api')

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar se o serviço está funcionando"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'service': 'Multi-Router API Proxy',
        'supported_routers': ['mikrotik', 'opnsense', 'pfsense']
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)