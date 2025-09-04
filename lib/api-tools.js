
import { z } from 'zod'

export class AppError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

// simple helper to validate JSON body with zod
export const zBody = (schema) => ({
  async parse(req) {
    const data = await (typeof req.json === 'function' ? req.json() : Promise.resolve({}))
    return schema.parse(data)
  }
})

// tiny wrapper to unify API handlers
export function createApi(config = {}, handler) {
  // Pages Router style handler
  return async function(req, res) {
    try {
      // optional body validation
      if (config.bodySchema) {
        await config.bodySchema.parse(req)
      }
      const result = await handler({ req, res })
      if (!res.headersSent) {
        res.status(200).json(result ?? { ok: true })
      }
    } catch (err) {
      const status = err?.status ?? 500
      const msg = process.env.NODE_ENV === 'production' && status === 500
        ? 'Internal Server Error'
        : err?.message || 'Error'
      if (!res.headersSent) {
        res.status(status).json({ error: msg })
      }
    }
  }
}
