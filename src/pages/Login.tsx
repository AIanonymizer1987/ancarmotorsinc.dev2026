import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCapsActive = e.getModifierState('CapsLock');
    setIsCapsLockOn(isCapsActive);
  };

  const handlePasswordBlur = () => {
    setIsCapsLockOn(false);
  };

  const validatePasswordInput = (): string | null => {
    if (!password.trim()) {
      return 'Password field is empty';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const passwordError = validatePasswordInput();
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('Successfully signed in.');
      navigate('/');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to sign in.';
      
      // Provide specific error messages based on error type
      if (errorMessage.toLowerCase().includes('password')) {
        toast.error('Incorrect password. Please try again.');
      } else if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('user')) {
        toast.error('Email not found. Please check your email or register.');
      } else if (errorMessage.toLowerCase().includes('verify')) {
        toast.error('Please verify your email before signing in.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Sign in to your account</h1>
          <p className="text-gray-600 mb-6">Use your email and password to access your account.</p>

          <form onSubmit={onSubmit} aria-label="Login form" className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                aria-required="true"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handlePasswordKeyDown}
                onKeyUp={handlePasswordKeyDown}
                onBlur={handlePasswordBlur}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                aria-required="true"
              />
              {isCapsLockOn && (
                <p className="text-sm text-orange-600 mt-1 flex items-center">
                  <span>⚠️ Caps Lock is on</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <Link to="/register" className="text-blue-600 hover:underline">Create an account</Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                disabled={submitting}
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;