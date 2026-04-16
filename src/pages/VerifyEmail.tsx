import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { verifyEmailCode } from '../utils/api';
import { toast } from 'react-toastify';

const VerifyEmail: React.FC = () => {
  const { refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const email = searchParams.get('email');
  const linkCode = searchParams.get('code');

  useEffect(() => {
    if (linkCode && email) {
      // Auto-verify if link clicked
      handleVerify(linkCode);
    }
  }, [linkCode, email]);

  const handleVerify = async (verificationCode: string) => {
    if (!email) {
      toast.error('Email not provided');
      return;
    }

    setSubmitting(true);
    try {
      const success = await verifyEmailCode(email, verificationCode);
      if (success) {
        toast.success('Email verified successfully!');
        if (refreshUser) {
          await refreshUser();
        }
        navigate('/profile');
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(code);
  };

  if (linkCode && email) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-md mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Verifying Email...</h1>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
            {submitting && <div className="mt-4">Verifying...</div>}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
          <p className="text-gray-600 mb-6">Enter the verification code sent to your email.</p>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                id="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter code"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;