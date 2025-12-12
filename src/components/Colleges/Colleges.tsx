import { useState, useEffect } from 'react';
import { School, Plus, MapPin, Trash2 } from 'lucide-react';
import { supabase, College } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function Colleges() {
  const { user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error('Error loading colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    try {
      const { error } = await supabase.from('colleges').insert({
        name,
        description,
        created_by: user.id,
      });

      if (error) throw error;

      setName('');
      setDescription('');
      setShowCreate(false);
      loadColleges();
    } catch (error) {
      console.error('Error creating college:', error);
      alert('Failed to create college page');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (collegeId: string) => {
    if (!confirm('Are you sure you want to delete this college page?')) return;

    try {
      const { error } = await supabase
        .from('colleges')
        .delete()
        .eq('id', collegeId);

      if (error) throw error;
      loadColleges();
    } catch (error) {
      console.error('Error deleting college:', error);
      alert('Failed to delete college');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading colleges...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">College Pages</h2>
          <p className="text-gray-600">Discover and connect with your college community</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          <Plus size={20} />
          <span>Create College Page</span>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Create College Page</h3>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-700">College Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="Tell us about your college..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-semibold shadow-lg"
            >
              {creating ? 'Creating...' : 'Create Page'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {colleges.map((college) => (
          <div key={college.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 overflow-hidden group hover:scale-105">
            <div className="p-8">
              <div className="flex items-start space-x-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-all">
                  <School className="text-blue-600" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-gray-900">{college.name}</h3>
                </div>
              </div>
              {college.description && (
                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{college.description}</p>
              )}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-lg hover:from-blue-200 hover:to-blue-100 transition-all font-semibold border border-blue-200">
                  View College
                </button>
                {college.created_by === user?.id && (
                  <button
                    onClick={() => handleDelete(college.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all border border-red-200"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {colleges.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <School size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No college pages yet. Create the first one!</p>
        </div>
      )}
    </div>
  );
}
