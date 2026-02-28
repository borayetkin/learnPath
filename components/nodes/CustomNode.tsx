'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { NodeStatus } from '@/types';

interface CustomNodeData {
  title: string;
  nodeType: string;
  estimatedHours: number;
  difficulty: number;
  status: NodeStatus;
  onClick?: () => void;
}

function CustomNode({ data }: any) {
  const { title, nodeType, estimatedHours, difficulty, status, onClick } = data;

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in_progress':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getNodeTypeColor = () => {
    switch (nodeType) {
      case 'concept':
        return 'bg-blue-100 text-blue-800';
      case 'skill':
        return 'bg-purple-100 text-purple-800';
      case 'project':
        return 'bg-orange-100 text-orange-800';
      case 'milestone':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        className={`px-4 py-3 rounded-lg border-2 shadow-md min-w-[200px] cursor-pointer hover:shadow-lg transition-shadow ${getStatusColor()}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
          </div>
          {getStatusIcon()}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={`text-xs ${getNodeTypeColor()}`}>
            {nodeType}
          </Badge>
          <span className="text-xs text-gray-600">{estimatedHours}h</span>
          <span className="text-xs text-gray-600">
            {'⭐'.repeat(difficulty)}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

export default memo(CustomNode);
