const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'An error occurred' };
      }

      return { data, message: data.message };
    } catch (error: any) {
      return { error: error.message || 'Network error' };
    }
  }

  // Auth endpoints
  async register(username: string, email: string, password: string) {
    return this.request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // User endpoints
  async getProfile() {
    return this.request<{ user: any }>('/api/user/profile', {
      method: 'GET',
    });
  }

  async updateProfile(username?: string, email?: string) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ username, email }),
    });
  }

  // Room endpoints
  async createRoom() {
    return this.request<{ roomId: string }>('/api/room/create', {
      method: 'POST',
    });
  }

  async joinRoom(roomId: string) {
    return this.request(`/api/room/join/${roomId}`, {
      method: 'POST',
    });
  }

  // Call logs
  async getCallLogs() {
    return this.request<{ callLogs: any[] }>('/api/call-logs', {
      method: 'GET',
    });
  }

  async getCallStats() {
    return this.request<{
      totalCalls: number;
      completedCalls: number;
      activeCalls: number;
      totalDuration: number;
      averageDuration: number;
    }>('/api/call-logs/stats', {
      method: 'GET',
    });
  }

  // Health check
  async healthCheck() {
    return this.request<{
      status: string;
      message: string;
      database: string;
      uptime: number;
    }>('/health', {
      method: 'GET',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
