import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BranchesCarousel from '../components/BranchesCarousel';
import { useAuth } from '../context/AuthContext';
import { addTicket, generateTicketId } from '../utils/api';
import { toast } from 'react-toastify';

export default function Contact() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nature_of_concern: 'bug',
    title: '',
    body: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to submit a ticket');
      return;
    }

    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const ticketId = generateTicketId();
      await addTicket({
        ticket_id: ticketId,
        user_id: user.id.toString(),
        username: user.name,
        user_email: user.user_email,
        nature_of_concern: formData.nature_of_concern,
        title: formData.title,
        body: formData.body,
        status: 'open',
      });
      
      toast.success(`Ticket #${ticketId} submitted successfully! We will review it shortly.`);
      setFormData({
        nature_of_concern: 'bug',
        title: '',
        body: '',
      });
    } catch (error) {
      toast.error('Failed to submit ticket. Please try again.');
      console.error('Ticket submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main>
        <BranchesCarousel />
        
        {/* Ticket Section */}
        <section className="py-16 bg-gray-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left: Information */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Place a Support Ticket
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Having an issue with our website or services? Let us know! Submit a support ticket and our team will get back to you as soon as possible.
                </p>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 font-bold">•</span>
                    <span><strong>Bug Report:</strong> Report technical issues or glitches</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 font-bold">•</span>
                    <span><strong>Feature Request:</strong> Suggest new features or improvements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 font-bold">•</span>
                    <span><strong>General Inquiry:</strong> Ask general questions about our services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 font-bold">•</span>
                    <span><strong>Account Issue:</strong> Report problems with your account</span>
                  </li>
                </ul>
              </div>

              {/* Right: Form */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="nature_of_concern" className="block text-sm font-medium text-gray-700 mb-2">
                      Nature of Concern
                    </label>
                    <select
                      id="nature_of_concern"
                      name="nature_of_concern"
                      value={formData.nature_of_concern}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="inquiry">General Inquiry</option>
                      <option value="account">Account Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title of Concern
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Briefly describe your concern"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                      Body of Concern
                    </label>
                    <textarea
                      id="body"
                      name="body"
                      value={formData.body}
                      onChange={handleChange}
                      placeholder="Please provide details about your concern..."
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !user}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>

                  {!user && (
                    <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded">
                      You must be signed in to submit a ticket.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}