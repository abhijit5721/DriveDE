
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zgmhkvpctiineanjmvga.supabase.co';
const supabaseAnonKey = 'sb_publishable_au6DMNH90xW4M7bW6MVZTw_ORZYpFS8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  console.log('Testing for specific columns in "driving_sessions"...');
  
  const columnsToTest = [
    'instructor_name',
    'route',
    'mistakes',
    'total_distance',
    'location_summary'
  ];

  for (const col of columnsToTest) {
    const { error } = await supabase
      .from('driving_sessions')
      .select(col)
      .limit(1);

    if (error) {
       console.log(`❌ Column "${col}": MISSING (${error.message})`);
    } else {
       console.log(`✅ Column "${col}": EXISTS`);
    }
  }
}

checkColumns();
