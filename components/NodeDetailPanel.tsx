'use client';

import { LearningNode as LearningNodeType, Resource, NodeStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ExternalLink,
  Clock,
  BookOpen,
  Video,
  FileText,
  Code,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { X } from 'lucide-react';

interface NodeDetailPanelProps {
  node: LearningNodeType | null;
  status?: NodeStatus;
  onClose: () => void;
  onUpdateStatus?: (nodeId: string, status: NodeStatus) => void;
}

export default function NodeDetailPanel({
  node,
  status = 'not_started',
  onClose,
  onUpdateStatus,
}: NodeDetailPanelProps) {
  if (!node) return null;

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'exercise':
        return <Code className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleStatusChange = (newStatus: NodeStatus) => {
    if (onUpdateStatus && node.id) {
      onUpdateStatus(node.id, newStatus);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Node Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Node Header */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-2xl font-bold">{node.title}</h3>
            <Badge variant="outline" className="capitalize">
              {node.nodeType}
            </Badge>
          </div>
          {node.description && (
            <p className="text-gray-700 leading-relaxed">{node.description}</p>
          )}
        </div>

        {/* Node Metadata */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {node.estimatedHours} hours
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Difficulty: {'⭐'.repeat(node.difficulty)}
          </div>
        </div>

        <Separator />

        {/* Progress Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                variant={status === 'not_started' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('not_started')}
              >
                <Circle className="w-4 h-4 mr-2" />
                Not Started
              </Button>
              <Button
                variant={status === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('in_progress')}
              >
                <Clock className="w-4 h-4 mr-2" />
                In Progress
              </Button>
              <Button
                variant={status === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('completed')}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Takeaways */}
        {node.keyTakeaways && node.keyTakeaways.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3">Key Takeaways</h4>
              <ul className="space-y-2">
                {node.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Resources */}
        {node.resources && node.resources.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-4">Learning Resources</h4>
              <div className="space-y-3">
                {node.resources.map((resource, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          {getResourceIcon(resource.resourceType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm mb-1 line-clamp-2">
                            {resource.title}
                          </h5>
                          {resource.description && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {resource.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {resource.platform && (
                              <Badge variant="secondary" className="text-xs">
                                {resource.platform}
                              </Badge>
                            )}
                            {resource.isFree && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-800"
                              >
                                Free
                              </Badge>
                            )}
                            {resource.estimatedDuration && (
                              <span className="text-xs text-gray-500">
                                {resource.estimatedDuration} min
                              </span>
                            )}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto"
                            asChild
                          >
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600"
                            >
                              Open Resource
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Practical Exercises */}
        {node.practicalExercises && node.practicalExercises.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3">Practical Exercises</h4>
              <ul className="space-y-2">
                {node.practicalExercises.map((exercise, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Code className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{exercise}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
