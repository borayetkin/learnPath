'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  BookOpen,
  ArrowLeft,
  Loader2,
  UserMinus,
  Share2,
  Globe,
  Lock,
  Crown,
  Shield,
  Clock,
  Award,
  MessageSquare,
} from 'lucide-react';

interface GroupDetails {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  is_public: boolean;
  member_count: number;
  icon: string | null;
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string | null;
  } | null;
  creator?: {
    id: string;
    name: string | null;
  } | null;
  userRole?: string | null;
  members: Array<{
    id: string;
    user_id: string;
    role: 'admin' | 'moderator' | 'member';
    joined_at: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  sharedPaths: Array<{
    id: string;
    path_id: string;
    shared_by: string;
    created_at: string;
    path: {
      id: string;
      title: string;
      description: string | null;
      topic: string;
      difficulty_level: string | null;
      estimated_duration: number | null;
    };
    sharedBy: {
      id: string;
      name: string | null;
    } | null;
  }>;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.id;

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (userId && groupId) {
      fetchGroupDetails();
    }
  }, [groupId, userId]);

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setGroup(result.data);
      } else {
        router.push('/groups');
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      router.push('/groups');
    } finally {
      setIsLoading(false);
    }
  };

  const leaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/members?userId=${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/groups');
      } else {
        alert(result.error || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/groups">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>

          <div className="flex items-start gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{
                backgroundColor: group.category?.color
                  ? `${group.category.color}20`
                  : '#f3f4f6',
              }}
            >
              {group.icon || group.category?.icon || '👥'}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {group.is_public ? (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                    {group.userRole && (
                      <Badge variant="secondary" className={getRoleBadge(group.userRole)}>
                        {getRoleIcon(group.userRole)}
                        <span className="ml-1">{group.userRole}</span>
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
                  <p className="text-lg text-gray-600 mb-4">
                    {group.description || 'A learning community'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {group.member_count} members
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {group.sharedPaths.length} shared paths
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {group.userRole && (
                    <>
                      <Link href={`/groups/${groupId}/feed`}>
                        <Button className="gap-2">
                          <MessageSquare className="w-4 h-4" />
                          View Feed
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={leaveGroup} className="gap-2">
                        <UserMinus className="w-4 h-4" />
                        Leave Group
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="paths" className="w-full">
          <TabsList>
            <TabsTrigger value="feed" asChild>
              <Link href={`/groups/${groupId}/feed`} className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Feed
              </Link>
            </TabsTrigger>
            <TabsTrigger value="paths">
              <BookOpen className="w-4 h-4 mr-2" />
              Shared Paths ({group.sharedPaths.length})
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members ({group.members.length})
            </TabsTrigger>
          </TabsList>

          {/* Shared Paths Tab */}
          <TabsContent value="paths" className="mt-6">
            {group.sharedPaths.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No shared paths yet
                </h3>
                <p className="text-gray-600">
                  Be the first to share a learning path with this group!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.sharedPaths.map((sharedPath) => (
                  <Link
                    key={sharedPath.id}
                    href={`/path/${sharedPath.path.id}`}
                    className="group"
                  >
                    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          {sharedPath.path.difficulty_level && (
                            <Badge
                              variant="secondary"
                              className={getDifficultyColor(sharedPath.path.difficulty_level)}
                            >
                              {sharedPath.path.difficulty_level}
                            </Badge>
                          )}
                          <Share2 className="w-4 h-4 text-gray-400" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                          {sharedPath.path.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm mb-4 line-clamp-3">
                          {sharedPath.path.description || sharedPath.path.topic}
                        </CardDescription>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {sharedPath.path.estimated_duration || 0}h
                          </div>
                          <div className="text-xs">
                            by {sharedPath.sharedBy?.name || 'Unknown'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.members.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {member.user.name || member.user.email}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {member.user.email}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className={getRoleBadge(member.role)}>
                        {getRoleIcon(member.role)}
                        <span className="ml-1">{member.role}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
