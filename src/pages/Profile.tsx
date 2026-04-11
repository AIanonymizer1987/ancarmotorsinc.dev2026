import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Profile Dashboard</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{user.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Home Address</label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{user.address}</p>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-gray-600">Your recent orders and activities will appear here.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}