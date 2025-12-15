
// Get API base URL from environment variable or detect dynamically
const getApiBaseUrl = () => {
  // Build-time override (optional)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Local development: backend is usually exposed on :5000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  // Docker/Swarm/Proxy deployments: always use same-origin relative API.
  // This avoids trying to hit ":5000" from the browser (which is typically not published in Swarm).
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

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

  // SMTP configuration
  async getSmtpConfig() {
    return this.request('/config/smtp');
  }

  async saveSmtpConfig(config: {
    host?: string;
    port?: string;
    username?: string;
    password?: string;
    useTls?: boolean;
    useSsl?: boolean;
    fromEmail?: string;
  }) {
    return this.request('/config/smtp', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async sendSmtpTest(toEmail: string) {
    return this.request('/config/smtp/test', {
      method: 'POST',
      body: JSON.stringify({ toEmail }),
    });
  }

  // Password recovery
  async requestPasswordReset(email: string) {
    return this.request('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
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
