import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const record_id = searchParams.get('record_id');
  if (!record_id) return NextResponse.json({ error: 'record_id required' }, { status: 400 });
  const { data, error } = await supabase
    .from('record_comments')
    .select('*')
    .eq('record_id', record_id)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || [], { status: 200 });
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  const body = await request.json();
  const { record_id, body: commentBody, user_id = null } = body || {};
  if (!record_id || !commentBody) return NextResponse.json({ error: 'record_id and body required' }, { status: 400 });
  const { data, error } = await supabase
    .from('record_comments')
    .insert([{ record_id, body: commentBody, user_id }])
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data || [])[0], { status: 201 });
}
