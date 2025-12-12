import { useState, useEffect } from 'react';
import { UsersRound, Plus, Tag, Users, User, Mail, Trash2 } from 'lucide-react';
import { supabase, TeamFinderPost } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function TeamFinder() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<TeamFinderPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [creating, setCreating] = useState(false);
  const [contactingPostId, setContactingPostId] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('team_finder_posts')
        .select('*, profiles(full_name, college_name, skills, interests)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    try {
      const { error } = await supabase.from('team_finder_posts').insert({
        user_id: user.id,
        title,
        description,
        required_skills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        team_size: teamSize,
      });

      if (error) throw error;

      setTitle('');
      setDescription('');
      setRequiredSkills('');
      setTeamSize(1);
      setShowCreate(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('team_finder_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleSendContact = async (postId: string, receiverId: string) => {
    if (!user || !contactMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        related_post_id: postId,
        content: contactMessage,
      });

      if (error) throw error;
      setContactingPostId(null);
      setContactMessage('');
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading posts...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Team Finder</h2>
          <p className="text-gray-600">Build amazing projects with talented teammates</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          <Plus size={20} />
          <span>Find Teammates</span>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Create Team Finder Post</h3>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-700">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:bg-gray-50"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:bg-gray-50"
              placeholder="Describe your project and what you're looking for..."
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Required Skills (comma-separated)</label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. React, Node.js, Design"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Team Size Needed</label>
              <input
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:bg-gray-50"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-semibold shadow-lg"
            >
              {creating ? 'Creating...' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-800 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <User className="text-gray-500" size={18} />
                <div>
                  <p className="font-semibold text-gray-800">{post.profiles?.full_name}</p>
                  <p className="text-gray-500">{post.profiles?.college_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Users className="text-blue-600" size={18} />
                <span className="text-gray-700">Need {post.team_size} teammate(s)</span>
              </div>
            </div>

            {post.required_skills.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Tag className="text-gray-500" size={18} />
                  <span className="text-sm font-semibold text-gray-700">Required Skills:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.required_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {post.profiles?.skills && post.profiles.skills.length > 0 && (
              <div className="mb-4">
                <span className="text-sm font-semibold text-gray-700">Their Skills:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.profiles.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {post.user_id !== user?.id && contactingPostId === post.id ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSendContact(post.id, post.user_id); }} className="space-y-3 mt-6 pt-6 border-t border-gray-200">
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Write a brief message..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                />
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-semibold shadow-lg"
                  >
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setContactingPostId(null); setContactMessage(''); }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                {post.user_id !== user?.id && (
                  <button
                    onClick={() => setContactingPostId(post.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Mail size={18} />
                    <span>Contact</span>
                  </button>
                )}
                {post.user_id === user?.id && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all border border-red-200 font-semibold"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <UsersRound size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No team finder posts yet. Be the first to create one!</p>
        </div>
      )}
    </div>
  );
}
