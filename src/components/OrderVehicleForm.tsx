import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Vehicle } from '../types';
import { getVehicle, addOrder, updateVehicle } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface OrderVehicleFormProps {
  onSuccess?: () => void;
}

const parseOptions = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseCapacityKg = (value: string) => {
  if (!value) return 0;
  const match = value.match(/[\d.,]+/);
  if (!match) return 0;
  const raw = match[0].replace(/,/g, '');
  const numeric = parseFloat(raw);
  if (Number.isNaN(numeric)) return 0;
  if (value.toLowerCase().includes('ton')) return numeric * 1000;
  return numeric;
};

const getCapacityCost = (value: string, type: 'payload' | 'lifting' | 'towing') => {
  const kg = parseCapacityKg(value);
  if (!kg) return 0;

  if (type === 'payload') {
    return Math.round(kg / 1000) * 5000;
  }

  if (type === 'lifting') {
    return Math.round(kg / 100) * 2000;
  }

  if (type === 'towing') {
    return Math.round(kg / 1000) * 8000;
  }

  return 0;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);

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
    payloadCapacity: '',
    liftingCapacity: '',
    towingCapacity: '',
    shipping_option: 'standard',
    payment: 'cash',
    installmentTerm: '12',
    repaymentFrequency: 'monthly',
    downPaymentPercent: '10',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadVehicle = async () => {
      if (vehicleId) {
        try {
          const v = await getVehicle(parseInt(vehicleId));
          setVehicle(v);

          const colors = parseOptions(v.vehicle_color);
          const payloadOptions = parseOptions(v.vehicle_payload_capacity);
          const liftingOptions = parseOptions(v.vehicle_lifting_capacity);
          const towingOptions = parseOptions(v.vehicle_towing_capacity);

          setFormData((prev) => ({
            ...prev,
            color: colors[0] || '',
            payloadCapacity: payloadOptions[0] || '',
            liftingCapacity: liftingOptions[0] || '',
            towingCapacity: towingOptions[0] || '',
          }));
          setVehicle(v);
        } catch {
          toast.error('Failed to load vehicle details');
        }
      }
      setLoading(false);
    };
    loadVehicle();
  }, [vehicleId]);

  const vehicleColors = vehicle ? parseOptions(vehicle.vehicle_color) : [];
  const payloadOptions = vehicle ? parseOptions(vehicle.vehicle_payload_capacity) : [];
  const liftingOptions = vehicle ? parseOptions(vehicle.vehicle_lifting_capacity) : [];
  const towingOptions = vehicle ? parseOptions(vehicle.vehicle_towing_capacity) : [];

  const shippingCost = formData.shipping_option === 'express' ? 5000 : 0;
  const transmissionCost = formData.transmission === 'manual' ? 1000 : 0;
  const payloadCost = getCapacityCost(formData.payloadCapacity, 'payload');
  const liftingCost = getCapacityCost(formData.liftingCapacity, 'lifting');
  const towingCost = getCapacityCost(formData.towingCapacity, 'towing');

  const calculatePrice = () => {
    if (!vehicle) return 0;
    const base = vehicle.vehicle_base_price;
    return (
      (base + transmissionCost + payloadCost + liftingCost + towingCost + shippingCost) *
      formData.quantity
    );
  };

  const subtotal = calculatePrice();
  const processingFee = Math.round(subtotal * 0.02);
  const bankTransactionFee = Math.round(subtotal * 0.015);
  const cashTotal = subtotal + processingFee;
  const bankTotal = formData.payment === 'bank' ? subtotal + bankTransactionFee + processingFee : 0;

  const downPaymentAmount = Math.round(subtotal * (Number(formData.downPaymentPercent) / 100));
  const financedAmount = Math.max(subtotal - downPaymentAmount, 0);
  const installmentMonths = Number(formData.installmentTerm);
  const periodsPerYear = formData.repaymentFrequency === 'quarterly' ? 4 : 12;
  const numberOfPayments =
    formData.repaymentFrequency === 'quarterly' ? installmentMonths / 3 : installmentMonths;
  const annualInterestRate = 0.08;
  const periodicRate = annualInterestRate / periodsPerYear;
  const installmentPayment =
    financedAmount > 0 && numberOfPayments > 0
      ? periodicRate > 0
        ? Math.round(
            (financedAmount * periodicRate) /
              (1 - Math.pow(1 + periodicRate, -numberOfPayments))
          )
        : Math.round(financedAmount / numberOfPayments)
      : 0;
  const installmentTotal = downPaymentAmount + installmentPayment * numberOfPayments + processingFee;
  const estimatedLateFee = Math.round(installmentPayment * 0.02);

  const prepareSchedule = () => {
    if (formData.payment !== 'installment' || financedAmount <= 0 || numberOfPayments <= 0) return [];

    const schedule = [] as Array<{
      period: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
    }>;

    let balance = financedAmount;
    const payment = installmentPayment;

    for (let period = 1; period <= numberOfPayments; period += 1) {
      const interest = Math.round(balance * periodicRate);
      const principal = period === numberOfPayments ? balance : Math.round(payment - interest);
      const totalPayment = period === numberOfPayments ? balance + interest : payment;
      balance = Math.max(0, balance - principal);

      schedule.push({
        period,
        payment: totalPayment,
        principal,
        interest,
        balance,
      });
    }

    return schedule;
  };

  const installmentSchedule = prepareSchedule();

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
        order_code: `ORDER_${Date.now()}`,
        product_name: vehicle.vehicle_name,
        product_img_url: vehicle.vehicle_img_url,
        product_model: vehicle.vehicle_model,
        product_color: formData.color,
        product_pl_capacity: formData.payloadCapacity,
        product_tw_capacity: formData.towingCapacity,
        product_transmission: formData.transmission,
        product_quantity: formData.quantity,
        product_base_price: vehicle.vehicle_base_price,
        product_total_price: subtotal,
        product_shipping_option: formData.shipping_option,
        product_payment: formData.payment,
        product_status: 'pending',
        product_payment_status: 'pending',
        payment_reference: formData.payment === 'cash' ? null : `REF-${Date.now()}`,
        product_transaction: JSON.stringify({
          paymentDetails: {
            shippingCost,
            processingFee,
            bankTransactionFee: formData.payment === 'bank' ? bankTransactionFee : 0,
            cashTotal: cashTotal,
            ...(formData.payment === 'bank' ? { bankTotal } : {}),
            installment: formData.payment === 'installment'
              ? {
                  downPaymentAmount,
                  financedAmount,
                  installmentPayment,
                  installmentTotal,
                  lateFee: estimatedLateFee,
                  termMonths: installmentMonths,
                  repaymentFrequency: formData.repaymentFrequency,
                  downPaymentPercent: formData.downPaymentPercent,
                }
              : null,
          },
        }),
        user_id: user.id.toString(),
        username: user.name,
      };

      const createdOrder = await addOrder(order);
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
  if (!vehicle) return <div>No vehicle selected. Please select a vehicle from Vehicles.</div>;
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-xl font-semibold text-gray-900 mb-4">Please sign in to place an order.</p>
        <p className="text-gray-600 mb-6">Ordering is restricted to registered customers. Please sign in or register to continue.</p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
        >
          Sign in to Order
        </a>
      </div>
    );
  }

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
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
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
              <option value="automatic">Automatic (+{formatCurrency(0)})</option>
              <option value="manual">Manual (+{formatCurrency(1000)})</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {vehicleColors.length > 0 ? (
                vehicleColors.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: option })}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-colors ${
                      formData.color === option
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span
                      className="inline-block h-4 w-4 rounded-full border"
                      style={{ backgroundColor: option, borderColor: option ? 'rgba(0,0,0,0.18)' : undefined }}
                    />
                    {option}
                  </button>
                ))
              ) : (
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter color"
                  required
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payload Capacity</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {payloadOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData({ ...formData, payloadCapacity: option })}
                    className={`rounded-full px-3 py-2 text-sm border transition-colors ${
                      formData.payloadCapacity === option
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lifting Capacity</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {liftingOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData({ ...formData, liftingCapacity: option })}
                    className={`rounded-full px-3 py-2 text-sm border transition-colors ${
                      formData.liftingCapacity === option
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Towing Capacity</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {towingOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({ ...formData, towingCapacity: option })}
                  className={`rounded-full px-3 py-2 text-sm border transition-colors ${
                    formData.towingCapacity === option
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Shipping Option</label>
            <select
              value={formData.shipping_option}
              onChange={(e) => setFormData({ ...formData, shipping_option: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="standard">Standard Shipping</option>
              <option value="express">Express Shipping (+{formatCurrency(5000)})</option>
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
              <option value="installment">Installment</option>
            </select>
          </div>

          {formData.payment === 'installment' && (
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <h4 className="font-semibold">Installment Application</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loan Term</label>
                  <select
                    value={formData.installmentTerm}
                    onChange={(e) => setFormData({ ...formData, installmentTerm: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                    <option value="48">48 months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Repayment Frequency</label>
                  <select
                    value={formData.repaymentFrequency}
                    onChange={(e) => setFormData({ ...formData, repaymentFrequency: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Down Payment</label>
                <select
                  value={formData.downPaymentPercent}
                  onChange={(e) => setFormData({ ...formData, downPaymentPercent: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="10">10%</option>
                  <option value="20">20%</option>
                  <option value="30">30%</option>
                </select>
              </div>

              <p className="text-sm text-gray-600">
                Processing fee applies to all payment forms. Late payments may incur an additional fee of {formatCurrency(estimatedLateFee)} per installment.
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <h4 className="font-semibold">Payment Summary</h4>
            <div className="grid gap-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Base price</span>
                <span>{formatCurrency(vehicle.vehicle_base_price)} × {formData.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Transmission</span>
                <span>{formatCurrency(transmissionCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payload option</span>
                <span>{formatCurrency(payloadCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Lifting option</span>
                <span>{formatCurrency(liftingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Towing option</span>
                <span>{formatCurrency(towingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Processing Fee</span>
                <span>{formatCurrency(processingFee)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Cash Total</span>
                <span>{formatCurrency(cashTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Bank Total</span>
                <span>{formatCurrency(bankTotal)}</span>
              </div>
              {formData.payment === 'installment' && (
                <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Down payment ({formData.downPaymentPercent})</span>
                    <span>{formatCurrency(downPaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Financed amount</span>
                    <span>{formatCurrency(financedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Installment payment</span>
                    <span>{formatCurrency(installmentPayment)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Estimated late fee</span>
                    <span>{formatCurrency(estimatedLateFee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Installment total</span>
                    <span>{formatCurrency(installmentTotal)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {formData.payment === 'installment' && installmentSchedule.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <h4 className="font-semibold mb-3">Amortization Schedule</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead>
                    <tr>
                      <th className="pb-2">Period</th>
                      <th className="pb-2">Payment</th>
                      <th className="pb-2">Principal</th>
                      <th className="pb-2">Interest</th>
                      <th className="pb-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installmentSchedule.map((row) => (
                      <tr key={row.period} className="border-t border-gray-100">
                        <td className="py-2">{row.period}</td>
                        <td className="py-2">{formatCurrency(row.payment)}</td>
                        <td className="py-2">{formatCurrency(row.principal)}</td>
                        <td className="py-2">{formatCurrency(row.interest)}</td>
                        <td className="py-2">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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