import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance, setAuthToken } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Wrench } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = isLogin ? { email, password } : { email, password, name, role: 'technician' };
      
      const response = await axiosInstance.post(endpoint, data);
      setAuthToken(response.data.token);
      toast.success(isLogin ? 'Logged in successfully!' : 'Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 grid-texture flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-6 shadow-md">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-4xl text-slate-900 mb-3" data-testid="app-title">GearGuard</h1>
          <p className="font-body text-slate-600">The Ultimate Maintenance Tracker</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <h2 className="font-heading font-semibold text-2xl text-slate-900 mb-6" data-testid="auth-form-title">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider text-slate-700 mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="h-12"
                  data-testid="name-input"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-slate-700 mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
                data-testid="email-input"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-slate-700 mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
                data-testid="password-input"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-all active:scale-95"
              disabled={loading}
              data-testid="submit-button"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              data-testid="toggle-auth-mode"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}