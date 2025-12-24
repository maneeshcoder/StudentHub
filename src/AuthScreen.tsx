import { useState, useEffect } from 'react';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Auth/SignIn';
import { 
  Brain, 
  Zap,
  Shield, 
  Globe, 
  Target, 
  TrendingUp 
} from 'lucide-react';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

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
                    Experience education like never before with AI-powered tools, collaborative spaces, and immersive resources.
                  </p>
                </div>
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
