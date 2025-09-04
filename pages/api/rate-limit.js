// Simple rate limiting middleware (demo)
let requests = {};

export function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  requests[ip] = requests[ip] || [];
  requests[ip] = requests[ip].filter(ts => now - ts < 60000);
  if (requests[ip].length >= 60) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  requests[ip].push(now);
  next();
}
