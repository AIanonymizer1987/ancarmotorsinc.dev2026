import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { requestEmailVerification } from '../utils/api';
import { sendVerificationEmail, generateVerificationCode } from '../utils/email';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreeToPolicies, setAgreeToPolicies] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'code' | 'link'>('code');
  const [submitting, setSubmitting] = useState(false);

  const validatePassword = (password: string) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/]/.test(password);
    const minLength = password.length >= 8;
    return hasUpper && hasLower && hasNumber && hasSymbol && minLength;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      toast.error('Password must be at least 8 characters with uppercase, lowercase, number, and symbol.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!agreeToPolicies) {
      toast.error('Please agree to our privacy policy.');
      return;
    }
    if (!agreeToTerms) {
      toast.error('Please agree to our terms and conditions.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(name.trim(), email.trim(), password, phone.trim(), address.trim());
      
      // Request email verification
      const code = generateVerificationCode();
      const requestedAt = new Date().toISOString();
      await requestEmailVerification(user.id, code, requestedAt);
      
      // Send verification email
      const verificationLink = verificationMethod === 'link' ? `${window.location.origin}/verify-email?code=${code}&email=${encodeURIComponent(email)}` : undefined;
      await sendVerificationEmail(email, code, verificationMethod, verificationLink);
      
      toast.success('Account created successfully! Please check your email for verification instructions.');
      navigate('/verify-email');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to register.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Create your account</h1>
          <p className="text-gray-600 mb-6">Register to save favorites, request info, and schedule test drives.</p>

          <form onSubmit={onSubmit} aria-label="Registration form" className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
                aria-required="true"
              />
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Your phone number"
                aria-required="true"
              />
            </div>

             <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                id="address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Your address"
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
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
                aria-required="true"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Repeat your password"
                aria-required="true"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-start">
                <input
                  id="agreeToPolicies"
                  type="checkbox"
                  checked={agreeToPolicies}
                  onChange={(e) => setAgreeToPolicies(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  required
                />
                <label htmlFor="agreeToPolicies" className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="/policies" target="_blank" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  required
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    Terms and Conditions
                  </a>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Verification Method</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="code"
                    type="radio"
                    name="verification"
                    value="code"
                    checked={verificationMethod === 'code'}
                    onChange={(e) => setVerificationMethod(e.target.value as 'code' | 'link')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="code" className="ml-2 text-sm text-gray-700">
                    Send verification code via email
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="link"
                    type="radio"
                    name="verification"
                    value="link"
                    checked={verificationMethod === 'link'}
                    onChange={(e) => setVerificationMethod(e.target.value as 'code' | 'link')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="link" className="ml-2 text-sm text-gray-700">
                    Send verification link via email
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;