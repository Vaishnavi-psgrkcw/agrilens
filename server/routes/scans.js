const express = require('express');
const router = express.Router();
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const pool = require('../db');
const auth = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// Upload an image -> forward to Flask ML API -> save result
router.post('/', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const { field_id } = req.body;

  try {
    const form = new FormData();
    form.append('image', req.file.buffer, { filename: req.file.originalname });

    const mlResponse = await fetch(`${process.env.ML_API_URL}/predict`, {
      method: 'POST',
      body: form,
    });

    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      return res.status(502).json({ error: 'ML API error', details: errText });
    }

    const result = await mlResponse.json();

    const saved = await pool.query(
      `INSERT INTO scans (
        user_id, field_id, predicted_class, confidence_percent,
        severity_percent, severity_label, treatment_summary,
        organic_treatment, chemical_treatment, prevention
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        req.user.id,
        field_id || null,
        result.predicted_class,
        result.confidence_percent,
        result.severity?.severity_percent || null,
        result.severity?.severity_label || null,
        result.treatment?.summary,
        result.treatment?.organic_treatment,
        result.treatment?.chemical_treatment,
        result.treatment?.prevention,
      ]
    );

    res.json({ scan: saved.rows[0], top_predictions: result.top_predictions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all scans for user (optionally filter by field)
router.get('/', auth, async (req, res) => {
  const { field_id } = req.query;
  try {
    const query = field_id
      ? 'SELECT * FROM scans WHERE user_id=$1 AND field_id=$2 ORDER BY scanned_at DESC'
      : 'SELECT * FROM scans WHERE user_id=$1 ORDER BY scanned_at DESC';
    const params = field_id ? [req.user.id, field_id] : [req.user.id];
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics: disease frequency + severity trend
router.get('/analytics', auth, async (req, res) => {
  try {
    const byDisease = await pool.query(
      `SELECT predicted_class, COUNT(*) as count, AVG(confidence_percent) as avg_confidence
       FROM scans WHERE user_id=$1 GROUP BY predicted_class ORDER BY count DESC`,
      [req.user.id]
    );
    const recent = await pool.query(
      `SELECT scanned_at, severity_percent, predicted_class FROM scans
       WHERE user_id=$1 ORDER BY scanned_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json({ byDisease: byDisease.rows, recent: recent.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
