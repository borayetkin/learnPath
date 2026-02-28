import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch category by slug
    const { data: category, error: categoryError } = await (supabaseAdmin as any)
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 }
      );
    }

    // Optionally fetch paths in this category
    const { searchParams } = new URL(request.url);
    const includePaths = searchParams.get('includePaths') === 'true';

    if (includePaths) {
      const { data: paths } = await (supabaseAdmin as any)
        .from('learning_paths')
        .select('id, title, description, topic, difficulty_level, estimated_duration, view_count, completion_rate, is_public, created_at')
        .eq('category_id', category.id)
        .eq('is_public', true)
        .order('view_count', { ascending: false })
        .limit(10);

      return NextResponse.json({
        success: true,
        data: {
          ...category,
          topPaths: paths || [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category',
      },
      { status: 500 }
    );
  }
}
