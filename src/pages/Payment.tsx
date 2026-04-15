import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getOrder, updateOrder } from '../utils/api';
import { toast } from 'react-toastify';
import * as emailjs from '@emailjs/browser';

type Step = 'otp' | 'payment' | 'verification' | 'receipt';

const Payment: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');

  const [currentStep, setCurrentStep] = useState<Step>('otp');
  const [order, setOrder] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!user || !orderId) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderData = await getOrder(parseInt(orderId));
        setOrder(orderData);
        setTransactionData(
          orderData.product_transaction ? JSON.parse(orderData.product_transaction) : null
        );
      } catch {
        toast.error('Order not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [user, orderId, navigate]);

  const sendOtp = async () => {
    if (!user?.email) return;

    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`otp_${orderId}`, otpCode); // Mock storage

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: user.email,
          otp: otpCode,
          order_id: orderId,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setOtpSent(true);
      toast.success('OTP sent to your email');
    } catch {
      toast.error('Failed to send OTP');
    }
  };

  const verifyOtp = () => {
    const storedOtp = localStorage.getItem(`otp_${orderId}`);
    if (otp === storedOtp) {
      setCurrentStep('payment');
      toast.success('OTP verified');
    } else {
      toast.error('Invalid OTP');
    }
  };

  const processPayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Mock payment processing
    setTimeout(() => {
      setCurrentStep('verification');
    }, 2000);
  };

  const completePayment = async () => {
    if (!orderId) return;

    try {
      await updateOrder(parseInt(orderId), { product_status: 'completed' });
      setCurrentStep('receipt');
      toast.success('Payment completed successfully');
    } catch {
      toast.error('Failed to complete payment');
    }
  };

  const formatCurrency = (value: number | string | null | undefined) => {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const paymentModeLabel = order?.product_payment === 'installment'
    ? 'Installment'
    : order?.product_payment === 'bank'
    ? 'Bank Payment'
    : 'Cash';

  const amountDue = (() => {
    if (!transactionData) return order?.product_total_price || 0;
    if (order?.product_payment === 'cash') return transactionData.paymentDetails?.cashTotal || order.product_total_price;
    if (order?.product_payment === 'bank') return transactionData.paymentDetails?.bankTotal || order.product_total_price;
    if (order?.product_payment === 'installment') return transactionData.paymentDetails?.installment?.installmentTotal || order.product_total_price;
    return order.product_total_price;
  })();

  const installmentInfo = order?.product_payment === 'installment'
    ? transactionData?.paymentDetails?.installment
    : null;

  const paymentOptions = order?.product_payment === 'installment'
    ? [
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
      ]
    : [
        { value: 'cash', label: 'Cash / Over-the-counter' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
      ];

  const transactionSummary = transactionData?.paymentDetails || {};

  const orderSummaryLines = [
    { label: 'Subtotal', value: transactionSummary.subtotal ?? order?.product_total_price },
    { label: 'Shipping', value: transactionSummary.shippingCost ?? 0 },
    { label: 'Processing fee', value: transactionSummary.processingFee ?? 0 },
  ];

  if (order?.product_payment === 'bank') {
    orderSummaryLines.push({ label: 'Bank transaction fee', value: transactionSummary.bankTransactionFee ?? 0 });
  }

  if (order?.product_payment === 'installment' && installmentInfo) {
    orderSummaryLines.push({ label: `Down payment (${installmentInfo.downPaymentPercent}%)`, value: installmentInfo.downPaymentAmount ?? 0 });
    orderSummaryLines.push({ label: 'Financed amount', value: installmentInfo.financedAmount ?? 0 });
    orderSummaryLines.push({ label: 'Installment payment', value: installmentInfo.installmentPayment ?? 0 });
  }

  orderSummaryLines.push({ label: 'Amount Due', value: amountDue });

  const isPaymentSelectionDisabled = !order?.product_payment;

  const sendReceipt = async () => {
    if (!user?.email || !order || !orderId) return;

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_RECEIPT_TEMPLATE_ID,
        {
          to_email: user.email,
          order_id: orderId,
          total_price: order.product_total_price,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      toast.success('Receipt sent to your email');
    } catch {
      toast.error('Failed to send receipt');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Payment Gateway</h1>

          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            {(['otp', 'payment', 'verification', 'receipt'] as Step[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === step ? 'bg-blue-600 text-white' :
                  ['otp', 'payment', 'verification', 'receipt'].indexOf(currentStep) > index ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm capitalize">{step}</span>
                {index < 3 && <div className="w-12 h-1 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
            <div className="grid gap-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Vehicle</span>
                <span>{order.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Qty</span>
                <span>{order.product_quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment type</span>
                <span>{paymentModeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount due</span>
                <span>{formatCurrency(amountDue)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Option</span>
                <span>{order.product_shipping_option}</span>
              </div>
            </div>
          </div>

          {currentStep === 'otp' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Verify Your Identity</h2>
              <p>We've sent a 6-digit OTP to your email for verification.</p>
              {!otpSent && (
                <button
                  onClick={sendOtp}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Send OTP
                </button>
              )}
              {otpSent && (
                <>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full border rounded px-3 py-2"
                    maxLength={6}
                  />
                  <button
                    onClick={verifyOtp}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Verify OTP
                  </button>
                </>
              )}
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Complete {paymentModeLabel} Payment</h2>
              <p className="text-sm text-gray-600">
                Please choose a payment gateway to finish your order. The current order flow is based on the selected {paymentModeLabel.toLowerCase()} option.
              </p>
              <div className="space-y-2">
                {paymentOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      value={option.value}
                      checked={paymentMethod === option.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4 text-sm text-gray-700">
                <div className="font-semibold mb-2">Payment details</div>
                {orderSummaryLines.map((line) => (
                  <div key={line.label} className="flex justify-between py-1">
                    <span>{line.label}</span>
                    <span>{formatCurrency(line.value)}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={processPayment}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={!paymentMethod || isPaymentSelectionDisabled}
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {currentStep === 'verification' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Verification</h2>
              <p>Processing your payment...</p>
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <button
                onClick={completePayment}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Complete Payment
              </button>
            </div>
          )}

          {currentStep === 'receipt' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Successful</h2>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-green-800">Your order has been completed successfully!</p>
                <p className="text-sm text-gray-600 mt-2">Order ID: {orderId}</p>
                <p className="text-sm text-gray-600">Payment type: {paymentModeLabel}</p>
                <p className="text-sm text-gray-600">Amount paid: {formatCurrency(amountDue)}</p>
                {installmentInfo && (
                  <div className="mt-3 border-t border-green-200 pt-3 text-sm text-gray-700">
                    <div className="font-semibold">Installment plan</div>
                    <div className="flex justify-between py-1">
                      <span>Term</span>
                      <span>{installmentInfo.termMonths} months</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Frequency</span>
                      <span>{installmentInfo.repaymentFrequency}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Monthly payment</span>
                      <span>{formatCurrency(installmentInfo.installmentPayment)}</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={sendReceipt}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
              >
                Send Receipt to Email
              </button>
              <button
                onClick={() => navigate('/my-activities')}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                View My Activities
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;