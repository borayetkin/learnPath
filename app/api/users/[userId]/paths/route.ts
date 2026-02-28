import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Fetch user's learning paths
    const { data: paths, error: pathsError } = await (supabaseAdmin as any)
      .from('learning_paths')
      .select('id, title, description, topic, difficulty_level, estimated_duration, category_id, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (pathsError) {
      console.error('Error fetching paths:', pathsError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch learning paths',
        },
        { status: 500 }
      );
    }

    // For each path, get progress statistics
    const pathsWithProgress = await Promise.all(
      (paths || []).map(async (path: any) => {
        // Get all nodes for this path
        const { data: nodes } = await (supabaseAdmin as any)
          .from('learning_nodes')
          .select('id')
          .eq('path_id', path.id);

        const nodeIds = nodes?.map((n: any) => n.id) || [];

        if (nodeIds.length === 0) {
          return {
            ...path,
            progress: {
              totalNodes: 0,
              completed: 0,
              inProgress: 0,
              notStarted: 0,
              progressPercentage: 0,
              totalTimeSpent: 0,
            },
          };
        }

        // Get progress for these nodes
        const { data: progress } = await (supabaseAdmin as any)
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .in('node_id', nodeIds);

        const completed = progress?.filter((p: any) => p.status === 'completed').length || 0;
        const inProgress = progress?.filter((p: any) => p.status === 'in_progress').length || 0;
        const totalNodes = nodeIds.length;
        const totalTimeSpent = progress?.reduce((sum: number, p: any) => sum + (p.time_spent || 0), 0) || 0;

        return {
          ...path,
          progress: {
            totalNodes,
            completed,
            inProgress,
            notStarted: totalNodes - completed - inProgress,
            progressPercentage: totalNodes > 0 ? Math.round((completed / totalNodes) * 100) : 0,
            totalTimeSpent,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: pathsWithProgress,
    });
  } catch (error) {
    console.error('Error in user paths API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
