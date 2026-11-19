import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Download,
  Phone,
  CalendarClock,
  MoreHorizontal,
  Handshake,
  CheckCircle2,
  Building2,
  User,
  Filter,
  Check,
  Eye
} from 'lucide-react';
import api from '../api';
import { LeadDetailModal } from '../components/LeadDetailModal';
import { LeadFormModal } from '../components/LeadFormModal';
import { LogActivityModal } from '../components/LogActivityModal';
import { ScheduleFollowUpModal } from '../components/ScheduleFollowUpModal';
import { ConvertClientModal } from '../components/ConvertClientModal';

const STATUSES = [
  'New Lead',
  'First Call Completed',
  'Interested',
  'Portfolio Sent',
  'Proposal Sent',
  'Follow-up Required',
  'Negotiation',
  'Converted',
  'Not Interested',
  'No Response',
  'Lost'
];

export function Leads({ user }) {
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all'); // 'all', 'assigned_me', 'created_me'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();

  // Active Modals
  const [activeLead, setActiveLead] = useState(null); // for detail popup
  const [formModalLead, setFormModalLead] = useState(null); // null = new, object = edit, false = closed
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [logModalLead, setLogModalLead] = useState(null);
  const [scheduleModalLead, setScheduleModalLead] = useState(null);
  const [convertModalLead, setConvertModalLead] = useState(null);

  useEffect(() => {
    if (searchParams.get('add') === '1' || searchParams.get('add') === 'true') {
      setFormModalLead(null);
      setIsFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function loadData() {
    try {
      setLoading(true);
      const [leadsRes, membersRes] = await Promise.all([
        api.get('/leads'),
        user.role === 'admin' ? api.get('/users') : Promise.resolve({ data: [] })
      ]);
      setItems(leadsRes.data);
      setMembers(membersRes.data);
      setError('');
    } catch (err) {
      setError('Could not load businesses. Please check server connection.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Status filter
      if (statusFilter && item.status !== statusFilter) return false;

      // Scope filter (Attribution & assignment)
      if (scopeFilter === 'assigned_me') {
        const assignedId = item.assignedTo?._id || item.assignedTo;
        if (assignedId !== user.id) return false;
      } else if (scopeFilter === 'created_me') {
        const creatorId = item.createdBy?._id || item.createdBy;
        if (creatorId !== user.id) return false;
      }

      // Search term
      if (search.trim()) {
        const s = search.toLowerCase();
        const matches = [
          item.businessName,
          item.contactPerson,
          item.mobile,
          item.city,
          item.category,
          item.createdBy?.name,
          item.assignedTo?.name
        ].some(v => v?.toLowerCase().includes(s));
        if (!matches) return false;
      }

      return true;
    });
  }, [items, search, statusFilter, scopeFilter, user.id]);

  async function exportCsv() {
    try {
      const r = await api.get('/export/leads.csv', { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leadflow-businesses-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported businesses to CSV successfully');
    } catch {
      setError('Failed to download CSV export');
    }
  }

  return (
    <div className="page">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-msg">
          <CheckCircle2 size={16} style={{ color: 'var(--white-smoke)' }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow">Outreach & Relationships</span>
          <h1 className="page-title">Businesses & Leads</h1>
          <p className="page-desc">
            Organized outreach pipeline. Every business is attributed to the member who added it.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormModalLead(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={16} /> Add Business
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="toolbar">
        {/* Segment Tabs for Ownership / Attribution */}
        <div className="segment-tabs">
          <button
            type="button"
            className={`segment-tab ${scopeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setScopeFilter('all')}
          >
            All Businesses ({items.length})
          </button>
          <button
            type="button"
            className={`segment-tab ${scopeFilter === 'assigned_me' ? 'active' : ''}`}
            onClick={() => setScopeFilter('assigned_me')}
          >
            Assigned to Me ({items.filter(i => (i.assignedTo?._id || i.assignedTo) === user.id).length})
          </button>
          <button
            type="button"
            className={`segment-tab ${scopeFilter === 'created_me' ? 'active' : ''}`}
            onClick={() => setScopeFilter('created_me')}
          >
            Added by Me ({items.filter(i => (i.createdBy?._id || i.createdBy) === user.id).length})
          </button>
        </div>

        {/* Search */}
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search business name, phone, city, or owner…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status Dropdown */}
        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* CSV Export */}
        <button type="button" className="btn btn-secondary" onClick={exportCsv}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>BUSINESS & CITY</th>
                <th>CONTACT PERSON</th>
                <th>SERVICE</th>
                <th>STATUS</th>
                <th>ADDED BY (CREATOR)</th>
                <th>ASSIGNED TO</th>
                <th>NEXT FOLLOW-UP</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const isCreator = (item.createdBy?._id || item.createdBy) === user.id;
                const isAssigned = (item.assignedTo?._id || item.assignedTo) === user.id;

                return (
                  <tr
                    key={item._id}
                    className="interactive-row"
                    onClick={() => setActiveLead(item)}
                  >
                    <td>
                      <span className="td-strong">{item.businessName}</span>
                      <span className="td-sub">
                        {item.city ? `${item.city}` : 'No city'} {item.category && `· ${item.category}`}
                      </span>
                    </td>

                    <td>
                      <span className="td-strong">{item.contactPerson || '—'}</span>
                      <span className="td-sub">{item.mobile}</span>
                    </td>

                    <td>
                      <span className="badge badge-neutral">{item.service}</span>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          item.status === 'Converted'
                            ? 'badge-green'
                            : item.status.includes('Follow') || item.status.includes('Proposal')
                            ? 'badge-amber'
                            : item.status.includes('Not') || item.status.includes('Lost')
                            ? 'badge-red'
                            : 'badge-neutral'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Added By (Creator Attribution) */}
                    <td>
                      <div className={`user-tag ${isCreator ? 'creator' : ''}`} title={`Created by ${item.createdBy?.name || 'Teammate'}`}>
                        <div className="user-tag-avatar">
                          {(item.createdBy?.name || 'T').slice(0, 1).toUpperCase()}
                        </div>
                        <span>
                          {item.createdBy?.name || 'Team member'} {isCreator && '(You)'}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Handler */}
                    <td>
                      <div className="user-tag" title={`Assigned to ${item.assignedTo?.name || 'Teammate'}`}>
                        <div className="user-tag-avatar" style={{ background: 'var(--navy)' }}>
                          {(item.assignedTo?.name || 'T').slice(0, 1).toUpperCase()}
                        </div>
                        <span>
                          {item.assignedTo?.name || 'Unassigned'} {isAssigned && '(You)'}
                        </span>
                      </div>
                    </td>

                    <td>
                      {item.nextFollowUpAt ? (
                        <span style={{ fontSize: '11.5px', color: 'var(--status-amber-text)', fontWeight: '500' }}>
                          {new Date(item.nextFollowUpAt).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>—</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          className="btn-icon-only"
                          title="View complete business profile"
                          onClick={() => setActiveLead(item)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon-only"
                          title="Log phone / WhatsApp interaction"
                          onClick={() => setLogModalLead(item)}
                        >
                          <Phone size={15} />
                        </button>
                        <button
                          className="btn-icon-only"
                          title="Schedule follow-up reminder"
                          onClick={() => setScheduleModalLead(item)}
                        >
                          <CalendarClock size={15} />
                        </button>
                        {item.status !== 'Converted' && (
                          <button
                            className="btn-icon-only"
                            style={{ color: 'var(--primary)' }}
                            title="Convert to paying client"
                            onClick={() => setConvertModalLead(item)}
                          >
                            <Handshake size={15} />
                          </button>
                        )}
                        <button
                          className="btn-icon-only"
                          title="Edit lead specifications"
                          onClick={() => {
                            setFormModalLead(item);
                            setIsFormOpen(true);
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredItems.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">
                <Building2 size={24} />
              </div>
              <h3>No businesses found</h3>
              <p>
                {search || statusFilter || scopeFilter !== 'all'
                  ? 'No records match your active search or filter criteria. Try clearing filters.'
                  : 'Get started by adding your first business prospect using the button above.'}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFormModalLead(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus size={16} /> Add First Business
              </button>
            </div>
          )}
        </div>
      </div>

      {/* POPUP 1: Detail Drawer Modal */}
      {activeLead && (
        <LeadDetailModal
          lead={activeLead}
          currentUser={user}
          onClose={() => setActiveLead(null)}
          onEdit={l => {
            setActiveLead(null);
            setFormModalLead(l);
            setIsFormOpen(true);
          }}
          onLogActivity={l => {
            setLogModalLead(l);
          }}
          onScheduleFollowUp={l => {
            setScheduleModalLead(l);
          }}
          onConvert={l => {
            setConvertModalLead(l);
          }}
        />
      )}

      {/* POPUP 2: Add / Edit Business Modal */}
      {isFormOpen && (
        <LeadFormModal
          lead={formModalLead}
          currentUser={user}
          members={members}
          onClose={() => {
            setIsFormOpen(false);
            setFormModalLead(null);
          }}
          onSaved={() => {
            loadData();
            showToast(formModalLead ? 'Business updated successfully' : 'Business created and stored in your name');
          }}
        />
      )}

      {/* POPUP 3: Log Activity / Interaction Modal (Replaces prompt) */}
      {logModalLead && (
        <LogActivityModal
          lead={logModalLead}
          onClose={() => setLogModalLead(null)}
          onSaved={() => {
            loadData();
            showToast('Interaction recorded on timeline');
          }}
        />
      )}

      {/* POPUP 4: Schedule Follow-up Modal (Replaces prompt) */}
      {scheduleModalLead && (
        <ScheduleFollowUpModal
          lead={scheduleModalLead}
          onClose={() => setScheduleModalLead(null)}
          onSaved={() => {
            loadData();
            showToast('Follow-up scheduled with reminder queue');
          }}
        />
      )}

      {/* POPUP 5: Convert to Client Modal (Replaces confirm & prompt) */}
      {convertModalLead && (
        <ConvertClientModal
          lead={convertModalLead}
          onClose={() => setConvertModalLead(null)}
          onConverted={() => {
            loadData();
            showToast('Business converted into an active client!');
          }}
        />
      )}
    </div>
  );
}
