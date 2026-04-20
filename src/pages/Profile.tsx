import React, { useEffect, useState } from 'react';
import { Upload, Lock, Mail, ShieldCheck, Ticket } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { changeEmail, changePassword, requestEmailVerification, requestPasswordChangeVerification, requestIdVerification, claimVoucher, updateProfilePicture, verifyPasswordChangeCode } from '../utils/api';
import { sendPasswordChangeVerificationEmail, generateVerificationCode, sendVerificationEmail } from '../utils/email';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'email' | 'picture' | 'discounts' | 'identity'>('profile');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    verificationCode: '',
  });
  
  const [emailData, setEmailData] = useState({
    newEmail: '',
    confirmEmail: '',
  });
  
  const [pictureUrl, setPictureUrl] = useState(user?.user_profile_picture || '');
  const [verificationMethod, setVerificationMethod] = useState<'code' | 'link'>('code');
  const [submitting, setSubmitting] = useState(false);
  const [passwordChangeStep, setPasswordChangeStep] = useState<'form' | 'verify'>('form');
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [voucherClaiming, setVoucherClaiming] = useState(false);
  const [idRequestLoading, setIdRequestLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'password', 'email', 'picture', 'discounts', 'identity'].includes(tab)) {
      setActiveTab(tab as typeof activeTab);
    }
  }, [searchParams]);

  const availableVouchers = [
    { code: 'WELCOME1000', amount: 1000, title: 'Welcome Voucher', description: 'A new account bonus you can apply to your first order.' },
    { code: 'LOYALTY500', amount: 500, title: 'Loyalty Discount', description: 'A repeat customer discount for your next purchase.' },
    { code: 'PHFLEET2000', amount: 2000, title: 'Fleet Savings', description: 'A larger voucher for big vehicle purchases.' },
  ];

  React.useEffect(() => {
    if (!user?.email) return;
    refreshUser();
  }, [user?.email, refreshUser]);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">Please sign in to view your profile.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await updateUser(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
    setIsEditing(false);
  };

  const handleSendVerification = async () => {
    const code = generateVerificationCode();
    const requestedAt = new Date().toISOString();
    setVerificationSending(true);

    console.log('[Profile.handleSendVerification] Starting email verification', {
      userId: user.id,
      userEmail: user.email,
      code,
      requestedAt,
      verificationMethod,
    });

    try {
      await requestEmailVerification(user.id, code, requestedAt);
      console.log('[Profile.handleSendVerification] Backend verification request stored');

      const verificationLink = verificationMethod === 'link'
        ? `${window.location.origin}/verify-email?code=${code}&email=${encodeURIComponent(user.email)}`
        : undefined;

      console.log('[Profile.handleSendVerification] About to send verification email', {
        toEmail: user.email,
        code,
        method: verificationMethod,
        verificationLink,
      });

      await sendVerificationEmail(user.email, code, verificationMethod, verificationLink);
      console.log('[Profile.handleSendVerification] Email sent successfully');
      toast.success('Verification message sent. Check your inbox.');
      setVerificationSent(true);
    } catch (error: any) {
      console.error('[Profile.handleSendVerification] Error:', {
        message: error?.message,
        error,
      });
      toast.error(error?.message || 'Failed to send verification email.');
      setVerificationSent(false);
    } finally {
      setVerificationSending(false);
    }
  };

  const handleClaimVoucher = async (code: string, amount: number) => {
    setVoucherClaiming(true);
    try {
      await claimVoucher(user.id, code, amount);
      await refreshUser();
      toast.success(`Voucher ${code} claimed! ₱${amount.toLocaleString()} added to your balance.`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to claim voucher');
    } finally {
      setVoucherClaiming(false);
    }
  };

  const handleIdVerificationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIdRequestLoading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      );

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      const imageUrl = data.secure_url;

      await requestIdVerification(user.id, imageUrl, new Date().toISOString());
      await refreshUser();
      toast.success('Identity verification request submitted. Admin will review your ID.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload ID for verification');
    } finally {
      setIdRequestLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChangeStep === 'form') {
      if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast.error('All password fields are required');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (passwordData.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }

      setSubmitting(true);
      try {
        const code = generateVerificationCode();
        const requestedAt = new Date().toISOString();
        await requestPasswordChangeVerification(user.id, code, requestedAt);
        await sendPasswordChangeVerificationEmail(user.email, code, 'code');
        setPasswordChangeStep('verify');
        toast.success('Verification code sent to your email');
      } catch (error: any) {
        toast.error(error?.message || 'Failed to send verification');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Verify code and change password
      if (!passwordData.verificationCode) {
        toast.error('Verification code is required');
        return;
      }

      setSubmitting(true);
      try {
        const isValid = await verifyPasswordChangeCode(user.id, passwordData.verificationCode);
        if (!isValid) {
          toast.error('Invalid verification code');
          return;
        }
        await changePassword(user.id, passwordData.oldPassword, passwordData.newPassword);
        toast.success('Password changed successfully');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '', verificationCode: '' });
        setPasswordChangeStep('form');
        setActiveTab('profile');
      } catch (error: any) {
        toast.error(error?.message || 'Failed to change password');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailData.newEmail || !emailData.confirmEmail) {
      toast.error('Email fields are required');
      return;
    }
    if (emailData.newEmail !== emailData.confirmEmail) {
      toast.error('Emails do not match');
      return;
    }

    setSubmitting(true);
    try {
      await changeEmail(user.id, emailData.newEmail);
      toast.success('Email changed successfully. Please log in again.');
      setEmailData({ newEmail: '', confirmEmail: '' });
      setActiveTab('profile');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to change email');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      );

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      const imageUrl = data.secure_url;

      await updateProfilePicture(user.id, imageUrl);
      await refreshUser();
      toast.success('Profile picture updated successfully');
      setPictureUrl(imageUrl);
      setActiveTab('profile');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload profile picture');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovePicture = async () => {
    setSubmitting(true);
    try {
      await updateProfilePicture(user.id, '');
      await refreshUser();
      setPictureUrl('');
      toast.success('Profile picture removed successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove profile picture');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Profile Dashboard</h1>

          {/* Tabs Navigation */}
          <div className="flex gap-2 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('picture')}
              className={`px-4 py-2 font-medium flex items-center gap-2 ${
                activeTab === 'picture'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload size={18} /> Picture
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-2 font-medium flex items-center gap-2 ${
                activeTab === 'password'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock size={18} /> Password
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-4 py-2 font-medium flex items-center gap-2 ${
                activeTab === 'email'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail size={18} /> Email
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`px-4 py-2 font-medium flex items-center gap-2 ${
                activeTab === 'discounts'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Ticket size={18} /> Discounts
            </button>
            <button
              onClick={() => setActiveTab('identity')}
              className={`px-4 py-2 font-medium flex items-center gap-2 ${
                activeTab === 'identity'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheck size={18} /> Verification
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="py-2 text-gray-900">{user.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2">
                      <p className="text-gray-900">{user.email}</p>
                      {user.emailVerified ? (
                        <p className="text-sm text-green-600 mt-1">✓ Email verified</p>
                      ) : (
                        <>
                          <p className="text-sm text-red-600 mt-1">✗ Email not verified</p>
                          <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                            <p className="text-sm text-yellow-900 mb-3">Verify your email to unlock full account access.</p>
                            <div className="space-y-2 mb-3">
                              <label className="text-sm font-medium text-gray-700">Verification preference</label>
                              <div className="flex gap-4">
                                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                  <input
                                    type="radio"
                                    name="profileVerificationMethod"
                                    value="code"
                                    checked={verificationMethod === 'code'}
                                    onChange={() => setVerificationMethod('code')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  Code
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                  <input
                                    type="radio"
                                    name="profileVerificationMethod"
                                    value="link"
                                    checked={verificationMethod === 'link'}
                                    onChange={() => {
                                      setVerificationMethod('link');
                                      setVerificationSent(false);
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  Link
                                </label>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleSendVerification}
                              disabled={verificationSending}
                              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                              {verificationSending ? 'Sending...' : 'Send verification'}
                            </button>
                            {verificationSent && !verificationSending && (
                              <p className="mt-3 text-sm text-green-700">Verification message sent. Please check your email.</p>
                            )}
                            <div className="mt-3 text-sm text-gray-600">
                              If you chose code verification, open the verification page to enter the code.
                            </div>
                            <button
                              type="button"
                              onClick={() => navigate(`/verify-email?email=${encodeURIComponent(user.email)}`)}
                              className="mt-3 w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
                            >
                              Verify received code
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="py-2 text-gray-900">{user.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home Address</label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <p className="py-2 text-gray-900">{user.address}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Edit Information
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Picture Tab */}
          {activeTab === 'picture' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile Picture</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center bg-gray-100 rounded-full h-64 w-64 mx-auto overflow-hidden">
                  {pictureUrl ? (
                    <img src={pictureUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-gray-500">
                      No picture
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600">This is your current profile picture. You can replace it or remove it entirely.</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureUpload}
                      disabled={submitting}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleRemovePicture}
                      disabled={!pictureUrl || submitting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Remove Picture
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Back to Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                {passwordChangeStep === 'form' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {submitting ? 'Sending...' : 'Send Verification Code'}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                      <input
                        type="text"
                        value={passwordData.verificationCode}
                        onChange={(e) => setPasswordData({ ...passwordData, verificationCode: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter code from email"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordChangeStep('form');
                          setPasswordData({ ...passwordData, verificationCode: '' });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        {submitting ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Change Email</h2>
              <form onSubmit={handleEmailChange} className="space-y-4 max-w-md">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                  Current email: <strong>{user.email}</strong>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
                  <input
                    type="email"
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Email</label>
                  <input
                    type="email"
                    value={emailData.confirmEmail}
                    onChange={(e) => setEmailData({ ...emailData, confirmEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {submitting ? 'Updating...' : 'Update Email'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'discounts' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Discounts & Vouchers</h2>
              <div className="grid gap-4 mb-6">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-800">Voucher balance</p>
                  <p className="text-3xl font-bold text-green-900">₱{Number(user.voucher_balance || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-2">Claim vouchers here and apply the balance when you place an order.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Claimable vouchers</p>
                  <div className="space-y-3">
                    {availableVouchers.map((voucher) => {
                      const claimed = (user.voucher_codes || '')
                        .split(',')
                        .map((code) => code.trim())
                        .filter(Boolean)
                        .includes(voucher.code);

                      return (
                        <div key={voucher.code} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-200 rounded-lg p-4">
                          <div>
                            <p className="text-base font-semibold text-gray-900">{voucher.title}</p>
                            <p className="text-sm text-gray-600">Code: <span className="font-medium">{voucher.code}</span></p>
                            <p className="text-sm text-gray-600 mt-1">{voucher.description}</p>
                            <p className="text-sm text-gray-700 mt-1">Amount: ₱{voucher.amount.toLocaleString()}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleClaimVoucher(voucher.code, voucher.amount)}
                            disabled={claimed || voucherClaiming}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${claimed ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition`}
                          >
                            {claimed ? 'Claimed' : 'Claim voucher'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">When a voucher is claimed, the voucher amount is added to your account balance. During checkout you can apply your voucher balance to reduce your order total.</p>
              </div>
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Identity Verification</h2>
              <div className="grid gap-4 mb-6">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-800">Current status</p>
                  <p className="text-lg font-semibold text-blue-900 mt-2">{user.id_verification_status || 'Not requested'}</p>
                  <p className="text-sm text-gray-600 mt-2">Upload a valid Philippine government-issued ID and our admin team will review it.</p>
                </div>
                {user.id_photo_url && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Uploaded ID preview</p>
                    <img src={user.id_photo_url} alt="Uploaded ID" className="w-full max-w-xs rounded-md border" />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Upload ID photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIdVerificationUpload}
                  disabled={idRequestLoading}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">Use a clear photo of a valid Philippine government-issued ID. The admin can approve or deny your verification request.</p>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                  After upload, your request will be sent to the admin. If the request is approved, your identity status will be updated here.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}