'use client';

import { useMemo, useState } from 'react';
import { LearningNode as LearningNodeType, GraphEdge, NodeStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Lock,
  Play,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Code,
} from 'lucide-react';

interface MilestoneMapProps {
  nodes: LearningNodeType[];
  edges: GraphEdge[];
  progress: Record<string, NodeStatus>;
  onUpdateStatus: (nodeId: string, status: NodeStatus) => void;
  onNodeClick: (node: LearningNodeType) => void;
}

function getResourceIcon(type: string) {
  switch (type) {
    case 'video': return <Video className="w-3.5 h-3.5" />;
    case 'course': return <BookOpen className="w-3.5 h-3.5" />;
    case 'article': return <FileText className="w-3.5 h-3.5" />;
    case 'exercise': return <Code className="w-3.5 h-3.5" />;
    default: return <FileText className="w-3.5 h-3.5" />;
  }
}

export default function MilestoneMap({
  nodes,
  edges,
  progress,
  onUpdateStatus,
  onNodeClick,
}: MilestoneMapProps) {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  // Build dependency map: for each node, which nodes are its prerequisites
  const prerequisiteMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const node of nodes) {
      map.set(node.id!, []);
    }
    for (const edge of edges) {
      const existing = map.get(edge.to) || [];
      existing.push(edge.from);
      map.set(edge.to, existing);
    }
    return map;
  }, [nodes, edges]);

  // Determine if a node is unlocked based on prerequisites
  const isNodeUnlocked = (nodeId: string): boolean => {
    const prereqs = prerequisiteMap.get(nodeId) || [];
    if (prereqs.length === 0) return true;
    return prereqs.every((prereqId) => progress[prereqId] === 'completed');
  };

  // Sort nodes by topological order (dependencies first)
  const sortedNodes = useMemo(() => {
    const visited = new Set<string>();
    const result: LearningNodeType[] = [];
    const nodeMap = new Map(nodes.map((n) => [n.id!, n]));

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      const prereqs = prerequisiteMap.get(nodeId) || [];
      for (const prereqId of prereqs) {
        visit(prereqId);
      }
      const node = nodeMap.get(nodeId);
      if (node) result.push(node);
    };

    for (const node of nodes) {
      visit(node.id!);
    }

    return result;
  }, [nodes, prerequisiteMap]);

  const completedCount = Object.values(progress).filter((s) => s === 'completed').length;
  const totalNodes = nodes.length;
  const allCompleted = completedCount === totalNodes && totalNodes > 0;

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Vertical timeline line */}
      <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-300 via-cyan-300 to-green-300" />

      <div className="space-y-4">
        {sortedNodes.map((node, index) => {
          const nodeId = node.id!;
          const status = progress[nodeId] || 'not_started';
          const unlocked = isNodeUnlocked(nodeId);
          const prereqs = prerequisiteMap.get(nodeId) || [];
          const isExpanded = expandedNode === nodeId;
          const isLocked = !unlocked && status !== 'completed';

          return (
            <div key={nodeId} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all ${
                  status === 'completed'
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : status === 'in_progress'
                    ? 'bg-violet-100 border-violet-500 text-violet-700 ring-4 ring-violet-100'
                    : isLocked
                    ? 'bg-gray-100 border-gray-300 text-gray-400'
                    : 'bg-white border-cyan-400 text-cyan-600'
                }`}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : isLocked ? (
                  <Lock className="w-5 h-5" />
                ) : status === 'in_progress' ? (
                  <Play className="w-5 h-5 fill-current" />
                ) : (
                  <span className="text-lg font-bold">{index + 1}</span>
                )}
              </div>

              {/* Node card */}
              <div className="flex-1 pb-2">
                <Card
                  className={`transition-all ${
                    status === 'completed'
                      ? 'border-green-200 bg-green-50/50'
                      : status === 'in_progress'
                      ? 'border-violet-200 bg-violet-50/50 shadow-md'
                      : isLocked
                      ? 'border-gray-200 bg-gray-50/50 opacity-60'
                      : 'border-cyan-200 bg-white hover:shadow-md'
                  }`}
                >
                  <CardContent className="p-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold text-base ${isLocked ? 'text-gray-400' : ''}`}>
                            {node.title}
                          </h3>
                          <Badge variant="outline" className="text-xs capitalize shrink-0">
                            {node.nodeType}
                          </Badge>
                        </div>
                        {node.description && (
                          <p className={`text-sm line-clamp-2 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                            {node.description}
                          </p>
                        )}
                      </div>

                      {/* Action button */}
                      <div className="shrink-0">
                        {status === 'completed' ? (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        ) : isLocked ? (
                          <Badge variant="secondary" className="text-gray-500">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        ) : status === 'in_progress' ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => onUpdateStatus(nodeId, 'completed')}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-violet-300 text-violet-700 hover:bg-violet-50"
                            onClick={() => onUpdateStatus(nodeId, 'in_progress')}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Metadata row */}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {node.estimatedHours}h
                      </div>
                      <div className="text-xs text-gray-500">
                        {'⭐'.repeat(node.difficulty)}
                      </div>
                      {prereqs.length > 0 && (
                        <div className="text-xs text-gray-400">
                          Requires: {prereqs.length} prerequisite{prereqs.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {!isLocked && (
                        <button
                          className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1 ml-auto"
                          onClick={() => setExpandedNode(isExpanded ? null : nodeId)}
                        >
                          {isExpanded ? 'Less' : 'Details'}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && !isLocked && (
                      <div className="mt-4 space-y-4 border-t pt-4">
                        {/* Key Takeaways */}
                        {node.keyTakeaways && node.keyTakeaways.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Key Takeaways</h4>
                            <ul className="space-y-1">
                              {node.keyTakeaways.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Resources */}
                        {node.resources && node.resources.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Resources</h4>
                            <div className="space-y-2">
                              {node.resources.map((r, i) => (
                                <a
                                  key={i}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 rounded-lg bg-white border hover:bg-gray-50 transition-colors"
                                >
                                  <div className="p-1.5 rounded bg-gray-100">
                                    {getResourceIcon(r.resourceType)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{r.title}</p>
                                    <div className="flex items-center gap-2">
                                      {r.platform && (
                                        <span className="text-xs text-gray-500">{r.platform}</span>
                                      )}
                                      {r.isFree && (
                                        <span className="text-xs text-green-600">Free</span>
                                      )}
                                    </div>
                                  </div>
                                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Practical Exercises */}
                        {node.practicalExercises && node.practicalExercises.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Exercises</h4>
                            <ul className="space-y-1">
                              {node.practicalExercises.map((e, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                  <Code className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                                  {e}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}

        {/* Badge completion node */}
        <div className="relative flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all ${
              allCompleted
                ? 'bg-yellow-100 border-yellow-500 text-yellow-700 ring-4 ring-yellow-100'
                : 'bg-gray-100 border-gray-300 text-gray-400'
            }`}
          >
            <span className="text-2xl">{allCompleted ? '🏆' : '🔒'}</span>
          </div>
          <div className="flex-1 pb-2">
            <Card
              className={`transition-all ${
                allCompleted
                  ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg'
                  : 'border-gray-200 bg-gray-50/50 opacity-50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-bold text-lg ${allCompleted ? 'text-yellow-800' : 'text-gray-400'}`}>
                      {allCompleted ? 'Path Complete!' : 'Badge Locked'}
                    </h3>
                    <p className={`text-sm ${allCompleted ? 'text-yellow-700' : 'text-gray-400'}`}>
                      {allCompleted
                        ? 'Congratulations! You earned the badge for this learning path.'
                        : `Complete all ${totalNodes} milestones to earn your badge`}
                    </p>
                  </div>
                  {allCompleted && (
                    <div className="text-4xl">🏆</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
