import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OrderVehicleForm from '../components/OrderVehicleForm';
import TestDriveForm from '../components/TestDriveForm';
import { useAuth } from '../context/AuthContext';

type ServiceType = 'order' | 'test-drive';

export default function Services() {
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service');
  const [activeService, setActiveService] = useState<ServiceType>(
    serviceParam === 'test-drive' ? 'test-drive' : 'order'
  );
  const navigate = useNavigate();
  const { user } = useAuth();
  const vehicleId = searchParams.get('vehicle');
  const hasVehicle = !!vehicleId;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
            <p className="text-xl text-gray-600">Order your vehicle or schedule a test drive</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setActiveService('order')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeService === 'order'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Order Vehicle
              </button>
              <button
                onClick={() => setActiveService('test-drive')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeService === 'test-drive'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Test Drive
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-lg shadow-md p-8">
              {activeService === 'order' ? (
                <OrderVehicleForm />
              ) : (
                <div className="relative">
                  <TestDriveForm />
                  {!user && (
                    <div className="absolute inset-0 z-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center p-6">
                      <div className="text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Browse Only</h2>
                        <p className="text-gray-600 mb-4">
                          You must sign in before scheduling a test drive.
                        </p>
                        <button
                          onClick={() => navigate('/login')}
                          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Sign In to Continue
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Overlay when no vehicle selected */}
            {!hasVehicle && (
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg text-center max-w-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">No Vehicle Selected</h2>
                  <p className="text-gray-600 mb-6">
                    Please select a vehicle from the Vehicles page first to proceed with your {activeService === 'order' ? 'order' : 'test drive'} request.
                  </p>
                  <button
                    onClick={() => navigate('/vehicles')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Browse Vehicles
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}