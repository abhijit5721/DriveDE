export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ error: 'Supabase not configured', hotspots: [] });
  }

  const { lat, lng, radius, limit, types } = req.query;
  const radiusKm = Math.min(Math.max(Number(radius) || 10, 1), 50);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);

  let query = supabaseUrl + '/rest/v1/mistake_hotspots?select=*';

  if (lat && lng) {
    query += `&lat=gte.${Number(lat) - radiusKm}&lat=lte.${Number(lat) + radiusKm}&lng=gte.${Number(lng) - radiusKm}&lng=lte.${Number(lng) + radiusKm}`;
  }

  if (types) {
    const typeList = types.split(',');
    query += `&mistake_type=in.(${typeList.map((t: string) => encodeURIComponent(t)).join(',')})`;
  }

  query += `&order=risk_score.desc&limit=${limitNum}`;

  try {
    const response = await fetch(query, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[HotspotsAPI] Supabase error:', response.status);
      return res.status(502).json({ error: 'Database error', hotspots: [] });
    }

    const hotspots = await response.json();
    return res.status(200).json({ hotspots, count: hotspots.length });
  } catch (error) {
    console.error('[HotspotsAPI] Error:', error);
    return res.status(500).json({ error: 'Internal error', hotspots: [] });
  }
}