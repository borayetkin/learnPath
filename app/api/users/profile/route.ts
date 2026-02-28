import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/users/profile?userId=xxx - Get user profile with stats
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await (supabaseAdmin as any)
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get path count and completion stats
    const { data: paths } = await (supabaseAdmin as any)
      .from('learning_paths')
      .select('id, title, topic, difficulty_level, estimated_duration, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get total progress stats
    const { data: progress } = await (supabaseAdmin as any)
      .from('user_progress')
      .select('status, time_spent, completed_at')
      .eq('user_id', userId);

    const completedNodes = progress?.filter((p: any) => p.status === 'completed').length || 0;
    const inProgressNodes = progress?.filter((p: any) => p.status === 'in_progress').length || 0;
    const totalTimeSpent = progress?.reduce((sum: number, p: any) => sum + (p.time_spent || 0), 0) || 0;

    // Get badges
    const { data: badges } = await (supabaseAdmin as any)
      .from('user_badges')
      .select(`
        *,
        learning_paths (
          id, title, topic, difficulty_level, category_id
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    // Get friend count
    const { count: friendCount } = await (supabaseAdmin as any)
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    // Get group count
    const { count: groupCount } = await (supabaseAdmin as any)
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Calculate streak (consecutive days with activity)
    const completedDates = progress
      ?.filter((p: any) => p.completed_at)
      .map((p: any) => new Date(p.completed_at).toDateString())
      || [];
    const uniqueDates = [...new Set(completedDates)].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (uniqueDates[i] === expected.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profile,
        stats: {
          totalPaths: paths?.length || 0,
          completedNodes,
          inProgressNodes,
          totalTimeSpent,
          totalBadges: badges?.length || 0,
          friendCount: friendCount || 0,
          groupCount: groupCount || 0,
          streak,
        },
        paths: paths || [],
        badges: badges || [],
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId, name, bio, avatarUrl } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const { data, error } = await (supabaseAdmin as any)
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
