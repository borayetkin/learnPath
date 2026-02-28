import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// POST /api/groups/[groupId]/members - Join a group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if group exists and is public
    const { data: group, error: groupError } = await (supabaseAdmin as any)
      .from('learning_groups')
      .select('id, is_public')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    if (!group.is_public) {
      return NextResponse.json(
        { success: false, error: 'Cannot join private group' },
        { status: 403 }
      );
    }

    // Check if already a member
    const { data: existingMember } = await (supabaseAdmin as any)
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'Already a member of this group' },
        { status: 409 }
      );
    }

    // Add user as member
    const { data: newMember, error: memberError } = await (supabaseAdmin as any)
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role: 'member',
      })
      .select(`
        id,
        group_id,
        user_id,
        role,
        joined_at,
        user:users(
          id,
          name,
          email
        )
      `)
      .single();

    if (memberError) {
      console.error('Error joining group:', memberError);
      return NextResponse.json(
        { success: false, error: 'Failed to join group' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newMember,
    });
  } catch (error) {
    console.error('Error in group members POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[groupId]/members - Leave group or remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const targetUserId = searchParams.get('targetUserId'); // For admins removing others

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userToRemove = targetUserId || userId;

    // If removing another user, check if requester is admin/moderator
    if (targetUserId && targetUserId !== userId) {
      const { data: requesterMember } = await (supabaseAdmin as any)
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (!requesterMember || !['admin', 'moderator'].includes(requesterMember.role)) {
        return NextResponse.json(
          { success: false, error: 'Only admins/moderators can remove members' },
          { status: 403 }
        );
      }

      // Cannot remove another admin
      const { data: targetMember } = await (supabaseAdmin as any)
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', targetUserId)
        .single();

      if (targetMember?.role === 'admin' && requesterMember.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Cannot remove group admin' },
          { status: 403 }
        );
      }
    }

    // Remove the member
    const { error } = await (supabaseAdmin as any)
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userToRemove);

    if (error) {
      console.error('Error leaving/removing from group:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to leave group' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: targetUserId && targetUserId !== userId
        ? 'Member removed successfully'
        : 'Left group successfully',
    });
  } catch (error) {
    console.error('Error in group members DELETE API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/groups/[groupId]/members - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const body = await request.json();
    const { userId, targetUserId, newRole } = body;

    if (!userId || !targetUserId || !newRole) {
      return NextResponse.json(
        { success: false, error: 'User ID, target user ID, and new role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'moderator', 'member'].includes(newRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if requester is admin
    const { data: requesterMember } = await (supabaseAdmin as any)
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!requesterMember || requesterMember.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can change member roles' },
        { status: 403 }
      );
    }

    // Update the member role
    const { data: updatedMember, error } = await (supabaseAdmin as any)
      .from('group_members')
      .update({ role: newRole })
      .eq('group_id', groupId)
      .eq('user_id', targetUserId)
      .select(`
        id,
        group_id,
        user_id,
        role,
        joined_at,
        user:users(
          id,
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error updating member role:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update member role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedMember,
    });
  } catch (error) {
    console.error('Error in group members PUT API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
