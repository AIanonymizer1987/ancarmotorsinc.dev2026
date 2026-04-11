import React, { useMemo, useState, useEffect } from 'react';
    import Header from '../components/Header';
    import Footer from '../components/Footer';
    import InventoryCard from '../components/InventoryCard';
    import { getVehicles } from '../utils/api';
import { Vehicle } from '../types';
    import { Filter, Search } from 'lucide-react';
    import { Link } from 'react-router-dom';

    export default function Inventory() {
      const [search, setSearch] = useState('');
      const [selectedMake, setSelectedMake] = useState<string>('All');
      const [selectedFuel, setSelectedFuel] = useState<string>('All');
      const [priceRange, setPriceRange] = useState<string>('All');
      const [minRating, setMinRating] = useState<number>(0);
      const [showFilters, setShowFilters] = useState<boolean>(false);
      const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehicles = await getVehicles();
        setAllVehicles(vehicles);
      } catch {
        console.error('Failed to load vehicles');
      }
    };
    loadVehicles();
  }, []);

  const makes = useMemo(() => {
    const setOfMakes = Array.from(new Set(allVehicles.map((v) => v.vehicle_make)));
    return ['All', ...setOfMakes];
  }, [allVehicles]);

  const fuelTypes = useMemo(() => {
    const setOfFuel = Array.from(new Set(allVehicles.map((v) => v.vehicle_fuel_type)));
    return ['All', ...setOfFuel];
  }, [allVehicles]);

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((v: Vehicle) => {
      // search by make, model, year
      const query = search.trim().toLowerCase();
      if (query) {
        const hay = `${v.vehicle_make} ${v.vehicle_model} ${v.vehicle_year}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      if (selectedMake !== 'All' && v.vehicle_make !== selectedMake) return false;
      if (selectedFuel !== 'All' && v.vehicle_fuel_type !== selectedFuel) return false;

      if (priceRange !== 'All') {
        if (priceRange === '<20000' && !(v.vehicle_base_price < 20000)) return false;
        if (priceRange === '20000-30000' && !(v.vehicle_base_price >= 20000 && v.vehicle_base_price <= 30000)) return false;
        if (priceRange === '>30000' && !(v.vehicle_base_price > 30000)) return false;
      }

      return true;
    });
  }, [allVehicles, search, selectedMake, selectedFuel, priceRange]);

      return (
        <div className="min-h-screen">
          <Header />
          <main className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Vehicle Inventory</h1>
                <p className="text-gray-600">Browse our current inventory. Use the search and filters to narrow results.</p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center w-full md:w-2/3">
                  <label htmlFor="inventory-search" className="sr-only">Search inventory</label>
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Search className="h-5 w-5" />
                    </span>
                    <input
                      id="inventory-search"
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by make, model, or year"
                      className="pl-10 pr-4 py-3 w-full border border-border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      aria-label="Search vehicles by make, model, or year"
                    />
                  </div>
                </div>

                <div className="ml-4 flex items-center">
                  <button
                    onClick={() => setShowFilters((s) => !s)}
                    className="inline-flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    aria-expanded={showFilters}
                    aria-controls="inventory-filters"
                  >
                    <Filter className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Filters</span>
                  </button>
                  <Link to="/inventory" className="ml-3 text-sm text-gray-500 hover:underline">Reset</Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside id="inventory-filters" className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden'} lg:block`}>
                  <section className="bg-white p-4 rounded-md shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Filter Inventory</h2>

                    <div className="mb-4">
                      <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                      <select
                        id="make"
                        value={selectedMake}
                        onChange={(e) => setSelectedMake(e.target.value)}
                        className="block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        {makes.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="fuel" className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                      <select
                        id="fuel"
                        value={selectedFuel}
                        onChange={(e) => setSelectedFuel(e.target.value)}
                        className="block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        {fuelTypes.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <select
                        id="price"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="All">All</option>
                        <option value="<20000">Below $20,000</option>
                        <option value="20000-30000">$20,000 - $30,000</option>
                        <option value=">30000">Above $30,000</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                      <select
                        id="rating"
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Any</option>
                        <option value={4}>4.0+</option>
                        <option value={4.5}>4.5+</option>
                        <option value={5}>5.0</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedMake('All');
                          setSelectedFuel('All');
                          setPriceRange('All');
                          setMinRating(0);
                        }}
                        className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </section>
                </aside>

                <section className="lg:col-span-3">
                  <div aria-live="polite" className="mb-4 text-sm text-gray-600">
                    Showing {filteredVehicles.length} result{filteredVehicles.length !== 1 ? 's' : ''}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                      <InventoryCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>

                  {filteredVehicles.length === 0 && (
                    <div className="mt-8 bg-white p-6 rounded-md shadow-sm text-center">
                      <p className="text-gray-700">No vehicles matched your search or filters.</p>
                    </div>
                  )}
                </section>
              </div>

              <div className="text-center mt-10">
                <Link to="/contact" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Request More Vehicles
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      );
    }