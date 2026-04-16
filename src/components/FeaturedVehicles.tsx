import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Gauge, Fuel, ChevronLeft, ChevronRight } from 'lucide-react';
import { getVehicles } from '../utils/api';
import type { Vehicle } from '../types';

const FeaturedVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await getVehicles();
        setVehicles(data.slice(0, 6)); // Show up to 6 featured vehicles
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (vehicles.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % vehicles.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [vehicles.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vehicles.length);
  };

  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num.toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });
  };

  if (loading) {
    return <div className="py-16 text-center">Loading featured vehicles...</div>;
  }

  if (vehicles.length === 0) {
    return <div className="py-16 text-center">No vehicles available</div>;
  }

  // Show 3 vehicles at a time in carousel
  const getVisibleVehicles = () => {
    const visible = [];
    for (let i = 0; i < 3 && i < vehicles.length; i++) {
      visible.push(vehicles[(currentIndex + i) % vehicles.length]);
    }
    return visible;
  };

  return (
    <section className="py-16 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="featured-heading text-3xl md:text-4xl font-bold mb-4">
  Featured Vehicles
</h2>
          <p className="text-xl featured-heading max-w-3xl mx-auto">
            Discover our handpicked selection of quality vehicles, 
            each thoroughly inspected and ready for the road.
          </p>
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handlePrev}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
            title="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 mx-4">
            {getVisibleVehicles().map((vehicle) => (
              <div key={vehicle.vehicle_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={vehicle.vehicle_img_url}
                    alt={`${vehicle.vehicle_year} ${vehicle.vehicle_make} ${vehicle.vehicle_model}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {vehicle.vehicle_year} {vehicle.vehicle_make} {vehicle.vehicle_model}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(vehicle.vehicle_base_price)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{vehicle.vehicle_year}</span>
                    </div>
                    <div className="flex items-center">
                      <Fuel className="h-4 w-4 mr-1" />
                      <span>{vehicle.vehicle_fuel_type}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/vehicles/${vehicle.vehicle_id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
            title="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {vehicles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 w-2'
              }`}
              title={`Go to vehicle ${idx + 1}`}
            />
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={() => navigate('/vehicles')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Browse All Vehicles
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVehicles;