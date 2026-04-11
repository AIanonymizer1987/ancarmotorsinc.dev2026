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
              <h2 className="text-lg font-semibold">Select Payment Method</h2>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Credit Card
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  PayPal
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Bank Transfer
                </label>
              </div>
              <button
                onClick={processPayment}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                <p className="text-sm text-gray-600">Total: ${order.product_total_price}</p>
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