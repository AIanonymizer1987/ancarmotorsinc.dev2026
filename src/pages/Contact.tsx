import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BranchesCarousel from '../components/BranchesCarousel';
import { useAuth } from '../context/AuthContext';
import { addTicket, generateTicketId } from '../utils/api';
import { sendSupportTicketCopyEmail, sendDirectEmail } from '../utils/email';
import { toast } from 'react-toastify';

export default function Contact() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    nature_of_concern: searchParams.get('nature') || 'bug',
    title: searchParams.get('title') || '',
    body: '',
  });
  const [emailFormData, setEmailFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailFormData.name.trim() || !emailFormData.email.trim() || !emailFormData.subject.trim() || !emailFormData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setEmailSubmitting(true);
    try {
      await sendDirectEmail({
        fromName: emailFormData.name,
        fromEmail: emailFormData.email,
        subject: emailFormData.subject,
        message: emailFormData.message,
      });
      
      toast.success('Email sent successfully! We will get back to you soon.');
      setEmailFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
      console.error('Email submission error:', error);
    } finally {
      setEmailSubmitting(false);
    }
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
      const userEmail = user.user_email || user.email;
      const userName = user.name || user.user_name || 'Customer';

      if (!userEmail) {
        throw new Error('Unable to determine customer email for ticket confirmation.');
      }

      await addTicket({
        ticket_id: ticketId,
        user_id: user.id.toString(),
        username: userName,
        user_email: userEmail,
        nature_of_concern: formData.nature_of_concern,
        title: formData.title,
        body: formData.body,
        status: 'open',
      });

      try {
        await sendSupportTicketCopyEmail(userEmail, {
          ticket_id: ticketId,
          user_id: user.id.toString(),
          username: userName,
          user_email: userEmail,
          nature_of_concern: formData.nature_of_concern,
          title: formData.title,
          body: formData.body,
          status: 'open',
        }, {
          user_name: userName,
          user_email: userEmail,
        });
      } catch (emailError) {
        console.error('Failed to send support ticket copy email:', emailError);
        toast.warning('Ticket submitted, but we could not send the confirmation email.');
      }
      
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
        <section id="ticket-section" className="py-16 bg-gray-50 dark:bg-slate-950">
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

        {/* Direct Email Section */}
        <section id="direct-email" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left: Information */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Send Us a Direct Email
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Have a question or need to get in touch? Send us a direct email and we'll respond as quickly as possible.
                </p>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 font-bold">•</span>
                    <span><strong>Quick Response:</strong> Direct emails get immediate attention</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 font-bold">•</span>
                    <span><strong>Personal Communication:</strong> Perfect for detailed inquiries</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 font-bold">•</span>
                    <span><strong>No Account Required:</strong> Anyone can send us an email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 font-bold">•</span>
                    <span><strong>Secure & Private:</strong> Your information stays confidential</span>
                  </li>
                </ul>
              </div>

              {/* Right: Email Form */}
              <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="email_name"
                        value={emailFormData.name}
                        onChange={(e) => setEmailFormData({ ...emailFormData, name: e.target.value })}
                        placeholder="Your full name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="email_email" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email_email"
                        value={emailFormData.email}
                        onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email_subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="email_subject"
                      value={emailFormData.subject}
                      onChange={(e) => setEmailFormData({ ...emailFormData, subject: e.target.value })}
                      placeholder="What is this about?"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="email_message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="email_message"
                      value={emailFormData.message}
                      onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                      placeholder="Please provide details about your inquiry..."
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={emailSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    {emailSubmitting ? 'Sending...' : 'Send Email'}
                  </button>
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