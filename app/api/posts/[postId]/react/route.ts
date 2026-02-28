import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// POST /api/posts/[postId]/react - Add or update a reaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { userId, reactionType } = body; // reactionType: 'upvote' | 'downvote'

    if (!userId || !reactionType) {
      return NextResponse.json(
        { success: false, error: 'User ID and reaction type are required' },
        { status: 400 }
      );
    }

    if (!['upvote', 'downvote'].includes(reactionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    // Check if user already reacted
    const { data: existingReaction } = await (supabaseAdmin as any)
      .from('post_reactions')
      .select('id, reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Same reaction - remove it (toggle off)
        const { error: deleteError } = await (supabaseAdmin as any)
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) {
          console.error('Error removing reaction:', deleteError);
          return NextResponse.json(
            { success: false, error: 'Failed to remove reaction' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: { reaction: null, message: 'Reaction removed' },
        });
      } else {
        // Different reaction - update it
        const { data: updatedReaction, error: updateError } = await (supabaseAdmin as any)
          .from('post_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating reaction:', updateError);
          return NextResponse.json(
            { success: false, error: 'Failed to update reaction' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: { reaction: updatedReaction.reaction_type, message: 'Reaction updated' },
        });
      }
    } else {
      // No existing reaction - create new
      const { data: newReaction, error: insertError } = await (supabaseAdmin as any)
        .from('post_reactions')
        .insert({
          post_id: postId,
          user_id: userId,
          reaction_type: reactionType,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error adding reaction:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to add reaction' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { reaction: newReaction.reaction_type, message: 'Reaction added' },
      });
    }
  } catch (error) {
    console.error('Error in post react API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
