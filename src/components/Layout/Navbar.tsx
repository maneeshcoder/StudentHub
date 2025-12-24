import { 
  Home as HomeIcon, 
  BookOpen, 
  Users, 
  School, 
  UsersRound, 
  MessageSquare, 
  LogOut, 
  ChevronDown, 
  User, 
  Settings,
  Bell,
  Search,
  Sparkles,
  Zap,
  Globe,
  Award,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New message', desc: 'You have a new team invite', time: '2 min ago', unread: true },
    { id: 2, title: 'Assignment due', desc: 'Math assignment due tomorrow', time: '1 hour ago', unread: true },
    { id: 3, title: 'New resource', desc: 'AI study notes uploaded', time: '3 hours ago', unread: false },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon, color: 'from-blue-500 to-cyan-400', glow: 'shadow-blue-500/30' },
    { id: 'notes', label: 'Notes', icon: BookOpen, color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/30' },
    { id: 'events', label: 'Events', icon: School, color: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/30' },
    { id: 'team-finder', label: 'Team Finder', icon: UsersRound, color: 'from-red-500 to-rose-500', glow: 'shadow-red-500/30' },
    { id: 'anonymous', label: 'Anonymous', icon: MessageSquare, color: 'from-indigo-500 to-blue-500', glow: 'shadow-indigo-500/30' },
    { id: 'profile', label: 'Profile', icon: Users, color: 'from-orange-500 to-amber-500', glow: 'shadow-orange-500/30' },
  ];

  const handleSignOut = () => {
    // Add confirmation animation
    const button = document.querySelector('.sign-out-btn');
    button?.classList.add('scale-90');
    setTimeout(() => {
      signOut();
    }, 300);
  };

  const clearAllNotifications = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  return (
    <nav className={` top-0 z-50 transition-all  duration-500 ${
      scrolled 
        ? 'bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 border-b border-gray-800/50'
        : 'bg-transparent'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -top-10 -right-20 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        )}
      </div>

      <div className="relative  w-full mx-auto px-2 sm:px-6">
        <div className="flex justify-between items-center h-20">
          {/* Left Section - Logo and Desktop Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-4 hover:opacity-90 transition-all duration-300 group relative"
            >
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
                <div className="relative p-2.5 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800/50 shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
                    <Zap className="w-6 h-6 text-white animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">EduSphere</h1>
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-spin-slow" />
                </div>
                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full border border-gray-700/50">
                  AI-Powered Learning
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-3 px-5 py-3 rounded-xl transition-all duration-500 group ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg ${tab.glow} transform scale-105`
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                    }`}
                  >
                    {/* Hover background effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    {/* Icon with gradient effect */}
                    <div className={`relative z-10 p-2 rounded-lg ${
                      activeTab === tab.id 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-br ${tab.color} opacity-60 group-hover:opacity-100`
                    } transition-all duration-300`}>
                      <Icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-gray-300 group-hover:text-white'} />
                    </div>
                    
                    <span className="relative z-10 font-semibold text-sm">{tab.label}</span>
                    
                    {/* Active indicator */}
                    {activeTab === tab.id && (
                      <>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-t-full"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-xl blur-md"></div>
                      </>
                    )}
                    
                    {/* Hover effect line */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-300 group-hover:w-16 transition-all duration-300"></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section - Search, Actions, Profile */}
          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            {/* <div className="hidden md:block relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 group-hover:border-blue-500/30 transition-all duration-300">
                <Search className="w-4 h-4 text-gray-500 ml-4" />
                <input
                  type="text"
                  placeholder="Search notes, colleges, people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-3 bg-transparent text-sm text-gray-300 placeholder-gray-500 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="pr-3 text-gray-500 hover:text-gray-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div> */}

            {/* Theme Toggle */}
            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-purple-500/30 hover:bg-gray-800/60 transition-all duration-300 group"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
              )}
            </button> */}

            {/* Notifications */}
            <div className="relative">
              {/* <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-3 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-blue-500/30 hover:bg-gray-800/60 transition-all duration-300 group"
              >
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-xs font-bold text-white">
                        {notifications.filter(n => n.unread).length}
                      </span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </button> */}

              {/* Notifications Dropdown */}
              {/* {showNotifications && (
                <>
                  <div className="absolute right-0 mt-2 w-96 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 py-3 z-50 animate-in slide-in-from-top-5">
                    <div className="px-4 py-3 border-b border-gray-700/50 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-5 h-5 text-blue-400" />
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        {notifications.filter(n => n.unread).length > 0 && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            {notifications.filter(n => n.unread).length} new
                          </span>
                        )}
                      </div>
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        Mark all read
                      </button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                              notification.unread ? 'bg-blue-500/5' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${notification.unread ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`} />
                                  <p className="text-sm font-semibold text-white">{notification.title}</p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{notification.desc}</p>
                              </div>
                              <span className="text-xs text-gray-500">{notification.time}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">No notifications</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="px-4 py-3 border-t border-gray-700/50">
                      <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        View all notifications →
                      </button>
                    </div>
                  </div>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                </>
              )} */}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-3 p-1.5 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 group relative"
              >
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5">
                    <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-lg">
                          <User className="w-6 h-6 text-blue-300" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full border-2 border-gray-900 flex items-center justify-center shadow-lg">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-left hidden xl:block">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-bold text-white truncate max-w-[120px]">{profile?.full_name || 'Student'}</p>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </div>
                  <p className="text-xs text-gray-400 truncate max-w-[120px]">{profile?.college_name || 'University Student'}</p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div className="absolute right-0 mt-2 w-72 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 py-3 z-50 animate-in slide-in-from-top-5">
                    {/* Profile Header */}
                    <div className="px-4 py-4 border-b border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5">
                            <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center">
                              {profile?.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.full_name}
                                  className="w-full h-full rounded-xl object-cover"
                                />
                              ) : (
                                <User className="w-8 h-8 text-blue-300" />
                              )}
                            </div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <Award className="w-3 h-3 text-gray-900" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{profile?.full_name || 'Student'}</p>
                          <p className="text-xs text-gray-400">{profile?.college_name || 'University Student'}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">Pro Student</span>
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-gray-700/50">
                      {[
                        { label: 'Notes', value: '5', color: 'text-blue-400' },
                        { label: 'Teams', value: '2', color: 'text-green-400' },
                        { label: 'Level', value: '1', color: 'text-amber-400' },
                      ].map((stat, index) => (
                        <div key={index} className="text-center">
                          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-xs text-gray-400">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      {[
                        { icon: User, label: 'My Profile', color: 'text-blue-400' },
                        { icon: Settings, label: 'Settings', color: 'text-purple-400' },
                      ].map((item, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200 group"
                        >
                          <div className={`p-2 rounded-lg bg-gray-800/50 ${item.color.replace('text-', 'bg-')}/10 group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon size={16} className={item.color} />
                          </div>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Sign Out */}
                    <div className="border-t border-gray-700/50 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 sign-out-btn"
                      >
                        <div className="p-2 rounded-lg bg-red-500/10">
                          <LogOut size={16} />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-blue-500/30 hover:bg-gray-800/60 transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 mt-2 mb-4 animate-in slide-in-from-top-5">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur"></div>
              <div className="relative flex items-center bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                <Search className="w-4 h-4 text-gray-500 ml-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent text-sm text-gray-300 placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg ${tab.glow}`
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800/70'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      activeTab === tab.id 
                        ? 'bg-white/20' 
                        : 'bg-gray-700/50'
                    }`}>
                      <Icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-gray-400'} />
                    </div>
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Quick Actions */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { icon: User, label: 'Profile' },
                { icon: Settings, label: 'Settings' },
                { icon: Bell, label: 'Alerts' },
                { icon: Globe, label: 'Global' },
              ].map((action, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-gray-700/50 mb-2">
                    <action.icon size={18} className="text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-3 p-4 mt-4 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 rounded-xl hover:from-red-600/30 hover:to-red-700/30 transition-all duration-300"
            >
              <LogOut size={20} />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Add to your global CSS */}
      <style jsx>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-in {
          animation: slideInFromTop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </nav>
  );
}