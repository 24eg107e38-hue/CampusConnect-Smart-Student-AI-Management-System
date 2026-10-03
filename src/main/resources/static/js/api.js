/**
 * CampusConnect - Unified API Client & Utilities
 */

const API_BASE = '/api';

// Toast Notification System
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';
  if (type === 'warning') icon = '🔔';

  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Authentication Helpers
const Auth = {
  getToken() {
    return localStorage.getItem('cc_token');
  },
  getUser() {
    const userStr = localStorage.getItem('cc_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setSession(data) {
    if (data.token) {
      localStorage.setItem('cc_token', data.token);
    }
    localStorage.setItem('cc_user', JSON.stringify(data));
  },
  clearSession() {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
  },
  isAuthenticated() {
    return !!this.getToken();
  },
  logout() {
    this.clearSession();
    window.location.href = '/login.html';
  },
  requireAuth(allowedRoles = []) {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    const user = this.getUser();
    if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
      showToast('Unauthorized access. Redirecting...', 'error');
      setTimeout(() => {
        if (user.role === 'ROLE_STUDENT') window.location.href = '/student-dashboard.html';
        else if (user.role === 'ROLE_FACULTY') window.location.href = '/faculty-dashboard.html';
        else if (user.role === 'ROLE_ADMIN') window.location.href = '/admin-dashboard.html';
        else window.location.href = '/login.html';
      }, 1000);
      return false;
    }
    return true;
  }
};

// Generic REST API Caller
const Api = {
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = Auth.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        Auth.clearSession();
        if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html') && window.location.pathname !== '/') {
          showToast('Session expired. Please log in again.', 'warning');
          setTimeout(() => {
            window.location.href = '/login.html';
          }, 1200);
        }
        throw new Error('Authentication required');
      }

      const resData = await response.json();

      if (!response.ok || resData.success === false) {
        let msg = resData.message || 'Operation failed';
        if (resData.validationErrors) {
          const detail = Object.values(resData.validationErrors).join(', ');
          msg = `${msg}: ${detail}`;
        }
        throw new Error(msg);
      }

      return resData;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// Modal Helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Formatters
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return 'N/A';
  const d = new Date(dateTimeStr);
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Sidebar Mobile Toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Populate user badge in sidebar if present
  const user = Auth.getUser();
  if (user) {
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    if (nameEl) nameEl.textContent = user.fullName || user.email;
    if (roleEl) {
      const cleanRole = user.role.replace('ROLE_', '').toLowerCase();
      roleEl.textContent = cleanRole;
    }
    if (avatarEl && user.fullName) {
      avatarEl.textContent = user.fullName.charAt(0).toUpperCase();
    }
  }
});
