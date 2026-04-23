const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zgmhkvpctiineanjmvga.supabase.co';
const supabaseKey = 'sb_publishable_au6DMNH90xW4M7bW6MVZTw_ORZYpFS8';
const userId = 'fd9f495d-108d-405c-96b3-bca044fd9622';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data, error } = await supabase
    .from('driving_sessions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching sessions:', error);
    return;
  }

  const rawMinutes = data.reduce((acc, s) => acc + s.duration_minutes, 0);
  
  // Hypotheis: Filtering out rows without external_id will give us the correct total.
  const modernSessions = data.filter(s => s.external_id !== null);
  const modernMinutes = modernSessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  // Hypothesis 2: Using (date + duration) as key but prioritizing external_id
  const sessionMap = new Map();
  data.forEach(s => {
      // Use date + duration + category as a "Legacy Key"
      const legacyKey = `${s.session_date}_${s.duration_minutes}_${s.category}`;
      const existing = sessionMap.get(legacyKey);
      
      if (!existing || (!existing.external_id && s.external_id)) {
          sessionMap.set(legacyKey, s);
      }
  });
  const mapMinutes = Array.from(sessionMap.values()).reduce((acc, s) => acc + s.duration_minutes, 0);

  console.log('--- DATA ANALYSIS ---');
  console.log('Total DB Rows:', data.length);
  console.log('Raw Total:', (rawMinutes / 60).toFixed(2), 'h (', rawMinutes, 'min )');
  console.log('Only with External ID:', (modernMinutes / 60).toFixed(2), 'h (', modernMinutes, 'min )');
  console.log('Smart De-duplication (Date+Dur+Cat):', (mapMinutes / 60).toFixed(2), 'h (', mapMinutes, 'min )');
  console.log('--- END ANALYSIS ---');
}

checkData();
