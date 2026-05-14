const MOCK_HOTSPOTS = [
  { id: '1', lat: 52.5200, lng: 13.4050, mistake_type: 'stop_sign', city: 'Berlin', total_incidents: 47, unique_drivers: 23, risk_score: 8.2, last_updated: new Date().toISOString() },
  { id: '2', lat: 52.5070, lng: 13.3320, mistake_type: 'right_before_left', city: 'Berlin', total_incidents: 38, unique_drivers: 18, risk_score: 7.5, last_updated: new Date().toISOString() },
  { id: '3', lat: 52.4850, lng: 13.4280, mistake_type: 'speeding', city: 'Berlin', total_incidents: 95, unique_drivers: 41, risk_score: 9.1, last_updated: new Date().toISOString() },
  { id: '4', lat: 52.5310, lng: 13.4110, mistake_type: 'wrong_way', city: 'Berlin', total_incidents: 12, unique_drivers: 8, risk_score: 6.8, last_updated: new Date().toISOString() },
  { id: '5', lat: 52.4990, lng: 13.3900, mistake_type: 'harsh_braking', city: 'Berlin', total_incidents: 61, unique_drivers: 29, risk_score: 7.9, last_updated: new Date().toISOString() },
  { id: '6', lat: 52.5150, lng: 13.4550, mistake_type: 'school_zone_speeding', city: 'Berlin', total_incidents: 28, unique_drivers: 14, risk_score: 5.4, last_updated: new Date().toISOString() },
  { id: '7', lat: 52.4780, lng: 13.3650, mistake_type: 'signal', city: 'Berlin', total_incidents: 33, unique_drivers: 16, risk_score: 5.8, last_updated: new Date().toISOString() },
  { id: '8', lat: 52.5420, lng: 13.3880, mistake_type: 'priority', city: 'Berlin', total_incidents: 19, unique_drivers: 11, risk_score: 4.3, last_updated: new Date().toISOString() },
];

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(200).json({ hotspots: MOCK_HOTSPOTS, count: MOCK_HOTSPOTS.length });
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
      return res.status(200).json({ hotspots: MOCK_HOTSPOTS, count: MOCK_HOTSPOTS.length });
    }

    const hotspots = await response.json();
    const result = Array.isArray(hotspots) && hotspots.length > 0 ? hotspots : MOCK_HOTSPOTS;
    return res.status(200).json({ hotspots: result, count: result.length });
  } catch (error) {
    console.error('[HotspotsAPI] Error:', error);
    return res.status(200).json({ hotspots: MOCK_HOTSPOTS, count: MOCK_HOTSPOTS.length });
  }
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