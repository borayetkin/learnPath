import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/groups/[groupId]/paths - Get paths shared in a group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Check if user has access to this group
    if (userId) {
      const { data: group } = await (supabaseAdmin as any)
        .from('learning_groups')
        .select('is_public')
        .eq('id', groupId)
        .single();

      if (!group) {
        return NextResponse.json(
          { success: false, error: 'Group not found' },
          { status: 404 }
        );
      }

      // If private group, verify membership
      if (!group.is_public) {
        const { data: membership } = await (supabaseAdmin as any)
          .from('group_members')
          .select('id')
          .eq('group_id', groupId)
          .eq('user_id', userId)
          .single();

        if (!membership) {
          return NextResponse.json(
            { success: false, error: 'Access denied to private group' },
            { status: 403 }
          );
        }
      }
    }

    // Fetch shared paths
    const { data: paths, error } = await (supabaseAdmin as any)
      .from('group_paths')
      .select(`
        id,
        path_id,
        shared_by,
        created_at,
        path:learning_paths(
          id,
          title,
          description,
          topic,
          difficulty_level,
          estimated_duration,
          category_id,
          view_count
        ),
        sharedBy:users!group_paths_shared_by_fkey(
          id,
          name
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching group paths:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch group paths' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: paths || [],
    });
  } catch (error) {
    console.error('Error in group paths GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[groupId]/paths - Share a path to the group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const body = await request.json();
    const { pathId, userId } = body;

    if (!pathId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Path ID and User ID are required' },
        { status: 400 }
      );
    }

    // Verify user is a member of the group
    const { data: membership } = await (supabaseAdmin as any)
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Must be a group member to share paths' },
        { status: 403 }
      );
    }

    // Verify path exists and is public or owned by user
    const { data: path } = await (supabaseAdmin as any)
      .from('learning_paths')
      .select('id, user_id, is_public')
      .eq('id', pathId)
      .single();

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path not found' },
        { status: 404 }
      );
    }

    if (!path.is_public && path.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot share private path you do not own' },
        { status: 403 }
      );
    }

    // Check if already shared
    const { data: existingShare } = await (supabaseAdmin as any)
      .from('group_paths')
      .select('id')
      .eq('group_id', groupId)
      .eq('path_id', pathId)
      .single();

    if (existingShare) {
      return NextResponse.json(
        { success: false, error: 'Path already shared in this group' },
        { status: 409 }
      );
    }

    // Share the path
    const { data: sharedPath, error } = await (supabaseAdmin as any)
      .from('group_paths')
      .insert({
        group_id: groupId,
        path_id: pathId,
        shared_by: userId,
      })
      .select(`
        id,
        path_id,
        shared_by,
        created_at,
        path:learning_paths(
          id,
          title,
          description,
          topic,
          difficulty_level,
          estimated_duration
        ),
        sharedBy:users!group_paths_shared_by_fkey(
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error sharing path to group:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to share path' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sharedPath,
    });
  } catch (error) {
    console.error('Error in group paths POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[groupId]/paths - Remove a shared path
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { searchParams } = new URL(request.url);
    const pathId = searchParams.get('pathId');
    const userId = searchParams.get('userId');

    if (!pathId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Path ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if user is the one who shared it or an admin/moderator
    const { data: sharedPath } = await (supabaseAdmin as any)
      .from('group_paths')
      .select('shared_by')
      .eq('group_id', groupId)
      .eq('path_id', pathId)
      .single();

    if (!sharedPath) {
      return NextResponse.json(
        { success: false, error: 'Shared path not found' },
        { status: 404 }
      );
    }

    const isSharer = sharedPath.shared_by === userId;

    if (!isSharer) {
      // Check if user is admin/moderator
      const { data: membership } = await (supabaseAdmin as any)
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (!membership || !['admin', 'moderator'].includes(membership.role)) {
        return NextResponse.json(
          { success: false, error: 'Only the sharer or group admins/moderators can remove this path' },
          { status: 403 }
        );
      }
    }

    // Remove the shared path
    const { error } = await (supabaseAdmin as any)
      .from('group_paths')
      .delete()
      .eq('group_id', groupId)
      .eq('path_id', pathId);

    if (error) {
      console.error('Error removing shared path:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove shared path' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Shared path removed successfully',
    });
  } catch (error) {
    console.error('Error in group paths DELETE API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
