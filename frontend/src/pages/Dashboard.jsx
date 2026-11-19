import { useEffect, useState } from 'react';
import {
  Building2,
  Target,
  CalendarClock,
  AlertCircle,
  ArrowUpRight,
  Clock3,
  Plus,
  Users,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import api from '../api';
import { LeadFormModal } from '../components/LeadFormModal';

export function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [members, setMembers] = useState([]);

  async function loadDashboard() {
    try {
      const [dashRes, membersRes] = await Promise.all([
        api.get('/dashboard'),
        user.role === 'admin' ? api.get('/users') : Promise.resolve({ data: [] })
      ]);
      setData(dashRes.data);
      setMembers(membersRes.data);
      setError('');
    } catch {
      setError('Could not load workspace dashboard');
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (error) {
    return (
      <div className="page">
        <div className="alert-box alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page">
        <div className="empty-state">
          <p style={{ color: 'var(--text-muted)' }}>Loading LeadFlow dashboard…</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Businesses in Pipeline',
      value: data.total,
      icon: Building2,
      tone: 'neutral',
      sub: 'All recorded leads'
    },
    {
      label: 'High-Intent Prospects',
      value: data.interested,
      icon: Target,
      tone: 'green',
      sub: 'Active opportunities'
    },
    {
      label: 'Scheduled Follow-ups',
      value: data.pending,
      icon: CalendarClock,
      tone: 'amber',
      sub: 'Queued callbacks'
    },
    {
      label: 'Overdue Reminders',
      value: data.overdue,
      icon: AlertCircle,
      tone: 'red',
      sub: 'Requires prompt attention'
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Executive Summary</span>
          <h1 className="page-title">
            Welcome back, {user.name.split(' ')[0]}.
          </h1>
          <p className="page-desc">
            Here is your 3-member team pipeline status and latest outreach activity.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} /> Add Business
          </button>
        </div>
      </div>

      {/* Primary Metric Cards */}
      <div className="stats-grid">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div className="stat-card" key={idx}>
              <div className="stat-card-header">
                <span className="stat-card-label">{card.label}</span>
                <div className={`stat-card-icon ${card.tone}`}>
                  <Icon size={18} />
                </div>
              </div>
              <strong
                className="stat-card-value"
                style={{ color: card.tone === 'red' && card.value > 0 ? 'var(--status-red-text)' : 'inherit' }}
              >
                {card.value}
              </strong>
              <span className="stat-card-sub">{card.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Two Column Grid */}
      <div className="dashboard-grid">
        {/* Team Performance Panel */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Team Outreach & Attribution</h2>
              <p className="panel-subtitle">Lead ownership and conversions by member</p>
            </div>
            <Users size={18} style={{ color: 'var(--text-muted)' }} />
          </div>

          {data.team?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.team.map(m => {
                const isMe = m.id === user.id;
                return (
                  <div
                    key={m.id}
                    style={{
                      padding: '12px 14px',
                      background: isMe ? 'var(--primary-light)' : 'var(--bg-surface-subtle)',
                      border: `1px solid ${isMe ? 'var(--status-green-border)' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div className="avatar">
                      {m.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)', display: 'block' }}>
                        {m.name} {isMe && <span style={{ color: 'var(--primary-text)', fontWeight: '600' }}>(You)</span>}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {m.leads} leads assigned
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--primary-text)' }}>
                        {m.converted}
                      </strong>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-subtle)', display: 'block' }}>
                        converted
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              Team performance breakdown is visible to the Super Admin.
            </div>
          )}
        </section>

        {/* Recent Activity Timeline */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Recent Activity Feed</h2>
              <p className="panel-subtitle">Live updates recorded across the team</p>
            </div>
            <Clock3 size={18} style={{ color: 'var(--text-muted)' }} />
          </div>

          {data.recent?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.recent.slice(0, 5).map(act => (
                <div
                  key={act._id}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>
                      {act.lead?.businessName || 'Business Lead'}
                    </strong>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-subtle)' }}>
                      {new Date(act.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-body)', margin: 0 }}>
                    {act.summary}
                  </p>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    Recorded by {act.user?.name || 'Teammate'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No interactions recorded yet. Register businesses and log notes to see live activity here.
            </div>
          )}
        </section>
      </div>

      {/* Best Practice Callout */}
      <div className="info-callout primary" style={{ padding: '16px' }}>
        <Sparkles size={20} style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ fontSize: '13px' }}>Rule of Three: Coordinated Outreach</strong>
          <p style={{ margin: '3px 0 0', fontSize: '12px', lineHeight: 1.5 }}>
            Each of the 3 members can view the complete shared list to ensure no two people reach out to the same business. When you add a lead with your login, it is automatically stamped with your name and assigned to your queue.
          </p>
        </div>
      </div>

      {/* POPUP: Add Business Modal */}
      {isFormOpen && (
        <LeadFormModal
          lead={null}
          currentUser={user}
          members={members}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => {
            loadDashboard();
          }}
        />
      )}
    </div>
  );
}
