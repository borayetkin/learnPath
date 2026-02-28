import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/groups - List learning groups (public or user's groups)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');
    const myGroups = searchParams.get('myGroups') === 'true';

    let query = (supabaseAdmin as any)
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
      `);

    if (myGroups && userId) {
      // Get groups where user is a member
      const { data: memberGroups, error: memberError } = await (supabaseAdmin as any)
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (memberError) {
        console.error('Error fetching user groups:', memberError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch user groups' },
          { status: 500 }
        );
      }

      const groupIds = memberGroups?.map((m: any) => m.group_id) || [];

      if (groupIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      query = query.in('id', groupIds);
    } else {
      // Only show public groups for browsing
      query = query.eq('is_public', true);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data: groups, error } = await query.order('member_count', { ascending: false });

    if (error) {
      console.error('Error fetching groups:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch groups' },
        { status: 500 }
      );
    }

    // If userId provided, add user's role in each group
    let groupsWithRole = groups || [];
    if (userId && groups) {
      const groupIds = groups.map((g: any) => g.id);
      const { data: memberships } = await (supabaseAdmin as any)
        .from('group_members')
        .select('group_id, role')
        .eq('user_id', userId)
        .in('group_id', groupIds);

      const roleMap = new Map(memberships?.map((m: any) => [m.group_id, m.role]) || []);

      groupsWithRole = groups.map((group: any) => ({
        ...group,
        userRole: roleMap.get(group.id) || null,
      }));
    }

    return NextResponse.json({
      success: true,
      data: groupsWithRole,
    });
  } catch (error) {
    console.error('Error in groups API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new learning group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, categoryId, creatorId, isPublic, icon } = body;

    if (!name || !creatorId) {
      return NextResponse.json(
        { success: false, error: 'Group name and creator ID are required' },
        { status: 400 }
      );
    }

    // Create the group
    const { data: newGroup, error: groupError } = await (supabaseAdmin as any)
      .from('learning_groups')
      .insert({
        name,
        description,
        category_id: categoryId || null,
        creator_id: creatorId,
        is_public: isPublic !== undefined ? isPublic : true,
        icon: icon || '👥',
      })
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
      .single();

    if (groupError) {
      console.error('Error creating group:', groupError);
      return NextResponse.json(
        { success: false, error: 'Failed to create group' },
        { status: 500 }
      );
    }

    // Add creator as admin member
    const { error: memberError } = await (supabaseAdmin as any)
      .from('group_members')
      .insert({
        group_id: newGroup.id,
        user_id: creatorId,
        role: 'admin',
      });

    if (memberError) {
      console.error('Error adding creator as member:', memberError);
      // Don't fail the request, group is created successfully
    }

    return NextResponse.json({
      success: true,
      data: { ...newGroup, userRole: 'admin' },
    });
  } catch (error) {
    console.error('Error in groups POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
