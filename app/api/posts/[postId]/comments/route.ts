import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/posts/[postId]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    const { data: comments, error } = await (supabaseAdmin as any)
      .from('post_comments')
      .select(`
        id,
        post_id,
        user_id,
        parent_comment_id,
        content,
        upvotes,
        created_at,
        updated_at,
        author:users!post_comments_user_id_fkey(
          id,
          name,
          email
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: comments || [],
    });
  } catch (error) {
    console.error('Error in comments GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/posts/[postId]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { userId, content, parentCommentId } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'User ID and content are required' },
        { status: 400 }
      );
    }

    const { data: newComment, error } = await (supabaseAdmin as any)
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId || null,
      })
      .select(`
        id,
        post_id,
        user_id,
        parent_comment_id,
        content,
        upvotes,
        created_at,
        updated_at,
        author:users!post_comments_user_id_fkey(
          id,
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    console.error('Error in comments POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
