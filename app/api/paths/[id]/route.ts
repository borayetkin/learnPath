import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pathId } = await params;

    // Fetch the learning path
    const { data: path, error: pathError } = await supabaseAdmin
      .from('learning_paths')
      .select('*')
      .eq('id', pathId)
      .single();

    if (pathError) {
      throw pathError;
    }

    // Fetch associated nodes
    const { data: nodes, error: nodesError } = await supabaseAdmin
      .from('learning_nodes')
      .select('*')
      .eq('path_id', pathId)
      .order('order_index', { ascending: true });

    if (nodesError) {
      throw nodesError;
    }

    // Fetch resources for each node
    const nodeIds = nodes.map((node: any) => node.id);
    const { data: resources, error: resourcesError } = await supabaseAdmin
      .from('resources')
      .select('*')
      .in('node_id', nodeIds);

    if (resourcesError) {
      throw resourcesError;
    }

    // Group resources by node_id
    const resourcesByNode = resources.reduce((acc: any, resource: any) => {
      if (!acc[resource.node_id]) {
        acc[resource.node_id] = [];
      }
      acc[resource.node_id].push(resource);
      return acc;
    }, {} as Record<string, any>);

    // Attach resources to nodes
    const nodesWithResources = nodes.map((node: any) => ({
      ...node,
      resources: resourcesByNode[node.id] || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...(path as any),
        nodes: nodesWithResources,
      },
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch learning path',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pathId } = await params;
    const body = await request.json();

    const { data, error } = await (supabaseAdmin as any)
      .from('learning_paths')
      .update(body)
      .eq('id', pathId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error updating learning path:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update learning path',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pathId } = await params;

    const { error } = await supabaseAdmin
      .from('learning_paths')
      .delete()
      .eq('id', pathId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Learning path deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting learning path:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete learning path',
      },
      { status: 500 }
    );
  }
}
