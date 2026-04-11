import React from 'react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../types';

type Props = {
  vehicle: Vehicle;
};

const InventoryCard: React.FC<Props> = ({ vehicle }) => {
  const formattedPrice = vehicle.vehicle_base_price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
      <Link to={`/inventory/${vehicle.vehicle_id}`} className="block focus:outline-none" aria-label={`View details for ${vehicle.vehicle_year} ${vehicle.vehicle_make} ${vehicle.vehicle_model}`}>
        <div className="w-full h-48 bg-gray-100 overflow-hidden">
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

          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                View Details
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default InventoryCard;