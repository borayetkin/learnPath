'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PathGenerationForm from '@/components/PathGenerationForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, TrendingUp, Target, Grid3X3, LogIn, User } from 'lucide-react';
import { AIPathGenerationResponse } from '@/types';

function HomeContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState<AIPathGenerationResponse | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const categorySlug = searchParams.get('category') || undefined;

  const handleGenerate = async (data: AIPathGenerationResponse) => {
    setGeneratedPath(data);
    setIsGenerating(false);

    // Save the path and redirect to the path viewer
    // For now, we'll just store it in localStorage for demo purposes
    const pathId = `path-${Date.now()}`;
    localStorage.setItem(pathId, JSON.stringify(data));

    // Redirect to the path viewer
    router.push(`/path/${pathId}`);
  };

  const handleFormSubmit = () => {
    setIsGenerating(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                  LearnPath
                </h1>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Turn any learning goal into a clear path - powered by AI
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/categories">
                <Button variant="outline" size="sm" className="gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Categories
                </Button>
              </Link>
              {!authLoading && (
                user ? (
                  <Link href="/dashboard">
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth">
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Form */}
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">
                Start Your Learning Journey
              </h2>
              <p className="text-gray-600">
                From music to coding, mindfulness to photography - tell us what you want to learn,
                and our AI will create a personalized path tailored to your goals.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Generate Your Learning Path</CardTitle>
                <CardDescription>
                  Fill in the details below to create a customized learning roadmap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PathGenerationForm
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  initialCategorySlug={categorySlug}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">Why LearnPath?</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Personalized Paths</h4>
                        <p className="text-sm text-gray-600">
                          AI analyzes your background, goals, and learning style to
                          create custom learning paths just for you.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Curated Resources</h4>
                        <p className="text-sm text-gray-600">
                          Get access to high-quality courses, articles, videos, and
                          exercises from the best platforms.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-green-100">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Track Progress</h4>
                        <p className="text-sm text-gray-600">
                          Visual progress tracking and interactive learning graphs
                          keep you motivated and on track.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Example Topics */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Web Development',
                  'Machine Learning',
                  'Data Science',
                  'Mobile Development',
                  'DevOps',
                  'Cloud Computing',
                  'Cybersecurity',
                  'UI/UX Design',
                ].map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm cursor-pointer transition-colors"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>
            Powered by Claude AI • Built with Next.js, React Flow, and Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
