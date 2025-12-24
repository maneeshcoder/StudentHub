import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Users,
  Search,
  MessageSquare,
  Award,
  Sparkles,
  Cpu,
  Rocket,
  TrendingUp,
  Brain,
} from "lucide-react";
import Navbar from "../Layout/Navbar";
import AuthScreen from "../../AuthScreen";
import { useAuth } from "../../contexts/AuthContext";
import Dashboard from "../Dashboard/Profile";

export default function Home({ user }: { user: any }) {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-800 border-t-purple-500 rounded-full animate-spin reverse"></div>
          </div>
          <div className="text-center mt-4">
            <p className="text-xl text-gray-300 font-semibold">Loading EduSphere</p>
            <p className="text-gray-500 text-sm mt-2">Preparing your experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const featureCards = [
    {
      icon: BookOpen,
      title: 'Smart Notes',
      description: 'AI-powered note taking with automatic summarization',
      gradient: 'from-blue-500 to-cyan-500',
      stats: '10K+ Notes'
    },
    {
      icon: GraduationCap,
      title: 'College Hub',
      description: 'Comprehensive college database with rankings',
      gradient: 'from-purple-500 to-pink-500',
      stats: '500+ Colleges'
    },
    {
      icon: Users,
      title: 'Communities',
      description: 'Join subject-specific learning communities',
      gradient: 'from-green-500 to-emerald-500',
      stats: '50+ Communities'
    },
    {
      icon: Search,
      title: 'Team Finder',
      description: 'Find study partners and project teams',
      gradient: 'from-orange-500 to-red-500',
      stats: '2K+ Teams'
    },
    {
      icon: MessageSquare,
      title: 'Anonymous',
      description: 'Share thoughts and questions anonymously',
      gradient: 'from-indigo-500 to-blue-500',
      stats: '100% Private'
    },
    {
      icon: Award,
      title: 'Achievements',
      description: 'Track your learning milestones',
      gradient: 'from-yellow-500 to-orange-500',
      stats: '50+ Badges'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <Navbar />
      <AppRoutes user={user} />

      {/* Removed activeTab conditional */}
        <div className="relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          {/* Hero Section */}
          <div className="relative pt-24 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* Left Side - Text Content */}
                <div className="lg:w-1/2 space-y-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700 mb-6">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">Welcome back, {user.displayName || 'Student'}!</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                      <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Unlock Your
                      </span>
                      <br />
                      <span className="text-white">Learning Journey</span>
                    </h1>
                    <p className="text-xl text-gray-300 mt-6 max-w-2xl">
                      Dive into an immersive educational experience with cutting-edge tools,
                      collaborative communities, and personalized learning paths.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-2xl">
                      Explore Features
                    </button>
                    <button className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm rounded-xl font-semibold text-lg border border-gray-700 hover:bg-gray-800 transition-all duration-300">
                      View Dashboard
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                    {[
                      { value: '10K+', label: 'Active Learners' },
                      { value: '500+', label: 'Resources' },
                      { value: '24/7', label: 'Support' },
                      { value: '99%', label: 'Satisfaction' },
                    ].map((stat, index) => (
                      <div key={index} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side - Video/Image Section */}
                <div className="lg:w-1/2">
                  <div className="relative group">
                    {/* Main Video Container */}
                    <div className="relative rounded-3xl overflow-hidden transform perspective-1000 group-hover:rotate-x-2 transition-transform duration-500">
                      <div className="aspect-video bg-gradient-to-br from-gray-800 to-black">
                        {/* Replace with actual video or animated content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="relative">
                              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl animate-pulse">
                                <div className="absolute inset-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl animate-spin-slow">
                                  <Cpu className="w-full h-full p-6 text-white" />
                                </div>
                              </div>
                            </div>
                            <p className="text-xl font-semibold mt-6 text-gray-300">
                              Interactive Learning Hub
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
                    </div>

                    {/* Floating Cards */}
                    <div className="absolute -bottom-6 left-1/4 transform -translate-x-1/2">
                      <div className="p-4 bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <Rocket className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Live Now</p>
                            <p className="text-xs text-gray-400">AI Study Assistant</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute -top-6 right-1/4 transform translate-x-1/2">
                      <div className="p-4 bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">24 Online</p>
                            <p className="text-xs text-gray-400">In Your Community</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Section Below Video */}
                  <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: 'Smart Analytics',
                        desc: 'Track your progress with detailed insights',
                        icon: TrendingUp,
                        color: 'from-blue-500 to-cyan-500'
                      },
                      {
                        title: 'Collaborative Tools',
                        desc: 'Real-time collaboration features',
                        icon: Users,
                        color: 'from-green-500 to-emerald-500'
                      },
                      {
                        title: 'AI Integration',
                        desc: 'Powered by advanced AI algorithms',
                        icon: Brain,
                        color: 'from-purple-500 to-pink-500'
                      },
                    ].map((detail, index) => (
                      <div key={index} className="p-6 bg-gray-800/30 rounded-xl border border-gray-700 hover:bg-gray-800/50 transition-all duration-300 group">
                        <div className={`p-3 ${detail.color} rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <detail.icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">{detail.title}</h4>
                        <p className="text-sm text-gray-400">{detail.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Powerful Features
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Everything you need to excel in your educational journey, all in one platform
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featureCards.map((feature, index) => (
                  <div
                    key={index}
                    className="relative group"
                    style={{ transform: `translateY(${scrollY * 0.02}px)` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-3xl transform group-hover:scale-105 transition-all duration-500" />
                    <div className="relative p-8 bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700 group-hover:border-blue-500/50 transition-all duration-500 h-full">
                      <div className={`p-4 ${feature.gradient} rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-gray-400 mb-6">{feature.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{feature.stats}</span>
                        <button
                          onClick={() => navigate(`/${feature.title.toLowerCase().replace(' ', '-').split(' ')[0]}`)}
                          className="px-4 py-2 bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors duration-300"
                        >
                          Explore →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10" />
                <div className="relative p-12 text-center">
                  <h3 className="text-4xl font-bold mb-6">
                    Ready to Transform Your Learning Experience?
                  </h3>
                  <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                    Join thousands of students who are already achieving their academic goals with EduSphere
                  </p>
                  <button className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold text-lg transform hover:scale-105 transition-all duration-300 shadow-2xl">
                    Start Your Journey Now
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
    </div>
  );
};