
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // User management
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData: { name: string; email: string; password: string; enabled?: boolean }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: Partial<{ name: string; email: string; password: string; enabled: boolean }>) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Router configuration
  async getRouterConfig() {
    return this.request('/config/router');
  }

  async saveRouterConfig(config: {
    routerType: string;
    endpoint: string;
    port?: string;
    user: string;
    password: string;
    useHttps?: boolean;
  }) {
    return this.request('/config/router', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // WireGuard configuration
  async getWireguardConfig() {
    return this.request('/config/wireguard');
  }

  async saveWireguardConfig(config: {
    endpointPadrao?: string;
    portaPadrao?: string;
    rangeIpsPermitidos?: string;
    dnsCliente?: string;
  }) {
    return this.request('/config/wireguard', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }
}

export const apiService = new ApiService();
