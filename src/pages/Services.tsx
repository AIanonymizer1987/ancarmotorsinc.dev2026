import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { addOrder } from '../data/orders';
import { toast } from 'react-toastify';

export default function Services() {
  const { user } = useAuth();
  const [orderForm, setOrderForm] = useState({
    make: '',
    model: '',
    year: '',
    fuelType: '',
    color: '',
    transmission: '',
    additionalSpecs: '',
    budget: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to place an order.');
      return;
    }

    if (!orderForm.make || !orderForm.model || !orderForm.year) {
      toast.error('Please fill in the required fields.');
      return;
    }

    setSubmitting(true);
    try {
      // Create a custom order - we'll use a dummy vehicle ID since this is custom
      const customOrder = {
        customerEmail: user.email,
        customerName: user.name,
        vehicleId: `custom-${Date.now()}`, // Custom vehicle ID
        amount: parseInt(orderForm.budget) || 0,
        status: 'in progress' as const
      };

      addOrder(customOrder);
      toast.success('Your custom vehicle order has been placed! We will contact you soon.');
      
      // Reset form
      setOrderForm({
        make: '',
        model: '',
        year: '',
        fuelType: '',
        color: '',
        transmission: '',
        additionalSpecs: '',
        budget: ''
      });
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From routine maintenance to custom vehicle orders, we provide comprehensive automotive services to keep you on the road.
            </p>
          </div>

          {/* Services Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Vehicle Maintenance</h3>
              <p className="text-gray-600">Regular servicing, oil changes, brake repairs, and comprehensive vehicle inspections.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Custom Orders</h3>
              <p className="text-gray-600">Order your dream vehicle with custom specifications tailored to your needs.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Test Drives</h3>
              <p className="text-gray-600">Schedule test drives for any vehicle in our inventory to experience the drive before you buy.</p>
            </div>
          </div>

          {/* Custom Vehicle Order Form */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Order a Custom Vehicle</h2>
            <p className="text-gray-600 mb-8">
              Tell us about your dream vehicle and we'll help make it a reality. Fill out the form below with your specifications.
            </p>

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <p className="text-yellow-800">
                  <strong>Note:</strong> You must be signed in to place a custom vehicle order.{' '}
                  <a href="/login" className="text-blue-600 hover:underline">Sign in</a> or{' '}
                  <a href="/register" className="text-blue-600 hover:underline">create an account</a>.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  required
                  value={orderForm.make}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Toyota, Honda, BMW"
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  required
                  value={orderForm.model}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Camry, CR-V, 3 Series"
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  required
                  min="2020"
                  max="2026"
                  value={orderForm.year}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2024"
                />
              </div>

              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={orderForm.fuelType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select fuel type</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={orderForm.color}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Midnight Blue, Pearl White"
                />
              </div>

              <div>
                <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                <select
                  id="transmission"
                  name="transmission"
                  value={orderForm.transmission}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  min="0"
                  value={orderForm.budget}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your budget"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="additionalSpecs" className="block text-sm font-medium text-gray-700 mb-1">Additional Specifications</label>
                <textarea
                  id="additionalSpecs"
                  name="additionalSpecs"
                  rows={4}
                  value={orderForm.additionalSpecs}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe any additional features, modifications, or special requirements..."
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  {submitting ? 'Placing Order...' : 'Place Custom Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}