
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zgmhkvpctiineanjmvga.supabase.co';
const supabaseAnonKey = 'sb_publishable_au6DMNH90xW4M7bW6MVZTw_ORZYpFS8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Full schema the app expects
const schema = {
  profiles: [
    'id', 'email', 'display_name', 'learning_path', 'transmission_type',
    'language', 'theme', 'is_premium', 'incorrect_questions', 'created_at', 'updated_at'
  ],
  driving_sessions: [
    'id', 'user_id', 'session_date', 'duration_minutes', 'category',
    'transmission_type', 'notes', 'instructor_name', 'route', 'mistakes',
    'total_distance', 'location_summary', 'created_at', 'updated_at'
  ],
  lesson_progress: [
    'id', 'user_id', 'lesson_id', 'status', 'completed_at',
    'confidence_rating', 'created_at', 'updated_at'
  ],
  quiz_attempts: [
    'id', 'user_id', 'question_id', 'lesson_id', 'selected_option_id',
    'is_correct', 'attempted_at'
  ],
  subscriptions: [
    'id', 'user_id', 'provider', 'product_id', 'status',
    'started_at', 'expires_at', 'created_at', 'updated_at'
  ]
};

async function fullAudit() {
  console.log('=== DriveDE Full Database Audit ===\n');
  let allGood = true;

  for (const [table, columns] of Object.entries(schema)) {
    console.log(`📋 Table: ${table}`);

    // Check table exists
    const { error: tableErr } = await supabase.from(table).select('count').limit(1);
    if (tableErr && tableErr.code === '42P01') {
      console.log(`  ❌ TABLE MISSING\n`);
      allGood = false;
      continue;
    }

    // Check each column
    for (const col of columns) {
      const { error } = await supabase.from(table).select(col).limit(1);
      if (error && error.message.includes('does not exist')) {
        console.log(`  ❌ Column "${col}" MISSING`);
        allGood = false;
      } else {
        console.log(`  ✅ ${col}`);
      }
    }
    console.log('');
  }

  if (allGood) {
    console.log('🎉 ALL GOOD! Database schema is complete.');
  } else {
    console.log('⚠️  Some items are missing. Run migrations to fix.');
  }
}

fullAudit();
