import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Auth/SignIn';
import Navbar from './components/Layout/Navbar';
import Home from './components/Home/Home';
import { Toaster } from "sonner";
import Notes from './components/Notes/Notes';
import Colleges from './components/Colleges/Events';
import Communities from './components/Communities/Profile';
import TeamFinder from './components/TeamFinder/TeamFinder';
import Anonymous from './components/Anonymous/Anonymous';
import { 
  Sparkles, 
  Users, 
  BookOpen, 
  GraduationCap, 
  MessageSquare, 
  Search,
  Globe,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Award,
  Brain,
  Cpu,
  Rocket
} from 'lucide-react';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Events from './components/Colleges/Events';
import Profile from './components/Communities/Profile';

function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particlesArray = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2,
    }));
    setParticles(particlesArray);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden relative">
      {/* Animated Background Particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-500/20 animate-pulse"
          style={{
            left: `${particle.x}vw`,
            top: `${particle.y}vh`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.speed}s`,
          }}
        />
      ))}

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Side - Branding */}
          <div className="md:w-1/2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl transform rotate-12 shadow-2xl">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  EduSphere
                </h1>
                <p className="text-gray-300 text-lg mt-2">Next-Gen Learning Platform</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <div className="p-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Revolutionary Learning</h3>
                  </div>
                  <p className="text-gray-300">
                    Experience education like never before with collaborative spaces, immersive resources and rich features.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, text: 'Secure & Private', color: 'from-green-500 to-emerald-600' },
                  { icon: Globe, text: 'Global Network', color: 'from-blue-500 to-cyan-600' },
                  { icon: Target, text: 'Goal Oriented', color: 'from-purple-500 to-pink-600' },
                  { icon: TrendingUp, text: 'Growth Focused', color: 'from-orange-500 to-red-600' },
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-gray-800/40 rounded-xl border border-gray-700">
                    <div className={`p-2 ${item.color} rounded-lg w-fit mb-2`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm text-gray-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="md:w-1/2 max-w-md">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isSignUp ? 'Join EduSphere' : 'Welcome Back'}
                </h2>
                <p className="text-gray-400">
                  {isSignUp ? 'Start your journey today' : 'Continue your learning journey'}
                </p>
              </div>
              
              {isSignUp ? (
                <SignUp onToggle={() => setIsSignUp(false)} />
              ) : (
                <SignIn onToggle={() => setIsSignUp(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
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
      title: 'Notes',
      description: 'Get notes from different students worldwide',
      gradient: 'from-blue-500 to-cyan-500',
      stats: '10+ Notes'
    },
    {
      icon: GraduationCap,
      title: 'Events',
      description: 'Get to know about latest events in different colleges',
      gradient: 'from-purple-500 to-pink-500',
      stats: '5+ Colleges'
    },
    
    {
      icon: Search,
      title: 'Team Finder',
      description: 'Find study partners and project teams',
      gradient: 'from-orange-500 to-red-500',
      stats: '20+ Teams'
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
      title: 'Profile',
      description: 'Create your profile',
      gradient: 'from-yellow-500 to-orange-500',
      stats: '10+ Profiles'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'home' && (
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
                      <span className="text-white">Campus Journey</span>
                    </h1>
                    <p className="text-xl text-gray-300 mt-6 max-w-2xl">
                      Dive into a connected campus experience with student communities, shared resources, and seamless collaboration.
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
                      { value: '10+', label: 'Active Learners' },
                      { value: '10+', label: 'Resources' },
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
                            <p className="text-xs text-gray-400">Anonymous Zone</p>
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
                            <p className="font-semibold text-sm">Your Campus</p>
                            <p className="text-xs text-gray-400">Network</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Section Below Video */}
                  <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: 'Student Communities',
                        desc: 'Join clubs, societies, and interest-based groups',
                        icon: Target,
                        color: 'from-blue-500 to-cyan-500'
                      },
                      {
                        title: 'Team Finder',
                        desc: 'Find teammates for projects, hackathons, and events',
                        icon: Users,
                        color: 'from-green-500 to-emerald-500'
                      },
                      {
                        title: 'Notes & Resources',
                        desc: 'Access and share study material with peers',
                        icon: BookOpen,
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
                          onClick={() => setActiveTab(feature.title.toLowerCase().replace(' ', '-').split(' ')[0])}
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

          <Testimonials/>
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
      )}

      {/* Other Pages */}
      {activeTab !== 'home' && (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            {/* <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-gray-400">
                Explore all features and tools in the {activeTab.replace('-', ' ')} section
              </p>
            </div> */}
            
            {activeTab === 'notes' && <Notes />}
            {activeTab === 'events' && <Events/>}
            {activeTab === 'profile' && <Profile />}
            {activeTab === 'team-finder' && <TeamFinder />}
            {activeTab === 'anonymous' && <Anonymous />}
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin.reverse {
          animation: spin-reverse 1s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-x-2 {
          transform: rotateX(2deg);
        }
      `}</style>
      <Toaster richColors position="top-right" />
      <MainApp />
    </AuthProvider>
  );
}

export default App;