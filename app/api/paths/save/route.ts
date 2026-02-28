import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pathData } = body;

    if (!userId || !pathData) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID and path data are required',
        },
        { status: 400 }
      );
    }

    // Save the learning path
    const { data: savedPath, error: pathError } = await (supabaseAdmin as any)
      .from('learning_paths')
      .insert({
        user_id: userId,
        title: pathData.title,
        description: pathData.description,
        topic: pathData.topic || pathData.title,
        difficulty_level: pathData.difficultyLevel,
        estimated_duration: pathData.estimatedDuration,
        graph_data: {
          nodes: pathData.nodes,
          edges: pathData.edges,
        },
        ai_metadata: {
          generatedAt: new Date().toISOString(),
          model: 'claude-3-5-sonnet-20241022',
        },
      })
      .select()
      .single();

    if (pathError) {
      throw pathError;
    }

    // Save nodes
    const nodesToInsert = pathData.nodes.map((node: any, index: number) => ({
      path_id: savedPath.id,
      title: node.title,
      description: node.description,
      node_type: node.nodeType,
      difficulty: node.difficulty,
      estimated_hours: node.estimatedHours,
      order_index: index,
      prerequisites: node.prerequisites || [],
    }));

    const { data: savedNodes, error: nodesError } = await (supabaseAdmin as any)
      .from('learning_nodes')
      .insert(nodesToInsert)
      .select();

    if (nodesError) {
      throw nodesError;
    }

    // Create a mapping from old node IDs to new node IDs
    const nodeIdMap = pathData.nodes.reduce((acc: any, node: any, index: number) => {
      acc[node.id] = savedNodes[index].id;
      return acc;
    }, {});

    // Save resources
    const resourcesToInsert: any[] = [];
    pathData.nodes.forEach((node: any) => {
      if (node.resources && node.resources.length > 0) {
        node.resources.forEach((resource: any) => {
          resourcesToInsert.push({
            node_id: nodeIdMap[node.id],
            title: resource.title,
            url: resource.url,
            resource_type: resource.resourceType,
            platform: resource.platform,
            is_free: resource.isFree ?? true,
            estimated_duration: resource.estimatedDuration,
            difficulty_level: resource.difficultyLevel,
            description: resource.description,
          });
        });
      }
    });

    if (resourcesToInsert.length > 0) {
      const { error: resourcesError } = await (supabaseAdmin as any)
        .from('resources')
        .insert(resourcesToInsert);

      if (resourcesError) {
        throw resourcesError;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        pathId: savedPath.id,
        path: savedPath,
      },
    });
  } catch (error) {
    console.error('Error saving learning path:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save learning path',
      },
      { status: 500 }
    );
  }
}
