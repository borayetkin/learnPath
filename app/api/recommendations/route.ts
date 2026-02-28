import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generatePathRecommendations, generateGroupRecommendations } from '@/lib/ai/recommendations';

// GET /api/recommendations - Get personalized recommendations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'paths' | 'groups' | 'all'
    const limit = parseInt(searchParams.get('limit') || '5');
    const refresh = searchParams.get('refresh') === 'true'; // Force regenerate

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const recommendationType = type || 'all';
    let pathRecommendations: any[] = [];
    let groupRecommendations: any[] = [];

    // Path Recommendations
    if (recommendationType === 'paths' || recommendationType === 'all') {
      if (!refresh) {
        // Try to get existing non-dismissed recommendations
        const { data: existing } = await (supabaseAdmin as any)
          .from('path_recommendations')
          .select(`
            id,
            user_id,
            recommended_path_id,
            reason,
            score,
            created_at,
            path:learning_paths!path_recommendations_recommended_path_id_fkey(
              id,
              title,
              description,
              topic,
              difficulty_level,
              estimated_duration,
              category_id,
              view_count
            )
          `)
          .eq('user_id', userId)
          .eq('is_dismissed', false)
          .order('score', { ascending: false })
          .limit(limit);

        if (existing && existing.length >= limit) {
          pathRecommendations = existing;
        }
      }

      // Generate new recommendations if needed
      if (pathRecommendations.length === 0 || refresh) {
        // Build user learning profile
        const { data: completedPaths } = await (supabaseAdmin as any)
          .from('learning_paths')
          .select(`
            id,
            title,
            topic,
            category_id,
            difficulty_level,
            user_progress!inner(status)
          `)
          .eq('user_id', userId)
          .eq('user_progress.status', 'completed');

        const { data: inProgressPaths } = await (supabaseAdmin as any)
          .from('learning_paths')
          .select('id, title, topic, category_id')
          .eq('user_id', userId);

        // Get user's most active categories
        const completedCategories = completedPaths?.map((p: any) => p.category_id).filter(Boolean) || [];
        const categoryPreferences = [...new Set(completedCategories)];

        // Get available public paths that user hasn't started
        const userPathIds = [
          ...(completedPaths?.map((p: any) => p.id) || []),
          ...(inProgressPaths?.map((p: any) => p.id) || []),
        ];

        const { data: availablePaths } = await (supabaseAdmin as any)
          .from('learning_paths')
          .select('id, title, description, topic, difficulty_level, estimated_duration, category_id, view_count, completion_rate')
          .eq('is_public', true)
          .not('id', 'in', `(${userPathIds.join(',') || 'null'})`)
          .order('view_count', { ascending: false })
          .limit(50);

        // Generate AI recommendations
        const aiRecommendations = await generatePathRecommendations(
          {
            userId,
            completedPaths: completedPaths?.map((p: any) => ({
              title: p.title,
              topic: p.topic,
              categoryId: p.category_id,
              difficultyLevel: p.difficulty_level,
            })) || [],
            inProgressPaths: inProgressPaths?.map((p: any) => ({
              title: p.title,
              topic: p.topic,
              categoryId: p.category_id,
            })) || [],
            categoryPreferences,
          },
          availablePaths || [],
          limit
        );

        // Save recommendations to database
        if (aiRecommendations.length > 0) {
          // Clear old recommendations if refreshing
          if (refresh) {
            await (supabaseAdmin as any)
              .from('path_recommendations')
              .delete()
              .eq('user_id', userId);
          }

          const { data: saved, error: saveError } = await (supabaseAdmin as any)
            .from('path_recommendations')
            .insert(
              aiRecommendations.map((rec) => ({
                user_id: userId,
                recommended_path_id: rec.pathId,
                reason: rec.reason,
                score: rec.score,
              }))
            )
            .select(`
              id,
              user_id,
              recommended_path_id,
              reason,
              score,
              created_at,
              path:learning_paths!path_recommendations_recommended_path_id_fkey(
                id,
                title,
                description,
                topic,
                difficulty_level,
                estimated_duration,
                category_id,
                view_count
              )
            `);

          if (saveError) {
            console.error('Error saving recommendations:', saveError);
          } else {
            pathRecommendations = saved || [];
          }
        }
      }
    }

    // Group Recommendations
    if (recommendationType === 'groups' || recommendationType === 'all') {
      // Get user's category interests
      const { data: userPaths } = await (supabaseAdmin as any)
        .from('learning_paths')
        .select('category_id')
        .eq('user_id', userId);

      const userCategories = [...new Set(userPaths?.map((p: any) => p.category_id).filter(Boolean))] as string[];

      // Get user's current groups
      const { data: userGroups } = await (supabaseAdmin as any)
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      const userGroupIds = userGroups?.map((g: any) => g.group_id) || [];

      // Get available public groups
      let availableGroupsQuery = (supabaseAdmin as any)
        .from('learning_groups')
        .select('id, name, description, category_id, member_count')
        .eq('is_public', true);

      if (userGroupIds.length > 0) {
        availableGroupsQuery = availableGroupsQuery.not('id', 'in', `(${userGroupIds.join(',')})`);
      }

      const { data: availableGroups } = await availableGroupsQuery
        .order('member_count', { ascending: false })
        .limit(20);

      // Generate group recommendations
      const aiGroupRecommendations = await generateGroupRecommendations(
        userId,
        userCategories,
        availableGroups || [],
        limit
      );

      // Fetch full group details for recommendations
      if (aiGroupRecommendations.length > 0) {
        const groupIds = aiGroupRecommendations.map((r) => r.groupId);
        const { data: groups } = await (supabaseAdmin as any)
          .from('learning_groups')
          .select(`
            id,
            name,
            description,
            category_id,
            member_count,
            icon,
            category:categories(
              id,
              name,
              slug,
              icon,
              color
            )
          `)
          .in('id', groupIds);

        groupRecommendations = aiGroupRecommendations.map((rec) => {
          const group = groups?.find((g: any) => g.id === rec.groupId);
          return {
            group,
            reason: rec.reason,
            score: rec.score,
          };
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paths: pathRecommendations,
        groups: groupRecommendations,
      },
    });
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/recommendations - Dismiss a recommendation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, recommendationId } = body;

    if (!userId || !recommendationId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Recommendation ID are required' },
        { status: 400 }
      );
    }

    // Verify ownership and dismiss
    const { data, error } = await (supabaseAdmin as any)
      .from('path_recommendations')
      .update({ is_dismissed: true })
      .eq('id', recommendationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      console.error('Error dismissing recommendation:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to dismiss recommendation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recommendation dismissed',
    });
  } catch (error) {
    console.error('Error in recommendations POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
