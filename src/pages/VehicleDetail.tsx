import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getVehicle } from '../utils/api';
import type { Vehicle } from '../types';
import { Calendar, Fuel, ArrowLeft } from 'lucide-react';

const parseList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

    const VehicleDetail: React.FC = () => {
      const { id } = useParams<{ id: string }>();
      const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicle = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const v = await getVehicle(parseInt(id));
        setVehicle(v);
      } catch (error) {
        console.error('Failed to load vehicle from API:', error);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };
    loadVehicle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p>Loading vehicle details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4">Vehicle Data does not exist or cannot be found.</h1>
            <p className="text-gray-600 mb-6">Please return to the vehicles page or try another selection.</p>
            <Link to="/vehicles" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md">
              <ArrowLeft className="h-4 w-4" /> Back to Vehicles
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedPrice = vehicle.vehicle_base_price.toLocaleString('en-US', {
        maximumFractionDigits: 0,
      });

      return (
        <div className="min-h-screen">
          <Header />
          <main className="py-12">
            <div className="max-w-6xl mx-auto px-4">
              <div className="mb-6">
                <Link to="/vehicles" className="inline-flex items-center gap-2 text-gray-600 hover:underline">
                  <ArrowLeft className="h-4 w-4" /> Back to Vehicles
                </Link>
              </div>

              <section className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="w-full h-96 bg-gray-100">
                    <img
                      src={vehicle.vehicle_img_url}
                      alt={`${vehicle.vehicle_year} ${vehicle.vehicle_make} ${vehicle.vehicle_model} - detailed view`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {vehicle.vehicle_year} {vehicle.vehicle_make} {vehicle.vehicle_model}
                    </h1>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {formattedPrice}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{vehicle.vehicle_description}</p>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 mb-6">
                      <li className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Year: <span className="ml-2 font-medium text-gray-900">{vehicle.vehicle_year}</span></li>
                      <li className="flex items-center"><Fuel className="h-4 w-4 mr-2" /> Fuel Type: <span className="ml-2 font-medium text-gray-900">{vehicle.vehicle_fuel_type}</span></li>
                      <li className="flex items-center"><span className="h-4 w-4 mr-2" /> Color: <span className="ml-2 font-medium text-gray-900">{parseList(vehicle.vehicle_color).join(', ') || 'N/A'}</span></li>
                      <li className="flex items-center"><span className="h-4 w-4 mr-2" /> Fuel Economy: <span className="ml-2 font-medium text-gray-900">{vehicle.vehicle_fuel_economy}</span></li>
                      <li className="flex items-center"><span className="h-4 w-4 mr-2" /> Transmission: <span className="ml-2 font-medium text-gray-900">{parseList(vehicle.vehicle_transmission).join(', ') || 'N/A'}</span></li>
                      <li className="flex items-center"><span className="h-4 w-4 mr-2" /> Stock: <span className="ml-2 font-medium text-gray-900">{vehicle.stock_quantity || 0}</span></li>
                      <li className="flex items-center"><span className="h-4 w-4 mr-2" /> Lifting Capacity: <span className="ml-2 font-medium text-gray-900">{parseList(vehicle.vehicle_lifting_capacity).join(', ') || 'N/A'}</span></li>
                      <li className="flex items-center"><span className="h-4 w-4 mr-2" /> Payload Capacity: <span className="ml-2 font-medium text-gray-900">{parseList(vehicle.vehicle_payload_capacity).join(', ') || 'N/A'}</span></li>
                      <li className="flex items-center"><span className="h-4 w-4 mr-2" /> Towing Capacity: <span className="ml-2 font-medium text-gray-900">{parseList(vehicle.vehicle_towing_capacity).join(', ') || 'N/A'}</span></li>
                    </ul>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {vehicle.stock_quantity > 0 ? (
                        <>
                          <button
                            onClick={() => navigate(`/services?vehicle=${vehicle.vehicle_id}&service=order`)}
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                          >
                            Order Vehicle
                          </button>
                          <button
                            onClick={() => navigate(`/services?vehicle=${vehicle.vehicle_id}&service=test-drive`)}
                            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                          >
                            Schedule Test Drive
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            disabled
                            className="w-full sm:w-auto px-6 py-3 bg-gray-400 text-gray-600 rounded-md cursor-not-allowed"
                          >
                            Order Vehicle (Out of Stock)
                          </button>
                          <button
                            onClick={() => {
                              const title = `Request for Stocks of ${vehicle.vehicle_year} ${vehicle.vehicle_make} ${vehicle.vehicle_model}`;
                              navigate(`/contact?nature=other&title=${encodeURIComponent(title)}#ticket-section`);
                            }}
                            className="w-full sm:w-auto px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition"
                          >
                            Request for Stock
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-8 bg-white p-6 rounded-md shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Full Details</h2>
                <p className="text-sm text-gray-700">
                  Below are the full vehicle details. For vehicle history, financing options, or to schedule a viewing, please contact our sales team.
                </p>

                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <dt className="font-medium text-gray-900">Make</dt>
                    <dd>{vehicle.vehicle_make}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Model</dt>
                    <dd>{vehicle.vehicle_model}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Year</dt>
                    <dd>{vehicle.vehicle_year}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Price</dt>
                    <dd>{formattedPrice}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Fuel Type</dt>
                    <dd>{vehicle.vehicle_fuel_type}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Color</dt>
                    <dd>{parseList(vehicle.vehicle_color).join(', ') || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Fuel Economy</dt>
                    <dd>{vehicle.vehicle_fuel_economy}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Transmission</dt>
                    <dd>{parseList(vehicle.vehicle_transmission).join(', ') || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Stock Quantity</dt>
                    <dd>{vehicle.stock_quantity || 0}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Lifting Capacity</dt>
                    <dd>{parseList(vehicle.vehicle_lifting_capacity).join(', ') || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Payload Capacity</dt>
                    <dd>{parseList(vehicle.vehicle_payload_capacity).join(', ') || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Towing Capacity</dt>
                    <dd>{parseList(vehicle.vehicle_towing_capacity).join(', ') || 'N/A'}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </main>
          <Footer />
        </div>
      );
    };

    export default VehicleDetail;