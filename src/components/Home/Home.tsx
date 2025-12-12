import { BookOpen, School, Users, UsersRound, MessageSquare, Home as HomeIcon } from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const sections = [
    {
      id: 'notes',
      icon: BookOpen,
      title: 'Notes',
      description: 'Upload, share, and discover study notes from your college',
      color: 'from-blue-500 to-blue-600',
      accentBg: 'bg-blue-50',
      accentText: 'text-blue-600',
    },
    {
      id: 'colleges',
      icon: School,
      title: 'Colleges',
      description: 'Connect with students from different colleges',
      color: 'from-green-500 to-green-600',
      accentBg: 'bg-green-50',
      accentText: 'text-green-600',
    },
    {
      id: 'communities',
      icon: Users,
      title: 'Communities',
      description: 'Join or create communities based on interests',
      color: 'from-purple-500 to-purple-600',
      accentBg: 'bg-purple-50',
      accentText: 'text-purple-600',
    },
    {
      id: 'team-finder',
      icon: UsersRound,
      title: 'Team Finder',
      description: 'Find teammates for your projects and collaborations',
      color: 'from-orange-500 to-orange-600',
      accentBg: 'bg-orange-50',
      accentText: 'text-orange-600',
    },
    {
      id: 'anonymous',
      icon: MessageSquare,
      title: 'Anonymous',
      description: 'Share thoughts and discuss topics anonymously',
      color: 'from-pink-500 to-pink-600',
      accentBg: 'bg-pink-50',
      accentText: 'text-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-xl">
              <HomeIcon size={32} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">StudentHub</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect, collaborate, and grow with your academic community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className="group h-full"
              >
                <div className={`${section.accentBg} rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl hover:scale-105 transform`}>
                  <div className={`bg-gradient-to-br ${section.color} p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{section.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-blue-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>Complete your profile with skills and interests</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>Explore notes and colleges in your community</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>Join communities and find teammates</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>Connect with other students and collaborate</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-green-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>Share and discover academic resources</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>Real-time messaging with other students</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>Anonymous discussions for open conversations</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>Build your professional network</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
