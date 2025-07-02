
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  enabled: boolean;
  created_at: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'created_at'>) => Promise<boolean>;
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load users and check for saved session
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // PRIMEIRO: Restaura usuário do localStorage apenas para verificar sessão válida
        const savedCurrentUser = localStorage.getItem('current_user');
        if (savedCurrentUser) {
          try {
            const parsedUser = JSON.parse(savedCurrentUser);
            const sessionToken = localStorage.getItem('session_token');
            const sessionExpiry = localStorage.getItem('session_expiry');
            
            if (sessionToken && sessionExpiry) {
              const now = new Date().getTime();
              const expiryTime = parseInt(sessionExpiry);
              
              if (now < expiryTime) {
                // Verifica se o usuário ainda existe no SQLite
                try {
                  const response = await apiService.getUsers();
                  if (response.success) {
                    const userExists = response.data.find((u: User) => u.id === parsedUser.id && u.enabled);
                    if (userExists) {
                      setCurrentUser(parsedUser);
                      console.log('User session restored and validated against SQLite:', parsedUser.email);
                    } else {
                      console.log('User not found in SQLite or disabled, logging out');
                      localStorage.removeItem('current_user');
                      localStorage.removeItem('session_token');
                      localStorage.removeItem('session_expiry');
                    }
                  }
                } catch (error) {
                  // Se API falhar, mantém usuário logado temporariamente
                  setCurrentUser(parsedUser);
                  console.log('Cannot validate user against SQLite, keeping session temporarily:', parsedUser.email);
                }
              } else {
                // Sessão expirada
                localStorage.removeItem('current_user');
                localStorage.removeItem('session_token');
                localStorage.removeItem('session_expiry');
                console.log('Session expired, user logged out');
              }
            }
          } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('current_user');
            localStorage.removeItem('session_token');
            localStorage.removeItem('session_expiry');
          }
        }

        // SEGUNDO: Carrega usuários do SQLite
        await loadUsers();
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('Loading users from SQLite database...');
      const response = await apiService.getUsers();
      if (response.success) {
        setUsers(response.data);
        console.log('Users loaded from SQLite:', response.data);
      } else {
        throw new Error('Failed to load users from SQLite');
      }
    } catch (error) {
      console.error('Failed to load users from SQLite database:', error);
      // Fallback temporário para localStorage apenas se API falhar
      console.log('Fallback: Loading users from localStorage');
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        // Usuário admin padrão
        const defaultUsers = [{
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'admin123',
          enabled: true,
          created_at: '2024-01-15'
        }];
        setUsers(defaultUsers);
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login via SQLite database...');
      const response = await apiService.login(email, password);
      if (response.success) {
        const user = response.data;
        setCurrentUser(user);
        localStorage.setItem('current_user', JSON.stringify(user));
        
        // Cria sessão com validade de 24 horas
        const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 horas
        localStorage.setItem('session_token', sessionToken);
        localStorage.setItem('session_expiry', sessionExpiry.toString());
        
        console.log('User logged in successfully via SQLite:', user.email);
        return true;
      }
      return false;
    } catch (error) {
      console.error('SQLite login failed, trying localStorage fallback:', error);
      // Fallback temporário para localStorage apenas se API falhar
      const user = users.find(u => u.email === email && u.password === password && u.enabled);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('current_user', JSON.stringify(user));
        
        // Cria sessão com validade de 24 horas
        const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 horas
        localStorage.setItem('session_token', sessionToken);
        localStorage.setItem('session_expiry', sessionExpiry.toString());
        
        console.log('Fallback: User logged in via localStorage:', user.email);
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    console.log('User logged out');
    setCurrentUser(null);
    localStorage.removeItem('current_user');
    localStorage.removeItem('session_token');
    localStorage.removeItem('session_expiry');
  };

  const addUser = async (userData: Omit<User, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      console.log('Creating user in SQLite database...');
      const response = await apiService.createUser(userData);
      if (response.success) {
        await loadUsers(); // Refresh users list from SQLite
        console.log('User created successfully in SQLite');
        return true;
      }
      return false;
    } catch (error) {
      console.error('SQLite create user failed:', error);
      return false;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    try {
      console.log('Updating user in SQLite database...');
      const response = await apiService.updateUser(id, updates);
      if (response.success) {
        await loadUsers(); // Refresh users list from SQLite
        
        // Update current user if it's the same
        if (currentUser?.id === id) {
          const updatedUser = { ...currentUser, ...updates };
          setCurrentUser(updatedUser);
          localStorage.setItem('current_user', JSON.stringify(updatedUser));
        }
        console.log('User updated successfully in SQLite');
        return true;
      }
      return false;
    } catch (error) {
      console.error('SQLite update user failed:', error);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      console.log('Deleting user from SQLite database...');
      const response = await apiService.deleteUser(id);
      if (response.success) {
        await loadUsers(); // Refresh users list from SQLite
        
        // Logout if current user was deleted
        if (currentUser?.id === id) {
          logout();
        }
        console.log('User deleted successfully from SQLite');
        return true;
      }
      return false;
    } catch (error) {
      console.error('SQLite delete user failed:', error);
      return false;
    }
  };

  const value = {
    currentUser,
    users,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    isAuthenticated: !!currentUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
