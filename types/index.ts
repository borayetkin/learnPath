import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

// Category Schema
export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  icon: z.string().min(1, 'Icon is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true),
  orderIndex: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Resource Schema
export const ResourceSchema = z.object({
  id: z.string().uuid().optional(),
  nodeId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Must be a valid URL'),
  resourceType: z.enum(['course', 'article', 'video', 'book', 'documentation', 'exercise', 'app', 'podcast', 'community', 'tool', 'sheet_music', 'template']),
  platform: z.string().optional(),
  isFree: z.boolean().default(true),
  estimatedDuration: z.number().positive().optional(), // in minutes
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  qualityScore: z.number().min(0).max(1).optional(),
  thumbnailUrl: z.string().url().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  domain: z.string().optional(),
  communityRating: z.number().min(0).max(5).optional(),
  ratingCount: z.number().default(0).optional(),
  certificationAvailable: z.boolean().default(false).optional(),
  practicalComponent: z.boolean().default(false).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.date().optional(),
});

// Learning Node Schema
export const LearningNodeSchema = z.object({
  id: z.string().uuid().optional(),
  pathId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  nodeType: z.enum(['concept', 'skill', 'project', 'milestone', 'practice', 'theory', 'technique', 'performance', 'foundation', 'integration']),
  difficulty: z.number().min(1).max(5),
  estimatedHours: z.number().positive(),
  orderIndex: z.number().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  prerequisites: z.array(z.string().uuid()).default([]),
  resources: z.array(ResourceSchema).default([]),
  keyTakeaways: z.array(z.string()).default([]),
  practicalExercises: z.array(z.string()).default([]),
  createdAt: z.date().optional(),
});

// Graph Edge Schema
export const GraphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(['prerequisite']).default('prerequisite'),
});

// Milestone Schema
export const MilestoneSchema = z.object({
  afterNode: z.string(),
  description: z.string(),
});

// Learning Path Schema
export const LearningPathSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  topic: z.string().min(1, 'Topic is required'),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedDuration: z.number().positive(), // in hours
  graphData: z.object({
    nodes: z.array(LearningNodeSchema),
    edges: z.array(GraphEdgeSchema),
  }).optional(),
  aiMetadata: z.record(z.string(), z.any()).optional(),
  isPublic: z.boolean().default(false),
  viewCount: z.number().default(0).optional(),
  forkCount: z.number().default(0).optional(),
  completionRate: z.number().default(0).optional(),
  milestones: z.array(MilestoneSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Path Generation Request Schema
export const PathGenerationRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  userBackground: z.string().optional(),
  learningGoal: z.string().optional(),
  timeCommitment: z.string().optional(),
  preferredResourceTypes: z.array(z.string()).optional(),
  currentKnowledge: z.array(z.string()).optional(),
  deadline: z.date().optional(),
});

// AI Path Generation Response Schema
export const AIPathGenerationResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  estimatedDuration: z.number(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  nodes: z.array(LearningNodeSchema),
  edges: z.array(GraphEdgeSchema),
  milestones: z.array(MilestoneSchema).optional(),
});

// User Progress Schema
export const UserProgressSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  pathId: z.string().uuid(),
  nodeId: z.string().uuid(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  notes: z.string().optional(),
  timeSpent: z.number().optional(), // in minutes
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Resource Interaction Schema
export const ResourceInteractionSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  resourceId: z.string().uuid(),
  interactionType: z.enum(['viewed', 'completed', 'bookmarked', 'rated']),
  rating: z.number().min(1).max(5).optional(),
  createdAt: z.date().optional(),
});

// ============================================================================
// TypeScript Types (inferred from schemas)
// ============================================================================

export type Category = z.infer<typeof CategorySchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type LearningNode = z.infer<typeof LearningNodeSchema>;
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type LearningPath = z.infer<typeof LearningPathSchema>;
export type PathGenerationRequest = z.infer<typeof PathGenerationRequestSchema>;
export type AIPathGenerationResponse = z.infer<typeof AIPathGenerationResponseSchema>;
export type UserProgress = z.infer<typeof UserProgressSchema>;
export type ResourceInteraction = z.infer<typeof ResourceInteractionSchema>;

// ============================================================================
// Additional Types
// ============================================================================

export type NodeStatus = 'not_started' | 'in_progress' | 'completed';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type NodeType = 'concept' | 'skill' | 'project' | 'milestone' | 'practice' | 'theory' | 'technique' | 'performance' | 'foundation' | 'integration';
export type ResourceType = 'course' | 'article' | 'video' | 'book' | 'documentation' | 'exercise' | 'app' | 'podcast' | 'community' | 'tool' | 'sheet_music' | 'template';
export type InteractionType = 'viewed' | 'completed' | 'bookmarked' | 'rated';

// Database types
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          description: string | null;
          color: string | null;
          is_active: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
          description?: string | null;
          color?: string | null;
          is_active?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          description?: string | null;
          color?: string | null;
          is_active?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      learning_paths: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          topic: string;
          difficulty_level: DifficultyLevel | null;
          estimated_duration: number | null;
          graph_data: any | null;
          ai_metadata: any | null;
          is_public: boolean;
          view_count: number;
          fork_count: number;
          completion_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          topic: string;
          difficulty_level?: DifficultyLevel | null;
          estimated_duration?: number | null;
          graph_data?: any | null;
          ai_metadata?: any | null;
          is_public?: boolean;
          view_count?: number;
          fork_count?: number;
          completion_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          topic?: string;
          difficulty_level?: DifficultyLevel | null;
          estimated_duration?: number | null;
          graph_data?: any | null;
          ai_metadata?: any | null;
          is_public?: boolean;
          view_count?: number;
          fork_count?: number;
          completion_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      learning_nodes: {
        Row: {
          id: string;
          path_id: string;
          title: string;
          description: string | null;
          node_type: NodeType | null;
          difficulty: number | null;
          estimated_hours: number | null;
          order_index: number | null;
          position_x: number | null;
          position_y: number | null;
          prerequisites: any | null;
          key_takeaways: any | null;
          practical_exercises: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          path_id: string;
          title: string;
          description?: string | null;
          node_type?: NodeType | null;
          difficulty?: number | null;
          estimated_hours?: number | null;
          order_index?: number | null;
          position_x?: number | null;
          position_y?: number | null;
          prerequisites?: any | null;
          key_takeaways?: any | null;
          practical_exercises?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          path_id?: string;
          title?: string;
          description?: string | null;
          node_type?: NodeType | null;
          difficulty?: number | null;
          estimated_hours?: number | null;
          order_index?: number | null;
          position_x?: number | null;
          position_y?: number | null;
          prerequisites?: any | null;
          key_takeaways?: any | null;
          practical_exercises?: any | null;
          created_at?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          node_id: string;
          title: string;
          url: string;
          resource_type: ResourceType | null;
          platform: string | null;
          is_free: boolean;
          estimated_duration: number | null;
          difficulty_level: DifficultyLevel | null;
          quality_score: number | null;
          thumbnail_url: string | null;
          description: string | null;
          author: string | null;
          domain: string | null;
          community_rating: number | null;
          rating_count: number;
          certification_available: boolean;
          practical_component: boolean;
          metadata: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          node_id: string;
          title: string;
          url: string;
          resource_type?: ResourceType | null;
          platform?: string | null;
          is_free?: boolean;
          estimated_duration?: number | null;
          difficulty_level?: DifficultyLevel | null;
          quality_score?: number | null;
          thumbnail_url?: string | null;
          description?: string | null;
          author?: string | null;
          domain?: string | null;
          community_rating?: number | null;
          rating_count?: number;
          certification_available?: boolean;
          practical_component?: boolean;
          metadata?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          node_id?: string;
          title?: string;
          url?: string;
          resource_type?: ResourceType | null;
          platform?: string | null;
          is_free?: boolean;
          estimated_duration?: number | null;
          difficulty_level?: DifficultyLevel | null;
          quality_score?: number | null;
          thumbnail_url?: string | null;
          description?: string | null;
          author?: string | null;
          domain?: string | null;
          community_rating?: number | null;
          rating_count?: number;
          certification_available?: boolean;
          practical_component?: boolean;
          metadata?: any | null;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          path_id: string;
          node_id: string;
          status: NodeStatus;
          started_at: string | null;
          completed_at: string | null;
          notes: string | null;
          time_spent: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          path_id: string;
          node_id: string;
          status: NodeStatus;
          started_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          time_spent?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          path_id?: string;
          node_id?: string;
          status?: NodeStatus;
          started_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          time_spent?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      resource_interactions: {
        Row: {
          id: string;
          user_id: string;
          resource_id: string;
          interaction_type: InteractionType;
          rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resource_id: string;
          interaction_type: InteractionType;
          rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resource_id?: string;
          interaction_type?: InteractionType;
          rating?: number | null;
          created_at?: string;
        };
      };
    };
  };
}
