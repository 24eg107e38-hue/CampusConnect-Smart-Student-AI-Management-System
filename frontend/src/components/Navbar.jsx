import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title, onToggleSidebar }) {
  const { user, logout } = useAuth();

  const getRoleLabel = (role) => {
    if (role === 'ROLE_ADMIN') return 'System Administrator';
    if (role === 'ROLE_FACULTY') return 'Faculty Member';
    return 'Student';
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'ROLE_ADMIN') return 'badge-danger';
    if (role === 'ROLE_FACULTY') return 'badge-info';
    return 'badge-primary';
  };

  return (
    <nav className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Toggle Navigation"
        >
          ☰
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
          {title || 'CampusConnect Portal'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {user && (
          <>
            <span className={`badge ${getRoleBadgeClass(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)' }}>
              {user.fullName || user.username}
            </span>
            <button className="btn btn-outline btn-sm" onClick={logout}>
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
