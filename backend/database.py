
import sqlite3
import os
from datetime import datetime
import hashlib
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
        
        # Insert default admin user if no users exist
        cursor.execute('SELECT COUNT(*) FROM usuarios')
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            cursor.execute('''
                INSERT INTO usuarios (name, email, password, enabled, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', ('Admin User', 'admin@example.com', 'admin123', 1, '2024-01-15'))
        
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
            cursor.execute('''
                INSERT INTO usuarios (name, email, password, enabled, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (name, email, password, enabled, datetime.now().strftime('%Y-%m-%d')))
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
                fields.append(f"{key} = ?")
                values.append(value)
        
        if fields:
            query = f"UPDATE usuarios SET {', '.join(fields)} WHERE id = ?"
            values.append(user_id)
            cursor.execute(query, values)
            conn.commit()
        
        conn.close()
    
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

# Global database instance
db = DatabaseManager()
