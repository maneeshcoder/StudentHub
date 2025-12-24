import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Tag,
  Eye,
  Shield,
  Lock,
  Sparkles,
  Zap,
  Flame,
  TrendingUp,
  Clock,
  Filter,
  ChevronDown,
  X,
  Heart,
  AlertCircle,
  RefreshCw,
  Users,
  BarChart3,
  Ghost,
  UserX,
  Globe,
  Search,
  CheckCircle,
  MoreVertical,
  Share2,
  Bookmark
} from "lucide-react";
import {
  supabase,
  AnonymousPost,
  AnonymousComment,
} from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function Anonymous() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [comments, setComments] = useState<Record<string, AnonymousComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    trendingPosts: 0,
    activeToday: 0
  });

  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("anonymous_posts")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (filter === "trending") {
        query = query.order("upvotes", { ascending: false });
      } else if (filter === "popular") {
        query = query.gt("upvotes", 10);
      } else if (filter === "recent") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte("created_at", today.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const postsData = data || [];
      setPosts(postsData);

      // Load comments for each post
      postsData.forEach((p) => loadComments(p.id));

      // Calculate stats
      let totalComments = 0;
      postsData.forEach(post => {
        const postComments = comments[post.id] || [];
        totalComments += postComments.length;
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = postsData.filter(p => {
        const postDate = new Date(p.created_at);
        return postDate >= today;
      }).length;

      const trendingCount = postsData.filter(p => p.upvotes > 10).length;

      setStats({
        totalPosts: postsData.length,
        totalComments,
        trendingPosts: trendingCount,
        activeToday: todayCount
      });

    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from("anonymous_comments")
        .select("*,anonymous_comment_likes(count)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments((prev) => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    setPostSuccess(false);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5);

      const { data, error } = await supabase
        .from("anonymous_posts")
        .insert({
          content,
          tags,
          upvotes: 0,
          downvotes: 0,
          views: 0
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setPostSuccess(true);
      setContent("");
      setTagsInput("");

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Add the new post to the state immediately
      if (data) {
        setPosts(prev => [data, ...prev]);
        setComments(prev => ({ ...prev, [data.id]: [] }));

        // Update stats
        setStats(prev => ({
          ...prev,
          totalPosts: prev.totalPosts + 1,
          activeToday: prev.activeToday + 1
        }));
      }

      // Clear success message after 2 seconds
      setTimeout(() => {
        setPostSuccess(false);
      }, 2000);

    } catch (error: any) {
      console.error("Error posting:", error);
      alert(`Failed to post: ${error.message || "Please try again"}`);
    } finally {
      setPosting(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("anonymous_posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete post error:", error);
      alert("Failed to delete post");
      return;
    }

    // Remove from UI immediately
    setPosts(prev => prev.filter(p => p.id !== postId));
    setComments(prev => {
      const copy = { ...prev };
      delete copy[postId];
      return copy;
    });
  };

  const deleteComment = async (commentId: string, postId: string) => {
    if (!user) return;

    const confirmDelete = confirm("Delete this comment?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("anonymous_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete comment error:", error);
      alert("Failed to delete comment");
      return;
    }

    // Update UI
    setComments(prev => ({
      ...prev,
      [postId]: prev[postId].filter(c => c.id !== commentId)
    }));
  };


  const handleComment = async (postId: string) => {
    if (!commentContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from("anonymous_comments")
        .insert({
          post_id: postId,
          content: commentContent
        })
        .select()
        .single();

      if (error) throw error;

      setCommentContent("");

      // Add the new comment to the state immediately
      if (data) {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data]
        }));

        // Update stats
        setStats(prev => ({
          ...prev,
          totalComments: prev.totalComments + 1
        }));
      }

    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  };
  const toggleCommentLike = async (commentId: string) => {
    if (!user) return;

    const { data: existingLike } = await supabase
      .from("anonymous_comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single();

    if (existingLike) {
      // unlike
      await supabase
        .from("anonymous_comment_likes")
        .delete()
        .eq("id", existingLike.id);
    } else {
      // like
      await supabase
        .from("anonymous_comment_likes")
        .insert({
          comment_id: commentId,
          user_id: user.id
        });
    }

    // reload comments to update count
    loadComments(selectedPost!);
  };

  const handleVote = async (postId: string, vote: "upvote" | "downvote") => {
    if (!user) return;

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("anonymous_votes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (!existingVote) {
      // First time voting
      await supabase.from("anonymous_votes").insert({
        post_id: postId,
        user_id: user.id,
        vote
      });
    } else if (existingVote.vote === vote) {
      // Same vote clicked again → remove vote (toggle)
      await supabase
        .from("anonymous_votes")
        .delete()
        .eq("id", existingVote.id);
    } else {
      // Switch vote
      await supabase
        .from("anonymous_votes")
        .update({ vote })
        .eq("id", existingVote.id);
    }

    // Reload posts to get correct counts
    loadPosts();
  };


  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(query) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-800 border-t-purple-500 rounded-full animate-spin reverse"></div>
            </div>
          </div>
          <p className="text-xl text-gray-300 font-semibold mt-4">Loading Anonymous Zone</p>
          <p className="text-gray-500 text-sm mt-2">Connecting you to the community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800/50 shadow-2xl">
                  <Ghost className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Anonymous Zone
                </h1>
                <p className="text-gray-400 mt-2">Share freely. No names. No judgments.</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">Total Posts</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalPosts}</p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">Comments</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalComments}</p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">Trending</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.trendingPosts}</p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">Active Today</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.activeToday}</p>
              </div>
            </div>
          </div>

          {/* Security Banner */}
          <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">100% Anonymous & Secure</h3>
                  <p className="text-gray-400 text-sm">Your identity is protected. Posts are never stored with personal data.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Lock className="w-4 h-4" />
                  <span>Secure Connection</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <UserX className="w-4 h-4" />
                  <span>No Tracking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Create Post Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Share Your Thoughts Anonymously</h3>
                  <p className="text-gray-400 text-sm">What's on your mind? Share freely without revealing your identity.</p>
                </div>
              </div>

              <form onSubmit={handlePost} className="space-y-4">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    rows={3}
                    placeholder="Type your thoughts here... (What's bothering you? What makes you happy? Share anything!)"
                    className="w-full px-5 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none transition-all duration-300"
                    required
                    maxLength={1000}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                    {content.length}/1000
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <label className="text-sm font-medium text-gray-400">Tags (optional)</label>
                    </div>
                    <input
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="exams, stress, success, mental-health, advice"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <p className="text-xs text-gray-500 mt-2">Separate with commas. Helps others find your post.</p>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="submit"
                      disabled={posting || !content.trim()}
                      className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        {postSuccess ? (
                          <>
                            <CheckCircle className="w-6 h-6" />
                            <span>Posted!</span>
                          </>
                        ) : posting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Posting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            <span>Post Anonymously</span>
                            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                          </>
                        )}
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search posts by content or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <Filter size={18} />
                <span>Filter</span>
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={loadPosts}
                className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                title="Refresh posts"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-800/50">
              <div className="flex flex-wrap gap-3">
                {['all', 'trending', 'recent', 'popular'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => {
                      setFilter(filterOption);
                      setShowFilters(false);
                      loadPosts();
                    }}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize ${filter === filterOption
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    {filterOption}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Posts Container */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const postComments = comments[post.id] || [];
              const netVotes = post.upvotes - post.downvotes;
              const isTrending = netVotes > 20;
              const isHot = postComments.length > 10;

              return (
                <div
                  key={post.id}
                  className="group relative bg-gradient-to-b from-gray-900/80 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10"
                >
                  {/* Trending/Hot Badges */}
                  <div className="absolute -top-3 -right-3 flex gap-2">
                    {isTrending && (
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Trending
                      </span>
                    )}
                    {isHot && (
                      <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Hot
                      </span>
                    )}
                  </div>

                  {/* Post Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full blur-md opacity-50"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-700/50">
                        <Ghost className="w-7 h-7 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Anonymous User</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-800/50 text-gray-400 rounded-full">
                            {netVotes >= 0 ? 'Positive' : 'Negative'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(post.created_at)}
                        </span>
                      </div>

                      <p className="text-gray-300 leading-relaxed">{post.content}</p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-full border border-blue-500/30 hover:border-blue-400/50 transition-colors cursor-pointer"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stats Bar */}
                      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-800/50">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleVote(post.id, "upvote")}
                            className="flex items-center gap-2 group"
                          >
                            <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${netVotes > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-800/50 text-gray-400'
                              }`}>
                              <ThumbsUp className="w-5 h-5" />
                            </div>
                            <span className={`font-semibold ${netVotes > 0 ? 'text-green-400' : 'text-gray-400'
                              }`}>
                              {post.upvotes}
                            </span>
                          </button>

                          <button
                            onClick={() => handleVote(post.id, "downvote")}
                            className="flex items-center gap-2 group"
                          >
                            <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${netVotes < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800/50 text-gray-400'
                              }`}>
                              <ThumbsDown className="w-5 h-5" />
                            </div>
                            <span className={`font-semibold ${netVotes < 0 ? 'text-red-400' : 'text-gray-400'
                              }`}>
                              {post?.downvotes}
                            </span>
                          </button>

                          <div className="flex items-center gap-2 text-gray-400">
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-semibold">{postComments.length}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-400">
                            <Eye className="w-5 h-5" />
                            <span className="font-semibold">{post.views || 0}</span>
                          </div>

                          {user && post.user_id === user.id && (
                            <button
                              onClick={() => deletePost(post.id)}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete post"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}

                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                          <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                            <Bookmark className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-300 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-6">
                    <button
                      onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold">{postComments.length} Comments</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${selectedPost === post.id ? 'rotate-180' : ''}`} />
                    </button>

                    {selectedPost === post.id && (
                      <div className="mt-6 space-y-4">
                        {/* Comments List */}
                        {postComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-700/50">
                                <Ghost className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-gray-300">Anonymous</span>
                                  <span className="text-xs text-gray-500">{timeAgo(comment.created_at)}</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{comment.content}</p>

                                <div className="flex items-center gap-2 text-gray-400">
                                  <button
                                    onClick={() => toggleCommentLike(comment.id)}
                                    className="flex items-center gap-1 hover:text-pink-400 transition-colors"
                                  >
                                    <Heart className="w-4 h-4" />
                                    <span className="text-sm">
                                      {comment.anonymous_comment_likes?.[0]?.count || 0}
                                    </span>
                                  </button>
                                </div>

                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment */}
                        <div className="flex gap-3 pt-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-700/50 flex-shrink-0">
                            <Ghost className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <input
                              value={commentContent}
                              onChange={(e) => setCommentContent(e.target.value)}
                              placeholder="Write a comment as anonymous..."
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                            />
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>Press Enter to post</span>
                                <span>•</span>
                                <span>Remain anonymous</span>
                              </div>
                              <button
                                onClick={() => handleComment(post.id)}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!commentContent.trim()}
                              >
                                Post Comment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover Gradient Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-6 border border-gray-800/50">
                <MessageSquare className="w-16 h-16 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {searchQuery || filter !== 'all' ? 'No Posts Found' : 'No Posts Yet'}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {searchQuery || filter !== 'all'
                  ? 'No posts match your search criteria. Try different keywords or filters.'
                  : 'Be the first to break the silence! Share your thoughts anonymously.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                  setShowFilters(false);
                  loadPosts();
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              >
                {searchQuery || filter !== 'all' ? 'Clear Filters' : 'Share First Post'}
              </button>
            </div>
          )}
        </div>

        {/* Community Guidelines */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl">
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Community Guidelines</h3>
                <p className="text-gray-400 text-sm">Keep our community safe and supportive</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="text-2xl mb-2">🤝</div>
                <h4 className="font-semibold text-white mb-1">Be Respectful</h4>
                <p className="text-sm text-gray-400">No hate speech or harassment</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-semibold text-white mb-1">Stay Anonymous</h4>
                <p className="text-sm text-gray-400">Don't reveal anyone's identity</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="text-2xl mb-2">💭</div>
                <h4 className="font-semibold text-white mb-1">Share Constructively</h4>
                <p className="text-sm text-gray-400">Focus on solutions, not just problems</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}