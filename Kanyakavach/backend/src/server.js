require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '32kb' }));

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kanyakavach',
  waitForConnections: true,
  connectionLimit: 10,
});

function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Please log in.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, database: 'connected' }); }
  catch { res.status(503).json({ ok: false, database: 'unavailable' }); }
});

app.post('/auth/register', async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!String(name || '').trim() || !/^[0-9]{10}$/.test(String(phone || '')) || !/^\S+@\S+\.\S+$/.test(cleanEmail) || String(password || '').length < 8)
      return res.status(400).json({ error: 'Enter your name, a valid 10-digit phone, email, and password of at least 8 characters.' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute('INSERT INTO users (full_name, phone, email, password_hash) VALUES (?, ?, ?, ?)', [String(name).trim(), phone, cleanEmail, hash]);
    const user = { id: result.insertId, name: String(name).trim(), phone, email: cleanEmail };
    res.status(201).json({ token: makeToken(user), user });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'An account with this email already exists.' });
    next(err);
  }
});

app.post('/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const [rows] = await pool.execute('SELECT id, full_name, phone, email, password_hash FROM users WHERE email = ?', [email]);
    if (!rows.length || !(await bcrypt.compare(String(req.body.password || ''), rows[0].password_hash)) )
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    const user = { id: rows[0].id, name: rows[0].full_name, phone: rows[0].phone, email: rows[0].email };
    res.json({ token: makeToken(user), user });
  } catch (err) { next(err); }
});

app.get('/auth/me', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, full_name AS name, phone, email, created_at AS createdAt FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Account not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

app.get('/contacts', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, phone, relation, is_primary AS primaryContact FROM emergency_contacts WHERE user_id = ? ORDER BY is_primary DESC, id', [req.user.id]);
    res.json(rows.map(row => ({ ...row, primary: Boolean(row.primaryContact), primaryContact: undefined })));
  } catch (err) { next(err); }
});

app.post('/contacts', auth, async (req, res, next) => {
  const { name, phone, relation } = req.body;
  if (!String(name || '').trim() || !/^[0-9]{10}$/.test(String(phone || '')) || !String(relation || '').trim())
    return res.status(400).json({ error: 'Enter a name, valid 10-digit phone, and relationship.' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [countRows] = await connection.execute('SELECT COUNT(*) AS total FROM emergency_contacts WHERE user_id = ? FOR UPDATE', [req.user.id]);
    if (countRows[0].total >= 5) { await connection.rollback(); return res.status(400).json({ error: 'You can add up to 5 emergency contacts.' }); }
    const primary = countRows[0].total === 0;
    const [result] = await connection.execute('INSERT INTO emergency_contacts (user_id, name, phone, relation, is_primary) VALUES (?, ?, ?, ?, ?)', [req.user.id, String(name).trim(), phone, String(relation).trim(), primary]);
    await connection.commit();
    res.status(201).json({ id: result.insertId, name: String(name).trim(), phone, relation: String(relation).trim(), primary });
  } catch (err) { await connection.rollback(); if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This phone number is already added.' }); next(err); }
  finally { connection.release(); }
});

app.patch('/contacts/:id/primary', auth, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute('SELECT id FROM emergency_contacts WHERE id = ? AND user_id = ? FOR UPDATE', [req.params.id, req.user.id]);
    if (!rows.length) { await connection.rollback(); return res.status(404).json({ error: 'Contact not found.' }); }
    await connection.execute('UPDATE emergency_contacts SET is_primary = (id = ?) WHERE user_id = ?', [req.params.id, req.user.id]);
    await connection.commit(); res.json({ ok: true });
  } catch (err) { await connection.rollback(); next(err); } finally { connection.release(); }
});

app.delete('/contacts/:id', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT is_primary FROM emergency_contacts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Contact not found.' });
    await pool.execute('DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows[0].is_primary) {
      await pool.execute('UPDATE emergency_contacts SET is_primary = TRUE WHERE user_id = ? ORDER BY id LIMIT 1', [req.user.id]);
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

app.post('/sos-events', auth, async (req, res, next) => {
  try {
    const { latitude, longitude, contactsCount, status } = req.body;
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 || !Number.isInteger(contactsCount) || contactsCount < 0 || contactsCount > 5 || !['sent', 'cancelled', 'prepared'].includes(status))
      return res.status(400).json({ error: 'Invalid SOS event.' });
    const [result] = await pool.execute('INSERT INTO sos_events (user_id, latitude, longitude, contacts_count, status) VALUES (?, ?, ?, ?, ?)', [req.user.id, latitude, longitude, contactsCount, status]);
    res.status(201).json({ id: result.insertId });
  } catch (err) { next(err); }
});

app.get('/sos-events', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, created_at AS date, latitude, longitude, contacts_count AS contactsCount, status FROM sos_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
});

app.get('/trips/active', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT id, start_location AS start, destination, expected_time AS expectedTime, started_at AS startedAt FROM safety_trips WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1", [req.user.id]);
    res.json(rows[0] || null);
  } catch (err) { next(err); }
});

app.post('/trips', auth, async (req, res, next) => {
  try {
    const { start, destination, expectedTime } = req.body;
    if (![start, destination, expectedTime].every(value => typeof value === 'string' && value.trim()))
      return res.status(400).json({ error: 'Enter the start, destination, and expected time.' });
    const [active] = await pool.execute("SELECT id FROM safety_trips WHERE user_id = ? AND status = 'active' LIMIT 1", [req.user.id]);
    if (active.length) return res.status(409).json({ error: 'You already have an active trip.' });
    const startedAt = new Date();
    const [result] = await pool.execute('INSERT INTO safety_trips (user_id, start_location, destination, expected_time, started_at) VALUES (?, ?, ?, ?, ?)', [req.user.id, start.trim(), destination.trim(), expectedTime.trim(), startedAt]);
    res.status(201).json({ id: result.insertId, start: start.trim(), destination: destination.trim(), expectedTime: expectedTime.trim(), startedAt: startedAt.toISOString() });
  } catch (err) { next(err); }
});

app.patch('/trips/:id/end', auth, async (req, res, next) => {
  try {
    const [result] = await pool.execute("UPDATE safety_trips SET status = 'completed', ended_at = NOW() WHERE id = ? AND user_id = ? AND status = 'active'", [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Active trip not found.' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Server error. Check the API and database configuration.' });
});

const port = Number(process.env.PORT || 3000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('Set JWT_SECRET to a random secret of at least 32 characters in backend/.env');
  process.exit(1);
}
app.listen(port, '0.0.0.0', () => console.log(`Kanyakavach API listening on port ${port}`));
