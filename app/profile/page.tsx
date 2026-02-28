'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  Flame,
  Save,
  Sparkles,
  Trophy,
  TrendingUp,
  Users,
  X,
  Camera,
} from 'lucide-react';

interface ProfileData {
  profile: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
  };
  stats: {
    totalPaths: number;
    completedNodes: number;
    inProgressNodes: number;
    totalTimeSpent: number;
    totalBadges: number;
    friendCount: number;
    groupCount: number;
    streak: number;
  };
  paths: Array<{
    id: string;
    title: string;
    topic: string;
    difficulty_level: string;
    estimated_duration: number;
    created_at: string;
  }>;
  badges: Array<{
    id: string;
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
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/profile?userId=${user.id}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          setEditName(result.data.profile.name || '');
          setEditBio(result.data.profile.bio || '');
          setEditAvatarUrl(result.data.profile.avatar_url || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: editName,
          bio: editBio,
          avatarUrl: editAvatarUrl,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                profile: {
                  ...prev.profile,
                  name: editName,
                  bio: editBio,
                  avatar_url: editAvatarUrl,
                },
              }
            : prev
        );
        setIsEditing(false);
        toast.success('Profile updated!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const profile = data?.profile;
  const stats = data?.stats;
  const badges = data?.badges || [];
  const paths = data?.paths || [];

  const displayName = profile?.name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                  My Profile
                </span>
              </div>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 bg-gradient-to-r from-violet-600 to-cyan-600">
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile header card */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500" />
          <CardContent className="relative pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              {/* Avatar */}
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}
                {isEditing && (
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Name and info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <Label htmlFor="name" className="text-xs text-gray-500">Display Name</Label>
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-xs text-gray-500">Bio</Label>
                      <Input
                        id="bio"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar" className="text-xs text-gray-500">Profile Picture URL</Label>
                      <Input
                        id="avatar"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {profile?.bio && (
                      <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
                    )}
                    {memberSince && (
                      <p className="text-xs text-gray-400 mt-1">Member since {memberSince}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-5 h-5 text-violet-600 mx-auto mb-1" />
              <div className="text-2xl font-bold">{stats?.totalPaths || 0}</div>
              <p className="text-xs text-gray-500">Learning Paths</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold">{stats?.completedNodes || 0}</div>
              <p className="text-xs text-gray-500">Nodes Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold">{formatTimeSpent(stats?.totalTimeSpent || 0)}</div>
              <p className="text-xs text-gray-500">Time Invested</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">{stats?.streak || 0}</div>
              <p className="text-xs text-gray-500">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Second stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">{stats?.totalBadges || 0}</div>
              <p className="text-xs text-gray-500">Badges Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <div className="text-2xl font-bold">{stats?.friendCount || 0}</div>
              <p className="text-xs text-gray-500">Friends</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-bold">{stats?.groupCount || 0}</div>
              <p className="text-xs text-gray-500">Groups</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges section */}
        {badges.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-900">Badges</h2>
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

        {/* Learning Paths */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-violet-600" />
              <h2 className="text-xl font-bold text-gray-900">Learning Paths</h2>
            </div>
            <Link href="/">
              <Button size="sm" variant="outline" className="gap-1">
                <Sparkles className="w-4 h-4" />
                New Path
              </Button>
            </Link>
          </div>

          {paths.length === 0 ? (
            <Card className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-600 mb-1">No learning paths yet</h3>
              <p className="text-sm text-gray-400 mb-4">Create your first AI-powered learning path</p>
              <Link href="/">
                <Button size="sm">Create a Path</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {paths.map((path) => (
                <Card
                  key={path.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/path/${path.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{path.title}</h3>
                          <Badge variant="secondary" className={`text-xs shrink-0 ${getDifficultyColor(path.difficulty_level)}`}>
                            {path.difficulty_level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{path.topic}</span>
                          <span>{path.estimated_duration}h estimated</span>
                          <span>Started {new Date(path.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <TrendingUp className="w-4 h-4 text-gray-400 shrink-0 ml-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
