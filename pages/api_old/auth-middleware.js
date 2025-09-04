// Simple role-based access middleware (Supabase)
export function requireRole(role) {
  return (req, res, next) => {
    const user = req.user || {};
    // Supabase user roles can be stored in user.user_metadata.role
    const roleValue = user.user_metadata?.role || 'viewer';
    if (roleValue !== role && roleValue !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
