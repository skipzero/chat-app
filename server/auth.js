const express2 = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const router = express2.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'DEMO_SECRET';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ error: 'User exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const usr = new User({ username, email, passwordHash });
    await usr.save();
    const token = jwt.sign({ userId: usr._id, username: usr.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: { id: usr._id, username: usr.username, email: usr.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const usr = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    if (!usr) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, usr.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: usr._id, username: usr.username }, JWT_SECRET2, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: { id: usr._id, username: usr.username, email: usr.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;