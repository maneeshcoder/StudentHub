import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  MessageSquare,
  Shield,
  Lock,
  Users,
  Sparkles,
  Zap,
  BookOpen,
  GraduationCap,
  Brain,
  Rocket,
  Coffee,
  Copyright
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 border-t border-gray-800/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Top Section - Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 rounded-2xl blur-xl opacity-20"></div>
                <div className="relative p-3 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800/50 shadow-2xl">
                  <Brain className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                  EduSphere
                </h2>
                <p className="text-sm text-gray-400">The Future of Learning</p>
              </div>
            </div>
            
            <p className="text-gray-400 mb-6 max-w-md">
              Revolutionizing education with different resources, collaborative students, 
              and personalized networking experiences for students worldwide.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4 text-blue-400" />
                <span>10+ Active Users</span>
              </div>
              
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Platform</h3>
            <ul className="space-y-3">
              {[
                { name: 'Smart Notes', icon: BookOpen },
                { name: 'College Network', icon: GraduationCap },
                { name: 'Team Finder', icon: Users },
                { name: 'Communities', icon: MessageSquare },
                { name: 'Events Hub', icon: Calendar },
                { name: 'Anonymous Chat', icon: Lock },
              ].map((item, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
                  >
                    <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {[
                'Study Guides',
                'Career Center',
                'Research Papers',
                'Scholarships',
                'Internships',
                'Blog & Articles',
                'FAQs',
                'Help Center',
              ].map((item, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-cyan-400 transition-colors hover:translate-x-1 inline-block duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a href="mailto:support@edusphere.com" className="text-white hover:text-blue-400 transition-colors">
                    support@edusphere.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                  <Phone className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <a href="tel:+11234567890" className="text-white hover:text-green-400 transition-colors">
                    +1 (123) 456-7890
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                  <MapPin className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-white">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-8"></div>

        {/* Middle Section - Social & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-6 max-w-lg">
              Subscribe to our newsletter for the latest updates on features, events, and educational resources.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Connect With Us</h3>
            <p className="text-gray-400 mb-6">Follow us on social media for updates and community discussions.</p>
            
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Facebook, label: 'Facebook', color: 'from-blue-600 to-blue-700' },
                { icon: Twitter, label: 'Twitter', color: 'from-cyan-500 to-blue-500' },
                { icon: Instagram, label: 'Instagram', color: 'from-pink-500 to-rose-500' },
                { icon: Linkedin, label: 'LinkedIn', color: 'from-blue-700 to-blue-800' },
                { icon: Github, label: 'GitHub', color: 'from-gray-700 to-gray-900' },
                { icon: Youtube, label: 'YouTube', color: 'from-red-500 to-red-600' },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className={`group relative p-3 bg-gradient-to-br ${social.color} rounded-xl hover:scale-110 transition-all duration-300`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-white" />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {social.label}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-8"></div>

        {/* Bottom Section - Copyright & Links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-gray-400">
            <Copyright className="w-4 h-4" />
            <span>{currentYear} EduSphere. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>Made with passion for education</span>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap gap-6">
            {[
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Code of Conduct',
              'Accessibility',
              'Sitemap'
            ].map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* App Download Banner */}
        {/* <div className="mt-12 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-3xl border border-gray-800/50 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                <Phone className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Download Our App</h3>
                <p className="text-gray-400">Take EduSphere with you everywhere</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button className="flex items-center gap-3 px-6 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 transition-colors group">
                <div className="p-2 bg-black rounded-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.8 1.01.03 2.06.39 2.99 1.09-1.25.77-1.95 1.97-2.15 3.38-.22 1.56.34 3.12 1.45 4.15-.9 1.23-2.04 2.31-3.14 3.35zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="text-white font-bold">App Store</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 px-6 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 transition-colors group">
                <div className="p-2 bg-black rounded-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.25.92-.59 1.19l-2.21 1.55L17 12l2.15-2.15 2.21 1.55M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Get it on</div>
                  <div className="text-white font-bold">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div> */}

        {/* Back to Top */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700/50 text-gray-300 rounded-xl hover:text-white hover:border-blue-500/30 transition-all duration-300 group"
          >
            <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Back to Top</span>
          </button>
        </div>

        {/* Educational Partners */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <h3 className="text-center text-gray-400 mb-6">Trusted by Educational Institutions Worldwide</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['University', 'College', 'Institute', 'Academy', 'School', 'Campus', 'Learning'].map((word, index) => (
              <div key={index} className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gray-500" />
                <span className="text-gray-500">{word}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-t border-gray-800/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>English (US)</span>
              </div>
              <span>•</span>
              <span>Version 2.1.0</span>
            </div>
            
            {/* <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                <span>Powered by AI</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                <span>Made possible by coffee</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Missing Icon Component */}
      <style jsx>{`
        .Calendar {
          display: inline-block;
          width: 1em;
          height: 1em;
          stroke-width: 0;
          stroke: currentColor;
          fill: currentColor;
        }
      `}</style>
    </footer>
  );
}

// Missing Calendar Icon Component
function Calendar(props: any) {
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}