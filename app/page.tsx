'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PathGenerationForm from '@/components/PathGenerationForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Grid3X3, LogIn, User } from 'lucide-react';
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

          {/* Right Column - Path Preview */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Your path will look like this</h3>
              <p className="text-gray-600 text-sm mb-4">
                AI generates a milestone-based roadmap you can follow step by step
              </p>
            </div>

            {/* Sample Milestone Preview */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-violet-400 via-cyan-400 to-green-400" />

              <div className="space-y-1">
                {[
                  { title: 'Foundations', desc: 'Core concepts & setup', status: 'completed' as const, hours: 4 },
                  { title: 'Building Blocks', desc: 'Essential skills & patterns', status: 'completed' as const, hours: 6 },
                  { title: 'Hands-on Practice', desc: 'Guided exercises & projects', status: 'in_progress' as const, hours: 8 },
                  { title: 'Deep Dive', desc: 'Advanced techniques', status: 'locked' as const, hours: 10 },
                  { title: 'Capstone Project', desc: 'Put it all together', status: 'locked' as const, hours: 12 },
                  { title: 'Badge Earned!', desc: 'Path complete - show it off', status: 'badge' as const, hours: 0 },
                ].map((node, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                      node.status === 'completed'
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : node.status === 'in_progress'
                        ? 'bg-violet-100 border-violet-500 text-violet-700 ring-4 ring-violet-100'
                        : node.status === 'badge'
                        ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {node.status === 'completed' ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : node.status === 'in_progress' ? (
                        <span className="text-sm font-bold">{i + 1}</span>
                      ) : node.status === 'badge' ? (
                        <span className="text-lg">🏆</span>
                      ) : (
                        <span className="text-sm font-bold">{i + 1}</span>
                      )}
                    </div>
                    <div className={`flex-1 p-3 rounded-lg ${
                      node.status === 'completed'
                        ? 'bg-green-50 border border-green-200'
                        : node.status === 'in_progress'
                        ? 'bg-violet-50 border border-violet-200'
                        : node.status === 'badge'
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-gray-50 border border-gray-200 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{node.title}</h4>
                        {node.hours > 0 && (
                          <span className="text-xs text-gray-500">{node.hours}h</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{node.desc}</p>
                      {node.status === 'in_progress' && (
                        <div className="mt-2">
                          <div className="w-full bg-violet-200 rounded-full h-1.5">
                            <div className="bg-violet-600 h-1.5 rounded-full" style={{ width: '45%' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Topics */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Guitar', 'Python', 'Photography', 'French',
                  'Meditation', 'Watercolor', 'Machine Learning', 'UI/UX Design',
                ].map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 rounded-full text-sm cursor-pointer transition-colors"
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
