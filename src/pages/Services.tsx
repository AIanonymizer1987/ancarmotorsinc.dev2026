import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OrderVehicleForm from '../components/OrderVehicleForm';
import TestDriveForm from '../components/TestDriveForm';
import { useAuth } from '../context/AuthContext';

type ServiceType = 'order' | 'test-drive';

const SkeletonOrderForm = () => (
  <div className="space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
    <div className="h-24 bg-gray-200 rounded"></div>
    <div className="h-12 bg-gray-200 rounded"></div>
  </div>
);

const SkeletonTestDriveForm = () => (
  <div className="space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
            <p className="text-xl text-gray-600">Order your vehicle or schedule a test drive</p>
          </div>

          <div className="flex justify-center mb-12">
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

          <div className="relative mb-24">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className={!hasVehicle ? 'blur-sm pointer-events-none' : ''}>
                {activeService === 'order' ? (
                  hasVehicle ? <OrderVehicleForm /> : <SkeletonOrderForm />
                ) : (
                  <div className="relative">
                    {hasVehicle ? <TestDriveForm /> : <SkeletonTestDriveForm />}
                    {!user && hasVehicle && (
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
              
              {/* Modal overlay when no vehicle selected */}
              {!hasVehicle && (
                <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center z-20 top-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg text-center max-w-sm border border-blue-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Vehicle Selected</h2>
                    <p className="text-gray-600 mb-6">
                      Please select a vehicle from the Vehicles page first to proceed with your {activeService === 'order' ? 'order' : 'test drive'} request.
                    </p>
                    <button
                      onClick={() => navigate('/vehicles')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full"
                    >
                      Browse Vehicles
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}