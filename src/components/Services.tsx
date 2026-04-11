import React from 'react';
import { Car, Wrench, CreditCard, Shield, Clock, Users } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Car,
      title: 'Vehicle Sales',
      description: 'Browse our extensive inventory of quality pre-owned and new vehicles from trusted brands.'
    },
    {
      icon: Wrench,
      title: 'Auto Repair',
      description: 'Expert mechanical services and maintenance to keep your vehicle running smoothly.'
    },
    {
      icon: CreditCard,
      title: 'Financing',
      description: 'Flexible financing options with competitive rates to help you get the car you want.'
    },
    {
      icon: Shield,
      title: 'Warranty',
      description: 'Comprehensive warranty coverage for peace of mind with every vehicle purchase.'
    },
    {
      icon: Clock,
      title: 'Quick Service',
      description: 'Fast and efficient service to get you back on the road as quickly as possible.'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Experienced professionals dedicated to providing exceptional customer service.'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From sales to service, we provide comprehensive automotive solutions 
            to meet all your vehicle needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-center text-justify">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;