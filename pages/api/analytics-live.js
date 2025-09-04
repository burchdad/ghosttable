// API endpoint for real-time analytics (demo: same as analytics.js)
import { getRecords } from '../../../lib/supabase';

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  try {
    const { table_id } = req.query;
    if (!table_id) {
      return res.status(400).json({ error: 'Missing table_id', code: 400 });
    }

    // Fetch records for the table
    const records = await getRecords(table_id);
    const count = records.length;
    const sumAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0);

    // Example chart data: group by Active status
    const activeCount = records.filter(r => r.active).length;
    const inactiveCount = count - activeCount;
    const chartData = [
      { name: 'Active', value: activeCount },
      { name: 'Inactive', value: inactiveCount }
    ];

    res.status(200).json({ count, sumAmount, chartData });
  } catch (err) {
    console.error('Analytics Live API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
