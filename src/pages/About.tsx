import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, Award, Clock, Heart } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: Users, label: 'Happy Customers', value: '1000+' },
    { icon: Award, label: 'Years of Experience', value: '15+' },
    { icon: Clock, label: 'Vehicles Sold', value: '5000+' },
    { icon: Heart, label: 'Customer Satisfaction', value: '98%' }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About Ancar Motors Inc
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're more than just a car dealership. We're your trusted automotive partner, 
                committed to providing exceptional vehicles and service to our community.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Ancar Motors showroom"
                  className="rounded-lg shadow-lg w-full h-96 object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Who are we?</h2>
                <p className="text-gray-600 mb-4">
                  Our business is in marketing of imported and reconditioned Japanese trucks, 
                  special-purpose vehicles such as tractor head, tanker, dump and fire trucks, SUVs,
                   and heavy equipment. 
                </p>
                <p className="text-gray-600 mb-4">
                  Our company carries Isuzu, Fuso, Mitsubishi, and Suzuki brands 
                  of reliable quality and performance in the Japanese and Philippine market.
                </p>
                <p className="text-gray-600">
                  Types of body include standard flat bed, low or high-dropside, palletized, and stake-body.
                   Our company can also provide the standard aluminum van to wing-van type and 
                   customized chiller and freezer vans and any customized body and/or unit preferred.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Integrity</h3>
                  <p className="text-gray-600">
                    We believe in honest, transparent dealings with every customer, 
                    building trust through our actions.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality</h3>
                  <p className="text-gray-600">
                    Every vehicle in our inventory is carefully inspected to ensure 
                    it meets our high standards.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Service</h3>
                  <p className="text-gray-600">
                    Our commitment to exceptional customer service doesn't end 
                    when you drive off the lot.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 gap-8 mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Support</h3>
                  <p className="text-gray-600">
                    Continuously help imporve the welfare of our people towards growth within the company.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainability</h3>
                  <p className="text-gray-600">
                    Adhere to the environmental standards and meet the expectations of the clients and stakeholders.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">World Class</h3>
                  <p className="text-gray-600">
                    Assure high quality and reliable products.
                  </p>
                </div>
              </div>
            </div>
             <div className="bg-gray-50 rounded-lg p-8 gap-8 mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Vision</h2>
              <div className="text-center gap-8">
                <div className="text-center">
                  <p className="text-gray-600">
                    To be the leading Filipino-owned truck and heavy equipment importer, distributor and assembler in the Philippine market.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
      </main>
      <Footer />
    </div>
  );
}