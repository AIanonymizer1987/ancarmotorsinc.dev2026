import React from 'react';
    import { useParams, Link } from 'react-router-dom';
    import Header from '../components/Header';
    import Footer from '../components/Footer';
    import { getVehicleById } from '../data/vehicles';
    import { Calendar, Gauge, Fuel, ArrowLeft, Star } from 'lucide-react';

    const VehicleDetail: React.FC = () => {
      const { id } = useParams<{ id: string }>();
      const vehicle = id ? getVehicleById(id) : undefined;

      if (!vehicle) {
        return (
          <div className="min-h-screen">
            <Header />
            <main className="py-16">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-4">Vehicle not found</h1>
                <p className="text-gray-600 mb-6">We couldn't find the vehicle you're looking for.</p>
                <Link to="/inventory" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md">
                  <ArrowLeft className="h-4 w-4" /> Back to Inventory
                </Link>
              </div>
            </main>
            <Footer />
          </div>
        );
      }

      const formattedPrice = vehicle.price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      });

      return (
        <div className="min-h-screen">
          <Header />
          <main className="py-12">
            <div className="max-w-6xl mx-auto px-4">
              <div className="mb-6">
                <Link to="/inventory" className="inline-flex items-center gap-2 text-gray-600 hover:underline">
                  <ArrowLeft className="h-4 w-4" /> Back to Inventory
                </Link>
              </div>

              <section className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="w-full h-96 bg-gray-100">
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - detailed view`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h1>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-700">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-semibold">{vehicle.rating.toFixed(1)}</span>
                        <span className="ml-2 text-sm text-gray-500">/ 5 rating</span>
                      </div>

                      <div className="text-2xl font-bold text-blue-600">
                        {formattedPrice}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{vehicle.description}</p>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 mb-6">
                      <li className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Year: <span className="ml-2 font-medium text-gray-900">{vehicle.year}</span></li>
                      <li className="flex items-center"><Gauge className="h-4 w-4 mr-2" /> Mileage: <span className="ml-2 font-medium text-gray-900">{vehicle.mileage} mi</span></li>
                      <li className="flex items-center"><Fuel className="h-4 w-4 mr-2" /> Fuel Type: <span className="ml-2 font-medium text-gray-900">{vehicle.fuelType}</span></li>
                      <li className="flex items-center"><span className="h-4 w-4 mr-2" />Condition: <span className="ml-2 font-medium text-gray-900">Used</span></li>
                    </ul>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">Request Info</button>
                      <button className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50">Schedule Test Drive</button>
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
                    <dd>{vehicle.make}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Model</dt>
                    <dd>{vehicle.model}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Year</dt>
                    <dd>{vehicle.year}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Price</dt>
                    <dd>{formattedPrice}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Mileage</dt>
                    <dd>{vehicle.mileage} mi</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Fuel Type</dt>
                    <dd>{vehicle.fuelType}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Rating</dt>
                    <dd>{vehicle.rating} / 5</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Stock ID</dt>
                    <dd>{vehicle.id}</dd>
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