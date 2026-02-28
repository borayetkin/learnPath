import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/groups/[groupId]/posts - Get all posts for a group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, top, hot
    const userId = searchParams.get('userId');

    // Fetch posts with user info and user's reaction
    let query = (supabaseAdmin as any)
      .from('group_posts')
      .select(`
        id,
        group_id,
        user_id,
        title,
        content,
        post_type,
        link_url,
        shared_path_id,
        upvotes,
        downvotes,
        comment_count,
        is_pinned,
        created_at,
        updated_at,
        author:users!group_posts_user_id_fkey(
          id,
          name,
          email
        ),
        shared_path:learning_paths!group_posts_shared_path_id_fkey(
          id,
          title,
          description,
          topic,
          difficulty_level,
          estimated_duration
        )
      `)
      .eq('group_id', groupId);

    // Sort logic
    if (sortBy === 'top') {
      query = query.order('upvotes', { ascending: false });
    } else if (sortBy === 'hot') {
      // Hot = recent with high engagement
      // Simple algorithm: sort by (upvotes - downvotes + comment_count) DESC, then by created_at DESC
      query = query.order('upvotes', { ascending: false }).order('created_at', { ascending: false });
    } else {
      // Recent (default)
      query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching group posts:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // Get user's reactions if userId is provided
    let postsWithReactions = posts;
    if (userId && posts && posts.length > 0) {
      const postIds = posts.map((p: any) => p.id);
      const { data: reactions } = await (supabaseAdmin as any)
        .from('post_reactions')
        .select('post_id, reaction_type')
        .eq('user_id', userId)
        .in('post_id', postIds);

      const reactionMap = new Map(reactions?.map((r: any) => [r.post_id, r.reaction_type]) || []);

      postsWithReactions = posts.map((post: any) => ({
        ...post,
        userReaction: reactionMap.get(post.id) || null,
        score: post.upvotes - post.downvotes,
      }));
    } else {
      postsWithReactions = posts?.map((post: any) => ({
        ...post,
        userReaction: null,
        score: post.upvotes - post.downvotes,
      })) || [];
    }

    return NextResponse.json({
      success: true,
      data: postsWithReactions,
    });
  } catch (error) {
    console.error('Error in group posts GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[groupId]/posts - Create a new post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const body = await request.json();
    const { userId, title, content, postType, linkUrl, sharedPathId } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { success: false, error: 'User ID and title are required' },
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
        { success: false, error: 'Must be a group member to post' },
        { status: 403 }
      );
    }

    // Create the post
    const { data: newPost, error } = await (supabaseAdmin as any)
      .from('group_posts')
      .insert({
        group_id: groupId,
        user_id: userId,
        title,
        content: content || null,
        post_type: postType || 'text',
        link_url: linkUrl || null,
        shared_path_id: sharedPathId || null,
      })
      .select(`
        id,
        group_id,
        user_id,
        title,
        content,
        post_type,
        link_url,
        shared_path_id,
        upvotes,
        downvotes,
        comment_count,
        is_pinned,
        created_at,
        updated_at,
        author:users!group_posts_user_id_fkey(
          id,
          name,
          email
        ),
        shared_path:learning_paths!group_posts_shared_path_id_fkey(
          id,
          title,
          description,
          topic,
          difficulty_level
        )
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...newPost, userReaction: null, score: 0 },
    });
  } catch (error) {
    console.error('Error in group posts POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
