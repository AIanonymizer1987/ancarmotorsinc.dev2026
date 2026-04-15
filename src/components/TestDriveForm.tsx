import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Vehicle } from '../types';
import { getVehicle } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { addTestDrive } from '../utils/api';
import { toast } from 'react-toastify';

interface TestDriveFormProps {
  onSuccess?: () => void;
}

export default function TestDriveForm({ onSuccess }: TestDriveFormProps) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicle');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadVehicle = async () => {
      if (vehicleId) {
        try {
          const v = await getVehicle(parseInt(vehicleId));
          setVehicle(v);
        } catch {
          toast.error('Failed to load vehicle details');
        }
      }
      setLoading(false);
    };
    loadVehicle();
  }, [vehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !vehicle) {
      toast.error('Please sign in and select a vehicle');
      return;
    }

    if (!formData.date || !formData.time) {
      toast.error('Please select date and time');
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(`${formData.date}T${formData.time}`);
    if (selectedDate <= new Date()) {
      toast.error('Please select a future date and time');
      return;
    }

    setSubmitting(true);
    try {
      const testDrive = {
        user_id: user.id.toString(),
        vehicle_id: vehicle.vehicle_id,
        requested_date: formData.date,
        requested_time: formData.time,
        status: 'pending',
      };

      await addTestDrive(testDrive);
      toast.success('Test drive request submitted successfully!');
      onSuccess?.();
    } catch {
      toast.error('Failed to submit test drive request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading vehicle details...</div>;
  if (!vehicle) return <div>No vehicle selected. Please select a vehicle from Vehicles.</div>;

  // Generate time options (9 AM to 5 PM)
  const timeOptions: string[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Request Test Drive</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={vehicle.vehicle_img_url} alt={vehicle.vehicle_name} className="w-full h-48 object-cover rounded-lg" />
          <h3 className="text-lg font-semibold mt-4">{vehicle.vehicle_name}</h3>
          <p className="text-gray-600">{vehicle.vehicle_model}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Time</label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Select time</option>
              {timeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-semibold text-blue-800">Test Drive Request Summary</h4>
            <p className="text-sm text-blue-700 mt-2">
              Vehicle: {vehicle.vehicle_name}<br />
              Date: {formData.date || 'Not selected'}<br />
              Time: {formData.time || 'Not selected'}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Our team will contact you to confirm availability and provide further instructions.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting Request...' : 'Submit Test Drive Request'}
          </button>
        </form>
      </div>
    </div>
  );
}