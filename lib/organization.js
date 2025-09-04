/**
 * @typedef {Object} Organization
 * @property {string} id
 * @property {string} name
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} CreateOrgInput
 * @property {string} name
 */

const API_ORIGIN2 =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    : ''

/** @returns {Promise<Organization[]>} */
export async function fetchOrgs() {
  const res = await fetch(`${API_ORIGIN2}/api/organizations`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`fetchOrgs failed: ${res.status}`)
  return res.json()
}

/** @param {CreateOrgInput} input @returns {Promise<Organization>} */
export async function createOrg(input) {
  const res = await fetch(`${API_ORIGIN2}/api/organizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    let err = null
    try { err = await res.json() } catch {}
    throw new Error((err && err.error) ?? `createOrg failed: ${res.status}`)
  }
  return res.json()
}
