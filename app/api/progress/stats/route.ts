import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pathId = searchParams.get('pathId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    if (pathId) {
      // Get stats for a specific path
      const { data: nodes } = await (supabaseAdmin as any)
        .from('learning_nodes')
        .select('id')
        .eq('path_id', pathId);

      const nodeIds = nodes?.map((n: any) => n.id) || [];

      const { data: progress } = await (supabaseAdmin as any)
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .in('node_id', nodeIds);

      const completed = progress?.filter((p: any) => p.status === 'completed').length || 0;
      const inProgress = progress?.filter((p: any) => p.status === 'in_progress').length || 0;
      const totalNodes = nodeIds.length;
      const totalTimeSpent = progress?.reduce((sum: number, p: any) => sum + (p.time_spent || 0), 0) || 0;

      return NextResponse.json({
        success: true,
        data: {
          totalNodes,
          completed,
          inProgress,
          notStarted: totalNodes - completed - inProgress,
          progressPercentage: totalNodes > 0 ? Math.round((completed / totalNodes) * 100) : 0,
          totalTimeSpent,
        },
      });
    } else {
      // Get overall stats across all paths
      const { data: progress } = await (supabaseAdmin as any)
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      const completed = progress?.filter((p: any) => p.status === 'completed').length || 0;
      const inProgress = progress?.filter((p: any) => p.status === 'in_progress').length || 0;
      const totalTimeSpent = progress?.reduce((sum: number, p: any) => sum + (p.time_spent || 0), 0) || 0;

      return NextResponse.json({
        success: true,
        data: {
          totalNodesTracked: progress?.length || 0,
          completed,
          inProgress,
          totalTimeSpent,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching stats:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
