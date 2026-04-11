import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Vehicle } from '../types';
import { getVehicle, addOrder, updateVehicle } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface OrderVehicleFormProps {
  onSuccess?: () => void;
}

export default function OrderVehicleForm({ onSuccess }: OrderVehicleFormProps) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vehicleId = searchParams.get('vehicle');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    quantity: 1,
    transmission: 'automatic',
    color: '',
    pl_capacity: '',
    tw_capacity: '',
    shipping_option: 'standard',
    payment: 'cash',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadVehicle = async () => {
      if (vehicleId) {
        try {
          const v = await getVehicle(parseInt(vehicleId));
          setVehicle(v);
          setFormData(prev => ({ ...prev, color: v.vehicle_color }));
        } catch {
          toast.error('Failed to load vehicle details');
        }
      }
      setLoading(false);
    };
    loadVehicle();
  }, [vehicleId]);

  const calculatePrice = () => {
    if (!vehicle) return 0;
    let price = vehicle.vehicle_base_price;
    // Add transmission cost
    if (formData.transmission === 'manual') price += 1000;
    // Add capacity costs (example)
    if (formData.pl_capacity) price += parseInt(formData.pl_capacity) * 500;
    if (formData.tw_capacity) price += parseInt(formData.tw_capacity) * 300;
    return price * formData.quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !vehicle) {
      toast.error('Please sign in and select a vehicle');
      return;
    }

    if (formData.quantity > (vehicle.stock_quantity || 0)) {
      toast.error('Not enough stock available');
      return;
    }

    setSubmitting(true);
    try {
      const order = {
        product_name: vehicle.vehicle_name,
        product_img_url: vehicle.vehicle_img_url,
        product_model: vehicle.vehicle_model,
        product_color: formData.color,
        product_pl_capacity: formData.pl_capacity,
        product_tw_capacity: formData.tw_capacity,
        product_transmission: formData.transmission,
        product_quantity: formData.quantity,
        product_base_price: vehicle.vehicle_base_price,
        product_total_price: calculatePrice(),
        product_shipping_option: formData.shipping_option,
        product_payment: formData.payment,
        product_status: 'pending',
        product_payment_status: 'pending',
        product_transaction: '',
        user_id: user.id.toString(),
        username: user.name,
      };

      const createdOrder = await addOrder(order);
      // Update stock
      await updateVehicle(vehicle.vehicle_id, { stock_quantity: (vehicle.stock_quantity || 0) - formData.quantity });
      toast.success('Order placed successfully! Redirecting to payment...');
      onSuccess?.();
      navigate(`/payment?order=${createdOrder.order_id}`);
    } catch {
      toast.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading vehicle details...</div>;
  if (!vehicle) return <div>No vehicle selected. Please select a vehicle from inventory.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Order Vehicle</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <img src={vehicle.vehicle_img_url} alt={vehicle.vehicle_name} className="w-full h-64 object-cover rounded-lg" />
          <h3 className="text-xl font-semibold mt-4">{vehicle.vehicle_name}</h3>
          <p className="text-gray-600">{vehicle.vehicle_description}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              max={vehicle.stock_quantity || 1}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full border rounded-md px-3 py-2"
              required
            />
            <p className="text-sm text-gray-500">Available: {vehicle.stock_quantity || 0}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Transmission</label>
            <select
              value={formData.transmission}
              onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="automatic">Automatic (+$0)</option>
              <option value="manual">Manual (+$1000)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter color"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payload/Lifting Capacity (tons)</label>
            <input
              type="number"
              step="0.1"
              value={formData.pl_capacity}
              onChange={(e) => setFormData({ ...formData, pl_capacity: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g. 5.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Towing Capacity (tons)</label>
            <input
              type="number"
              step="0.1"
              value={formData.tw_capacity}
              onChange={(e) => setFormData({ ...formData, tw_capacity: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g. 10.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Shipping Option</label>
            <select
              value={formData.shipping_option}
              onChange={(e) => setFormData({ ...formData, shipping_option: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="standard">Standard Shipping</option>
              <option value="express">Express Shipping (+$500)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select
              value={formData.payment}
              onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Payment</option>
              <option value="loan">Loan</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-semibold">Total Price: ${calculatePrice().toLocaleString()}</h4>
            <p className="text-sm text-gray-600">Base: ${vehicle.vehicle_base_price} × {formData.quantity} + options</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : 'Place Order & Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}