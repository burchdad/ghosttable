export function createApi({ querySchema, bodySchema, rateLimit, allowIdempotency = true, requireApiKey = false, scopes = [] }, fn) {
  const wrapped = async (req, res) => {
    try {
      await checkRate(req, rateLimit)

      // API key enforcement (optional)
      if (requireApiKey) {
        const { verifyApiKey } = await import('./api-auth.js')
        await verifyApiKey(req, scopes)
      }

            // ... (rest unchanged)
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
        };
        return wrapped;
      }
