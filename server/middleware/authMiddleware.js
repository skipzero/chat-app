const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'DEMO_SECRET';

function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Bad token format' });
  try{
    const payload = jwt.verify(parts[1], JWT_SECRET);
    console.log('auth ====', parts[1], JWT_SECRET, payload);
    req.user = payload; // { userId, username }
    next();
  }catch(err){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;