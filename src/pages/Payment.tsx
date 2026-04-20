import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getOrder, updateOrder, getUserById } from '../utils/api';
import { sendNotificationEmail, sendReceiptSummaryEmail } from '../utils/email';
import { toast } from 'react-toastify';

type Step = 'user_info' | 'payment' | 'verification' | 'receipt';

const Payment: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');

  const [currentStep, setCurrentStep] = useState<Step>('user_info');
  const [order, setOrder] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [transactionResult, setTransactionResult] = useState<'success' | 'failed' | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const validatePaymentDetails = () => {
    if (paymentMethod === 'credit_card') {
      if (!cardNumber || !cardHolder || !expiryDate || !cvc) {
        toast.error('Please fill in all credit card details.');
        return false;
      }
      const normalizedCard = cardNumber.replace(/\s+/g, '');
      if (!/^\d{12,19}$/.test(normalizedCard)) {
        toast.error('Enter a valid credit card number.');
        return false;
      }
      if (!/^\d{3,4}$/.test(cvc)) {
        toast.error('Enter a valid card CVC.');
        return false;
      }
    }
    if (paymentMethod === 'bank_transfer') {
      if (!bankName || !accountNumber || !accountHolder) {
        toast.error('Please fill in all bank transfer details.');
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const parsedOrderId = orderId ? Number(orderId) : NaN;

    if (!user || !orderId || Number.isNaN(parsedOrderId) || parsedOrderId <= 0) {
      toast.error('Invalid payment request');
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderData = await getOrder(parsedOrderId);
        if (!orderData) {
          throw new Error('Order not found');
        }
        if (orderData.user_id !== user.id.toString()) {
          toast.error('You are not authorized to view this payment.');
          navigate('/');
          return;
        }
        setOrder(orderData);
        setTransactionData(
          orderData.product_transaction ? JSON.parse(orderData.product_transaction) : null
        );
      } catch {
        toast.error('Order not found');
        navigate('/');
      }
    };

    const fetchUserData = async () => {
      try {
        const fullUser = await getUserById(user.id);
        setUserData(fullUser);
        const verificationStatus = fullUser?.id_verification_status || '';
        if (!['verified', 'approved'].includes(verificationStatus)) {
          navigate('/profile?tab=identity');
          return;
        }
        setDeliveryAddress(fullUser?.user_address || '');
        setCurrentStep('payment');
      } catch {
        toast.error('Failed to load user data');
        navigate('/');
      }
    };

    fetchOrder();
    fetchUserData().finally(() => setLoading(false));
  }, [user, orderId, navigate]);

  const mockPaymentProcess = async (method: string, amount: number) => {
    setPaymentProcessing(true);
    setTransactionResult(null);
    const result = await new Promise<'success' | 'failed'>((resolve) => {
      setTimeout(() => {
        const successRate = method === 'bank_transfer' ? 0.85 : method === 'credit_card' ? 0.9 : 0.95;
        const isSuccessful = Math.random() < successRate;
        resolve(isSuccessful ? 'success' : 'failed');
      }, 1600);
    });
    setPaymentProcessing(false);
    return result;
  };

  const proceedToPayment = () => {
    setCurrentStep('payment');
  };

  const processPayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (!validatePaymentDetails()) {
      return;
    }
    if (!order) {
      toast.error('Order not loaded');
      return;
    }

    const result = await mockPaymentProcess(paymentMethod, Number(amountDue));
    setTransactionResult(result);
    setPaymentDetails({ method: paymentMethod, amount: amountDue, timestamp: new Date().toISOString() });

    if (result === 'success') {
      setCurrentStep('verification');
      toast.success('Payment authorization succeeded. Finalizing transaction...');
    } else {
      toast.error('Payment failed. Please retry or choose another method.');
    }
  };

  const completePayment = async () => {
    if (!orderId) return;

    try {
      await updateOrder(parseInt(orderId), {
        product_payment_status: 'paid',
        delivery_address: deliveryAddress,
      });
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
    if (order?.product_payment === 'installment') return transactionData.paymentDetails?.installment?.installmentPayment || order.product_total_price;
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
    { label: 'Subtotal', value: transactionSummary.originalSubtotal ?? order?.product_total_price },
    { label: 'Shipping', value: transactionSummary.shippingCost ?? 0 },
    { label: 'Processing fee', value: transactionSummary.processingFee ?? 0 },
  ];

  if (order?.discount_amount && order.discount_amount > 0) {
    orderSummaryLines.push({ label: 'Discount', value: -Math.abs(order.discount_amount) });
  }

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

    const detailsHtml = `
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td colspan="2" style="padding:8px;"><img src="${order.product_img_url}" alt="${order.product_name}" style="width:100px; height:100px; object-fit:cover; border-radius:8px;" /></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>Order code</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${order.order_code || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>Vehicle</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${order.product_name} (${order.product_model})</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>Payment type</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${paymentModeLabel}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>Delivery address</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${deliveryAddress || order.delivery_address || 'N/A'}</td></tr>
        ${order.voucher_code ? `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>Voucher used</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${order.voucher_code}</td></tr>` : ''}
        ${order.discount_amount ? `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>Discount</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">-${formatCurrency(order.discount_amount)}</td></tr>` : ''}
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>Amount due</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${formatCurrency(amountDue)}</td></tr>
      </table>
    `;

    let combinedDetailsHtml = detailsHtml;

    if (order.product_payment === 'installment' && installmentInfo) {
      combinedDetailsHtml += `
        <div style="margin-top:20px;">
          <h3 style="margin-bottom: 10px; color: #2563eb;">Installment Plan Details</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr style="background-color:#f9fafb;">
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Down payment</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${formatCurrency(installmentInfo.downPaymentAmount)} (${installmentInfo.downPaymentPercent}%)</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Financed amount</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${formatCurrency(installmentInfo.financedAmount)}</td>
            </tr>
            <tr style="background-color:#f9fafb;">
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Installment</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${formatCurrency(installmentInfo.installmentPayment)} / month</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Term</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${installmentInfo?.termMonths ?? 'N/A'} months</td>
            </tr>
          </table>
        </div>
      `;
    }

    const receiptSubject = order.product_payment === 'installment'
      ? `Installment Payment Receipt - ${order.order_code || 'Order'}`
      : `Payment Receipt - ${order.order_code || 'Order'}`;
    const receiptHeadline = order.product_payment === 'installment'
      ? 'Installment Payment Receipt'
      : 'Payment Receipt';
    const receiptBodyText = order.product_payment === 'installment'
      ? 'Thank you for your installment payment. Please review the payment details and schedule below.'
      : 'Thank you for your payment. Please review the details below.';

    try {
      await sendReceiptSummaryEmail(
        user.email,
        receiptSubject,
        receiptHeadline,
        receiptBodyText,
        combinedDetailsHtml
      );

      toast.success('Receipt sent to your email');
    } catch (error: any) {
      console.error('Failed to send receipt', error);
      toast.error(error?.message || 'Failed to send receipt');
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Payment Gateway</h1>

          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            {(['user_info', 'payment', 'verification', 'receipt'] as Step[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === step ? 'bg-blue-600 text-white' :
                  ['user_info', 'payment', 'verification', 'receipt'].indexOf(currentStep) > index ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm capitalize">{step.replace('_', ' ')}</span>
                {index < 3 && <div className="w-12 h-1 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
            <div className="flex items-center gap-4 mb-4">
              <img src={order.product_img_url} alt={order.product_name} className="w-16 h-16 object-cover rounded" />
              <div>
                <div className="font-semibold">{order.product_name}</div>
                <div className="text-sm text-gray-600">{order.product_model}</div>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Order code</span>
                <span>{order.order_code || 'N/A'}</span>
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

          {currentStep === 'user_info' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">User Information</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span>{userData?.user_name || user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{userData?.user_phone_number || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">Delivery Address</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="registered"
                    name="address"
                    checked={!useCustomAddress}
                    onChange={() => setUseCustomAddress(false)}
                  />
                  <label htmlFor="registered" className="text-sm">Use registered address</label>
                </div>
                <div className="text-sm text-gray-600 ml-4">
                  {userData?.user_address || 'No address registered'}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="custom"
                    name="address"
                    checked={useCustomAddress}
                    onChange={() => setUseCustomAddress(true)}
                  />
                  <label htmlFor="custom" className="text-sm">Use custom address</label>
                </div>
                {useCustomAddress && (
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Enter custom delivery address"
                    rows={3}
                  />
                )}
              </div>
              <button
                onClick={proceedToPayment}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Complete {paymentModeLabel} Payment</h2>
              <p className="text-sm text-gray-600">
                Choose a payment channel and submit a mock payment. The system will simulate success or failure so you can confirm the payment result.
              </p>
              <div className="space-y-2">
                {paymentOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="radio"
                      value={option.value}
                      checked={paymentMethod === option.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
                  <h3 className="font-semibold">Credit Card Details</h3>
                  <div className="grid gap-4">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card number"
                      className="w-full border rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Cardholder name"
                      className="w-full border rounded-md px-3 py-2"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="Expiry MM/YY"
                        className="w-full border rounded-md px-3 py-2"
                      />
                      <input
                        type="text"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="CVC"
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}
              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
                  <h3 className="font-semibold">Bank Transfer Details</h3>
                  <div className="grid gap-4">
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Bank name"
                      className="w-full border rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account number"
                      className="w-full border rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Account holder name"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              )}
              <div className="bg-white border border-gray-200 rounded-md p-4 text-sm text-gray-700">
                <div className="font-semibold mb-2">Payment details</div>
                {orderSummaryLines.map((line) => (
                  <div key={line.label} className="flex justify-between py-1">
                    <span>{line.label}</span>
                    <span>{formatCurrency(line.value)}</span>
                  </div>
                ))}
              </div>
              {paymentMethod && (
                <div className="rounded-lg border border-gray-200 bg-slate-50 p-4 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  <div className="font-semibold mb-2">Mock payment flow</div>
                  {paymentMethod === 'cash' && (
                    <p>Cash payment is set to over-the-counter processing. You will receive instructions to pay at an authorized branch.</p>
                  )}
                  {paymentMethod === 'bank_transfer' && (
                    <p>Bank payment simulates transfer processing. Use the provided bank account details to complete the transfer.</p>
                  )}
                  {paymentMethod === 'credit_card' && (
                    <p>Installment payments simulate card authorization. Enter card details and complete the schedule if the mock transaction succeeds.</p>
                  )}
                </div>
              )}
              <button
                onClick={processPayment}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={!paymentMethod || isPaymentSelectionDisabled || paymentProcessing}
              >
                {paymentProcessing ? 'Processing payment...' : 'Proceed to Payment'}
              </button>
              {transactionResult === 'failed' && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
                  The payment failed. Please retry or select a different payment method.
                </div>
              )}
            </div>
          )}

          {currentStep === 'verification' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Verification</h2>
              <p>Your payment has been authorized. Finalizing the transaction now.</p>
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                {paymentDetails ? (
                  <>
                    <div className="font-semibold">Transaction summary</div>
                    <div className="grid gap-2 pt-2">
                      <div className="flex justify-between"><span>Method</span><span>{paymentDetails.method}</span></div>
                      <div className="flex justify-between"><span>Amount</span><span>{formatCurrency(paymentDetails.amount)}</span></div>
                      <div className="flex justify-between"><span>Timestamp</span><span>{new Date(paymentDetails.timestamp).toLocaleString()}</span></div>
                    </div>
                  </>
                ) : (
                  <p>Confirming the payment details.</p>
                )}
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