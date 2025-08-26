const { createClient } = require('@supabase/supabase-js');

// 環境変数からSupabase設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fzfnjtuuxmxpngzwaueo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6Zm5qdHV1eG14cG5nendhdWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MTgxMTcsImV4cCI6MjA3MDk5NDExN30.7g7hvPHgMvt3RtYmTWdgkGejWcicH2R9gzRUzclhJpo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOrganizations() {
  console.log('=== Supabase組織情報確認 ===');
  
  try {
    // 1. スキーマ情報を確認
    console.log('📊 スキーマ情報を確認中...');
    const { data: schemas, error: schemaError } = await supabase
      .rpc('get_schemas');
    
    if (schemaError) {
      console.error('スキーマ取得エラー:', schemaError.message);
    } else {
      console.log('✅ 利用可能なスキーマ:', schemas);
    }

    // 2. 組織/テナント情報を確認（存在する場合）
    console.log('\n🏢 組織情報を確認中...');
    
    // organizationsテーブルが存在するか確認
    try {
      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('*');
      
      if (orgError) {
        console.log('ℹ️  organizationsテーブルは存在しません:', orgError.message);
      } else {
        console.log('✅ 組織総数:', organizations.length);
        organizations.forEach(org => {
          console.log(`  - ID: ${org.id}`);
          console.log(`    名前: ${org.name}`);
          console.log(`    作成日: ${org.created_at}`);
          if (org.description) console.log(`    説明: ${org.description}`);
        });
      }
    } catch (e) {
      console.log('ℹ️  organizationsテーブルは存在しません');
    }

    // 3. テナント情報を確認（multi-tenantの場合）
    console.log('\n🏭 テナント情報を確認中...');
    
    // tenantsテーブルが存在するか確認
    try {
      const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('*');
      
      if (tenantError) {
        console.log('ℹ️  tenantsテーブルは存在しません:', tenantError.message);
      } else {
        console.log('✅ テナント総数:', tenants.length);
        tenants.forEach(tenant => {
          console.log(`  - ID: ${tenant.id}`);
          console.log(`    ドメイン: ${tenant.domain}`);
          console.log(`    名前: ${tenant.name}`);
        });
      }
    } catch (e) {
      console.log('ℹ️  tenantsテーブルは存在しません');
    }

    // 4. ユーザー情報から組織IDを確認
    console.log('\n👥 ユーザー情報から組織を確認中...');
    try {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email, organization_id, tenant_id')
        .limit(10);
      
      if (userError) {
        console.log('ℹ️  usersテーブルから組織情報を取得できません:', userError.message);
      } else {
        console.log('✅ ユーザー総数:', users.length);
        const orgIds = [...new Set(users.map(u => u.organization_id).filter(Boolean))];
        const tenantIds = [...new Set(users.map(u => u.tenant_id).filter(Boolean))];
        
        if (orgIds.length > 0) {
          console.log('  関連する組織ID:', orgIds);
        }
        if (tenantIds.length > 0) {
          console.log('  関連するテナントID:', tenantIds);
        }
        
        users.forEach(user => {
          console.log(`  - ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
          if (user.organization_id) console.log(`    組織: ${user.organization_id}`);
          if (user.tenant_id) console.log(`    テナント: ${user.tenant_id}`);
        });
      }
    } catch (e) {
      console.log('ℹ️  usersテーブルから組織情報を取得できません');
    }

    // 5. テーブル一覧を確認
    console.log('\n📋 テーブル一覧を確認中...');
    try {
      const { data: tables, error: tableError } = await supabase
        .rpc('get_tables');
      
      if (tableError) {
        console.log('ℹ️  テーブル一覧を取得できません:', tableError.message);
      } else {
        console.log('✅ 利用可能なテーブル:');
        tables.forEach(table => {
          if (table.table_name && table.table_name.includes('org')) {
            console.log(`  📊 ${table.table_name} (スキーマ: ${table.table_schema})`);
          } else if (table.table_name && table.table_name.includes('tenant')) {
            console.log(`  🏢 ${table.table_name} (スキーマ: ${table.table_schema})`);
          }
        });
      }
    } catch (e) {
      console.log('ℹ️  テーブル一覧を取得できません');
    }

    console.log('\n=== 組織情報確認完了 ===');
    
  } catch (error) {
    console.error('❌ 接続エラー:', error.message);
  }
}

// 実行
checkOrganizations();