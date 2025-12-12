import { useState, useEffect } from 'react';
import { Users, Plus, UserPlus, UserCheck } from 'lucide-react';
import { supabase, Community } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function Communities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCommunities();
    loadJoinedCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*, community_members(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJoinedCommunities = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setJoinedCommunities(new Set(data?.map(m => m.community_id) || []));
    } catch (error) {
      console.error('Error loading joined communities:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('communities')
        .insert({
          name,
          description,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('community_members').insert({
        community_id: data.id,
        user_id: user.id,
      });

      setName('');
      setDescription('');
      setShowCreate(false);
      loadCommunities();
      loadJoinedCommunities();
    } catch (error) {
      console.error('Error creating community:', error);
      alert('Failed to create community');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (communityId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('community_members').insert({
        community_id: communityId,
        user_id: user.id,
      });

      if (error) throw error;
      loadJoinedCommunities();
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLeave = async (communityId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;
      loadJoinedCommunities();
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading communities...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Communities & Clubs</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Plus size={20} />
          <span>Create Community</span>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Create New Community</h3>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Community Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What is this community about?"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Community'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => {
          const isJoined = joinedCommunities.has(community.id);
          return (
            <div key={community.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-3 mb-4">
                <Users className="text-blue-600 flex-shrink-0" size={28} />
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800">{community.name}</h3>
                </div>
              </div>
              {community.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">{community.description}</p>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Members: {community.member_count || 0}</span>
              </div>
              <div className="flex space-x-2">
                {isJoined ? (
                  <button
                    onClick={() => handleLeave(community.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <UserCheck size={18} />
                    <span>Joined</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(community.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    <UserPlus size={18} />
                    <span>Join</span>
                  </button>
                )}
                {community.created_by === user?.id && (
                  <button
                    onClick={() => handleDeleteCommunity(community.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {communities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No communities yet. Create the first one!</p>
        </div>
      )}
    </div>
  );
}
