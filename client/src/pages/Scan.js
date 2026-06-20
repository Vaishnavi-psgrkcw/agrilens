import React, { useState, useEffect, useRef } from 'react';
import API from '../utils/api';

const severityClass = { Minimal: 'badge-healthy', Mild: 'badge-mild', Moderate: 'badge-moderate', Severe: 'badge-severe' };

export default function Scan() {
  const [fields, setFields] = useState([]);
  const [fieldId, setFieldId] = useState('');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef();

  useEffect(() => { API.get('/fields').then(r => setFields(r.data)); }, []);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const scan = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (fieldId) formData.append('field_id', fieldId);

      const { data } = await API.post('/scans', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Scan failed. Make sure the ML API (Flask) is running with a trained model.');
    }
    setLoading(false);
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(''); };

  return (
    <div>
      <h1 className="page-title">📷 Scan a Leaf</h1>

      {fields.length > 0 && (
        <div style={{ maxWidth: 400, marginBottom: 16 }}>
          <select value={fieldId} onChange={e => setFieldId(e.target.value)}>
            <option value="">No field selected</option>
            {fields.map(f => <option key={f.id} value={f.id}>{f.field_name} ({f.crop_type})</option>)}
          </select>
        </div>
      )}

      {!result ? (
        <div className="card">
          {!preview ? (
            <div
              className={`dropzone ${dragActive ? 'active' : ''}`}
              onClick={() => inputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Click or drag a leaf photo here</p>
              <p style={{ color: '#9cb89a', fontSize: 13 }}>JPG or PNG, clear photo of a single leaf works best</p>
              <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div>
              <img src={preview} alt="leaf preview" style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8, marginBottom: 16 }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" onClick={scan} disabled={loading}>
                  {loading ? '🔬 Analyzing...' : '🔬 Analyze Leaf'}
                </button>
                <button className="btn btn-secondary" onClick={reset}>Choose Different Photo</button>
              </div>
            </div>
          )}
          {error && <div style={{ color: '#ef4444', marginTop: 16, fontSize: 14 }}>{error}</div>}
        </div>
      ) : (
        <div>
          <div className="grid-2">
            <div className="card">
              <img src={preview} alt="scanned leaf" style={{ width: '100%', borderRadius: 8 }} />
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: '#4caf50', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
                Detected
              </div>
              <h2 style={{ fontSize: 22, marginBottom: 8 }}>{result.scan.predicted_class?.replace(/_/g, ' ')}</h2>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#9cb89a' }}>Confidence: </span>
                <span style={{ fontWeight: 700 }}>{result.scan.confidence_percent}%</span>
                <div className="score-bar"><div className="score-fill" style={{ width: `${result.scan.confidence_percent}%` }} /></div>
              </div>

              {result.scan.severity_label && (
                <div style={{ marginBottom: 16 }}>
                  <span className={`badge ${severityClass[result.scan.severity_label] || 'badge-mild'}`}>
                    {result.scan.severity_label} severity ({result.scan.severity_percent}% affected)
                  </span>
                </div>
              )}

              {result.top_predictions && (
                <div>
                  <div style={{ fontSize: 12, color: '#9cb89a', marginBottom: 6 }}>Other possibilities:</div>
                  {result.top_predictions.slice(1).map((p, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#9cb89a' }}>
                      {p.class?.replace(/_/g, ' ')} — {p.confidence}%
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>💊 Treatment Advice</h3>
            <p style={{ color: '#cfe0cb', marginBottom: 16 }}>{result.scan.treatment_summary}</p>
            <div className="grid-2">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#4caf50', marginBottom: 6 }}>🌿 Organic</div>
                <p style={{ fontSize: 14, color: '#cfe0cb' }}>{result.scan.organic_treatment}</p>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f9a825', marginBottom: 6 }}>⚗️ Chemical</div>
                <p style={{ fontSize: 14, color: '#cfe0cb' }}>{result.scan.chemical_treatment}</p>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#9cb89a', marginBottom: 6 }}>🛡️ Prevention</div>
              <p style={{ fontSize: 14, color: '#cfe0cb' }}>{result.scan.prevention}</p>
            </div>
          </div>

          <button className="btn btn-primary" onClick={reset}>📷 Scan Another Leaf</button>
        </div>
      )}
    </div>
  );
}
