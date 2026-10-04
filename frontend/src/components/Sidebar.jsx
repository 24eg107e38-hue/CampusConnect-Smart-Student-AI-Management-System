import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ items, activeTab, onSelectTab, isOpen, onClose }) {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">🎓</div>
        <div>
          <div className="brand-title">CampusConnect</div>
          <div className="brand-sub">Smart Campus AI</div>
        </div>
      </div>

      <ul className="sidebar-menu">
        {items.map((item) => (
          <li key={item.id}>
            <button
              className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                onSelectTab(item.id);
                if (window.innerWidth <= 992 && onClose) onClose();
              }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}

        <li style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="sidebar-link" onClick={logout}>
            <span className="sidebar-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </li>
      </ul>

      {user && (
        <div className="sidebar-footer">
          <div className="user-snippet">
            <div className="avatar-circle">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName || user.username}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
