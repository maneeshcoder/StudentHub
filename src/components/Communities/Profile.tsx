import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Globe,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  MessageSquare,
  FileText,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  Download,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  MoreVertical,
  Trash2,
  Archive,
  ExternalLink,
  Filter,
  Search,
  Plus,
  Hash,
  Lock,
  Unlock,
  BellOff,
  BellRing,
  UserPlus,
  UserMinus,
  RefreshCw
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  job_title?: string;
  is_private: boolean;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface PostStats {
  total_posts: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  total_comments: number;
  avg_engagement: number;
}

interface PostMessage {
  id: string;
  post_id: string;
  sender_id: string;
  sender_email: string;
  sender_name: string;
  content: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
  post_title?: string;
  post_type?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [myPosts, setMyPosts] = useState<any[]>([]);

  const [stats, setStats] = useState<PostStats>({
    total_posts: 0,
    total_views: 0,
    total_likes: 0,
    total_shares: 0,
    total_comments: 0,
    avg_engagement: 0
  });
  const [messages, setMessages] = useState<PostMessage[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfile(profileData);
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user?.id,
          email: user?.email,
          full_name: '',
          is_private: false,
          notification_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: createdProfile } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createdProfile) {
          setProfile(createdProfile);
        }
      }

      // Load post statistics
      await loadPostStats();
      // load post 
      await loadMyPosts();
      // Load messages
      await loadMessages();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyPosts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("team_finder_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading user posts:", error);
    } else {
      setMyPosts(data || []);
    }
  };

  const loadPostStats = async () => {
    try {
      // Get user's posts
      const { data: posts, error: postsError } = await supabase
        .from('team_finder_posts')
        .select('*')
        .eq('user_id', user?.id);

      if (postsError) throw postsError;

      // Calculate statistics
      const totalPosts = posts?.length || 0;
      const totalViews = posts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
      const totalLikes = posts?.reduce((sum, post) => sum + (post.upvotes || 0), 0) || 0;
      const totalComments = 0; // You'll need to calculate this from comments table
      const totalShares = 0; // You'll need to track shares separately

      // For demo, let's calculate comments
      if (posts && posts.length > 0) {
        const postIds = posts.map(p => p.id);
        const { data: comments } = await supabase
          .from('anonymous_comments')
          .select('post_id')
          .in('post_id', postIds);

        const totalComments = comments?.length || 0;
        const avgEngagement = totalPosts > 0 ? ((totalLikes + totalComments) / totalPosts) : 0;

        setStats({
          total_posts: totalPosts,
          total_views: totalViews,
          total_likes: totalLikes,
          total_shares: totalShares,
          total_comments: totalComments,
          avg_engagement: parseFloat(avgEngagement.toFixed(1))
        });
      }
    } catch (error) {
      console.error('Error loading post stats:', error);
    }
  };

  const loadMessages = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select(`
      id,
      content,
      created_at,
      read,
      post_id,
      sender:profiles!messages_sender_id_fkey (
        full_name
      ),
      post:team_finder_posts (
        id,
        title
      )
    `)
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    setMessages(
      (data || []).map((m: any) => ({
        id: m.id,
        post_id: m.post_id,
        sender_name: m.sender?.full_name || "Unknown",
        content: m.content,
        created_at: m.created_at,
        status: m.read ? "read" : "unread",
        post_title: m.post?.title
      }))
    );
  };

  const handleSaveProfile = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const updates = {
        ...profile,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

          if (!updateError) {
            setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
          }
        }
      }

      // Update auth context

      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);

    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMessageAction = async (messageId: string, action: 'read' | 'archive' | 'delete') => {
    try {
      // Update message status in database
      if (action === 'delete') {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      } else {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, status: action as 'read' | 'archived' } : msg
        ));
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filterStatus !== 'all' && msg.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        msg.content.toLowerCase().includes(query) ||
        msg.sender_name.toLowerCase().includes(query) ||
        (msg.post_title && msg.post_title.toLowerCase().includes(query))
      );
    }
    return true;
  });
  // 🔹 Group messages under each of user's posts
  const messagesByPost = myPosts.map(post => ({
    ...post,
    messages: messages.filter(msg => msg.post_id === post.id)
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-800 border-t-purple-500 rounded-full animate-spin reverse"></div>
            </div>
          </div>
          <p className="text-xl text-gray-300 font-semibold mt-4">Loading Your Dashboard</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your personalized experience...</p>
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800/50 shadow-2xl">
                  <User className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Your Dashboard
                </h1>
                <p className="text-gray-400 mt-2">Manage your profile, posts, and messages</p>
              </div>
            </div>

            {/* <div className="flex items-center gap-3">
              <div className="relative group">
                <button className="p-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 text-gray-400 hover:text-white hover:border-purple-500/30 transition-all duration-300">
                  <Bell className="w-6 h-6" />
                </button>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs font-bold flex items-center justify-center">
                  3
                </span>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-800/50 text-gray-400 hover:text-white hover:border-purple-500/30 transition-all duration-300 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div> */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(false);
                          setAvatarFile(null);
                          setAvatarPreview(null);
                        }}
                        className="px-4 py-2 bg-gray-800 rounded-xl font-semibold text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar Section */}
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                      <div className="relative w-40 h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full overflow-hidden border-4 border-gray-800/50">
                        {avatarPreview || profile?.avatar_url ? (
                          <img
                            src={avatarPreview || profile?.avatar_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-20 h-20 text-gray-600" />
                          </div>
                        )}
                        {editing && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                          >
                            <Camera className="w-10 h-10 text-white" />
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    {editing && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Click image to upload new avatar
                      </p>
                    )}
                  </div>

                  {/* Profile Form */}
                  <div className="flex-1">
                    {editing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profile?.full_name || ''}
                              onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={profile?.email || user?.email || ''}
                              disabled
                              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/30 rounded-xl text-gray-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Bio
                          </label>
                          <textarea
                            value={profile?.bio || ''}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            placeholder="Tell us about yourself..."
                            maxLength={200}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              <MapPin className="w-4 h-4 inline mr-2" />
                              Location
                            </label>
                            <input
                              type="text"
                              value={profile?.location || ''}
                              onChange={(e) => setProfile(prev => prev ? { ...prev, location: e.target.value } : null)}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="City, Country"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              <Phone className="w-4 h-4 inline mr-2" />
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={profile?.phone || ''}
                              onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              <Briefcase className="w-4 h-4 inline mr-2" />
                              Job Title
                            </label>
                            <input
                              type="text"
                              value={profile?.job_title || ''}
                              onChange={(e) => setProfile(prev => prev ? { ...prev, job_title: e.target.value } : null)}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="Software Developer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              <Globe className="w-4 h-4 inline mr-2" />
                              Website
                            </label>
                            <input
                              type="url"
                              value={profile?.website || ''}
                              onChange={(e) => setProfile(prev => prev ? { ...prev, website: e.target.value } : null)}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="https://example.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800/50">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setProfile(prev => prev ? { ...prev, is_private: !prev.is_private } : null)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile?.is_private ? 'bg-purple-600' : 'bg-gray-700'
                                }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile?.is_private ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                            <div>
                              <span className="text-sm font-medium text-white">Private Profile</span>
                              <p className="text-xs text-gray-500">{profile?.is_private ? 'Your profile is hidden' : 'Your profile is public'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setProfile(prev => prev ? { ...prev, notification_enabled: !prev.notification_enabled } : null)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile?.notification_enabled ? 'bg-green-600' : 'bg-gray-700'
                                }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile?.notification_enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                            <div>
                              <span className="text-sm font-medium text-white">Notifications</span>
                              <p className="text-xs text-gray-500">{profile?.notification_enabled ? 'Enabled' : 'Disabled'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {profile?.full_name || 'Anonymous User'}
                          </h3>
                          <p className="text-gray-400">
                            {profile?.bio || 'No bio added yet. Click Edit Profile to add one.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 text-gray-400">
                            <Mail className="w-5 h-5" />
                            <span>{profile?.email || user?.email}</span>
                          </div>
                          {profile?.location && (
                            <div className="flex items-center gap-3 text-gray-400">
                              <MapPin className="w-5 h-5" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                          {profile?.phone && (
                            <div className="flex items-center gap-3 text-gray-400">
                              <Phone className="w-5 h-5" />
                              <span>{profile.phone}</span>
                            </div>
                          )}
                          {profile?.job_title && (
                            <div className="flex items-center gap-3 text-gray-400">
                              <Briefcase className="w-5 h-5" />
                              <span>{profile.job_title}</span>
                            </div>
                          )}
                          {profile?.website && (
                            <div className="flex items-center gap-3 text-gray-400">
                              <Globe className="w-5 h-5" />
                              <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                {profile.website}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-800/50">
                          <div className="flex items-center gap-2">
                            {profile?.is_private ? (
                              <>
                                <Lock className="w-5 h-5 text-purple-400" />
                                <span className="text-sm text-gray-400">Private Profile</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-5 h-5 text-green-400" />
                                <span className="text-sm text-gray-400">Public Profile</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {profile?.notification_enabled ? (
                              <>
                                <BellRing className="w-5 h-5 text-green-400" />
                                <span className="text-sm text-gray-400">Notifications On</span>
                              </>
                            ) : (
                              <>
                                <BellOff className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-400">Notifications Off</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-400">
                              Joined {new Date(profile?.created_at || '').toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-400">Total Posts</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.total_posts}</p>
                <p className="text-xs text-gray-500 mt-2">All your published posts</p>
              </div>

              

             

              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-xs text-gray-400">Total Comments</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.total_comments}</p>
                <p className="text-xs text-gray-500 mt-2">Comments on your posts</p>
              </div>


            </div>

            {/* User Posts & Messages */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">
                Your Posts & Messages
              </h2>

              {messagesByPost.length === 0 ? (
                <p className="text-gray-500">You haven’t created any posts yet.</p>
              ) : (
                messagesByPost.map(post => (
                  <div
                    key={post.id}
                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5"
                  >
                    <h3 className="text-xl font-bold text-white">
                      {post.title}
                    </h3>

                    <p className="text-sm text-gray-400 mt-1">
                      {post.description}
                    </p>

                    <div className="mt-4 space-y-3">
                      {post.messages.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          No messages received for this post yet.
                        </p>
                      ) : (
                        post.messages.map((msg: any) => (
                          <div
                            key={msg.id}
                            className="bg-black/40 border border-gray-800 rounded-xl p-3"
                          >
                            <p className="text-sm text-white">
                              {msg.content}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              From {msg.sender_name} •{" "}
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .reverse {
          animation-direction: reverse;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}