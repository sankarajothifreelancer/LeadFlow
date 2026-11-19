import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarClock,
  Users,
  Handshake,
  ChartColumn,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

export function Layout({ user, onLogout, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Impressive Brand Header */}
        <div className="brand">
          <div className="brand-logo-wrap">
            <img src="/logo.png" alt="LeadFlow" className="brand-logo-img" />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-title">LeadFlow</span>
              <span className="brand-edition-tag">CRM</span>
            </div>
            <span className="brand-sub">Private 3-Member Workspace</span>
          </div>
          <button
            className="btn-icon-only mobile-close-btn"
            style={{ marginLeft: 'auto' }}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Core Pipeline */}
        <div className="nav-section-title">Core Pipeline</div>
        <nav className="nav-group">
          <NavLink
            to="/"
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-box">
              <LayoutDashboard size={16} />
            </div>
            <span className="nav-label">Dashboard</span>
            <span className="nav-active-pill" />
          </NavLink>

          <NavLink
            to="/leads"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-box">
              <Building2 size={16} />
            </div>
            <span className="nav-label">Businesses</span>
            <span className="nav-active-pill" />
          </NavLink>

          <NavLink
            to="/follow-ups"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-box">
              <CalendarClock size={16} />
            </div>
            <span className="nav-label">Follow-ups</span>
            <span className="nav-active-pill" />
          </NavLink>

          <NavLink
            to="/clients"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-box">
              <Handshake size={16} />
            </div>
            <span className="nav-label">Clients & Projects</span>
            <span className="nav-active-pill" />
          </NavLink>
        </nav>

        {/* Section 2: Workspace Management */}
        <div className="nav-section-title" style={{ marginTop: '16px' }}>Intelligence & Team</div>
        <nav className="nav-group">
          <NavLink
            to="/reports"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-box">
              <ChartColumn size={16} />
            </div>
            <span className="nav-label">Reports & Analytics</span>
            <span className="nav-active-pill" />
          </NavLink>

          {user.role === 'admin' && (
            <NavLink
              to="/team"
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-box">
                <Users size={16} />
              </div>
              <span className="nav-label">Team Members</span>
              <span className="nav-seat-badge">3 Seats</span>
              <span className="nav-active-pill" />
            </NavLink>
          )}
        </nav>

        {/* Impressive Bottom User Card */}
        <div className="sidebar-bottom">
          <div className="user-profile-badge">
            <div className="user-avatar-wrap">
              <div className="avatar-initials">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="avatar-online-dot" />
            </div>
            <div className="user-meta-info">
              <span className="user-meta-name" title={user.name}>
                {user.name}
              </span>
              <span className="user-meta-role-pill">
                {user.role === 'admin' ? 'Super Admin' : 'Team Member'}
              </span>
            </div>
            <button
              className="btn-logout-sidebar"
              title="Sign out of CRM"
              onClick={onLogout}
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="btn-icon-only mobile-toggle"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="topbar-title">LeadFlow Workspace</div>
          </div>
          <div className="topbar-right">
            <div className="user-tag creator">
              <div className="user-tag-avatar">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <span>{user.name}</span>
            </div>
          </div>
        </header>

        <div className="content">{children}</div>
      </main>
    </div>
  );
}
