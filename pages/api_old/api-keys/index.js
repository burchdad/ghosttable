import crypto from 'node:crypto'
import { supabase } from '../../../lib/supabase'
import { createApi, zBody, AppError } from '../../../lib/api-tools'
import { sha256 } from '../../../lib/api-auth'

export default createApi(
  { bodySchema: zBody({ organization_id: z.string().uuid(), name: z.string().min(1), scopes: z.array(z.string()).default([]) }) },
  async ({ body }) => {
    const prefix = `gai_${crypto.randomBytes(4).toString('hex')}`
    const secret = crypto.randomBytes(24).toString('base64url')
    const full = `${prefix}.${secret}`
    const key_hash = sha256(full)

    const { data, error } = await supabase.from('api_keys').insert([{
      organization_id: body.organization_id, name: body.name, key_prefix: prefix, key_hash, scopes: body.scopes
    }]).select()
    if (error) throw error

    return { token: full, api_key: data[0] }  // show token once
  }
)
