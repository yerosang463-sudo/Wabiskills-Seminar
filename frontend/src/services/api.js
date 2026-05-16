import { resolveApiBase } from '../utils/url.js';

export const API_BASE_URL = resolveApiBase();

async function parseApiResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: response.ok ? 'Empty server response' : 'Server returned an invalid response',
    };
  }

  return {
    ...data,
    ok: response.ok,
    status: response.status,
  };
}

export const api = {
  // Auth endpoints
  async register(username, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    return response.json();
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getMe(token) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  async changePassword(token, currentPassword, newPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return parseApiResponse(response);
  },

  // Room endpoints
  async createRoom(token, roomId = null) {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId }),
    });
    const data = await parseApiResponse(response);
    
    // Auto-logout on authentication errors
    if (data.status === 401 && data.code && ['INVALID_TOKEN', 'TOKEN_EXPIRED', 'NO_TOKEN'].includes(data.code)) {
      localStorage.clear();
      window.location.href = '/';
    }
    
    return data;
  },

  async getRoom(token, roomId) {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await parseApiResponse(response);
    
    // Auto-logout on authentication errors
    if (data.status === 401 && data.code && ['INVALID_TOKEN', 'TOKEN_EXPIRED', 'NO_TOKEN'].includes(data.code)) {
      localStorage.clear();
      window.location.href = '/';
    }
    
    return data;
  },

  async joinRoom(token, roomId) {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await parseApiResponse(response);
    
    // Auto-logout on authentication errors
    if (data.status === 401 && data.code && ['INVALID_TOKEN', 'TOKEN_EXPIRED', 'NO_TOKEN'].includes(data.code)) {
      localStorage.clear();
      window.location.href = '/';
    }
    
    return data;
  },

  async leaveRoom(token, roomId) {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return parseApiResponse(response);
  },

  async getUserRooms(token) {
    const response = await fetch(`${API_BASE_URL}/rooms/my-rooms`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};

export default api;
