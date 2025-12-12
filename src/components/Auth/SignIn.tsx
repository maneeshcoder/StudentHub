import { useState } from 'react';
import { Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SignInProps {
  onToggle: () => void;
}

export default function SignIn({ onToggle }: SignInProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center space-x-3 mb-10 animate-fade-in">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
          <HomeIcon size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">StudentHub</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl px-8 pt-8 pb-8 backdrop-blur-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 text-sm mb-8">Sign in to your account</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-3">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 text-sm font-semibold mb-3">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <p className="mt-4 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}
