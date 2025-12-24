import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  Tag,
  Search,
  Filter,
  ChevronDown,
  X,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Mic,
  Briefcase,
  Music,
  Globe,
  Share2,
  Bookmark,
  Eye,
  Trash2,
  Edit2,
  CheckCircle,
  Upload,
  Shield,
  Target,
  BarChart3,
  AlertCircle,
  ExternalLink,
  Ticket,
  Star,
  Bell,
  Heart
} from "lucide-react";
import { supabase, Event } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function Events() {
  const { user, profile } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcoming: 0,
    hackathons: 0,
    registered: 0
  });

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("hackathon");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [venue, setVenue] = useState("");
  const [website, setWebsite] = useState("");
  const [maxAttendees, setMaxAttendees] = useState(100);
  const [tags, setTags] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [search, events, selectedFilter, selectedCategory, dateFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*, profiles(full_name, avatar_url), event_registrations(count), event_likes(count)")
        .order("date", { ascending: true });

      if (error) throw error;
      
      const eventsData = data || [];
      setEvents(eventsData);
      
      // Calculate stats
      const now = new Date();
      const upcomingCount = eventsData.filter(e => new Date(e.date) > now).length;
      const hackathonCount = eventsData.filter(e => e.event_type === 'hackathon').length;
      const registeredCount = eventsData.reduce((sum, event) => 
        sum + (event.event_registrations?.[0]?.count || 0), 0
      );
      
      setStats({
        totalEvents: eventsData.length,
        upcoming: upcomingCount,
        hackathons: hackathonCount,
        registered: registeredCount
      });
      
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    const now = new Date();
    
    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.tags?.join(",").toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      );
    }
    
    // Apply type filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "upcoming") {
        filtered = filtered.filter(e => new Date(e.date) > now);
      } else if (selectedFilter === "past") {
        filtered = filtered.filter(e => new Date(e.date) < now);
      } else if (selectedFilter === "featured") {
        filtered = filtered.filter(e => e.is_featured);
      } else if (selectedFilter === "yours") {
        filtered = filtered.filter(e => e.created_by === user?.id);
      }
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(e => e.event_type === selectedCategory);
    }
    
    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date();
      if (dateFilter === "today") {
        filtered = filtered.filter(e => 
          new Date(e.date).toDateString() === today.toDateString()
        );
      } else if (dateFilter === "week") {
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + 7);
        filtered = filtered.filter(e => {
          const eventDate = new Date(e.date);
          return eventDate >= today && eventDate <= weekEnd;
        });
      } else if (dateFilter === "month") {
        const monthEnd = new Date();
        monthEnd.setDate(monthEnd.getDate() + 30);
        filtered = filtered.filter(e => {
          const eventDate = new Date(e.date);
          return eventDate >= today && eventDate <= monthEnd;
        });
      }
    }
    
    setFilteredEvents(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to create an event");
      return;
    }

    if (!cover) {
      alert("Please upload a cover image");
      return;
    }

    setCreating(true);
    setCreateSuccess(false);

    try {
      // Upload cover image
      const ext = cover.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("event-covers")
        .upload(fileName, cover);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("event-covers")
        .getPublicUrl(fileName);

      // Prepare tags array
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);

      // Create event
      const { error } = await supabase.from("events").insert({
        title,
        description,
        event_type: eventType,
        date,
        time,
        location,
        venue,
        website,
        max_attendees: maxAttendees,
        tags: tagsArray,
        cover_url: urlData.publicUrl,
        created_by: user.id,
        is_featured: false,
        likes_count: 0
      });

      if (error) throw error;

      // Reset form
      setTitle("");
      setDescription("");
      setEventType("hackathon");
      setDate("");
      setTime("");
      setLocation("");
      setVenue("");
      setWebsite("");
      setMaxAttendees(100);
      setTags("");
      setCover(null);
      setCoverPreview(null);
      setCreateSuccess(true);
      
      // Reload events
      loadEvents();
      
      // Close modal after delay
      setTimeout(() => {
        setShowCreate(false);
        setCreateSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      console.error("Create error:", err);
      alert(`Failed to create event: ${err.message || "Unknown error"}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      
      // Update events state
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setFilteredEvents(prev => prev.filter(e => e.id !== eventId));
      
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete event");
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) {
      alert("Please sign in to register for events");
      return;
    }

    try {
      // Check if already registered
      const { data: existingRegistration } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (existingRegistration) {
        alert("You are already registered for this event");
        return;
      }

      // Register for event
      const { error } = await supabase.from("event_registrations").insert({
        event_id: eventId,
        user_id: user.id,
        status: "registered"
      });

      if (error) throw error;

      alert("Successfully registered for the event!");
      loadEvents();
      
    } catch (err) {
      console.error("Registration error:", err);
      alert("Failed to register for event");
    }
  };

  const handleLike = async (eventId: string) => {
    if (!user) {
      alert("Please sign in to like events");
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from("event_likes")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from("event_likes")
          .delete()
          .eq("id", existingLike.id);
      } else {
        // Like
        await supabase.from("event_likes").insert({
          event_id: eventId,
          user_id: user.id
        });
      }

      loadEvents();
      
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCover(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hackathon': return 'from-purple-500 to-pink-500';
      case 'workshop': return 'from-blue-500 to-cyan-500';
      case 'conference': return 'from-green-500 to-emerald-500';
      case 'festival': return 'from-orange-500 to-amber-500';
      case 'seminar': return 'from-red-500 to-rose-500';
      case 'networking': return 'from-indigo-500 to-blue-500';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'hackathon': return <Zap className="w-5 h-5" />;
      case 'workshop': return <Briefcase className="w-5 h-5" />;
      case 'conference': return <Mic className="w-5 h-5" />;
      case 'festival': return <Music className="w-5 h-5" />;
      case 'seminar': return <Award className="w-5 h-5" />;
      case 'networking': return <Users className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isEventLive = (eventDate: string, eventTime: string) => {
    const now = new Date();
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const diff = eventDateTime.getTime() - now.getTime();
    return diff > 0 && diff < 24 * 60 * 60 * 1000; // Within next 24 hours
  };

  const isEventPassed = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-800 border-t-purple-500 rounded-full animate-spin reverse"></div>
            </div>
          </div>
          <p className="text-xl text-gray-300 font-semibold mt-4">Loading Events</p>
          <p className="text-gray-500 text-sm mt-2">Fetching exciting opportunities...</p>
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
                <div className="absolute -inset-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl blur-xl opacity-20"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800/50 shadow-2xl">
                  <Calendar className="w-10 h-10 text-pink-400" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-300 to-orange-400 bg-clip-text text-transparent">
                  Events Hub
                </h1>
                <p className="text-gray-400 mt-2">Discover hackathons, workshops, conferences, and more</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
                { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'from-green-500 to-emerald-500' },
                { label: 'Hackathons', value: stats.hackathons, icon: Zap, color: 'from-purple-500 to-pink-500' },
                { label: 'Registered', value: stats.registered, icon: Users, color: 'from-orange-500 to-amber-500' },
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
                <div className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl">
                  <Target className="w-8 h-8 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Host Your Event</h3>
                  <p className="text-gray-400 text-sm">Reach thousands of students and professionals</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold shadow-xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Create Event</span>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600/30 to-purple-600/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                  placeholder="Search events by title, description, tags, or location..."
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Event Type Filters */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Event Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'hackathon', 'workshop', 'conference', 'festival', 'seminar', 'networking'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedCategory(type)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 capitalize ${
                            selectedCategory === type
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filters */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'upcoming', 'past', 'featured', 'yours'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setSelectedFilter(filter)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 capitalize ${
                            selectedFilter === filter
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Filters */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Date Range</h4>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'today', 'week', 'month'].map((dateRange) => (
                        <button
                          key={dateRange}
                          onClick={() => setDateFilter(dateRange)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 capitalize ${
                            dateFilter === dateRange
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {dateRange}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Event Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-gray-800/50 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-900/90 backdrop-blur-sm py-2 -mx-8 px-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Create New Event</h3>
                      <p className="text-gray-400 text-sm">Share your event with the community</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreate(false);
                      setCoverPreview(null);
                      setCover(null);
                    }}
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
                    <h4 className="text-2xl font-bold text-white mb-2">Event Created Successfully!</h4>
                    <p className="text-gray-400">Your event is now live for registrations.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreate} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Event Title *</label>
                        <input
                          required
                          placeholder="e.g., Annual Tech Hackathon 2024"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Event Type *</label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <option value="hackathon">Hackathon</option>
                          <option value="workshop">Workshop</option>
                          <option value="conference">Conference</option>
                          <option value="festival">Festival</option>
                          <option value="seminar">Seminar</option>
                          <option value="networking">Networking</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                      <textarea
                        required
                        placeholder="Describe your event, agenda, speakers, prizes, etc."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-32 resize-none"
                        rows={4}
                      />
                    </div>

                    {/* Date & Time */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Date *</label>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Time *</label>
                        <input
                          type="time"
                          required
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    {/* Location Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Location *</label>
                        <input
                          required
                          placeholder="e.g., New York City, NY"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Venue</label>
                        <input
                          placeholder="e.g., Convention Center, Room 101"
                          value={venue}
                          onChange={(e) => setVenue(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                        <input
                          type="url"
                          placeholder="https://event-website.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Max Attendees</label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={maxAttendees}
                          onChange={(e) => setMaxAttendees(parseInt(e.target.value) || 100)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
                      <input
                        placeholder="tech, coding, ai, blockchain, startup (separate with commas)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <p className="text-xs text-gray-500 mt-2">Add relevant tags to help people discover your event</p>
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Cover Image *
                      </label>
                      <div className="space-y-4">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 hover:border-pink-500/50 ${
                            coverPreview ? 'border-pink-500/30' : 'border-gray-700/50'
                          }`}
                        >
                          {coverPreview ? (
                            <div className="relative h-56 rounded-xl overflow-hidden">
                              <img
                                src={coverPreview}
                                alt="Cover preview"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                                <Image className="w-5 h-5" />
                                <span>Click to change</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-56 text-gray-500">
                              <Upload className="w-12 h-12 mb-3" />
                              <p className="font-medium">Upload event cover image</p>
                              <p className="text-sm mt-1">Recommended: 1200×400 pixels</p>
                            </div>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            required
                            onChange={handleCoverChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-800/50">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>Secure & Verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>Global Reach</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreate(false);
                            setCoverPreview(null);
                            setCover(null);
                          }}
                          className="px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={creating}
                          type="submit"
                          className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {creating ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Creating...
                            </div>
                          ) : (
                            'Publish Event'
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

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const isOwner = event.created_by === user?.id;
              const isLive = isEventLive(event.date, event.time || "");
              const isPassed = isEventPassed(event.date);
              const likesCount = event.event_likes?.[0]?.count || 0;
              const registrationsCount = event.event_registrations?.[0]?.count || 0;
              const isRegistered = false; // You would check this from user's registrations
              
              return (
                <div
                  key={event.id}
                  className="group relative bg-gradient-to-b from-gray-900/80 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/50 overflow-hidden hover:border-pink-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/10"
                >
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    {isLive && (
                      <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Zap className="w-3 h-3" /> LIVE NOW
                      </span>
                    )}
                    {event.is_featured && (
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                        ⭐ Featured
                      </span>
                    )}
                    {isPassed && (
                      <span className="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-700 text-white text-xs font-bold rounded-full shadow-lg">
                        Past Event
                      </span>
                    )}
                  </div>

                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.cover_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    {/* Event Type Overlay */}
                    <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg ${getEventTypeColor(event.event_type)} text-white text-xs font-bold`}>
                      <div className="flex items-center gap-1">
                        {getEventTypeIcon(event.event_type)}
                        <span className="capitalize">{event.event_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      
                      {/* Date & Time */}
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.time)}</span>
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{event.location}</span>
                          {event.venue && <span className="text-gray-500">• {event.venue}</span>}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-6 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-full border border-gray-700/50"
                          >
                            #{tag}
                          </span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className="px-2.5 py-1 bg-gray-800/50 text-gray-500 text-xs rounded-full">
                            +{event.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-800/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-semibold">{registrationsCount} registered</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-semibold">{likesCount}</span>
                        </div>
                      </div>
                      
                      {/* Creator Info */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 overflow-hidden">
                          {event.profiles?.avatar_url ? (
                            <img
                              src={event.profiles.avatar_url}
                              alt={event.profiles.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {!isOwner && !isPassed ? (
                        <>
                          <button
                            onClick={() => handleRegister(event.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                          >
                            <Ticket className="w-5 h-5" />
                            <span>Register Now</span>
                          </button>
                          <button
                            onClick={() => handleLike(event.id)}
                            className="p-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-800 hover:text-pink-400 transition-colors"
                            title="Like event"
                          >
                            <Heart className="w-5 h-5" />
                          </button>
                        </>
                      ) : isOwner ? (
                        <>
                          <button className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors">
                            View Registrations
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <button className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl">
                          Event Ended
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hover Gradient Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-6 border border-gray-800/50">
                <Calendar className="w-16 h-16 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {search || selectedFilter !== 'all' || selectedCategory !== 'all' ? 'No Events Found' : 'No Events Yet'}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {search || selectedFilter !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your search terms or filters to find more events.'
                  : 'Be the first to create an exciting event for the community!'}
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedFilter('all');
                  setSelectedCategory('all');
                  setDateFilter('all');
                  setShowFilters(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-semibold text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300"
              >
                {search || selectedFilter !== 'all' || selectedCategory !== 'all' ? 'Clear Filters' : 'Create First Event'}
              </button>
            </div>
          )}
        </div>

        {/* Event Categories Info */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Event Categories</h3>
                <p className="text-gray-400 text-sm">Find the perfect event for your interests</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { type: 'hackathon', icon: Zap, label: 'Hackathons', desc: 'Code & Build', color: 'from-purple-500 to-pink-500' },
                { type: 'workshop', icon: Briefcase, label: 'Workshops', desc: 'Learn Skills', color: 'from-blue-500 to-cyan-500' },
                { type: 'conference', icon: Mic, label: 'Conferences', desc: 'Network & Learn', color: 'from-green-500 to-emerald-500' },
                { type: 'festival', icon: Music, label: 'Festivals', desc: 'Celebrate', color: 'from-orange-500 to-amber-500' },
                { type: 'seminar', icon: Award, label: 'Seminars', desc: 'Expert Talks', color: 'from-red-500 to-rose-500' },
                { type: 'networking', icon: Users, label: 'Networking', desc: 'Connect', color: 'from-indigo-500 to-blue-500' },
              ].map((category) => (
                <div
                  key={category.type}
                  onClick={() => setSelectedCategory(category.type)}
                  className={`bg-gray-900/50 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    selectedCategory === category.type ? 'ring-2 ring-blue-500/50' : ''
                  }`}
                >
                  <div className={`inline-flex p-3 ${category.color} rounded-xl mb-3`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">{category.label}</h4>
                  <p className="text-xs text-gray-400">{category.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}

// Add missing User icon component
function User(props: any) {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function Image(props: any) {
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}