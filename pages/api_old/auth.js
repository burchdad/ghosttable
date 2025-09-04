// Simple JWT authentication middleware (demo)
import { supabase } from '../../lib/supabase';

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  // Validate JWT with Supabase
  const { data: user, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user.user;
  next();
}
