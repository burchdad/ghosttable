/**
 * @typedef {Object} Base
 * @property {string} id
 * @property {string} name
 * @property {string} organization_id
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} CreateBaseInput
 * @property {string} name
 * @property {string} organization_id
 */

const API_ORIGIN =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    : ''

/** @returns {Promise<Base[]>} */
export async function fetchBases() {
  const res = await fetch(`${API_ORIGIN}/api/bases`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`fetchBases failed: ${res.status}`)
  return res.json()
}

/** @param {CreateBaseInput} input @returns {Promise<Base>} */
export async function createBase(input) {
  const res = await fetch(`${API_ORIGIN}/api/bases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    let err = null
    try { err = await res.json() } catch {}
    throw new Error((err && err.error) ?? `createBase failed: ${res.status}`)
  }
  return res.json()
}