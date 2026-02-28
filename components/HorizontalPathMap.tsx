'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { LearningNode as LearningNodeType, GraphEdge, NodeStatus } from '@/types';
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
  Trophy,
} from 'lucide-react';

interface HorizontalPathMapProps {
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

export default function HorizontalPathMap({
  nodes,
  edges,
  progress,
  onUpdateStatus,
  onNodeClick,
}: HorizontalPathMapProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Build dependency map
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

  const isNodeUnlocked = (nodeId: string): boolean => {
    const prereqs = prerequisiteMap.get(nodeId) || [];
    if (prereqs.length === 0) return true;
    return prereqs.every((prereqId) => progress[prereqId] === 'completed');
  };

  // Sort topologically
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

  const selected = selectedNode ? sortedNodes.find((n) => n.id === selectedNode) : null;
  const selectedStatus = selectedNode ? (progress[selectedNode] || 'not_started') : 'not_started';
  const selectedUnlocked = selectedNode ? isNodeUnlocked(selectedNode) : false;
  const selectedLocked = selectedNode ? (!selectedUnlocked && selectedStatus !== 'completed') : false;

  // Auto-scroll to first in-progress or not-started node on mount
  useEffect(() => {
    const firstActive = sortedNodes.find((n) => {
      const s = progress[n.id!] || 'not_started';
      return s === 'in_progress' || (s === 'not_started' && isNodeUnlocked(n.id!));
    });
    if (firstActive) {
      const el = nodeRefs.current.get(firstActive.id!);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  return (
    <div className="w-full">
      {/* Horizontal scrolling path */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4 scrollbar-thin"
      >
        <div className="flex items-center px-6 py-8 min-w-max gap-0">
          {sortedNodes.map((node, index) => {
            const nodeId = node.id!;
            const status = progress[nodeId] || 'not_started';
            const unlocked = isNodeUnlocked(nodeId);
            const isLocked = !unlocked && status !== 'completed';
            const isSelected = selectedNode === nodeId;

            return (
              <div key={nodeId} className="flex items-center">
                {/* Node circle + label */}
                <div
                  ref={(el) => { if (el) nodeRefs.current.set(nodeId, el); }}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => {
                    setSelectedNode(isSelected ? null : nodeId);
                    onNodeClick(node);
                  }}
                >
                  {/* Node circle */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative ${
                      status === 'completed'
                        ? 'bg-green-100 border-green-500 text-green-700 shadow-md shadow-green-200'
                        : status === 'in_progress'
                        ? 'bg-violet-100 border-violet-500 text-violet-700 ring-4 ring-violet-100 shadow-md shadow-violet-200'
                        : isLocked
                        ? 'bg-gray-100 border-gray-300 text-gray-400'
                        : 'bg-white border-cyan-400 text-cyan-600 group-hover:shadow-md group-hover:shadow-cyan-100 group-hover:scale-110'
                    } ${isSelected ? 'ring-4 ring-offset-2 ring-violet-400 scale-110' : ''}`}
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

                  {/* Node label */}
                  <div className={`mt-3 text-center max-w-[120px] ${isSelected ? 'transform scale-105' : ''}`}>
                    <p className={`text-xs font-semibold leading-tight line-clamp-2 ${
                      isLocked ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      {node.title}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-400">{node.estimatedHours}h</span>
                    </div>
                  </div>
                </div>

                {/* Connector line */}
                {index < sortedNodes.length - 1 && (
                  <div className="flex items-center mx-1 -mt-8">
                    <div
                      className={`w-16 sm:w-24 h-0.5 transition-all duration-500 ${
                        status === 'completed'
                          ? 'bg-gradient-to-r from-green-400 to-green-300'
                          : status === 'in_progress'
                          ? 'bg-gradient-to-r from-violet-400 to-gray-300'
                          : 'bg-gray-200'
                      }`}
                    />
                    <div
                      className={`w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] -ml-px ${
                        status === 'completed'
                          ? 'border-l-green-300'
                          : status === 'in_progress'
                          ? 'border-l-gray-300'
                          : 'border-l-gray-200'
                      }`}
                    />
                  </div>
                )}

                {/* Trophy at the end */}
                {index === sortedNodes.length - 1 && (
                  <div className="flex items-center mx-1 -mt-8">
                    <div
                      className={`w-12 h-0.5 ${
                        status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                      }`}
                    />
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                        allCompleted
                          ? 'bg-yellow-100 border-yellow-400 shadow-md shadow-yellow-200'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      {allCompleted ? (
                        <Trophy className="w-6 h-6 text-yellow-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected node detail panel */}
      {selected && (
        <div className="mx-4 sm:mx-6 mt-2 mb-4 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`rounded-xl border-2 p-5 transition-colors ${
              selectedStatus === 'completed'
                ? 'border-green-200 bg-green-50/50'
                : selectedStatus === 'in_progress'
                ? 'border-violet-200 bg-violet-50/50'
                : selectedLocked
                ? 'border-gray-200 bg-gray-50/50'
                : 'border-cyan-200 bg-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{selected.title}</h3>
                  <Badge variant="outline" className="text-xs capitalize">{selected.nodeType}</Badge>
                </div>
                {selected.description && (
                  <p className="text-sm text-gray-600">{selected.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {selected.estimatedHours}h estimated
                  </div>
                  <div className="text-xs text-gray-500">
                    {'⭐'.repeat(selected.difficulty)}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {selectedStatus === 'completed' ? (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                  </Badge>
                ) : selectedLocked ? (
                  <Badge variant="secondary" className="text-gray-500">
                    <Lock className="w-3 h-3 mr-1" /> Locked
                  </Badge>
                ) : selectedStatus === 'in_progress' ? (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onUpdateStatus(selectedNode!, 'completed')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-violet-300 text-violet-700 hover:bg-violet-50"
                    onClick={() => onUpdateStatus(selectedNode!, 'in_progress')}
                  >
                    <Play className="w-4 h-4 mr-1" /> Start
                  </Button>
                )}
              </div>
            </div>

            {/* Content grid */}
            {!selectedLocked && (
              <div className="grid md:grid-cols-3 gap-4 border-t pt-4">
                {/* Key Takeaways */}
                {selected.keyTakeaways && selected.keyTakeaways.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Key Takeaways</h4>
                    <ul className="space-y-1.5">
                      {selected.keyTakeaways.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resources */}
                {selected.resources && selected.resources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Resources</h4>
                    <div className="space-y-2">
                      {selected.resources.map((r, i) => (
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
                              {r.platform && <span className="text-xs text-gray-500">{r.platform}</span>}
                              {r.isFree && <span className="text-xs text-green-600">Free</span>}
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical Exercises */}
                {selected.practicalExercises && selected.practicalExercises.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Exercises</h4>
                    <ul className="space-y-1.5">
                      {selected.practicalExercises.map((e, i) => (
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
          </div>
        </div>
      )}
    </div>
  );
}
