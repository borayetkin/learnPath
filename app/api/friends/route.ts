import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/friends - Get user's friends and pending requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // 'accepted', 'pending', 'all'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = (supabaseAdmin as any)
      .from('user_connections')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        updated_at,
        friend:users!user_connections_friend_id_fkey(
          id,
          name,
          email
        )
      `)
      .eq('user_id', userId);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: connections, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching friends:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch friends' },
        { status: 500 }
      );
    }

    // Also get incoming friend requests (where the user is the friend_id)
    const { data: incomingRequests, error: incomingError } = await (supabaseAdmin as any)
      .from('user_connections')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        updated_at,
        requester:users!user_connections_user_id_fkey(
          id,
          name,
          email
        )
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (incomingError) {
      console.error('Error fetching incoming requests:', incomingError);
    }

    return NextResponse.json({
      success: true,
      data: {
        friends: connections || [],
        incomingRequests: incomingRequests || [],
      },
    });
  } catch (error) {
    console.error('Error in friends API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/friends - Send a friend request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, friendId } = body;

    if (!userId || !friendId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Friend ID are required' },
        { status: 400 }
      );
    }

    if (userId === friendId) {
      return NextResponse.json(
        { success: false, error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const { data: existingConnection } = await (supabaseAdmin as any)
      .from('user_connections')
      .select('*')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .single();

    if (existingConnection) {
      return NextResponse.json(
        { success: false, error: 'Friend connection already exists' },
        { status: 409 }
      );
    }

    // Create friend request
    const { data: newConnection, error } = await (supabaseAdmin as any)
      .from('user_connections')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      })
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        updated_at,
        friend:users!user_connections_friend_id_fkey(
          id,
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error creating friend request:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to send friend request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newConnection,
    });
  } catch (error) {
    console.error('Error in friends POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
