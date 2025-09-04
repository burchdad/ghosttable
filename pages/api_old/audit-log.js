// Simple audit logging middleware (demo)
let logs = [];

export function auditLog(req, res, next) {
  logs.push({ path: req.url, method: req.method, user: req.user?.id, ts: Date.now() });
  next();
}

export function getLogs() {
  return logs;
}
