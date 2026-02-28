'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  Plus,
  ArrowRight,
  Target,
  Calendar,
  Sparkles,
  Lightbulb,
  Users,
  X,
  LogOut,
  Trophy,
} from 'lucide-react';

interface PathProgress {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty_level: string;
  estimated_duration: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  progress: {
    totalNodes: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    progressPercentage: number;
    totalTimeSpent: number;
  };
}

interface PathRecommendation {
  id: string;
  recommended_path_id: string;
  reason: string;
  score: number;
  path: {
    id: string;
    title: string;
    description: string | null;
    topic: string;
    difficulty_level: string | null;
    estimated_duration: number | null;
  };
}

interface UserBadge {
  id: string;
  user_id: string;
  path_id: string;
  badge_name: string;
  badge_icon: string;
  badge_color: string;
  earned_at: string;
  learning_paths: {
    id: string;
    title: string;
    topic: string;
    difficulty_level: string | null;
    category_id: string | null;
  } | null;
}

interface GroupRecommendation {
  group: {
    id: string;
    name: string;
    description: string | null;
    member_count: number;
    icon: string | null;
    category?: {
      name: string;
      color: string | null;
    } | null;
  };
  reason: string;
  score: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [paths, setPaths] = useState<PathProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pathRecommendations, setPathRecommendations] = useState<PathRecommendation[]>([]);
  const [groupRecommendations, setGroupRecommendations] = useState<GroupRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [badges, setBadges] = useState<UserBadge[]>([]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user, router]);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchUserPaths = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/paths`);
        const result = await response.json();

        if (result.success) {
          setPaths(result.data);
        }
      } catch (error) {
        console.error('Error fetching user paths:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const response = await fetch(`/api/recommendations?userId=${userId}&type=all&limit=3`);
        const result = await response.json();

        if (result.success) {
          setPathRecommendations(result.data.paths || []);
          setGroupRecommendations(result.data.groups || []);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    const fetchBadges = async () => {
      try {
        const response = await fetch(`/api/badges?userId=${userId}`);
        const result = await response.json();
        if (result.success) {
          setBadges(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
      }
    };

    fetchUserPaths();
    fetchRecommendations();
    fetchBadges();
  }, [userId]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const dismissRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, recommendationId }),
      });

      if (response.ok) {
        setPathRecommendations(prev => prev.filter(r => r.id !== recommendationId));
      }
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  // Calculate overall statistics
  const overallStats = paths.reduce(
    (acc, path) => ({
      totalPaths: acc.totalPaths + 1,
      totalNodes: acc.totalNodes + path.progress.totalNodes,
      completedNodes: acc.completedNodes + path.progress.completed,
      totalTimeSpent: acc.totalTimeSpent + path.progress.totalTimeSpent,
    }),
    { totalPaths: 0, totalNodes: 0, completedNodes: 0, totalTimeSpent: 0 }
  );

  const overallProgress = overallStats.totalNodes > 0
    ? Math.round((overallStats.completedNodes / overallStats.totalNodes) * 100)
    : 0;

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

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (authLoading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                  LearnPath
                </span>
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button className="gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
                  <Plus className="w-4 h-4" />
                  New Path
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="gap-2">
                <Target className="w-4 h-4" />
                Profile
              </Button>
            </Link>
            <Link href="/friends">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                Friends
              </Button>
            </Link>
            <Link href="/groups">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                Groups
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Browse Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {paths.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Start Your Learning Journey
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't created any learning paths yet. Generate your first personalized
                learning path to get started!
              </p>
              <Link href="/">
                <Button size="lg" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Path
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Paths</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.totalPaths}</div>
                  <p className="text-xs text-gray-600">Total paths created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nodes Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overallStats.completedNodes}/{overallStats.totalNodes}
                  </div>
                  <p className="text-xs text-gray-600">{overallProgress}% overall progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
                  <Clock className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTimeSpent(overallStats.totalTimeSpent)}
                  </div>
                  <p className="text-xs text-gray-600">Total learning time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallProgress}%</div>
                  <Progress value={overallProgress} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Earned Badges */}
            {badges.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Badges
                  </h2>
                  <Badge variant="secondary" className="ml-2">{badges.length}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map((badge) => (
                    <Card
                      key={badge.id}
                      className="text-center hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                      onClick={() => badge.learning_paths && router.push(`/path/${badge.learning_paths.id}`)}
                    >
                      <CardContent className="p-4">
                        <div
                          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
                          style={{ backgroundColor: `${badge.badge_color}20` }}
                        >
                          {badge.badge_icon}
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-1">{badge.badge_name}</h3>
                        {badge.learning_paths && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {badge.learning_paths.topic}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {(pathRecommendations.length > 0 || groupRecommendations.length > 0) && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Recommended For You
                  </h2>
                </div>

                {/* Path Recommendations */}
                {pathRecommendations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Learning Paths You Might Like
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pathRecommendations.map((rec) => (
                        <Card
                          key={rec.id}
                          className="hover:shadow-lg transition-all hover:-translate-y-1 relative"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => dismissRecommendation(rec.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                <Lightbulb className="w-3 h-3 mr-1" />
                                AI Pick
                              </Badge>
                              {rec.path.difficulty_level && (
                                <Badge
                                  variant="secondary"
                                  className={getDifficultyColor(rec.path.difficulty_level)}
                                >
                                  {rec.path.difficulty_level}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg line-clamp-2">
                              {rec.path.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-sm mb-3 line-clamp-2">
                              {rec.path.description || rec.path.topic}
                            </CardDescription>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <p className="text-xs text-blue-900 italic">
                                {rec.reason}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              {rec.path.estimated_duration && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {rec.path.estimated_duration}h
                                </div>
                              )}
                              <Link href={`/path/${rec.path.id}`}>
                                <Button size="sm" variant="outline">
                                  View Path
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Group Recommendations */}
                {groupRecommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Groups You Might Be Interested In
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupRecommendations.map((rec, idx) => (
                        <Card
                          key={idx}
                          className="hover:shadow-lg transition-all hover:-translate-y-1"
                          onClick={() => router.push(`/groups/${rec.group.id}`)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                style={{
                                  backgroundColor: rec.group.category?.color
                                    ? `${rec.group.category.color}20`
                                    : '#f3f4f6',
                                }}
                              >
                                {rec.group.icon || '👥'}
                              </div>
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                <Lightbulb className="w-3 h-3 mr-1" />
                                Suggested
                              </Badge>
                            </div>
                            <CardTitle className="text-lg line-clamp-1">
                              {rec.group.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-sm mb-3 line-clamp-2">
                              {rec.group.description || 'A learning community'}
                            </CardDescription>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                              <p className="text-xs text-purple-900 italic">
                                {rec.reason}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-1" />
                                {rec.group.member_count} members
                              </div>
                              <Button size="sm" variant="outline">
                                Join Group
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Learning Paths */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Learning Paths</h2>
              <div className="grid grid-cols-1 gap-6">
                {paths.map((path) => (
                  <Card key={path.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="secondary"
                              className={getDifficultyColor(path.difficulty_level)}
                            >
                              {path.difficulty_level}
                            </Badge>
                            {path.progress.progressPercentage === 100 && (
                              <Badge className="bg-green-600">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl mb-2">{path.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {path.description || path.topic}
                          </CardDescription>
                        </div>
                        <Link href={`/path/${path.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            Continue
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">
                              {path.progress.completed}/{path.progress.totalNodes} nodes •{' '}
                              {path.progress.progressPercentage}%
                            </span>
                          </div>
                          <Progress value={path.progress.progressPercentage} />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>{path.progress.inProgress} in progress</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{path.estimated_duration}h estimated</span>
                          </div>
                          {path.progress.totalTimeSpent > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{formatTimeSpent(path.progress.totalTimeSpent)} spent</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Started {new Date(path.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
