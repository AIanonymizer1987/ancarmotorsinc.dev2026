import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OrderVehicleForm from '../components/OrderVehicleForm';
import TestDriveForm from '../components/TestDriveForm';

type ServiceType = 'order' | 'test-drive';

export default function Services() {
  const [activeService, setActiveService] = useState<ServiceType>('order');

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

          <div className="bg-white rounded-lg shadow-md p-8">
            {activeService === 'order' ? (
              <OrderVehicleForm />
            ) : (
              <TestDriveForm />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}