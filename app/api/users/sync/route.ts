import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// POST /api/users/sync - Sync auth user to users table (uses admin client to bypass RLS)
export async function POST(request: NextRequest) {
  try {
    const { id, email, name } = await request.json();

    if (!id || !email) {
      return NextResponse.json(
        { success: false, error: 'id and email are required' },
        { status: 400 }
      );
    }

    const { error } = await (supabaseAdmin as any)
      .from('users')
      .upsert(
        { id, email, name: name || email.split('@')[0] },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Error syncing user:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in user sync:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
