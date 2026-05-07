/**
 * DriveDE Overpass API Proxy
 * 
 * Bypasses CORS and Origin blocking by forwarding requests from the server.
 * Includes a custom User-Agent to comply with Overpass usage policies.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data: query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Missing Overpass query' });
  }

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass.osm.ch/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  // Randomize start endpoint to balance load
  const shuffledEndpoints = [...endpoints].sort(() => Math.random() - 0.5);

  for (const endpoint of shuffledEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'DriveDE/1.0 (https://drive-de.vercel.app)'
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }

      console.warn(`[OverpassProxy] Endpoint ${endpoint} returned status: ${response.status}`);
    } catch (error) {
      console.error(`[OverpassProxy] Error fetching from ${endpoint}:`, error);
    }
  }

  return res.status(502).json({ error: 'All Overpass endpoints failed' });
}
