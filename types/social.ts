import { z } from 'zod';

// ============================================================================
// Social Features - Zod Schemas
// ============================================================================

// User Connection Schema
export const UserConnectionSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  friendId: z.string().uuid(),
  status: z.enum(['pending', 'accepted', 'blocked']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Learning Group Schema
export const LearningGroupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  creatorId: z.string().uuid().optional(),
  isPublic: z.boolean().default(true),
  memberCount: z.number().default(0),
  icon: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Group Member Schema
export const GroupMemberSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['admin', 'moderator', 'member']),
  joinedAt: z.date().optional(),
});

// Group Path Schema
export const GroupPathSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid(),
  pathId: z.string().uuid(),
  sharedBy: z.string().uuid().optional(),
  createdAt: z.date().optional(),
});

// Path Recommendation Schema
export const PathRecommendationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  recommendedPathId: z.string().uuid(),
  reason: z.string().optional(),
  score: z.number().default(0),
  isDismissed: z.boolean().default(false),
  createdAt: z.date().optional(),
});

// ============================================================================
// TypeScript Types
// ============================================================================

export type UserConnection = z.infer<typeof UserConnectionSchema>;
export type LearningGroup = z.infer<typeof LearningGroupSchema>;
export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type GroupPath = z.infer<typeof GroupPathSchema>;
export type PathRecommendation = z.infer<typeof PathRecommendationSchema>;

export type ConnectionStatus = 'pending' | 'accepted' | 'blocked';
export type GroupRole = 'admin' | 'moderator' | 'member';

// Extended types with relations
export interface UserConnectionWithUser extends UserConnection {
  friend: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface LearningGroupWithDetails extends LearningGroup {
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string | null;
  };
  creator?: {
    id: string;
    name: string | null;
  };
  userRole?: GroupRole;
}

export interface PathRecommendationWithPath extends PathRecommendation {
  path: {
    id: string;
    title: string;
    description: string | null;
    topic: string;
    difficultyLevel: string | null;
    estimatedDuration: number | null;
    categoryId: string | null;
  };
}
