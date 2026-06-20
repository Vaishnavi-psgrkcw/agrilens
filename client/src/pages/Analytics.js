import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import API from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Analytics() {
  const [data, setData] = useState({ byDisease: [], recent: [] });

  useEffect(() => { API.get('/scans/analytics').then(r => setData(r.data)); }, []);

  const barData = {
    labels: data.byDisease.map(d => d.predicted_class?.replace(/_/g, ' ')),
    datasets: [{
      label: 'Times Detected',
      data: data.byDisease.map(d => parseInt(d.count)),
      backgroundColor: '#4caf50',
      borderRadius: 6,
    }],
  };

  const totalScans = data.byDisease.reduce((s, d) => s + parseInt(d.count), 0);
  const healthyScans = data.byDisease.find(d => d.predicted_class?.includes('healthy'));
  const healthyRate = totalScans > 0 ? Math.round(((healthyScans?.count || 0) / totalScans) * 100) : 0;

  return (
    <div>
      <h1 className="page-title">📊 Analytics</h1>

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card"><h2>{totalScans}</h2><p>Total Scans</p></div>
        <div className="stat-card"><h2>{data.byDisease.length}</h2><p>Distinct Conditions Found</p></div>
        <div className="stat-card"><h2>{healthyRate}%</h2><p>Healthy Scan Rate</p></div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Disease Frequency</h3>
        {data.byDisease.length > 0
          ? <Bar data={barData} options={{
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#9cb89a' }, grid: { color: '#16241a' } },
                y: { ticks: { color: '#9cb89a' }, grid: { color: '#2a3d2a' } },
              },
            }} />
          : <p style={{ color: '#9cb89a', textAlign: 'center' }}>No scans yet</p>}
      </div>
    </div>
  );
}
