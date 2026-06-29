// API integration helpers for the Online Quiz Maker

const API_BASE = '/api';

// Get authenticating headers
const getHeaders = () => {
  const token = localStorage.getItem('quiz_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async register(username, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
    return data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
    return data;
  },

  // Quizzes
  async getQuizzes() {
    const res = await fetch(`${API_BASE}/quizzes`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load quizzes');
    return data;
  },

  async getQuiz(id) {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load quiz');
    return data;
  },

  async createQuiz(quizData) {
    const res = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(quizData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create quiz');
    return data;
  },

  async updateQuiz(id, quizData) {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(quizData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update quiz');
    return data;
  },

  async deleteQuiz(id) {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete quiz');
    return data;
  },

  async submitAttempt(quizId, answers, userId, username) {
    const res = await fetch(`${API_BASE}/quizzes/${quizId}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, userId, username })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit quiz');
    return data;
  },

  async getQuizStats(id) {
    const res = await fetch(`${API_BASE}/quizzes/${id}/stats`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch statistics');
    return data;
  },

  async getMyAttempts() {
    const res = await fetch(`${API_BASE}/attempts/me`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load history');
    return data;
  },

  async getGlobalLeaderboard() {
    const res = await fetch(`${API_BASE}/leaderboard`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch global leaderboard');
    return data;
  }
};
