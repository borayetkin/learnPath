'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';
import { Loader2, ArrowLeft, Clock, TrendingUp, Award } from 'lucide-react';

interface CategoryWithPaths extends Category {
  topPaths?: Array<{
    id: string;
    title: string;
    description: string;
    topic: string;
    difficulty_level: string;
    estimated_duration: number;
    view_count: number;
    completion_rate: number;
    is_public: boolean;
    created_at: string;
  }>;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [category, setCategory] = useState<CategoryWithPaths | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${slug}?includePaths=true`);
        const result = await response.json();

        if (result.success) {
          setCategory(result.data);
        } else {
          router.push('/categories');
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        router.push('/categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [slug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!category) {
    return null;
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div
        className="bg-white border-b"
        style={{ borderBottomColor: category.color || '#e5e7eb' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/categories">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
          </Link>

          <div className="flex items-start gap-6">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {category.icon}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {category.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {category.description}
              </p>

              <Link href={`/?category=${category.slug}`}>
                <Button
                  size="lg"
                  style={{ backgroundColor: category.color }}
                  className="text-white hover:opacity-90"
                >
                  Create Learning Path in {category.name}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Paths */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Popular Learning Paths
          </h2>
          <p className="text-gray-600">
            Explore top-rated learning paths created by the community
          </p>
        </div>

        {category.topPaths && category.topPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.topPaths.map((path) => (
              <Link
                key={path.id}
                href={`/path/${path.id}`}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant="secondary"
                        className={getDifficultyColor(path.difficulty_level)}
                      >
                        {path.difficulty_level}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {path.view_count || 0}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                      {path.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm mb-4 line-clamp-3">
                      {path.description || path.topic}
                    </CardDescription>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {path.estimated_duration}h
                      </div>
                      {path.completion_rate > 0 && (
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {Math.round(path.completion_rate)}%
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">
              No public learning paths available in this category yet.
            </p>
            <Link href={`/?category=${category.slug}`}>
              <Button style={{ backgroundColor: category.color }} className="text-white">
                Be the first to create one!
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
