
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
        // Check for saved current user
        const savedCurrentUser = localStorage.getItem('current_user');
        if (savedCurrentUser) {
          setCurrentUser(JSON.parse(savedCurrentUser));
        }

        // Load users from API, with fallback to localStorage
        await loadUsers();
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Fallback to localStorage if API fails
        await loadUsersFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      if (response.success) {
        setUsers(response.data);
        console.log('Users loaded from API:', response.data);
      }
    } catch (error) {
      console.error('Failed to load users from API:', error);
      throw error;
    }
  };

  const loadUsersFromLocalStorage = async () => {
    console.log('Loading users from localStorage as fallback');
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Default admin user
      const defaultUsers = [{
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        enabled: true,
        created_at: '2024-01-15'
      }];
      setUsers(defaultUsers);
      localStorage.setItem('app_users', JSON.stringify(defaultUsers));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        const user = response.data;
        setCurrentUser(user);
        localStorage.setItem('current_user', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('API login failed, trying localStorage fallback:', error);
      // Fallback to localStorage
      const user = users.find(u => u.email === email && u.password === password && u.enabled);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('current_user', JSON.stringify(user));
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('current_user');
  };

  const addUser = async (userData: Omit<User, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      const response = await apiService.createUser(userData);
      if (response.success) {
        await loadUsers(); // Refresh users list
        return true;
      }
      return false;
    } catch (error) {
      console.error('API create user failed, trying localStorage fallback:', error);
      // Fallback to localStorage
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        created_at: new Date().toISOString().split('T')[0]
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      return true;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    try {
      const response = await apiService.updateUser(id, updates);
      if (response.success) {
        await loadUsers(); // Refresh users list
        
        // Update current user if it's the same
        if (currentUser?.id === id) {
          const updatedUser = { ...currentUser, ...updates };
          setCurrentUser(updatedUser);
          localStorage.setItem('current_user', JSON.stringify(updatedUser));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('API update user failed, trying localStorage fallback:', error);
      // Fallback to localStorage
      const updatedUsers = users.map(user => 
        user.id === id ? { ...user, ...updates } : user
      );
      setUsers(updatedUsers);
      localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      
      if (currentUser?.id === id) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
      }
      return true;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const response = await apiService.deleteUser(id);
      if (response.success) {
        await loadUsers(); // Refresh users list
        
        // Logout if current user was deleted
        if (currentUser?.id === id) {
          logout();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('API delete user failed, trying localStorage fallback:', error);
      // Fallback to localStorage
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      
      if (currentUser?.id === id) {
        logout();
      }
      return true;
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
