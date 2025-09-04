export async function runSQL(query) {
const { error } = await supabase.rpc('execute_sql', { query })
if (error) throw new Error(error.message)
}