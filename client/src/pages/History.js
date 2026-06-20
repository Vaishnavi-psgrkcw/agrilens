import React, { useEffect, useState } from 'react';
import API from '../utils/api';

const severityClass = { Minimal: 'badge-healthy', Mild: 'badge-mild', Moderate: 'badge-moderate', Severe: 'badge-severe' };

export default function History() {
  const [scans, setScans] = useState([]);

  useEffect(() => { API.get('/scans').then(r => setScans(r.data)); }, []);

  return (
    <div>
      <h1 className="page-title">📋 Scan History</h1>
      {scans.length === 0 && <div className="card" style={{ textAlign: 'center', color: '#9cb89a' }}>No scans yet. Go scan a leaf! 🌿</div>}
      {scans.map(s => (
        <div className="card" key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.predicted_class?.replace(/_/g, ' ')}</div>
            <div style={{ fontSize: 12, color: '#9cb89a' }}>{new Date(s.scanned_at).toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {s.severity_label && (
              <span className={`badge ${severityClass[s.severity_label] || 'badge-mild'}`}>
                {s.severity_label}
              </span>
            )}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#4caf50' }}>{s.confidence_percent}%</div>
              <div style={{ fontSize: 11, color: '#9cb89a' }}>confidence</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
