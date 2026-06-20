import React, { useEffect, useState } from 'react';
import API from '../utils/api';

export default function Fields() {
  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({ field_name: '', crop_type: '' });

  useEffect(() => { load(); }, []);
  const load = () => API.get('/fields').then(r => setFields(r.data));

  const add = async () => {
    if (!form.field_name) return;
    await API.post('/fields', form);
    setForm({ field_name: '', crop_type: '' });
    load();
  };

  const del = async (id) => {
    await API.delete(`/fields/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="page-title">🌱 My Fields</h1>

      <div className="card" style={{ maxWidth: 450 }}>
        <h3 style={{ marginBottom: 12 }}>Add a Field</h3>
        <input placeholder="Field name (e.g. North Plot)" value={form.field_name} onChange={e => setForm({ ...form, field_name: e.target.value })} />
        <input placeholder="Crop type (e.g. Tomato)" value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })} />
        <button className="btn btn-primary" onClick={add}>Add Field</button>
      </div>

      <div>
        {fields.length === 0 && <div className="card" style={{ textAlign: 'center', color: '#9cb89a' }}>No fields added yet.</div>}
        {fields.map(f => (
          <div className="card" key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{f.field_name}</div>
              <div style={{ fontSize: 13, color: '#9cb89a' }}>{f.crop_type}</div>
            </div>
            <button className="btn btn-danger" onClick={() => del(f.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
