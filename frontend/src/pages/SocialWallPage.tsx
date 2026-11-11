import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import {
  MessageSquare,
  Heart,
  ThumbsUp,
  Trophy,
  Pin,
  Image as ImageIcon,
  Calendar,
  Send,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Users,
  Bell,
  Award,
  Smile,
  Clock,
  Loader2,
  Plus,
  Filter,
  Megaphone,
  X,
  Upload,
  Check,
  ChevronRight,
} from 'lucide-react';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

const REACTION_EMOJIS: Record<string, { label: string; color: string; icon: any }> = {
  LIKE: { label: 'Like', color: 'text-blue-600', icon: ThumbsUp },
  LOVE: { label: 'Love', color: 'text-rose-600', icon: Heart },
  CLAP: { label: 'Applaud', color: 'text-amber-600', icon: Award },
  WOW: { label: 'Inspiring', color: 'text-purple-600', icon: Smile },
};

export const SocialWallPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    document.title = 'Campus Community Feed & Social Wall — Ever Grow Schools ERP';
  }, []);
  const [activeTab, setActiveTab] = useState<'feed' | 'pending'>('feed');
  const [filterType, setFilterType] = useState<string>('all');
  const [posts, setPosts] = useState<any[]>([]);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [widgets, setWidgets] = useState<any>({
    top_students: [],
    upcoming_events: [],
    pinned_notices: [],
  });
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);

  // Reaction picker state
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);

  // Comment section toggles & inputs
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    post_type: 'ANNOUNCEMENT',
    title: '',
    content: '',
    visibility: 'SCHOOL_WIDE',
    target_class_id: '',
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isStaffOrAdmin =
    user?.username === 'adrin' ||
    user?.portal_type === 'staff' ||
    user?.roles?.some((r: string) =>
      ['super_admin', 'school_admin', 'principal', 'teacher', 'staff'].includes(r)
    );

  const isAdmin =
    user?.username === 'adrin' ||
    user?.roles?.some((r: string) =>
      ['super_admin', 'school_admin', 'principal'].includes(r)
    );

  // Load Feed & Widgets
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, page_size: 30 };
      if (filterType !== 'all') {
        params.filter_type = filterType;
      }
      const [feedRes, widgetRes] = await Promise.all([
        api.get('/social/feed', { params }),
        api.get('/social/widgets'),
      ]);
      setPosts(feedRes.data?.items || []);
      setWidgets(widgetRes.data || {});

      // Record views for posts
      if (feedRes.data?.items?.length) {
        feedRes.data.items.slice(0, 5).forEach((p: any) => {
          api.post(`/social/posts/${p.id}/view`).catch(() => {});
        });
      }
    } catch (err) {
      console.error('Failed to load social feed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load Pending Posts if Admin
  const fetchPendingPosts = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/social/pending');
      setPendingPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load pending posts:', err);
    }
  };

  useEffect(() => {
    fetchFeed();
    if (isAdmin) {
      fetchPendingPosts();
    }
    api.get('/academic/classes').then((res) => {
      setClasses(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
  }, [filterType]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reactions
  const handleToggleReaction = async (postId: string, reactionType: string) => {
    try {
      const res = await api.post(`/social/posts/${postId}/react`, {
        reaction_type: reactionType,
      });

      // Update post in-place
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const oldReaction = p.user_reaction;
          const reactionCounts = { ...p.reactions_count };

          if (res.data?.action === 'removed') {
            reactionCounts[reactionType] = Math.max(0, (reactionCounts[reactionType] || 1) - 1);
            return {
              ...p,
              user_reaction: null,
              reactions_count: reactionCounts,
              total_reactions: Math.max(0, p.total_reactions - 1),
            };
          } else if (res.data?.action === 'updated') {
            if (oldReaction) {
              reactionCounts[oldReaction] = Math.max(0, (reactionCounts[oldReaction] || 1) - 1);
            }
            reactionCounts[reactionType] = (reactionCounts[reactionType] || 0) + 1;
            return {
              ...p,
              user_reaction: reactionType,
              reactions_count: reactionCounts,
            };
          } else {
            // Added
            reactionCounts[reactionType] = (reactionCounts[reactionType] || 0) + 1;
            return {
              ...p,
              user_reaction: reactionType,
              reactions_count: reactionCounts,
              total_reactions: p.total_reactions + 1,
            };
          }
        })
      );
      setActiveReactionPickerId(null);
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  // Toggle comments
  const handleToggleComments = async (postId: string) => {
    const isExpanded = !expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: isExpanded }));

    if (isExpanded && !postComments[postId]) {
      try {
        const res = await api.get(`/social/posts/${postId}/comments`);
        setPostComments((prev) => ({ ...prev, [postId]: res.data || [] }));
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    }
  };

  // Add Comment (Staff Only)
  const handleAddComment = async (postId: string) => {
    const content = (commentInputs[postId] || '').trim();
    if (!content) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await api.post(`/social/posts/${postId}/comments`, { content });
      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data],
      }));
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit comment.');
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Admin: Approve
  const handleApprovePost = async (postId: string) => {
    try {
      await api.put(`/social/posts/${postId}/approve`);
      toast.success('Post verified and published to school feed');
      fetchPendingPosts();
      fetchFeed();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve post.');
    }
  };

  // Admin: Reject
  const handleRejectPost = async (postId: string) => {
    try {
      await api.put(`/social/posts/${postId}/reject`);
      toast.success('Post rejected and archived.');
      fetchPendingPosts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject post.');
    }
  };

  // Admin: Toggle Pin
  const handleTogglePin = async (postId: string) => {
    try {
      const res = await api.put(`/social/posts/${postId}/pin`);
      toast.success(res.data?.is_pinned ? 'Post pinned to top' : 'Post unpinned');
      fetchFeed();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle pin.');
    }
  };

  // Admin: Delete
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      await api.delete(`/social/posts/${postId}`);
      toast.success('Post permanently deleted.');
      fetchFeed();
      if (isAdmin) fetchPendingPosts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  // Image upload handling
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload immediately
    const formData = new FormData();
    formData.append('file', file);
    setUploadingImage(true);
    try {
      const res = await api.post('/social/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPostForm((prev) => ({ ...prev, image_url: res.data?.image_url || '' }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Post Submission
  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.content.trim()) return;

    setSubmittingPost(true);
    try {
      await api.post('/social/posts', {
        post_type: postForm.post_type,
        title: postForm.title.trim() || undefined,
        content: postForm.content.trim(),
        visibility: postForm.visibility,
        target_class_id: postForm.target_class_id || undefined,
        image_url: postForm.image_url || undefined,
      });

      setIsCreateModalOpen(false);
      setPostForm({
        post_type: 'ANNOUNCEMENT',
        title: '',
        content: '',
        visibility: 'SCHOOL_WIDE',
        target_class_id: '',
        image_url: '',
      });
      setImageFile(null);
      setImagePreview(null);

      toast.success('Post submitted for admin review');
      fetchFeed();
      if (isAdmin) fetchPendingPosts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit post.');
    } finally {
      setSubmittingPost(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur text-slate-800 px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-fadeIn border border-slate-200/80">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[24px] p-5 sm:p-6 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1D1D1F]">
            School Internal Social Wall
          </h1>
          {isAdmin && pendingPosts.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse shrink-0">
              {pendingPosts.length} Pending
            </span>
          )}
        </div>

        {/* Tab Switcher (Feed vs Pending Approval for Admin) */}
        {isAdmin && (
          <div className="flex-shrink-0 bg-white/80 backdrop-blur p-1 rounded-2xl border border-blue-200 shadow-sm flex space-x-1 w-full sm:w-auto justify-center">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                activeTab === 'feed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              School Feed
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending Approval</span>
              {pendingPosts.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                  {pendingPosts.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: MAIN FEED (65% width on desktop = 8 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'pending' ? (
            /* ADMIN PENDING APPROVAL TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1D1D1F]">
                  Posts Awaiting Verification ({pendingPosts.length})
                </h2>
                <span className="text-xs text-slate-500">
                  Staff posts require administrative clearance before publishing
                </span>
              </div>

              {pendingPosts.length === 0 ? (
                <div className="ios-card rounded-[24px] p-8 text-center text-slate-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                  <p className="font-bold text-sm text-slate-800">All caught up!</p>
                  <p className="text-xs">There are no posts currently pending review.</p>
                </div>
              ) : (
                pendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="ios-card rounded-[24px] p-6 space-y-4 border border-amber-200/80 bg-amber-50/20 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {post.author_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {post.author_name}{' '}
                            <span className="font-normal text-slate-500">({post.author_role})</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatRelativeTime(post.created_at)} • Visibility: {post.visibility}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {post.post_type}
                      </span>
                    </div>

                    {post.title && (
                      <h3 className="font-bold text-sm text-slate-900">{post.title}</h3>
                    )}
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post media"
                        className="rounded-2xl max-h-72 w-full object-cover border border-slate-200"
                      />
                    )}

                    <div className="pt-3 border-t border-black/[0.05] flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleRejectPost(post.id)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprovePost(post.id)}
                        className="ios-gloss-btn px-5 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Approve & Publish</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* STANDARD FEED VIEW */
            <>
              {/* Post Creation Box (Staff/Admin Only) */}
              {isStaffOrAdmin && (
                <div className="ios-card rounded-[22px] p-4 sm:p-5 space-y-3 border border-slate-200/90 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0">
                      {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs text-slate-500 border border-slate-200/80 transition-all focus:outline-none truncate"
                    >
                      Share an announcement or update...
                    </button>
                  </div>

                  <div className="pt-2.5 border-t border-black/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                      <button
                        onClick={() => {
                          setPostForm((prev) => ({ ...prev, post_type: 'PHOTO_GALLERY' }));
                          setIsCreateModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold flex items-center space-x-1.5 transition-all shrink-0 text-xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Photo</span>
                      </button>
                      <button
                        onClick={() => {
                          setPostForm((prev) => ({ ...prev, post_type: 'ACHIEVEMENT' }));
                          setIsCreateModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold flex items-center space-x-1.5 transition-all shrink-0 text-xs"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Achievement</span>
                      </button>
                      <button
                        onClick={() => {
                          setPostForm((prev) => ({ ...prev, post_type: 'EVENT' }));
                          setIsCreateModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold flex items-center space-x-1.5 transition-all shrink-0 text-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>Event</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="ios-gloss-btn px-4 py-2 text-xs font-bold space-x-1 flex items-center justify-center shadow-xs w-full sm:w-auto shrink-0"
                    >
                      <span>Create Post</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Filter Bar */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 text-xs font-bold scrollbar-none tab-scroll-container">
                {[
                  { id: 'all', label: 'All Feed' },
                  { id: 'announcements', label: 'Announcements' },
                  { id: 'achievements', label: 'Achievements' },
                  { id: 'events', label: 'Events' },
                  { id: 'my_class', label: 'My Class' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all ${
                      filterType === f.id
                        ? 'bg-[#0071E3] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Feed Cards */}
              {loading ? (
                <div className="py-20 text-center text-slate-500">
                  <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-600" />
                  <p className="mt-3 text-xs font-medium">Loading school wall updates...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="ios-card rounded-[28px] p-10 text-center text-slate-500 space-y-3">
                  <Megaphone className="w-8 h-8 mx-auto text-slate-400" />
                  <h3 className="font-bold text-sm text-slate-800">No posts in this stream yet</h3>
                  <p className="text-xs">Be the first to share an update with the campus!</p>
                </div>
              ) : (
                posts.map((post) => {
                  const isAutoAchievement = post.post_type === 'AUTO_ACHIEVEMENT';

                  return (
                    <div
                      key={post.id}
                      className={`ios-card rounded-[26px] p-6 space-y-4 transition-all relative overflow-hidden ${
                        isAutoAchievement
                          ? 'border-2 border-amber-300 bg-gradient-to-br from-amber-50/60 via-yellow-50/40 to-amber-50/60 shadow-[0_4px_24px_rgba(245,158,11,0.12)]'
                          : 'border border-slate-200/90 shadow-sm'
                      }`}
                    >
                      {/* Pinned Banner */}
                      {post.is_pinned && (
                        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl w-fit border border-blue-200/80 mb-1">
                          <Pin className="w-3 h-3 fill-blue-600 rotate-45" />
                          <span>PINNED ANNOUNCEMENT</span>
                        </div>
                      )}

                      {/* Header Row: Author & Metadata */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                              isAutoAchievement
                                ? 'bg-amber-400 text-amber-950 shadow-sm'
                                : 'bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 text-[#0071E3] border border-blue-500/20'
                            }`}
                          >
                            {isAutoAchievement ? (
                              <Trophy className="w-5 h-5 text-amber-950" />
                            ) : (
                              post.author_name?.charAt(0) || 'E'
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-[#1D1D1F]">
                                {post.author_name}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                ({post.author_role})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                              <span>{formatRelativeTime(post.created_at)}</span>
                              <span>•</span>
                              <span className="capitalize">{post.visibility.replace('_', ' ').toLowerCase()}</span>
                              {post.target_class_name && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold text-blue-600">{post.target_class_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Badges & Admin Actions */}
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isAutoAchievement
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : post.post_type === 'ANNOUNCEMENT'
                                ? 'bg-blue-100 text-blue-800'
                                : post.post_type === 'EVENT'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {post.post_type.replace('_', ' ')}
                          </span>

                          {isAdmin && (
                            <div className="flex items-center space-x-1 pl-1">
                              <button
                                onClick={() => handleTogglePin(post.id)}
                                title={post.is_pinned ? 'Unpin post' : 'Pin post to top'}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  post.is_pinned
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                                }`}
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                title="Delete post"
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="space-y-2">
                        {post.title && (
                          <h3
                            className={`text-base font-extrabold tracking-tight ${
                              isAutoAchievement ? 'text-amber-950' : 'text-[#1D1D1F]'
                            }`}
                          >
                            {post.title}
                          </h3>
                        )}
                        <p
                          className={`text-xs md:text-sm leading-relaxed whitespace-pre-line ${
                            isAutoAchievement ? 'text-amber-900 font-medium' : 'text-slate-700'
                          }`}
                        >
                          {post.content}
                        </p>

                        {/* Special Auto Achievement Action */}
                        {isAutoAchievement && (
                          <div className="pt-2">
                            <Link
                              to="/examinations"
                              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-200/60 px-3 py-1.5 rounded-xl border border-amber-300 transition-all"
                            >
                              <span>View Academic Leaderboard</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}

                        {/* Media image if present */}
                        {post.image_url && (
                          <div className="pt-2">
                            <img
                              src={post.image_url}
                              alt="Announcement media"
                              className="rounded-2xl max-h-96 w-full object-cover border border-slate-200/80 shadow-xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* Engagement Bar: Reactions, Views, Comments */}
                      <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs text-slate-500">
                        {/* Reaction counters */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 font-semibold text-slate-700">
                            {post.reactions_count?.LIKE > 0 && <span className="text-blue-600">Like ({post.reactions_count.LIKE})</span>}
                            {post.reactions_count?.LOVE > 0 && <span className="text-rose-600">Love ({post.reactions_count.LOVE})</span>}
                            {post.reactions_count?.CLAP > 0 && <span className="text-amber-600">Applaud ({post.reactions_count.CLAP})</span>}
                            {post.reactions_count?.WOW > 0 && <span className="text-purple-600">Inspiring ({post.reactions_count.WOW})</span>}
                            {post.total_reactions === 0 && <span>Be the first to react</span>}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 text-[11px]">
                          <span className="flex items-center space-x-1 text-slate-400">
                            <Eye className="w-3 h-3" />
                            <span>{post.views_count} views</span>
                          </span>
                          <button
                            onClick={() => handleToggleComments(post.id)}
                            className="font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center space-x-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{post.comments_count} Comments</span>
                          </button>
                        </div>
                      </div>

                      {/* Action Bar: React picker & Comment toggle */}
                      <div className="pt-2 border-t border-black/[0.04] flex items-center space-x-2 relative">
                        {/* React Button & Floating Picker */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveReactionPickerId(
                                activeReactionPickerId === post.id ? null : post.id
                              )
                            }
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                              post.user_reaction
                                ? `${REACTION_EMOJIS[post.user_reaction]?.color} bg-blue-50 border border-blue-200`
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>
                              {post.user_reaction
                                ? REACTION_EMOJIS[post.user_reaction]?.label
                                : 'React'}
                            </span>
                          </button>

                          {/* Floating Reaction Picker */}
                          {activeReactionPickerId === post.id && (
                            <div className="absolute left-0 bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 flex items-center space-x-1 z-30 animate-fadeIn">
                              {Object.entries(REACTION_EMOJIS).map(([type, meta]) => {
                                const IconComponent = meta.icon;
                                return (
                                  <button
                                    key={type}
                                    onClick={() => handleToggleReaction(post.id, type)}
                                    className={`px-2.5 py-1.5 rounded-xl flex items-center space-x-1 text-xs font-bold hover:scale-105 transition-all ${
                                      post.user_reaction === type
                                        ? 'bg-blue-100 ring-2 ring-blue-500 text-blue-700'
                                        : 'hover:bg-slate-100 text-slate-700'
                                    }`}
                                    title={meta.label}
                                  >
                                    <IconComponent className="w-3.5 h-3.5" />
                                    <span>{meta.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Comment Button */}
                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center space-x-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Comment</span>
                        </button>
                      </div>

                      {/* Collapsible Comments Section */}
                      {expandedComments[post.id] && (
                        <div className="pt-3 border-t border-black/[0.05] space-y-3 animate-fadeIn">
                          {/* Comments List */}
                          {(postComments[post.id] || []).length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No comments yet.</p>
                          ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                              {(postComments[post.id] || []).map((comm) => (
                                <div
                                  key={comm.id}
                                  className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/60 text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">
                                      {comm.author_name}{' '}
                                      <span className="font-normal text-[10px] text-slate-500">
                                        ({comm.author_role})
                                      </span>
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {formatRelativeTime(comm.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-slate-700">{comm.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Comment Input (Staff Only) */}
                          {isStaffOrAdmin ? (
                            <div className="flex items-center space-x-2 pt-1">
                              <input
                                type="text"
                                value={commentInputs[post.id] || ''}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddComment(post.id);
                                  }
                                }}
                                placeholder="Write a staff comment (max 300 chars)..."
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                disabled={submittingComment[post.id] || !(commentInputs[post.id] || '').trim()}
                                className="ios-gloss-btn px-4 py-2 text-xs font-bold flex items-center space-x-1 disabled:opacity-50"
                              >
                                {submittingComment[post.id] ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5 text-white" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">
                              Students and parents have read-only view on comments.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SIDEBAR WIDGETS (35% width = 4 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* WIDGET 1: TOP STUDENTS THIS WEEK */}
          <div className="ios-card rounded-[26px] p-6 space-y-4 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1D1D1F] flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Top Students This Week</span>
              </h2>
            </div>
            <div className="space-y-3">
              {(widgets.top_students || []).map((student: any, idx: number) => {
                const medalColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
                return (
                  <div
                    key={student.student_id || idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60"
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-black ${medalColors[idx] || 'text-slate-500'}`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {student.class_name} • {student.badge}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-bold">
                      {student.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WIDGET 2: UPCOMING EVENTS & HOLIDAYS */}
          <div className="ios-card rounded-[26px] p-6 space-y-4 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1D1D1F] flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Upcoming Events</span>
              </h2>
            </div>
            <div className="space-y-3">
              {(widgets.upcoming_events || []).map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{ev.title}</span>
                    <span className="text-[10px] font-semibold text-blue-700 px-2 py-0.5 bg-blue-50 rounded-md">
                      {ev.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{ev.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* WIDGET 3: PINNED NOTICES */}
          <div className="ios-card rounded-[26px] p-6 space-y-4 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1D1D1F] flex items-center space-x-2">
                <Pin className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span>Pinned Notices</span>
              </h2>
            </div>
            {(widgets.pinned_notices || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No pinned notices currently.</p>
            ) : (
              <div className="space-y-2">
                {(widgets.pinned_notices || []).map((n: any) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs font-semibold text-blue-900 hover:bg-blue-100/60 transition-all flex items-center justify-between"
                  >
                    <span className="truncate max-w-[240px]">{n.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POST CREATION MODAL */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="ios-modal rounded-[30px] max-w-lg w-full p-7 shadow-2xl border border-white/80 space-y-4 bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
                  Create School Wall Post
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Posts by teachers are submitted for administration review before publishing.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4 text-xs">
              {/* Post Type Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Post Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ANNOUNCEMENT', label: 'Announcement' },
                    { id: 'ACHIEVEMENT', label: 'Achievement' },
                    { id: 'EVENT', label: 'Event' },
                    { id: 'PHOTO_GALLERY', label: 'Photo' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setPostForm({ ...postForm, post_type: t.id })}
                      className={`py-2 px-2.5 rounded-xl font-bold text-[11px] border text-center transition-all ${
                        postForm.post_type === t.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Field (Optional) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title (Optional)</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="e.g. Sports Day Schedule Announced"
                  maxLength={255}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                />
              </div>

              {/* Content Textarea with Counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Content *</label>
                  <span className="text-[10px] text-slate-400">
                    {postForm.content.length} / 1000 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  maxLength={1000}
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Write message to students, teachers, and parents..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Attach Photo (Optional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setPostForm((prev) => ({ ...prev, image_url: '' }));
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full py-3 px-4 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl flex items-center justify-center space-x-2 text-slate-600 bg-slate-50/50 hover:bg-slate-50 transition-all font-semibold"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Uploading photo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Choose JPG/PNG photo (max 5MB)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Visibility Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Visibility</label>
                  <select
                    value={postForm.visibility}
                    onChange={(e) => setPostForm({ ...postForm, visibility: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                  >
                    <option value="SCHOOL_WIDE">School-Wide (Everyone)</option>
                    <option value="CLASS_SPECIFIC">Class Specific</option>
                    {isAdmin && <option value="STAFF_ONLY">Staff Only</option>}
                  </select>
                </div>

                {postForm.visibility === 'CLASS_SPECIFIC' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Class</label>
                    <select
                      value={postForm.target_class_id}
                      onChange={(e) => setPostForm({ ...postForm, target_class_id: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                    >
                      <option value="">Select Class...</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost || !postForm.content.trim()}
                  className="ios-gloss-btn px-5 py-2.5 font-bold space-x-1.5 flex items-center shadow-md disabled:opacity-50"
                >
                  {submittingPost ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for Review</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

