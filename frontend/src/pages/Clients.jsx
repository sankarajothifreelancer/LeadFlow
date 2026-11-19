import { useEffect, useState } from 'react';
import {
  BriefcaseBusiness,
  Plus,
  IndianRupee,
  FolderKanban,
  Receipt,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import api from '../api';
import { Modal } from '../components/Modal';

export function Clients({ user }) {
  const [items, setItems] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Sub-modals
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Forms
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    agreedAmount: 0,
    status: 'In Progress'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'UPI',
    reference: '',
    notes: ''
  });

  const [savingAction, setSavingAction] = useState(false);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function loadClients() {
    try {
      setLoading(true);
      const res = await api.get('/clients');
      setItems(res.data);
      setError('');
    } catch {
      setError('Unable to load clients database');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function openClientDrawer(client) {
    setSelectedClient(client);
    try {
      const [projRes, payRes] = await Promise.all([
        api.get(`/clients/${client._id}/projects`),
        api.get(`/clients/${client._id}/payments`)
      ]);
      setProjects(projRes.data);
      setPayments(payRes.data);
    } catch {
      setError('Could not load client details');
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!projectForm.name.trim()) return;
    setSavingAction(true);
    try {
      await api.post(`/clients/${selectedClient._id}/projects`, projectForm);
      setProjectForm({ name: '', description: '', agreedAmount: 0, status: 'In Progress' });
      setShowAddProject(false);
      showToast('Project created successfully');
      await openClientDrawer(selectedClient);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create project');
    } finally {
      setSavingAction(false);
    }
  }

  async function handleRecordPayment(e) {
    e.preventDefault();
    const amt = Number(paymentForm.amount);
    if (!amt || amt <= 0) {
      setError('Enter a valid payment amount');
      return;
    }
    setSavingAction(true);
    try {
      await api.post(`/clients/${selectedClient._id}/payments`, {
        ...paymentForm,
        amount: amt
      });
      setPaymentForm({ amount: '', method: 'UPI', reference: '', notes: '' });
      setShowAddPayment(false);
      showToast('Payment transaction recorded');
      await openClientDrawer(selectedClient);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not record payment');
    } finally {
      setSavingAction(false);
    }
  }

  const formatINR = n =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="page">
      {toast && (
        <div className="toast-msg">
          <CheckCircle2 size={16} style={{ color: 'var(--white-smoke)' }} />
          <span>{toast}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <span className="eyebrow">Client Accounts</span>
          <h1 className="page-title">Clients & Projects</h1>
          <p className="page-desc">
            Converted businesses, active deliverable projects, and payment tracking.
          </p>
        </div>
        <div className="header-actions">
          <div className="workspace-badge">
            <BriefcaseBusiness size={14} />
            <span>{items.length} Converted Clients</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Client Cards */}
      <div className="card-grid">
        {items.map(client => {
          const isCreator = (client.createdBy?._id || client.createdBy) === user.id;
          const isAssigned = (client.assignedTo?._id || client.assignedTo) === user.id;

          return (
            <div
              key={client._id}
              className="card-item"
              style={{ cursor: 'pointer' }}
              onClick={() => openClientDrawer(client)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div className="stat-card-icon green">
                  <BriefcaseBusiness size={18} />
                </div>
                <span className="badge badge-green">Active Client</span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                {client.businessName}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {client.contactPerson || client.mobile || 'No contact person added'}
              </p>

              {/* Attribution */}
              <div
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '11.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Created by:</span>
                  <strong>{client.createdBy?.name || 'Teammate'} {isCreator && '(You)'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Managed by:</span>
                  <strong>{client.assignedTo?.name || 'Unassigned'} {isAssigned && '(You)'}</strong>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-subtle)', display: 'block' }}>Contract Value</span>
                  <strong style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                    {formatINR(client.agreedAmount)}
                  </strong>
                </div>

                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: '600', fontSize: '12px' }}>
                  Manage <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && !loading && (
        <div className="panel empty-state">
          <div className="empty-icon">
            <BriefcaseBusiness size={24} />
          </div>
          <h3>No converted clients yet</h3>
          <p>
            When a business agrees to work with your team, click the <strong>Convert to Client</strong> action in the Businesses tab.
          </p>
        </div>
      )}

      {/* POPUP 1: Client Overview & Management Drawer */}
      {selectedClient && (
        <Modal
          title={selectedClient.businessName}
          subtitle={`Client Account · Handled by ${selectedClient.assignedTo?.name || user.name}`}
          icon={BriefcaseBusiness}
          size="lg"
          onClose={() => setSelectedClient(null)}
        >
          <div className="modal-body">
            {/* Summary Banner */}
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item-label">Contact Person</span>
                <span className="detail-item-val">{selectedClient.contactPerson || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Mobile Number</span>
                <span className="detail-item-val">{selectedClient.mobile}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Contract Amount</span>
                <span className="detail-item-val" style={{ color: 'var(--primary-text)' }}>
                  {formatINR(selectedClient.agreedAmount)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Account Handler</span>
                <span className="detail-item-val">
                  {selectedClient.assignedTo?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Projects Section */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '14.5px' }}>Delivery Projects</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Tasks and milestones</p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddProject(true)}
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  No active projects logged. Click <em>Add Project</em> to track delivery.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projects.map(p => (
                    <div
                      key={p._id}
                      style={{
                        padding: '12px 16px',
                        background: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '13px' }}>{p.name}</strong>
                        {p.description && (
                          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            {p.description}
                          </p>
                        )}
                      </div>
                      <span className="badge badge-neutral">{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments Section */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '14.5px' }}>Payment History</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Invoices and receipts recorded</p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddPayment(true)}
                >
                  <Plus size={14} /> Record Payment
                </button>
              </div>

              {payments.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  No payments recorded yet. Click <em>Record Payment</em> when funds are received.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {payments.map(pay => (
                    <div
                      key={pay._id}
                      style={{
                        padding: '12px 16px',
                        background: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '13.5px', color: 'var(--status-green-text)' }}>
                          {formatINR(pay.amount)}
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                          via {pay.method} {pay.reference && `(${pay.reference})`}
                        </span>
                        {pay.notes && (
                          <p style={{ fontSize: '11px', color: 'var(--text-subtle)', margin: '2px 0 0' }}>
                            {pay.notes}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                        {new Date(pay.paidAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedClient(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* POPUP 2: Add Project Modal */}
      {showAddProject && (
        <Modal
          title="New Project Scope"
          subtitle={`Create a work package for ${selectedClient.businessName}`}
          icon={FolderKanban}
          size="md"
          onClose={() => setShowAddProject(false)}
        >
          <form onSubmit={handleCreateProject}>
            <div className="modal-body">
              <div className="form-field">
                <label>Project Name <span className="req">*</span></label>
                <input
                  required
                  className="form-input"
                  placeholder="e.g. Website Redesign & CMS Integration"
                  value={projectForm.name}
                  onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Description / Deliverables</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. 5 pages, responsive design, contact form, SEO tags"
                  value={projectForm.description}
                  onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Status</label>
                  <select
                    className="form-select"
                    value={projectForm.status}
                    onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Agreed Project Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={projectForm.agreedAmount}
                    onChange={e => setProjectForm({ ...projectForm, agreedAmount: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddProject(false)}
                disabled={savingAction}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingAction}
              >
                {savingAction ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* POPUP 3: Record Payment Modal */}
      {showAddPayment && (
        <Modal
          title="Record Payment"
          subtitle={`Log payment received from ${selectedClient.businessName}`}
          icon={CreditCard}
          size="md"
          onClose={() => setShowAddPayment(false)}
        >
          <form onSubmit={handleRecordPayment}>
            <div className="modal-body">
              <div className="form-field">
                <label>Amount (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  required
                  className="form-input"
                  placeholder="e.g. 25000"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentForm.method}
                    onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Card / Stripe</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Reference / Transaction ID</label>
                  <input
                    className="form-input"
                    placeholder="e.g. UPI Ref / Txn ID"
                    value={paymentForm.reference}
                    onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Internal Notes</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="e.g. 50% advance for milestone 1"
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddPayment(false)}
                disabled={savingAction}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingAction}
              >
                {savingAction ? 'Recording…' : 'Record Payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
