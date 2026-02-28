import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/badges?userId=xxx - Get user's badges
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('user_badges')
      .select(`
        *,
        learning_paths (
          id,
          title,
          topic,
          difficulty_level,
          category_id
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

// POST /api/badges - Award a badge for completing a path
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pathId, badgeName, badgeIcon, badgeColor } = body;

    if (!userId || !pathId || !badgeName) {
      return NextResponse.json(
        { success: false, error: 'userId, pathId, and badgeName are required' },
        { status: 400 }
      );
    }

    // Check if badge already exists
    const { data: existing } = await (supabaseAdmin as any)
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('path_id', pathId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, data: existing, message: 'Badge already earned' });
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('user_badges')
      .insert({
        user_id: userId,
        path_id: pathId,
        badge_name: badgeName,
        badge_icon: badgeIcon || '🏆',
        badge_color: badgeColor || '#eab308',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error awarding badge:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to award badge' },
      { status: 500 }
    );
  }
}
