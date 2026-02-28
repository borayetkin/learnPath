import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pathId, nodeId, status, notes, timeSpent } = body;

    if (!userId || !pathId || !nodeId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Check if progress already exists
    const { data: existing } = await (supabaseAdmin as any)
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('node_id', nodeId)
      .single();

    const now = new Date().toISOString();
    let result;

    if (existing) {
      // Update existing progress
      const updateData: any = {
        status,
        notes: notes || (existing as any).notes,
        time_spent: timeSpent || (existing as any).time_spent,
        updated_at: now,
      };

      if (status === 'in_progress' && !(existing as any).started_at) {
        updateData.started_at = now;
      }

      if (status === 'completed') {
        updateData.completed_at = now;
      }

      const { data, error } = await (supabaseAdmin as any)
        .from('user_progress')
        .update(updateData)
        .eq('id', (existing as any).id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new progress
      const insertData: any = {
        user_id: userId,
        path_id: pathId,
        node_id: nodeId,
        status,
        notes,
        time_spent: timeSpent,
      };

      if (status === 'in_progress') {
        insertData.started_at = now;
      }

      if (status === 'completed') {
        insertData.started_at = now;
        insertData.completed_at = now;
      }

      const { data, error } = await (supabaseAdmin as any)
        .from('user_progress')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error updating progress:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update progress',
      },
      { status: 500 }
    );
  }
}
