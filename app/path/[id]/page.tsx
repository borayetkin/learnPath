'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MilestoneMap from '@/components/MilestoneMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowLeft, Share2, Trophy } from 'lucide-react';
import { LearningNode as LearningNodeType, NodeStatus, AIPathGenerationResponse } from '@/types';

export default function PathViewerPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.id as string;

  const [pathData, setPathData] = useState<AIPathGenerationResponse | null>(null);
  const [progress, setProgress] = useState<Record<string, NodeStatus>>({});

  useEffect(() => {
    // Load path data from localStorage (in a real app, this would come from the database)
    const stored = localStorage.getItem(pathId);
    if (stored) {
      const data = JSON.parse(stored);
      setPathData(data);
    }

    // Load progress from localStorage
    const storedProgress = localStorage.getItem(`${pathId}-progress`);
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
  }, [pathId]);

  const handleNodeClick = (node: LearningNodeType) => {
    // Scrolling is handled by the milestone map inline expansion
  };

  const handleUpdateStatus = (nodeId: string, status: NodeStatus) => {
    const newProgress = { ...progress, [nodeId]: status };
    setProgress(newProgress);

    // Save to localStorage
    localStorage.setItem(`${pathId}-progress`, JSON.stringify(newProgress));
  };

  const calculateProgress = () => {
    if (!pathData) return 0;
    const totalNodes = pathData.nodes.length;
    const completedNodes = Object.values(progress).filter(
      (s) => s === 'completed'
    ).length;
    return totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  };

  if (!pathData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = calculateProgress();
  const completedCount = Object.values(progress).filter(
    (s) => s === 'completed'
  ).length;
  const inProgressCount = Object.values(progress).filter(
    (s) => s === 'in_progress'
  ).length;
  const allCompleted = completedCount === pathData.nodes.length && pathData.nodes.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold">{pathData.title}</h1>
                  {allCompleted && (
                    <Badge className="bg-yellow-500 text-white">
                      <Trophy className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                {pathData.description && (
                  <p className="text-sm text-gray-600 mt-1 max-w-xl line-clamp-1">
                    {pathData.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Progress summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-violet-600">{progressPercentage}%</div>
              <Progress value={progressPercentage} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Overall</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedCount}/{pathData.nodes.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{inProgressCount}</div>
              <p className="text-xs text-gray-500 mt-1">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{pathData.estimatedDuration}h</div>
              <Badge variant="secondary" className="mt-1 capitalize">
                {pathData.difficultyLevel}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Milestone Map */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Your Learning Journey</h2>
          <MilestoneMap
            nodes={pathData.nodes}
            edges={pathData.edges || []}
            progress={progress}
            onUpdateStatus={handleUpdateStatus}
            onNodeClick={handleNodeClick}
          />
        </div>
      </main>
    </div>
  );
}
