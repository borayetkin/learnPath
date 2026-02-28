'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LearningGraph from '@/components/LearningGraph';
import NodeDetailPanel from '@/components/NodeDetailPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowLeft, Download, Share2 } from 'lucide-react';
import { LearningNode as LearningNodeType, NodeStatus, AIPathGenerationResponse } from '@/types';

export default function PathViewerPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.id as string;

  const [pathData, setPathData] = useState<AIPathGenerationResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<LearningNodeType | null>(null);
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
    setSelectedNode(node);
  };

  const handleUpdateStatus = (nodeId: string, status: NodeStatus) => {
    const newProgress = { ...progress, [nodeId]: status };
    setProgress(newProgress);

    // Save to localStorage
    localStorage.setItem(`${pathId}-progress`, JSON.stringify(newProgress));

    // Update the selected node if it's currently selected
    if (selectedNode?.id === nodeId) {
      setSelectedNode({ ...selectedNode });
    }
  };

  const calculateProgress = () => {
    if (!pathData) return 0;
    const totalNodes = pathData.nodes.length;
    const completedNodes = Object.values(progress).filter(
      (status) => status === 'completed'
    ).length;
    return totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  };

  if (!pathData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-600">Loading your learning path</p>
        </div>
      </div>
    );
  }

  const progressPercentage = calculateProgress();
  const completedCount = Object.values(progress).filter(
    (status) => status === 'completed'
  ).length;
  const inProgressCount = Object.values(progress).filter(
    (status) => status === 'in_progress'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <h1 className="text-xl font-bold">{pathData.title}</h1>
                </div>
                {pathData.description && (
                  <p className="text-sm text-gray-600 mt-1">
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
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressPercentage}%</div>
              <Progress value={progressPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedCount}/{pathData.nodes.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">nodes completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {inProgressCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">nodes in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pathData.estimatedDuration}h</div>
              <Badge variant="secondary" className="mt-1">
                {pathData.difficultyLevel}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Learning Graph */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Path Visualization</CardTitle>
            <p className="text-sm text-gray-600">
              Click on any node to view details and resources
            </p>
          </CardHeader>
          <CardContent>
            <LearningGraph
              nodes={pathData.nodes}
              edges={pathData.edges || []}
              progress={progress}
              onNodeClick={handleNodeClick}
            />
          </CardContent>
        </Card>

        {/* Milestones */}
        {pathData.milestones && pathData.milestones.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pathData.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="p-2 rounded-full bg-purple-100">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">After: {milestone.afterNode}</p>
                      <p className="text-sm text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Node Detail Panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          status={progress[selectedNode.id!] || 'not_started'}
          onClose={() => setSelectedNode(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
