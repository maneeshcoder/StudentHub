import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Auth/SignIn';
import Navbar from './components/Layout/Navbar';
import Home from './components/Home/Home';
import Notes from './components/Notes/Notes';
import Colleges from './components/Colleges/Colleges';
import Communities from './components/Communities/Communities';
import TeamFinder from './components/TeamFinder/TeamFinder';
import Anonymous from './components/Anonymous/Anonymous';

function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {isSignUp ? (
        <SignUp onToggle={() => setIsSignUp(false)} />
      ) : (
        <SignIn onToggle={() => setIsSignUp(true)} />
      )}
    </div>
  );
}

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
        {activeTab === 'notes' && <Notes />}
        {activeTab === 'colleges' && <Colleges />}
        {activeTab === 'communities' && <Communities />}
        {activeTab === 'team-finder' && <TeamFinder />}
        {activeTab === 'anonymous' && <Anonymous />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
