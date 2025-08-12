const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const RefreshToken = require('./models/RefreshTokens');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_strong_secret';
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES_DAYS = parseInt(process.env.REFRESH_EXPIRES_DAYS || '7', 10);

// middleware used in server index.js: app.use(cookieParser());

// simple rate limiter for auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many requests' } });

// helpers
function generateAccessToken(user){
  return jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function generateRefreshTokenRaw(){
  return crypto.randomBytes(64).toString('hex');
}

async function saveRefreshToken(userId, rawToken, ip, userAgent){
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  const dbToken = new RefreshToken({ user: userId, tokenHash: hash, expiresAt, ip, userAgent });
  await dbToken.save();
  return dbToken;
}

async function revokeRefreshTokenByHash(hash, replacedBy){
  await RefreshToken.findOneAndUpdate({ tokenHash: hash }, { revoked: true, replacedByToken: replacedBy });
}

// Register (with validation)
router.post('/register', authLimiter, [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input', details: errors.array() });

  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ error: 'User exists' });
    const passwordHash = await bcrypt.hash(password, 12);

    const usr = new User({ username, email, passwordHash, failedLoginAttempts: 0 });
    await usr.save();

    // issue tokens
    const accessToken = generateAccessToken(usr);
    const rawRefresh = generateRefreshTokenRaw();
    await saveRefreshToken(usr._id, rawRefresh, req.ip, req.get('User-Agent'));

    // set httpOnly secure cookie for refresh token
    res.cookie('refreshToken', rawRefresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000 });

    res.json({ token: accessToken, user: { id: usr._id, username: usr.username, email: usr.email } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Registration failed' }); }
});

// Login (with lockout and validation)
router.post('/login', authLimiter, [
  body('usernameOrEmail').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input' });
  const { usernameOrEmail, password } = req.body;
  try{
    const usr = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    if (!usr) return res.status(401).json({ error: 'Invalid credentials' });

    // check lockout
    if (usr.lockUntil && usr.lockUntil > Date.now()) return res.status(403).json({ error: 'Account locked. Try later.' });

    const ok = await bcrypt.compare(password, usr.passwordHash);
    if (!ok){
      usr.failedLoginAttempts = (usr.failedLoginAttempts || 0) + 1;
      if (usr.failedLoginAttempts >= 5){
        usr.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lockout
      }
      await usr.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // reset attempts
    usr.failedLoginAttempts = 0;
    usr.lockUntil = undefined;
    await usr.save();

    const accessToken = generateAccessToken(usr);
    const rawRefresh = generateRefreshTokenRaw();
    await saveRefreshToken(usr._id, rawRefresh, req.ip, req.get('User-Agent'));
    res.cookie('refreshToken', rawRefresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000 });

    res.json({ token: accessToken, user: { id: usr._id, username: usr.username, email: usr.email } });
  }catch(err){ console.error(err); res.status(500).json({ error: 'Login failed' }); }
});

// Refresh endpoint: rotate refresh tokens
router.post('/refresh', authLimiter, async (req, res) => {
  try{
    const raw = req.cookies?.refreshToken;
    if (!raw) return res.status(401).json({ error: 'Missing refresh token' });
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const dbToken = await RefreshToken.findOne({ tokenHash: hash }).populate('user');
    if (!dbToken || dbToken.revoked) return res.status(401).json({ error: 'Invalid refresh token' });
    if (dbToken.expiresAt < new Date()) return res.status(401).json({ error: 'Refresh token expired' });

    // rotate: mark current revoked and issue new one
    const newRaw = generateRefreshTokenRaw();
    await revokeRefreshTokenByHash(hash, newRaw);
    await saveRefreshToken(dbToken.user._id, newRaw, req.ip, req.get('User-Agent'));

    const accessToken = generateAccessToken(dbToken.user);
    res.cookie('refreshToken', newRaw, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000 });
    res.json({ token: accessToken });
  }catch(err){ console.error(err); res.status(500).json({ error: 'Could not refresh' }); }
});

// Logout: revoke the refresh token cookie
router.post('/logout', authLimiter, async (req, res) => {
  try{
    const raw = req.cookies?.refreshToken;
    if (raw){
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      await RefreshToken.findOneAndUpdate({ tokenHash: hash }, { revoked: true });
    }
    res.clearCookie('refreshToken');
    res.json({ ok: true });
  }catch(err){ console.error(err); res.status(500).json({ error: 'Logout failed' }); }
});

module.exports = router;