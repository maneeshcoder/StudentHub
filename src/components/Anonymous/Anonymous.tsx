import { useState, useEffect } from 'react';
import { MessageSquare, Send, MessageCircle } from 'lucide-react';
import { supabase, AnonymousPost, AnonymousComment } from '../../lib/supabase';

export default function Anonymous() {
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [comments, setComments] = useState<{ [key: string]: AnonymousComment[] }>({});
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('anonymous_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);

      data?.forEach(post => {
        loadComments(post.id);
      });
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('anonymous_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    try {
      const { error } = await supabase.from('anonymous_posts').insert({
        content,
      });

      if (error) throw error;

      setContent('');
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentContent.trim()) return;

    try {
      const { error } = await supabase.from('anonymous_comments').insert({
        post_id: postId,
        content: commentContent,
      });

      if (error) throw error;

      setCommentContent('');
      loadComments(postId);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to create comment');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading posts...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Anonymous Discussion Zone</h2>
        <p className="text-gray-600">Share your thoughts anonymously with the community</p>
      </div>

      <form onSubmit={handlePost} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Share something anonymously..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          required
        />
        <button
          type="submit"
          disabled={posting}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          <Send size={18} />
          <span>{posting ? 'Posting...' : 'Post Anonymously'}</span>
        </button>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare size={20} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-800">Anonymous</span>
                  <span className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</span>
                </div>
                <p className="text-gray-700">{post.content}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-3"
              >
                <MessageCircle size={18} />
                <span>
                  {comments[post.id]?.length || 0} {comments[post.id]?.length === 1 ? 'comment' : 'comments'}
                </span>
              </button>

              {selectedPost === post.id && (
                <div className="space-y-3">
                  {comments[post.id]?.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-700 text-sm">Anonymous</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  ))}

                  <div className="flex space-x-2 mt-4">
                    <input
                      type="text"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No posts yet. Be the first to share something anonymously!</p>
        </div>
      )}
    </div>
  );
}
