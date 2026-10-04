import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');

  // Handle URL hash changes or reset page on logout
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['landing', 'login', 'register'].includes(hash)) {
        setCurrentPage(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.location.hash = page;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#fff',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', borderColor: '#4f46e5', borderTopColor: 'transparent' }}></div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Loading CampusConnect...</div>
        </div>
      </div>
    );
  }

  // If authenticated, render role-specific dashboard
  if (isAuthenticated && user) {
    const role = user.role || '';
    if (role === 'ROLE_ADMIN') {
      return <AdminDashboard />;
    } else if (role === 'ROLE_FACULTY') {
      return <FacultyDashboard />;
    } else {
      return <StudentDashboard />;
    }
  }

  // Unauthenticated routing
  if (currentPage === 'login') {
    return <LoginPage onNavigate={navigateTo} />;
  }
  if (currentPage === 'register') {
    return <RegisterPage onNavigate={navigateTo} />;
  }

  return <LandingPage onNavigate={navigateTo} />;
}
