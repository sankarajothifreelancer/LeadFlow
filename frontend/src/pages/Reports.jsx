import { useEffect, useState } from 'react';
import { ChartColumn, Download, PieChart, Layers } from 'lucide-react';
import api from '../api';

export function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/reports')
      .then(r => setData(r.data))
      .catch(() => setError('Unable to load analytics data'));
  }, []);

  async function exportCsv() {
    try {
      const r = await api.get('/export/leads.csv', { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leadflow-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download CSV export');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Intelligence</span>
          <h1 className="page-title">Pipeline Reports</h1>
          <p className="page-desc">
            Visual breakdown of lead stages and service demand across your team.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={exportCsv}>
            <Download size={15} /> Export Complete CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>{error}</span>
        </div>
      )}

      {!data ? (
        <div className="panel empty-state">
          <p style={{ color: 'var(--text-muted)' }}>Loading analytics breakdown…</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Breakdown by Status */}
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Businesses by Stage</h2>
                <p className="panel-subtitle">Pipeline progression breakdown</p>
              </div>
              <PieChart size={18} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.byStatus.map(x => {
                const max = Math.max(...data.byStatus.map(y => y.count), 1);
                const pct = Math.max(5, (x.count / max) * 100);

                return (
                  <div key={x._id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--text-body)' }}>{x._id}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{x.count}</strong>
                    </div>
                    <div
                      style={{
                        height: '7px',
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-pill)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--primary)',
                          borderRadius: 'var(--radius-pill)',
                          transition: 'width 300ms ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Breakdown by Service */}
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Leads by Requested Service</h2>
                <p className="panel-subtitle">Market demand across offerings</p>
              </div>
              <Layers size={18} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.byService.map(x => {
                const max = Math.max(...data.byService.map(y => y.count), 1);
                const pct = Math.max(5, (x.count / max) * 100);

                return (
                  <div key={x._id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--text-body)' }}>{x._id}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{x.count}</strong>
                    </div>
                    <div
                      style={{
                        height: '7px',
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-pill)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--navy)',
                          borderRadius: 'var(--radius-pill)',
                          transition: 'width 300ms ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
