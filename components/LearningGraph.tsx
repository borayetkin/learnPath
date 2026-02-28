'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LearningNode as LearningNodeType, GraphEdge, NodeStatus } from '@/types';
import CustomNode from './nodes/CustomNode';

interface LearningGraphProps {
  nodes: LearningNodeType[];
  edges: GraphEdge[];
  progress?: Record<string, NodeStatus>;
  onNodeClick?: (node: LearningNodeType) => void;
}

export default function LearningGraph({
  nodes: learningNodes,
  edges: graphEdges,
  progress = {},
  onNodeClick,
}: LearningGraphProps) {
  const nodeTypes: any = useMemo(() => ({ custom: CustomNode }), []);

  // Convert learning nodes to React Flow nodes with automatic layout
  const initialNodes: Node[] = useMemo(() => {
    // Simple hierarchical layout
    const nodesWithoutPrereqs = learningNodes.filter(
      (node) => !node.prerequisites || node.prerequisites.length === 0
    );

    const nodeMap = new Map(learningNodes.map((node) => [node.id!, node]));
    const processedNodes = new Set<string>();
    const flowNodes: Node[] = [];

    let currentY = 0;
    const levelWidth = 300;
    const levelHeight = 150;

    const processNode = (node: LearningNodeType, level: number, indexInLevel: number) => {
      if (processedNodes.has(node.id!)) return;

      const x = level * levelWidth;
      const y = indexInLevel * levelHeight;

      flowNodes.push({
        id: node.id!,
        type: 'custom',
        position: { x, y },
        data: {
          ...node,
          status: progress[node.id!] || 'not_started',
          onClick: () => onNodeClick?.(node),
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      processedNodes.add(node.id!);

      // Process children
      const children = learningNodes.filter((n) =>
        n.prerequisites?.includes(node.id!)
      );

      children.forEach((child, idx) => {
        processNode(child, level + 1, idx);
      });
    };

    nodesWithoutPrereqs.forEach((node, idx) => {
      processNode(node, 0, idx);
    });

    return flowNodes;
  }, [learningNodes, progress, onNodeClick]);

  const initialEdges: Edge[] = useMemo(
    () =>
      graphEdges.map((edge) => ({
        id: `${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: {
          strokeWidth: 2,
        },
      })),
    [graphEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-[600px] border rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const status = node.data?.status || 'not_started';
            switch (status) {
              case 'completed':
                return '#22c55e';
              case 'in_progress':
                return '#eab308';
              default:
                return '#9ca3af';
            }
          }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
