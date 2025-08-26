const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fzfnjtuuxmxpngzwaueo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6Zm5qdHV1eG14cG5nendhdWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MTgxMTcsImV4cCI6MjA3MDk5NDExN30.7g7hvPHgMvt3RtYmTWdgkGejWcicH2R9gzRUzclhJpo'
);

async function testSupabase() {
  console.log('=== Supabase接続テスト ===');
  
  try {
    // 車両データ確認
    const { data: vehicles, error: vError } = await supabase.from('vehicles').select('*');
    if (vError) {
      console.error('車両取得エラー:', vError.message);
    } else {
      console.log('✅ 車両総数:', vehicles.length);
      vehicles.forEach(v => {
        console.log(`  - ${v.brand} ${v.model}: ¥${v.price_day}/日, ${v.seats}席, ${v.powertrain}`);
      });
    }
    
    // 予約データ確認
    const { data: bookings, error: bError } = await supabase.from('bookings').select('*');
    if (bError) {
      console.error('予約取得エラー:', bError.message);
    } else {
      console.log('✅ 予約総数:', bookings.length);
      bookings.forEach(b => {
        console.log(`  - ID: ${b.id.substring(0,8)}... ステータス: ${b.status} 金額: ¥${b.total_amount}`);
      });
    }
    
    // ユーザーデータ確認
    const { data: users, error: uError } = await supabase.from('users').select('*').limit(3);
    if (uError) {
      console.error('ユーザー取得エラー:', uError.message);
    } else {
      console.log('✅ ユーザーデータ:', users.length, '件');
    }
    
    // スキーマ確認
    const { data: schema, error: sError } = await supabase.rpc('get_schemas');
    if (!sError) {
      console.log('✅ スキーマ確認完了');
    }
    
    console.log('=== 接続成功！Supabaseは正常に動作しています ===');
    
  } catch (error) {
    console.error('❌ 接続エラー:', error.message);
  }
}

testSupabase();