'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Plus,
  Loader2,
  Link as LinkIcon,
  BookOpen,
  Flame,
  TrendingUp,
  Clock,
  Pin,
  Send,
} from 'lucide-react';

interface GroupPost {
  id: string;
  group_id: string;
  user_id: string;
  title: string;
  content: string | null;
  post_type: 'text' | 'link' | 'path' | 'discussion';
  link_url: string | null;
  shared_path_id: string | null;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  score: number;
  userReaction: 'upvote' | 'downvote' | null;
  author: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  shared_path?: {
    id: string;
    title: string;
    description: string | null;
    topic: string;
    difficulty_level: string | null;
    estimated_duration: number | null;
  } | null;
}

interface Comment {
  id: string;
  content: string;
  upvotes: number;
  created_at: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export default function GroupFeedPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const groupId = params.groupId as string;

  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'top' | 'hot'>('recent');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<GroupPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Create post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'link' | 'discussion'>('text');
  const [linkUrl, setLinkUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const userId = user?.id;

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (userId && groupId) {
      fetchPosts();
    }
  }, [groupId, sortBy, userId]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/posts?sortBy=${sortBy}&userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle) return;

    setIsCreating(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: postTitle,
          content: postContent,
          postType,
          linkUrl: postType === 'link' ? linkUrl : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateDialog(false);
        setPostTitle('');
        setPostContent('');
        setLinkUrl('');
        setPostType('text');
        fetchPosts();
      } else {
        alert(result.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };

  const handleReaction = async (postId: string, reactionType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reactionType }),
      });

      if (response.ok) {
        fetchPosts(); // Refresh to get updated counts
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      const result = await response.json();

      if (result.success) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const submitComment = async () => {
    if (!commentText || !selectedPost) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content: commentText }),
      });

      const result = await response.json();

      if (result.success) {
        setCommentText('');
        fetchComments(selectedPost.id);
        fetchPosts(); // Refresh to update comment count
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const openComments = (post: GroupPost) => {
    setSelectedPost(post);
    fetchComments(post.id);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <LinkIcon className="w-4 h-4" />;
      case 'path':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTimeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm';
    return Math.floor(seconds) + 's';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/groups/${groupId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Group
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              {/* Sort Options */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                  className="rounded-none"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  New
                </Button>
                <Button
                  variant={sortBy === 'hot' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('hot')}
                  className="rounded-none"
                >
                  <Flame className="w-4 h-4 mr-1" />
                  Hot
                </Button>
                <Button
                  variant={sortBy === 'top' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('top')}
                  className="rounded-none"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Top
                </Button>
              </div>

              {/* Create Post Dialog */}
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create a Post</DialogTitle>
                    <DialogDescription>Share something with the group</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={createPost} className="space-y-4">
                    {/* Post Type Selector */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={postType === 'text' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPostType('text')}
                      >
                        Text
                      </Button>
                      <Button
                        type="button"
                        variant={postType === 'link' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPostType('link')}
                      >
                        Link
                      </Button>
                      <Button
                        type="button"
                        variant={postType === 'discussion' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPostType('discussion')}
                      >
                        Discussion
                      </Button>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Enter a descriptive title"
                        maxLength={300}
                        required
                      />
                    </div>

                    {postType === 'link' && (
                      <div>
                        <label className="text-sm font-medium">URL</label>
                        <Input
                          type="url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://example.com"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium">Content (optional)</label>
                      <Textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Add more details..."
                        rows={6}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {(authLoading || isLoading || !user) ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share something with the group!</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className={`hover:shadow-md transition-shadow ${
                  post.is_pinned ? 'border-blue-500 border-2' : ''
                }`}
              >
                <div className="flex gap-3 p-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${
                        post.userReaction === 'upvote' ? 'text-orange-600' : 'text-gray-400'
                      }`}
                      onClick={() => handleReaction(post.id, 'upvote')}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </Button>
                    <span
                      className={`text-sm font-bold ${
                        post.score > 0
                          ? 'text-orange-600'
                          : post.score < 0
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {post.score}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${
                        post.userReaction === 'downvote' ? 'text-blue-600' : 'text-gray-400'
                      }`}
                      onClick={() => handleReaction(post.id, 'downvote')}
                    >
                      <ArrowDown className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    {/* Post Header */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      {post.is_pinned && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      <Badge variant="secondary" className="gap-1">
                        {getPostTypeIcon(post.post_type)}
                        {post.post_type}
                      </Badge>
                      <span>
                        Posted by <strong>{post.author?.name || 'Unknown'}</strong>
                      </span>
                      <span>•</span>
                      <span>{getTimeSince(post.created_at)} ago</span>
                    </div>

                    {/* Post Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                      {post.title}
                    </h3>

                    {/* Post Content */}
                    {post.content && (
                      <p className="text-gray-700 text-sm mb-3 line-clamp-3">{post.content}</p>
                    )}

                    {/* Link Preview */}
                    {post.post_type === 'link' && post.link_url && (
                      <a
                        href={post.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mb-3"
                      >
                        <div className="border rounded-lg p-3 hover:bg-gray-50">
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <LinkIcon className="w-4 h-4" />
                            {post.link_url}
                          </div>
                        </div>
                      </a>
                    )}

                    {/* Shared Path Preview */}
                    {post.shared_path && (
                      <Link href={`/path/${post.shared_path.id}`}>
                        <div className="border rounded-lg p-4 mb-3 hover:bg-gray-50">
                          <div className="flex items-start gap-3">
                            <BookOpen className="w-5 h-5 text-blue-600 mt-1" />
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {post.shared_path.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {post.shared_path.description || post.shared_path.topic}
                              </p>
                              {post.shared_path.difficulty_level && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  {post.shared_path.difficulty_level}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-4 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-gray-600 hover:text-blue-600"
                        onClick={() => openComments(post)}
                      >
                        <MessageSquare className="w-4 h-4" />
                        {post.comment_count} comments
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Comments Dialog */}
        <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPost?.title}</DialogTitle>
              <DialogDescription>
                Posted by {selectedPost?.author?.name || 'Unknown'} •{' '}
                {selectedPost && getTimeSince(selectedPost.created_at)} ago
              </DialogDescription>
            </DialogHeader>

            {selectedPost?.content && (
              <div className="text-gray-700 mb-4">{selectedPost.content}</div>
            )}

            {/* Add Comment */}
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="flex-1"
                />
                <Button
                  onClick={submitComment}
                  disabled={!commentText || isSubmittingComment}
                  size="sm"
                  className="self-end"
                >
                  {isSubmittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 mt-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-gray-200 pl-4 py-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <strong>{comment.author?.name || 'Unknown'}</strong>
                      <span>•</span>
                      <span>{getTimeSince(comment.created_at)} ago</span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
