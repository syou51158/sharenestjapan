const { createClient } = require('@supabase/supabase-js');

// 環境変数からSupabase設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iygiuutslpnvrheqbqgv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2l1dXRzbHBudnJoZXFicWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjkzNzksImV4cCI6MjA2Mjg0NTM3OX0.skNBoqKqMl69jLLCyGvfS6CUY7TiCftaUOuLlrdUl10';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOrganizations() {
  console.log('=== Supabase組織情報確認 ===');
  
  try {
    // 1. 全テーブルを確認
    console.log('📊 全テーブル一覧を確認中...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tableError) {
      console.error('テーブル一覧取得エラー:', tableError.message);
    } else {
      console.log('✅ 利用可能なテーブル総数:', tables.length);
      
      // 組織・テナント関連のテーブルを抽出
      const orgTables = tables.filter(t => 
        t.table_name.toLowerCase().includes('org') ||
        t.table_name.toLowerCase().includes('tenant') ||
        t.table_name.toLowerCase().includes('company') ||
        t.table_name.toLowerCase().includes('team')
      );
      
      if (orgTables.length > 0) {
        console.log('\n🏢 組織・テナント関連テーブル:');
        orgTables.forEach(table => {
          console.log(`  - ${table.table_schema}.${table.table_name}`);
        });
      } else {
        console.log('ℹ️  組織・テナント関連テーブルは見つかりませんでした');
      }
    }

    // 2. ユーザー情報から組織関連カラムを確認
    console.log('\n👥 ユーザー情報から組織情報を確認中...');
    try {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(5);
      
      if (userError) {
        console.log('ℹ️  usersテーブルにアクセスできません:', userError.message);
      } else {
        console.log('✅ usersテーブルから取得したデータ:', users.length, '件');
        if (users && users.length > 0) {
          const user = users[0];
          const columns = Object.keys(user || {});
          console.log('  カラム一覧:', columns);
          
          // 組織関連のカラムを探す
          const orgColumns = columns.filter(col => 
            col.toLowerCase().includes('org') ||
            col.toLowerCase().includes('tenant') ||
            col.toLowerCase().includes('company') ||
            col.toLowerCase().includes('team')
          );
          
          if (orgColumns.length > 0) {
            console.log('  🏢 組織関連カラム:', orgColumns);
          }
          
          users.forEach((user, index) => {
            console.log(`  ユーザー${index + 1}: ${user.email || user.id}`);
            if (user.organization_id) console.log(`    組織ID: ${user.organization_id}`);
            if (user.tenant_id) console.log(`    テナントID: ${user.tenant_id}`);
            if (user.company_id) console.log(`    会社ID: ${user.company_id}`);
          });
        } else {
          console.log('  usersテーブルは空です');
        }
      }
    } catch (e) {
      console.log('ℹ️  usersテーブルは存在しません');
    }

    // 3. 既存のデータを確認
    console.log('\n📋 既存の主要データを確認中...');
    
    // 車両データ
    try {
      const { data: vehicles, error: vError } = await supabase
        .from('vehicles')
        .select('*')
        .limit(3);
      
      if (!vError && vehicles) {
        console.log('✅ 車両データ:', vehicles.length, '件');
        if (vehicles.length > 0) {
          const vehicle = vehicles[0];
          const columns = Object.keys(vehicle);
          console.log('  カラム:', columns);
        }
      }
    } catch (e) {
      console.log('ℹ️  vehiclesテーブルは存在しません');
    }

    // 予約データ
    try {
      const { data: bookings, error: bError } = await supabase
        .from('bookings')
        .select('*')
        .limit(3);
      
      if (!bError && bookings) {
        console.log('✅ 予約データ:', bookings.length, '件');
        if (bookings.length > 0) {
          const booking = bookings[0];
          const columns = Object.keys(booking);
          console.log('  カラム:', columns);
        }
      }
    } catch (e) {
      console.log('ℹ️  bookingsテーブルは存在しません');
    }

    console.log('\n=== 組織情報確認完了 ===');
    console.log('💡 このSupabaseプロジェクトには、現在のところ組織・テナント機能は実装されていないようです。');
    console.log('💡 必要に応じて、organizationsテーブルやtenant_idカラムを追加することで、');
    console.log('   マルチテナント機能を実装できます。');
    
  } catch (error) {
    console.error('❌ 接続エラー:', error.message);
  }
}

checkOrganizations();