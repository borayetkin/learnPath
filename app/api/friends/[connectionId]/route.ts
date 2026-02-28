import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// PUT /api/friends/[connectionId] - Accept or reject a friend request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  try {
    const { connectionId } = await params;
    const body = await request.json();
    const { action, userId } = body; // action: 'accept' | 'reject' | 'block'

    if (!action || !userId) {
      return NextResponse.json(
        { success: false, error: 'Action and User ID are required' },
        { status: 400 }
      );
    }

    // Verify the connection exists and the user is the recipient
    const { data: connection, error: fetchError } = await (supabaseAdmin as any)
      .from('user_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { success: false, error: 'Friend request not found' },
        { status: 404 }
      );
    }

    // User must be the friend_id (recipient) to accept/reject
    if (connection.friend_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to modify this request' },
        { status: 403 }
      );
    }

    let newStatus: string;
    switch (action) {
      case 'accept':
        newStatus = 'accepted';
        break;
      case 'reject':
        // Delete the connection on reject
        const { error: deleteError } = await (supabaseAdmin as any)
          .from('user_connections')
          .delete()
          .eq('id', connectionId);

        if (deleteError) {
          console.error('Error rejecting friend request:', deleteError);
          return NextResponse.json(
            { success: false, error: 'Failed to reject friend request' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Friend request rejected',
        });
      case 'block':
        newStatus = 'blocked';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update the connection status
    const { data: updatedConnection, error: updateError } = await (supabaseAdmin as any)
      .from('user_connections')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', connectionId)
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

    if (updateError) {
      console.error('Error updating friend request:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update friend request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedConnection,
    });
  } catch (error) {
    console.error('Error in friend connection PUT API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/friends/[connectionId] - Remove a friend
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  try {
    const { connectionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify the connection exists and the user is part of it
    const { data: connection, error: fetchError } = await (supabaseAdmin as any)
      .from('user_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { success: false, error: 'Friend connection not found' },
        { status: 404 }
      );
    }

    // User must be either user_id or friend_id to delete
    if (connection.user_id !== userId && connection.friend_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this connection' },
        { status: 403 }
      );
    }

    // Delete the connection
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('user_connections')
      .delete()
      .eq('id', connectionId);

    if (deleteError) {
      console.error('Error removing friend:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to remove friend' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Friend removed successfully',
    });
  } catch (error) {
    console.error('Error in friend connection DELETE API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
