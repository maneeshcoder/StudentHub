import { useState, useEffect } from "react";
import {
  UsersRound,
  Plus,
  Tag,
  Users,
  User,
  Mail,
  Trash2,
  Search,
  X,
  Zap,
  Users2,
  Target,
  Calendar,
  Briefcase,
  Globe,
  Sparkles,
  Send,
  CheckCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  Clock,
  TrendingUp,
  Star,
  Award,
  Brain,
  Cpu,
  Rocket,
  Shield
} from "lucide-react";
import { supabase, TeamFinderPost } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function TeamFinder() {
  const { user, profile } = useAuth();

  const [posts, setPosts] = useState<TeamFinderPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<TeamFinderPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    activeTeams: 0,
    skillsInDemand: 0,
    matchesFound: 0
  });

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [teamSize, setTeamSize] = useState(2);
  const [projectType, setProjectType] = useState("hackathon");
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [contactingPostId, setContactingPostId] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [search, posts, selectedFilter, skillsFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("team_finder_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const postsData = data || [];
      setPosts(postsData);
      
      // Calculate stats
      const uniqueSkills = new Set<string>();
      postsData.forEach(post => {
        post.required_skills?.forEach(skill => uniqueSkills.add(skill));
      });
      
      // Calculate potential matches based on user skills
      let matches = 0;
      if (profile?.skills) {
        const userSkills = profile.skills.split(',').map(s => s.trim().toLowerCase());
        postsData.forEach(post => {
          const postSkills = post.required_skills?.map(s => s.trim().toLowerCase()) || [];
          const match = postSkills.some(skill => 
            userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
          );
          if (match) matches++;
        });
      }
      
      setStats({
        totalPosts: postsData.length,
        activeTeams: postsData.filter(p => p.team_size > 1).length,
        skillsInDemand: uniqueSkills.size,
        matchesFound: matches
      });
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];
    
    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.required_skills?.join(",").toLowerCase().includes(q) ||
          p.profiles?.college_name?.toLowerCase().includes(q) ||
          p.profiles?.full_name?.toLowerCase().includes(q)
      );
    }
    
    // Apply type filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(p => {
        const titleLower = p.title.toLowerCase();
        const descLower = p.description?.toLowerCase() || "";
        
        if (selectedFilter === "hackathon") {
          return titleLower.includes("hackathon") || descLower.includes("hackathon") ||
                 titleLower.includes("competition") || descLower.includes("competition");
        } else if (selectedFilter === "startup") {
          return titleLower.includes("startup") || descLower.includes("startup") ||
                 titleLower.includes("business") || descLower.includes("business");
        } else if (selectedFilter === "academic") {
          return titleLower.includes("project") || descLower.includes("project") ||
                 titleLower.includes("research") || descLower.includes("research");
        } else if (selectedFilter === "yours") {
          return p.user_id === user?.id;
        }
        return true;
      });
    }
    
    // Apply skills filter
    if (skillsFilter.length > 0) {
      filtered = filtered.filter(p => 
        p.required_skills?.some(skill => 
          skillsFilter.some(filterSkill => 
            skill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }
    
    setFilteredPosts(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    setCreateSuccess(false);

    try {
      const skillsArray = requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10); // Limit to 10 skills

      const { data, error } = await supabase
        .from("team_finder_posts")
        .insert({
          user_id: user.id,
          title,
          description,
          required_skills: skillsArray,
          team_size: teamSize,
          project_type: projectType
        })
        .select()
        .single();

      if (error) {
        console.error("Create error:", error);
        throw error;
      }

      // Reset form
      setTitle("");
      setDescription("");
      setRequiredSkills("");
      setTeamSize(2);
      setProjectType("hackathon");
      setCreateSuccess(true);
      
      // Update posts state immediately
      if (data) {
        setPosts(prev => [data, ...prev]);
        setStats(prev => ({
          ...prev,
          totalPosts: prev.totalPosts + 1,
          activeTeams: prev.activeTeams + 1
        }));
      }
      
      // Close modal after success
      setTimeout(() => {
        setShowCreate(false);
        setCreateSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      alert(`Failed to create post: ${err.message || "Please try again"}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const { error } = await supabase
        .from("team_finder_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      
      // Update posts state immediately
      setPosts(prev => prev.filter(p => p.id !== postId));
      setFilteredPosts(prev => prev.filter(p => p.id !== postId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalPosts: prev.totalPosts - 1,
        activeTeams: prev.activeTeams - 1
      }));
      
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const handleSendContact = async (postId: string, receiverId: string) => {
    if (!user || !contactMessage.trim()) return;

    setSendingMessage(true);
    setMessageSent(false);

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        related_post_id: postId,
        content: contactMessage,
      });

      if (error) throw error;

      setMessageSent(true);
      setContactMessage("");
      
      // Reset after success
      setTimeout(() => {
        setContactingPostId(null);
        setMessageSent(false);
      }, 1500);
      
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'hackathon': return 'from-purple-500 to-pink-500';
      case 'startup': return 'from-green-500 to-emerald-500';
      case 'academic': return 'from-blue-500 to-cyan-500';
      case 'research': return 'from-orange-500 to-amber-500';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'hackathon': return <Zap className="w-4 h-4" />;
      case 'startup': return <Rocket className="w-4 h-4" />;
      case 'academic': return <Book className="w-4 h-4" />;
      case 'research': return <Brain className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  };

  const popularSkills = [
    'React', 'Node.js', 'Python', 'AI/ML', 'Blockchain', 
    'UI/UX', 'Mobile', 'DevOps', 'Data Science', 'Web3'
  ];

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
          <p className="text-xl text-gray-300 font-semibold mt-4">Finding Teams</p>
          <p className="text-gray-500 text-sm mt-2">Loading collaborative opportunities...</p>
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
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-blue-500 via-cyan-500 to-green-500 rounded-2xl blur-xl opacity-20"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800/50 shadow-2xl">
                  <Users2 className="w-10 h-10 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-green-400 bg-clip-text text-transparent">
                  Team Finder
                </h1>
                <p className="text-gray-400 mt-2">Connect with talented individuals for amazing projects</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Posts', value: stats.totalPosts, icon: Target, color: 'from-blue-500 to-cyan-500' },
                { label: 'Active Teams', value: stats.activeTeams, icon: Users2, color: 'from-green-500 to-emerald-500' },
                { label: 'Skills Needed', value: stats.skillsInDemand, icon: Brain, color: 'from-purple-500 to-pink-500' },
                { label: 'Your Matches', value: stats.matchesFound, icon: Star, color: 'from-orange-500 to-amber-500' },
              ].map((stat, index) => (
                <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 ${stat.color} rounded-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-400">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action Banner */}
          <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                  <Zap className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Find Your Dream Team</h3>
                  <p className="text-gray-400 text-sm">Connect with developers, designers, and innovators for hackathons, startups, and projects</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Create Team Post</span>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search by project, skills, college, or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  <Filter size={18} />
                  <span>Filters</span>
                  <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-800/50">
                <div className="space-y-4">
                  {/* Project Type Filters */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Project Type</h4>
                    <div className="flex flex-wrap gap-3">
                      {['all', 'hackathon', 'startup', 'academic', 'yours'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setSelectedFilter(filter)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize ${
                            selectedFilter === filter
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {filter === 'all' ? 'All Types' : filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Skills */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Popular Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {popularSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => {
                            if (skillsFilter.includes(skill)) {
                              setSkillsFilter(skillsFilter.filter(s => s !== skill));
                            } else {
                              setSkillsFilter([...skillsFilter, skill]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                            skillsFilter.includes(skill)
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-2xl bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-gray-800/50 shadow-2xl animate-in slide-in-from-top-5">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Create Team Post</h3>
                      <p className="text-gray-400 text-sm">Find your perfect team members</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {createSuccess ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">Post Created Successfully!</h4>
                    <p className="text-gray-400">Your team post is now live. Start receiving applications!</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Project Title *</label>
                      <input
                        required
                        placeholder="e.g., AI-Powered Study Assistant Hackathon"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Project Description *</label>
                      <textarea
                        required
                        placeholder="Describe your project, goals, and what you're looking for in teammates..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-32 resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Required Skills</label>
                        <input
                          placeholder="React, Node.js, UI/UX, Python, etc."
                          value={requiredSkills}
                          onChange={(e) => setRequiredSkills(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <p className="text-xs text-gray-500 mt-2">Separate skills with commas</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Team Size Needed</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={teamSize}
                            onChange={(e) => setTeamSize(parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-400" />
                            <span className="text-xl font-bold text-white">{teamSize}</span>
                            <span className="text-gray-400">members</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Project Type</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { value: 'hackathon', label: 'Hackathon', icon: Zap, color: 'from-purple-500 to-pink-500' },
                          { value: 'startup', label: 'Startup', icon: Rocket, color: 'from-green-500 to-emerald-500' },
                          { value: 'academic', label: 'Academic', icon: Book, color: 'from-blue-500 to-cyan-500' },
                          { value: 'research', label: 'Research', icon: Brain, color: 'from-orange-500 to-amber-500' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setProjectType(type.value)}
                            className={`p-4 rounded-xl border transition-all duration-300 ${
                              projectType === type.value
                                ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg`
                                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-800'
                            }`}
                          >
                            <div className={`p-2 rounded-lg w-fit mb-2 ${type.color.replace('from-', 'bg-').replace(' to-', '/20')}`}>
                              <type.icon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-800/50">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>Secure Connection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>Global Reach</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowCreate(false)}
                          className="px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={creating}
                          type="submit"
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {creating ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Creating...
                            </div>
                          ) : (
                            'Create Team Post'
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {contactingPostId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-gray-800/50 shadow-2xl animate-in slide-in-from-top-5">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Send Message</h3>
                      <p className="text-gray-400 text-sm">Introduce yourself to the team leader</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setContactingPostId(null);
                      setContactMessage('');
                      setMessageSent(false);
                    }}
                    className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {messageSent ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Message Sent!</h4>
                    <p className="text-gray-400">The team leader will get back to you soon.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Your Message *
                      </label>
                      <textarea
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Hi! I'm interested in joining your team. I have experience with..."
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-32 resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setContactingPostId(null);
                          setContactMessage('');
                        }}
                        className="px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const post = posts.find(p => p.id === contactingPostId);
                          if (post) {
                            handleSendContact(post.id, post.user_id);
                          }
                        }}
                        disabled={sendingMessage || !contactMessage.trim()}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {sendingMessage ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </div>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team Posts Grid */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const isOwner = post.user_id === user?.id;
              const postSkills = post.required_skills || [];
              const isMatch = profile?.skills && postSkills.some(skill => 
                profile.skills.toLowerCase().includes(skill.toLowerCase())
              );
              
              return (
                <div
                  key={post.id}
                  className="group relative bg-gradient-to-b from-gray-900/80 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-8 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  {/* Match Badge */}
                  {isMatch && !isOwner && (
                    <div className="absolute -top-3 -left-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg z-10">
                      ✨ Your Skills Match!
                    </div>
                  )}

                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full blur-md opacity-50"></div>
                        <div className={`relative p-3 rounded-xl ${getProjectTypeColor(post.project_type || 'hackathon')}`}>
                          {getProjectTypeIcon(post.project_type || 'hackathon')}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{post.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{timeAgo(post.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Looking for {post.team_size} member{post.team_size > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Owner Actions */}
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-3 bg-gray-800/50 border border-gray-700/50 text-red-400 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-8 leading-relaxed">{post.description}</p>

                  {/* Skills */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-gray-400 mb-4">Required Skills:</h4>
                    <div className="flex flex-wrap gap-3">
                      {postSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-lg border border-blue-500/30 text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Post Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-800/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 overflow-hidden">
                          {post.profiles?.avatar_url ? (
                            <img
                              src={post.profiles.avatar_url}
                              alt={post.profiles.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{post.profiles?.full_name}</p>
                          <p className="text-sm text-gray-400">{post.profiles?.college_name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {!isOwner ? (
                        <button
                          onClick={() => setContactingPostId(post.id)}
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                        >
                          Join Team
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-lg text-sm">
                          Your Post
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Gradient Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-6 border border-gray-800/50">
                <UsersRound className="w-16 h-16 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {search || selectedFilter !== 'all' || skillsFilter.length > 0 
                  ? 'No Teams Found' 
                  : 'No Team Posts Yet'}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {search || selectedFilter !== 'all' || skillsFilter.length > 0
                  ? 'Try adjusting your search terms or filters to find more teams.'
                  : 'Be the first to create a team post and find amazing collaborators!'}
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedFilter('all');
                  setSkillsFilter([]);
                  setShowFilters(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              >
                {search || selectedFilter !== 'all' || skillsFilter.length > 0 
                  ? 'Clear Filters' 
                  : 'Create First Team'}
              </button>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl">
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Tips for Successful Team Building</h3>
                <p className="text-gray-400 text-sm">Make the most of your collaborative experience</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-white mb-2">Clear Goals</h4>
                <p className="text-sm text-gray-400">Define project objectives and expectations upfront</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="text-2xl mb-2">🤝</div>
                <h4 className="font-semibold text-white mb-2">Diverse Skills</h4>
                <p className="text-sm text-gray-400">Look for teammates with complementary skills</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-semibold text-white mb-2">Communication</h4>
                <p className="text-sm text-gray-400">Establish regular check-ins and clear communication channels</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slide-in-from-top 0.3s ease-out;
        }
        .reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}

// Add missing Book icon component
function Book(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}