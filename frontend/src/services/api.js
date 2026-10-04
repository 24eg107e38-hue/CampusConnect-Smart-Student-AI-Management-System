/**
 * CampusConnect Unified Frontend API Service
 */

const API_BASE = '/api';

export const Api = {
  getToken() {
    return localStorage.getItem('cc_token');
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // AI Service Helpers
  chatAi(message, studentId, history = []) {
    return this.post('/ai/assistant/chat', { message, studentId, history });
  },

  getStudyPlan(studentId, dailyHours = 3.0, focusGoal = '') {
    return this.post('/ai/study-plan', { studentId, dailyHours, focusGoal });
  },

  getPerformanceExplanation(studentId) {
    return this.get(`/ai/performance-explanation/student/${studentId}`);
  }
};
