import crypto from 'node:crypto'
import { supabase } from './supabase'
import { AppError } from './api-tools'

export function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex')
}

// Parse header: "X-API-Key: gai_xxxxx.yyyyy" -> { prefix, secret }
export function parseApiKey(h) {
  if (!h) return null
  const [prefix, secret] = String(h).trim().split('.', 2)
  if (!prefix || !secret) return null
  return { prefix, secret }
}

export async function verifyApiKey(req, requiredScopes = []) {
  const raw = req.headers['x-api-key']
  const parsed = parseApiKey(raw)
  if (!parsed) throw new AppError(401, 'unauthorized', 'Missing or invalid API key')

  const { data: rows, error } = await supabase
    .from('api_keys')
    .select('id, organization_id, key_hash, scopes')
    .eq('key_prefix', parsed.prefix)
    .limit(1)
  if (error || !rows?.[0]) throw new AppError(401, 'unauthorized', 'API key not found')
  const row = rows[0]

  const hash = sha256(`${parsed.prefix}.${parsed.secret}`)
  if (hash !== row.key_hash) throw new AppError(401, 'unauthorized', 'API key mismatch')

  const scopes = Array.isArray(row.scopes) ? row.scopes : []
  const missing = requiredScopes.filter(s => !scopes.includes(s))
  if (missing.length) throw new AppError(403, 'forbidden', `Missing scopes: ${missing.join(', ')}`)

  // touch last_used
  await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', row.id)

  return { keyId: row.id, organization_id: row.organization_id, scopes }
}
