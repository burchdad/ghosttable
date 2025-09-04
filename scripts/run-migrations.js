// scripts/run-migrations.js
import { createClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'
import path from 'node:path'

// load .env.local (Next keeps secrets there)
loadEnv({ path: path.resolve(process.cwd(), '.env.local') })

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY not found. Put it in .env.local')
  process.exit(1)
}

const supabase = createClient(
  'https://kosidswrkjtzztkeuqma.supabase.co',
  SERVICE_KEY
)

async function exec(query) {
  const { error } = await supabase.rpc('execute_sql', { query })
  if (error) {
    console.error('\n❌ Failed query:\n' + query + '\n')
    throw new Error(error.message)
  }
  console.log('✅', query.trim().split('\n')[0])
}

async function main() {
  // --- SQL 1: add/seed `position` on fields ---
  await exec(`alter table if exists fields add column if not exists position int`)
  await exec(`
    update fields f
    set position = sub.rn
    from (
      select id, row_number() over (partition by table_id order by created_at) as rn
      from fields
    ) as sub
    where f.id = sub.id and f.position is null
  `)
  await exec(`create index if not exists idx_fields_table_position on fields(table_id, position)`)

  // --- SQL 2: create `views` table ---
  await exec(`
    create table if not exists views (
      id uuid primary key default gen_random_uuid(),
      table_id uuid references tables(id) on delete cascade,
      name text not null,
      config jsonb default '{}'::jsonb,
      created_at timestamptz default now()
    )
  `)
  await exec(`create index if not exists idx_views_table on views(table_id)`)

  // OPTIONAL: enforce unique field names per table (uncomment after removing dupes)
  // await exec(`alter table fields drop constraint if exists fields_unique_per_table`)
  // await exec(`alter table fields add constraint fields_unique_per_table unique (table_id, name)`)

  console.log('\n🎉 All migrations finished')
}

main().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
