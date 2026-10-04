import React, { createContext, useContext, useState, useEffect } from 'react';
import { Api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const normalizeUser = (data) => {
    if (!data) return null;
    return {
      ...data,
      id: data.userId || data.id,
      userId: data.userId || data.id,
      studentId: data.profileId || data.studentId,
      facultyId: data.profileId || data.facultyId,
    };
  };

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cc_user');
    return saved ? normalizeUser(JSON.parse(saved)) : null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await Api.post('/auth/login', { email, password });
      const data = res.data;
      if (data.token) {
        localStorage.setItem('cc_token', data.token);
      }
      const normalized = normalizeUser(data);
      localStorage.setItem('cc_user', JSON.stringify(normalized));
      setUser(normalized);
      return normalized;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await Api.post('/auth/register', formData);
      const data = res.data;
      if (data.token) {
        localStorage.setItem('cc_token', data.token);
      }
      const normalized = normalizeUser(data);
      localStorage.setItem('cc_user', JSON.stringify(normalized));
      setUser(normalized);
      return normalized;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
