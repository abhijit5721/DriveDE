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

  const mr = data.find(s => s.external_id !== null);
  const lr = data.find(s => s.external_id === null);

  console.log('Modern Row Session Date:', mr?.session_date, 'Type:', typeof mr?.session_date);
  console.log('Legacy Row Session Date:', lr?.session_date, 'Type:', typeof lr?.session_date);
  
  console.log('Comparison (===):', mr?.session_date === lr?.session_date);
  
  // Test with normalization
  const norm = (d) => new Date(d).toISOString().split('T')[0];
  console.log('Normalized Modern:', norm(mr?.session_date));
  console.log('Normalized Legacy:', norm(lr?.session_date));
  console.log('Comparison (Normalized):', norm(mr?.session_date) === norm(lr?.session_date));
}

checkData();
