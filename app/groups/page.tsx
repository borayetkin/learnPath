'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Loader2,
  ArrowLeft,
  UserPlus,
  Globe,
  Lock,
} from 'lucide-react';

interface LearningGroup {
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
}

export default function GroupsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [myGroups, setMyGroups] = useState<LearningGroup[]>([]);
  const [publicGroups, setPublicGroups] = useState<LearningGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'my'>('browse');

  // Form state
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const userId = user?.id;

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (userId) {
      fetchGroups();
    }
  }, [activeTab, userId]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'my') {
        const response = await fetch(`/api/groups?userId=${userId}&myGroups=true`);
        const result = await response.json();
        if (result.success) {
          setMyGroups(result.data);
        }
      } else {
        const response = await fetch(`/api/groups?userId=${userId}`);
        const result = await response.json();
        if (result.success) {
          setPublicGroups(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          creatorId: userId,
          isPublic,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateDialog(false);
        setGroupName('');
        setGroupDescription('');
        router.push(`/groups/${result.data.id}`);
      } else {
        alert(result.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/groups/${groupId}`);
      } else {
        alert(result.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
  };

  const groups = activeTab === 'my' ? myGroups : publicGroups;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Groups</h1>
              <p className="text-gray-600 mt-1">
                Join communities and learn together
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Learning Group</DialogTitle>
                  <DialogDescription>
                    Start a new community around your learning interests
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={createGroup} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Group Name
                    </label>
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g., Web Development Enthusiasts"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <Textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="What is this group about?"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                      Public group (anyone can join)
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating} className="flex-1">
                      {isCreating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Create Group'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'browse' ? 'default' : 'outline'}
            onClick={() => setActiveTab('browse')}
          >
            <Globe className="w-4 h-4 mr-2" />
            Browse Groups
          </Button>
          <Button
            variant={activeTab === 'my' ? 'default' : 'outline'}
            onClick={() => setActiveTab('my')}
          >
            <Users className="w-4 h-4 mr-2" />
            My Groups ({myGroups.length})
          </Button>
        </div>

        {/* Groups Grid */}
        {(authLoading || isLoading || !user) ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : groups.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'my' ? 'No groups yet' : 'No public groups available'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'my'
                ? 'Join or create a group to start learning with others!'
                : 'Be the first to create a learning group!'}
            </p>
            {activeTab === 'my' && (
              <Button onClick={() => setActiveTab('browse')}>
                Browse Public Groups
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => router.push(`/groups/${group.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{
                        backgroundColor: group.category?.color
                          ? `${group.category.color}20`
                          : '#f3f4f6',
                      }}
                    >
                      {group.icon || group.category?.icon || '👥'}
                    </div>
                    <div className="flex items-center gap-2">
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
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{group.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {group.description || 'A learning community'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                    </div>
                    {group.userRole ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {group.userRole}
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          joinGroup(group.id);
                        }}
                        className="gap-1"
                      >
                        <UserPlus className="w-4 h-4" />
                        Join
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
