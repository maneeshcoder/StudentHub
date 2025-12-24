import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  User,
  Calendar,
  Search,
  Download,
  Eye,
  Filter,
  X,
  ChevronDown,
  Zap,
  Sparkles,
  BarChart3,
  Clock,
  Star,
  BookOpen,
  Shield,
  Globe,
  TrendingUp,
  FileUp,
  CheckCircle,
  AlertCircle,
  Layers
} from "lucide-react";
import { supabase, Note } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function Notes() {
  const { user, profile } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    popular: 0,
    yourNotes: 0
  });

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("");

  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterAndSortNotes();
  }, [search, notes, selectedFilter, sortBy]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*, profiles(full_name, profile_photo_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const notesData = data || [];
      setNotes(notesData);

      // Calculate stats
      const yourNotesCount = notesData.filter(n => n.user_id === user?.id).length;
      const recentCount = notesData.filter(n => {
        const noteDate = new Date(n.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return noteDate > weekAgo;
      }).length;

      setStats({
        total: notesData.length,
        recent: recentCount,
        popular: notesData.filter(n => (n.downloads?.[0]?.count || 0) > 50).length,
        yourNotes: yourNotesCount
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortNotes = () => {
    let filtered = [...notes];

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.subject?.toLowerCase().includes(q) ||
          n.profiles?.full_name?.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q)
      );
    }

    // Apply category filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "yours") {
        filtered = filtered.filter(n => n.user_id === user?.id);
      } else if (selectedFilter === "recent") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(n => new Date(n.created_at) > weekAgo);
      } else if (selectedFilter === "popular") {
        filtered = filtered.filter(n => (n.downloads?.[0]?.count || 0) > 10);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === "popular") {
        const aDownloads = a.downloads?.[0]?.count || 0;
        const bDownloads = b.downloads?.[0]?.count || 0;
        return bDownloads - aDownloads;
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    setFilteredNotes(filtered);
  };

  // const handleUpload = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!user || !file) return;

  //   setUploading(true);
  //   setUploadSuccess(false);

  //   try {
  //     const fileExt = file.name.split(".").pop();
  //     const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  //     const fileType = file.type.includes('pdf') ? 'PDF' :
  //       file.type.includes('word') ? 'DOC' :
  //         file.type.includes('text') ? 'TEXT' : 'OTHER';
      

  //     const { error: uploadError } = await supabase.storage
  //       .from("notes-files")
  //       .upload(fileName, file);

  //     if (uploadError) throw uploadError;

  //     const { data: publicUrl } = supabase.storage
  //       .from("notes-files")
  //       .getPublicUrl(fileName);

  //     const { error } = await supabase.from("notes").insert({
  //       user_id: user.id,
  //       title,
  //       subject,
  //       description,
  //       file_url: publicUrl.publicUrl,
  //     });

  //     if (error) throw error;

  //     // Reset form
  //     setTitle("");
  //     setSubject("");
  //     setDescription("");
  //     setFile(null);
  //     setFileType("");
  //     setUploadSuccess(true);

  //     // Reload notes after a delay
  //     setTimeout(() => {
  //       loadNotes();
  //       setShowUpload(false);
  //       setUploadSuccess(false);
  //     }, 1500);

  //   } catch (err) {
  //     console.error(err);
  //     alert("Upload failed. Please try again.");
  //   } finally {
  //     setUploading(false);
  //   }
  // };

const handleUpload = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user || !file) return;

  console.log("User ID:", user.id);
  console.log("User object:", user);

  setUploading(true);
  setUploadSuccess(false);

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // 1️⃣ Upload file
    const { error: uploadError } = await supabase.storage
      .from("notes-files")
      .upload(filePath, file);
      

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }

    // 2️⃣ Get public URL
    const { data } = supabase.storage
      .from("notes-files")
      .getPublicUrl(filePath);

    console.log("Public URL:", data.publicUrl);

    // 3️⃣ Prepare insert data
    const insertData = {
      user_id: user.id,  // CRITICAL: This must match auth.uid()
      title,
      subject,
      description,
      file_url: data.publicUrl,
    };

    console.log("Inserting data:", insertData);
    console.log(user?.id);

    // 4️⃣ Insert DB record
   const { data: insertedData, error } = await supabase
  .from("notes")
  .insert(insertData)
  .select()
  .single();

if (error) throw error;

console.log("Insert successful:", insertedData);


if (error) throw error;



    if (error) {
      console.error("Database insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log("Insert successful:", insertedData);

    // Reset form
    setTitle("");
    setSubject("");
    setDescription("");
    setFile(null);
    setUploadSuccess(true);

    setTimeout(() => {
      loadNotes();
      setShowUpload(false);
      setUploadSuccess(false);
    }, 1500);

  } catch (err: any) {
    console.error("Full upload error:", err);
    alert(`Upload failed: ${err.message}`);
  } finally {
    setUploading(false);
  }
};
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(selectedFile.type.includes('pdf') ? 'PDF' :
        selectedFile.type.includes('word') ? 'DOC' :
          selectedFile.type.includes('text') ? 'TEXT' : 'OTHER');
    }
  };

  const handleDownload = async (noteId: string, fileUrl: string) => {
    try {
      // Increment download count
      await supabase
        .from('notes_downloads')
        .upsert({ note_id: noteId, user_id: user?.id }, { onConflict: 'note_id,user_id' });

      // Trigger download
      window.open(fileUrl, '_blank');

      // Reload to update counts
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return '📄';
      case 'DOC': return '📝';
      case 'TEXT': return '📃';
      default: return '📎';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Mathematics': 'from-blue-500 to-cyan-500',
      'Science': 'from-green-500 to-emerald-500',
      'Computer': 'from-purple-500 to-pink-500',
      'Engineering': 'from-orange-500 to-amber-500',
      'Business': 'from-red-500 to-rose-500',
      'Arts': 'from-indigo-500 to-blue-500',
      'default': 'from-gray-500 to-gray-700'
    };

    for (const [key, value] of Object.entries(colors)) {
      if (subject?.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return colors.default;
  };

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
          <p className="text-xl text-gray-300 font-semibold mt-4">Loading Notes</p>
          <p className="text-gray-500 text-sm mt-2">Fetching your study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-gray-900 via-black to-gray-900">

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">

        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl shadow-xl shadow-blue-500/20">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                    Smart Notes
                  </h1>
                  <p className="text-gray-400 mt-2">AI-powered notes library with collaborative learning</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { label: 'Total Notes', value: stats.total, icon: Layers, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Recent Uploads', value: stats.recent, icon: Clock, color: 'from-green-500 to-emerald-500' },
                  { label: 'Popular Notes', value: stats.popular, icon: TrendingUp, color: 'from-orange-500 to-amber-500' },
                  { label: 'Your Notes', value: stats.yourNotes, icon: User, color: 'from-purple-500 to-pink-500' },
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

            {/* Upload Button */}
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold text-lg text-white shadow-2xl shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-6 h-6 group-hover:animate-bounce" />
                <span>Upload Notes</span>
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search notes by title, subject, description, or uploader..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
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

              {/* Filter and Sort Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  <Filter size={18} />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="title">A-Z</option>
                </select>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-800/50">
                <div className="flex flex-wrap gap-3">
                  {['all', 'yours', 'recent', 'popular'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize ${selectedFilter === filter
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                      {filter === 'all' ? 'All Notes' : filter}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Form Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-2xl bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-gray-800/50 shadow-2xl animate-in slide-in-from-top-5">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                      <FileUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Upload New Notes</h3>
                      <p className="text-gray-400 text-sm">Share your knowledge with the community</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {uploadSuccess ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">Upload Successful!</h4>
                    <p className="text-gray-400">Your notes have been shared with the community.</p>
                  </div>
                ) : (
                  <form onSubmit={handleUpload} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
                        <input
                          required
                          placeholder="e.g., Calculus 101 Notes"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                        <input
                          placeholder="e.g., Mathematics, Physics"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                      <textarea
                        placeholder="Brief description of your notes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-32 resize-none"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        File Upload (PDF, DOC, TXT) *
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          required
                          onChange={handleFileChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                        />
                        {file && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>{file.name} ({fileType})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-800/50">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>Secure & Private</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>Global Access</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowUpload(false)}
                          className="px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={uploading}
                          type="submit"
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {uploading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Uploading...
                            </div>
                          ) : (
                            'Upload Notes'
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

        {/* Notes Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => {
              const downloadCount = note.downloads?.[0]?.count || 0;
              const isPopular = downloadCount > 50;
              const isNew = new Date(note.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

              return (
                <div
                  key={note.id}
                  className="group relative bg-gradient-to-b from-gray-900/80 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 hover:border-blue-500/30 hover:scale-[1.02] transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  {/* Popular/New Badges */}
                  {(isPopular || isNew) && (
                    <div className="absolute -top-3 -right-3 flex gap-1">
                      {isPopular && (
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                          🔥 Popular
                        </span>
                      )}
                      {isNew && (
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                          ✨ New
                        </span>
                      )}
                    </div>
                  )}

                  {/* File Type Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${getSubjectColor(note.subject)} rounded-xl`}>
                      <span className="text-2xl">{getFileIcon(note.file_type)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{downloadCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{note.views || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title and Subject */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {note.title}
                  </h3>

                  {note.subject && (
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 bg-gradient-to-r ${getSubjectColor(note.subject)}/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30`}>
                        {note.subject}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                    {note.description || "No description provided"}
                  </p>

                  {/* Uploader Info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                        {note.profiles?.avatar_url ? (
                          <img
                            src={note.profiles.avatar_url}
                            alt={note.profiles.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-blue-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{note.profiles?.full_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* File Size */}
                    {note.file_size && (
                      <span className="text-xs text-gray-500">
                        {(note.file_size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownload(note.id, note.file_url)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group"
                    >
                      <Download className="w-5 h-5 group-hover:animate-bounce" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => window.open(note.file_url, '_blank')}
                      className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Hover Gradient Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-6 border border-gray-800/50">
              <FileText className="w-16 h-16 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Notes Found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {search ? 'Try adjusting your search terms or filters' : 'Be the first to upload notes and help others learn!'}
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
            >
              Upload First Note
            </button>
          </div>
        )}

        {/* Empty State for Filters */}
        {search && filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">No matching notes</h4>
            <p className="text-gray-400">Try different search terms or clear your filters</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedFilter('all');
              }}
              className="mt-4 px-6 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Statistics Bar */}
        {filteredNotes.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-800/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h4 className="text-lg font-bold text-white mb-2">Notes Statistics</h4>
                <p className="text-gray-400 text-sm">
                  Showing {filteredNotes.length} of {notes.length} total notes
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <span className="text-gray-400">Your Notes: {stats.yourNotes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <span className="text-gray-400">Recent: {stats.recent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                  <span className="text-gray-400">Popular: {stats.popular}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}