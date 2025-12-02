
import sqlite3
import os
from datetime import datetime
import bcrypt
import json
from encryption import password_encryption

class DatabaseManager:
    def __init__(self, db_path='wireguard_manager.db'):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable dict-like access to rows
        return conn
    
    def init_database(self):
        """Initialize database with tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                enabled BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create router configurations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS configuracoes_roteador (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                router_type TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                port TEXT,
                user TEXT NOT NULL,
                password TEXT NOT NULL,
                use_https BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create WireGuard configurations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS configuracoes_wireguard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint_padrao TEXT,
                porta_padrao TEXT,
                range_ips_permitidos TEXT,
                dns_cliente TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create SMTP configuration table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS configuracoes_smtp (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                host TEXT,
                port TEXT,
                username TEXT,
                password TEXT,
                use_tls BOOLEAN DEFAULT 1,
                use_ssl BOOLEAN DEFAULT 0,
                from_email TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create password reset tokens table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                used BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES usuarios(id)
            )
        ''')
        
        # Insert default admin user if no users exist
        cursor.execute('SELECT COUNT(*) FROM usuarios')
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute('''
                INSERT INTO usuarios (name, email, password, enabled, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', ('Admin User', 'admin@example.com', admin_password, 1, '2024-01-15'))
        
        conn.commit()
        conn.close()
    
    # User management methods
    def get_users(self):
        """Get all users"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM usuarios ORDER BY created_at DESC')
        users = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return users
    
    def get_user_by_email(self, email):
        """Get user by email"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM usuarios WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        return dict(user) if user else None
    
    def create_user(self, name, email, password, enabled=True):
        """Create new user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            hashed_password = password if self._is_hashed(password) else bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute('''
                INSERT INTO usuarios (name, email, password, enabled, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (name, email, hashed_password, enabled, datetime.now().strftime('%Y-%m-%d')))
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            return user_id
        except sqlite3.IntegrityError:
            conn.close()
            return None
    
    def update_user(self, user_id, **kwargs):
        """Update user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Build dynamic update query
        fields = []
        values = []
        for key, value in kwargs.items():
            if key in ['name', 'email', 'password', 'enabled']:
                if key == 'password' and value:
                    value = value if self._is_hashed(value) else bcrypt.hashpw(value.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                fields.append(f"{key} = ?")
                values.append(value)
        
        if fields:
            query = f"UPDATE usuarios SET {', '.join(fields)} WHERE id = ?"
            values.append(user_id)
            cursor.execute(query, values)
            conn.commit()
        
        conn.close()

    def _is_hashed(self, password: str) -> bool:
        try:
            return isinstance(password, str) and password.startswith(('$2a$', '$2b$', '$2y$'))
        except Exception:
            return False
    
    def delete_user(self, user_id):
        """Delete user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM usuarios WHERE id = ?', (user_id,))
        conn.commit()
        conn.close()
    
    # Router configuration methods
    def get_router_config(self):
        """Get router configuration (latest one)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM configuracoes_roteador ORDER BY updated_at DESC LIMIT 1')
        config = cursor.fetchone()
        conn.close()
        
        if config:
            config_dict = dict(config)
            # Decrypt password before returning
            if config_dict.get('password'):
                config_dict['password'] = password_encryption.decrypt_password(config_dict['password'])
            return config_dict
        return None
    
    def save_router_config(self, router_type, endpoint, port, user, password, use_https):
        """Save router configuration"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Encrypt password before storing
        encrypted_password = password_encryption.encrypt_password(password) if password else ""
        
        # Delete existing configs and insert new one
        cursor.execute('DELETE FROM configuracoes_roteador')
        cursor.execute('''
            INSERT INTO configuracoes_roteador 
            (router_type, endpoint, port, user, password, use_https, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (router_type, endpoint, port, user, encrypted_password, use_https, 
              datetime.now().isoformat(), datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    # WireGuard configuration methods
    def get_wireguard_config(self):
        """Get WireGuard configuration (latest one)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM configuracoes_wireguard ORDER BY updated_at DESC LIMIT 1')
        config = cursor.fetchone()
        conn.close()
        return dict(config) if config else None
    
    def save_wireguard_config(self, endpoint_padrao, porta_padrao, range_ips_permitidos, dns_cliente):
        """Save WireGuard configuration"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Delete existing configs and insert new one
        cursor.execute('DELETE FROM configuracoes_wireguard')
        cursor.execute('''
            INSERT INTO configuracoes_wireguard 
            (endpoint_padrao, porta_padrao, range_ips_permitidos, dns_cliente, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (endpoint_padrao, porta_padrao, range_ips_permitidos, dns_cliente,
              datetime.now().isoformat(), datetime.now().isoformat()))
        
        conn.commit()
        conn.close()

    # SMTP configuration methods
    def get_smtp_config(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM configuracoes_smtp ORDER BY updated_at DESC LIMIT 1')
        config = cursor.fetchone()
        conn.close()
        if config:
            config_dict = dict(config)
            if config_dict.get('password'):
                config_dict['password'] = password_encryption.decrypt_password(config_dict['password'])
            return config_dict
        return None

    def save_smtp_config(self, host, port, username, password, use_tls, use_ssl, from_email):
        conn = self.get_connection()
        cursor = conn.cursor()
        encrypted_password = password_encryption.encrypt_password(password) if password else ""
        cursor.execute('DELETE FROM configuracoes_smtp')
        cursor.execute('''
            INSERT INTO configuracoes_smtp
            (host, port, username, password, use_tls, use_ssl, from_email, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (host, port, username, encrypted_password, use_tls, use_ssl, from_email, datetime.now().isoformat(), datetime.now().isoformat()))
        conn.commit()
        conn.close()

    # Password reset token methods
    def create_password_reset_token(self, user_id, token, expires_at):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO password_reset_tokens (user_id, token, expires_at, used, created_at)
            VALUES (?, ?, ?, 0, ?)
        ''', (user_id, token, expires_at, datetime.now().isoformat()))
        conn.commit()
        conn.close()

    def get_password_reset_token(self, token):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM password_reset_tokens WHERE token = ?', (token,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def mark_token_used(self, token):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE password_reset_tokens SET used = 1 WHERE token = ?', (token,))
        conn.commit()
        conn.close()

# Global database instance
db = DatabaseManager()
