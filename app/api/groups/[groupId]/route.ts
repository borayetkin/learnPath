import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/groups/[groupId] - Get group details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Fetch group details
    const { data: group, error: groupError } = await (supabaseAdmin as any)
      .from('learning_groups')
      .select(`
        id,
        name,
        description,
        category_id,
        creator_id,
        is_public,
        member_count,
        icon,
        created_at,
        updated_at,
        category:categories(
          id,
          name,
          slug,
          icon,
          color
        ),
        creator:users!learning_groups_creator_id_fkey(
          id,
          name
        )
      `)
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if user is a member and get their role
    let userRole = null;
    if (userId) {
      const { data: membership } = await (supabaseAdmin as any)
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      userRole = membership?.role || null;
    }

    // If group is private and user is not a member, deny access
    if (!group.is_public && !userRole) {
      return NextResponse.json(
        { success: false, error: 'Access denied to private group' },
        { status: 403 }
      );
    }

    // Fetch members
    const { data: members, error: membersError } = await (supabaseAdmin as any)
      .from('group_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        user:users(
          id,
          name,
          email
        )
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: false });

    if (membersError) {
      console.error('Error fetching group members:', membersError);
    }

    // Fetch shared paths
    const { data: paths, error: pathsError } = await (supabaseAdmin as any)
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
          estimated_duration
        ),
        sharedBy:users!group_paths_shared_by_fkey(
          id,
          name
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (pathsError) {
      console.error('Error fetching group paths:', pathsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...group,
        userRole,
        members: members || [],
        sharedPaths: paths || [],
      },
    });
  } catch (error) {
    console.error('Error in group GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/groups/[groupId] - Update group details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const body = await request.json();
    const { userId, name, description, isPublic, icon } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: membership } = await (supabaseAdmin as any)
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only group admins can update group details' },
        { status: 403 }
      );
    }

    // Update the group
    const updateData: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.is_public = isPublic;
    if (icon !== undefined) updateData.icon = icon;

    const { data: updatedGroup, error } = await (supabaseAdmin as any)
      .from('learning_groups')
      .update(updateData)
      .eq('id', groupId)
      .select(`
        id,
        name,
        description,
        category_id,
        creator_id,
        is_public,
        member_count,
        icon,
        created_at,
        updated_at,
        category:categories(
          id,
          name,
          slug,
          icon,
          color
        )
      `)
      .single();

    if (error) {
      console.error('Error updating group:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update group' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...updatedGroup, userRole: 'admin' },
    });
  } catch (error) {
    console.error('Error in group PUT API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[groupId] - Delete group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: membership } = await (supabaseAdmin as any)
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only group admins can delete groups' },
        { status: 403 }
      );
    }

    // Delete the group (cascade will handle members and paths)
    const { error } = await (supabaseAdmin as any)
      .from('learning_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting group:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete group' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    console.error('Error in group DELETE API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
