import { NextRequest, NextResponse } from 'next/server';
import { PathGenerationRequestSchema } from '@/types';
import { generateLearningPath } from '@/lib/ai/claude';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedRequest = PathGenerationRequestSchema.parse(body);

    // Generate learning path using Claude
    const aiResponse = await generateLearningPath(validatedRequest);

    // For now, we'll return the AI response without saving to database
    // In a real app, you'd want to save this to the database with a user_id
    // and handle authentication

    return NextResponse.json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error('Error in path generation:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate learning path',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Fetch user's learning paths
    const { data, error } = await supabaseAdmin
      .from('learning_paths')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching learning paths:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch learning paths',
      },
      { status: 500 }
    );
  }
}
