import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillCredentials = (role) => {
    if (role === 'student-risk') {
      setEmail('rahul.sharma@campusconnect.edu');
      setPassword('Student@123');
    } else if (role === 'student-honor') {
      setEmail('priya.patel@campusconnect.edu');
      setPassword('Student@123');
    } else if (role === 'faculty') {
      setEmail('faculty.cse@campusconnect.edu');
      setPassword('Faculty@123');
    } else if (role === 'admin') {
      setEmail('admin@campusconnect.edu');
      setPassword('Admin@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Navigation is handled automatically by App.jsx observing user state
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', padding: '36px', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎓</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            CampusConnect Sign In
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Access your student, faculty, or admin academic portal
          </p>
        </div>

        {/* 1-Click Demo Login Fillers */}
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '22px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
            ⚡ 1-Click Demo Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillCredentials('student-risk')}
              style={{ fontSize: '11.5px', justifyContent: 'flex-start' }}
            >
              🎓 Student (At-Risk)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillCredentials('student-honor')}
              style={{ fontSize: '11.5px', justifyContent: 'flex-start' }}
            >
              🌟 Student (Honors)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillCredentials('faculty')}
              style={{ fontSize: '11.5px', justifyContent: 'flex-start' }}
            >
              👩‍🏫 Faculty Member
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillCredentials('admin')}
              style={{ fontSize: '11.5px', justifyContent: 'flex-start' }}
            >
              🛡️ System Admin
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 14px', background: 'var(--danger-light)', color: '#b91c1c', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '18px', border: '1px solid #fecaca' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Campus Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. rahul.sharma@campusconnect.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '14px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
          >
            Register Student
          </button>
        </div>

        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            onClick={() => onNavigate('landing')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
