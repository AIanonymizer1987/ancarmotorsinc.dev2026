import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Vehicle } from '../types';

type Props = {
  vehicle: Vehicle;
};

const parseList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const InventoryCard: React.FC<Props> = ({ vehicle }) => {
  const navigate = useNavigate();

  // Format price in PHP with commas
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(Number(vehicle.vehicle_base_price));

  // Mock rating (random between 3.5 and 5)
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 45) + 5;

  const colors = parseList(vehicle.vehicle_color);
  const transmissions = parseList(vehicle.vehicle_transmission);
  const liftingCapacities = parseList(vehicle.vehicle_lifting_capacity);
  const payloadCapacities = parseList(vehicle.vehicle_payload_capacity);
  const towingCapacities = parseList(vehicle.vehicle_towing_capacity);

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
      <Link to={`/vehicles/${vehicle.vehicle_id}`} className="block focus:outline-none" aria-label={`View details for ${vehicle.vehicle_year} ${vehicle.vehicle_make} ${vehicle.vehicle_model}`}>
        <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
          <img
            src={vehicle.vehicle_img_url}
            alt={`${vehicle.vehicle_year} ${vehicle.vehicle_make} ${vehicle.vehicle_model}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">
          <header className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {vehicle.vehicle_year} {vehicle.vehicle_make} {vehicle.vehicle_model}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(Number(rating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">
                  {rating} ({reviewCount} reviews)
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {vehicle.vehicle_fuel_type} • Stock: {vehicle.stock_quantity || 0}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {formattedPrice}
              </div>
              <div className="text-sm text-gray-500">Per unit</div>
            </div>
          </header>

          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {vehicle.vehicle_description}
          </p>

          <div className="grid gap-2 text-xs text-gray-500 mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              {transmissions.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-gray-100">Transmission: {transmissions.join(', ')}</span>
              )}
              {colors.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-gray-100">Color: {colors.join(', ')}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {liftingCapacities.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-gray-100">Lifting: {liftingCapacities.join(', ')}</span>
              )}
              {payloadCapacities.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-gray-100">Payload: {payloadCapacities.join(', ')}</span>
              )}
              {towingCapacities.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-gray-100">Towing: {towingCapacities.join(', ')}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Fuel Economy</span>
              <span>{vehicle.vehicle_fuel_economy || 'N/A'}</span>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => navigate(`/vehicles/${vehicle.vehicle_id}`)}
          className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          View Details
        </button>
        {vehicle.stock_quantity > 0 ? (
          <button
            onClick={() => navigate(`/services?vehicle=${vehicle.vehicle_id}`)}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Order Vehicle
          </button>
        ) : (
          <button
            onClick={() => {
              const title = `Request for Stocks of ${vehicle.vehicle_year} ${vehicle.vehicle_make} ${vehicle.vehicle_model}`;
              navigate(`/contact?nature=other&title=${encodeURIComponent(title)}#ticket-section`);
            }}
            className="flex-1 bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            Request for Stock
          </button>
        )}
      </div>
    </article>
  );
};

export default InventoryCard;