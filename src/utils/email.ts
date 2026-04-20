import * as emailjs from '@emailjs/browser';

const SERVICE_ID =
  import.meta.env.VITE_EMAILJS_SERVICE_ID ||
  import.meta.env.EMAILJS_SERVICE_ID ||
  process.env?.EMAILJS_SERVICE_ID;
const PUBLIC_KEY =
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY ||
  import.meta.env.EMAILJS_PUBLIC_KEY ||
  process.env?.EMAILJS_PUBLIC_KEY;
const NOTIFICATION_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID ||
  import.meta.env.EMAILJS_TEMPLATE_NOTIFICATION ||
  process.env?.EMAILJS_TEMPLATE_NOTIFICATION;
const RECEIPT_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_RECEIPT_TEMPLATE_ID ||
  import.meta.env.EMAILJS_TEMPLATE_RECEIPT ||
  process.env?.EMAILJS_TEMPLATE_RECEIPT;

if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY);
}

const sendEmail = async (templateId: string, templateParams: Record<string, unknown>) => {
  if (!SERVICE_ID || !PUBLIC_KEY || !templateId) {
    throw new Error('EmailJS configuration is missing. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_PUBLIC_KEY and template IDs.');
  }

  try {
    if (import.meta.env.DEV) {
      console.debug('EmailJS send', { serviceId: SERVICE_ID, templateId, templateParams, publicKey: PUBLIC_KEY });
    }
    return await emailjs.send(SERVICE_ID, templateId, templateParams, PUBLIC_KEY);
  } catch (error: any) {
    const details = error?.text || error?.statusText || error?.message || JSON.stringify(error);
    console.error('EmailJS send failed', { serviceId: SERVICE_ID, templateId, templateParams, publicKey: PUBLIC_KEY, details, error });
    throw new Error(details || 'EmailJS send failed');
  }
};

const formatAmount = (amount: number | string | null | undefined) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
};

export const generateVerificationCode = (length = 6): string => {
  const digits = '0123456789';
  return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join('');
};

export const sendNotificationEmail = async (
  toEmail: string,
  subject: string,
  headline: string,
  bodyText: string,
  options?: {
    buttonText?: string;
    buttonUrl?: string;
    detailsHtml?: string;
    footerText?: string;
    extraParams?: Record<string, unknown>;
  }
) => {
  const templateParams: Record<string, any> = {
    to_email: toEmail,
    email: toEmail,
    reply_to: toEmail,
    subject,
    headline,
    body_text: bodyText,
  };

  // Only add optional fields if they have non-empty values
  // EmailJS corrupts templates when variables are referenced but not provided
  // ALWAYS provide button_url (even as fallback) since template references it
  if (options?.buttonText) templateParams.button_text = options.buttonText;
  templateParams.button_url = options?.buttonUrl || '#';  // Always provide button_url to prevent template corruption
  if (options?.detailsHtml) templateParams.details_html = options.detailsHtml;
  if (options?.footerText) templateParams.footer_text = options.footerText;

  // Add extraParams, filtering out empty strings but keeping other falsy values
  if (options?.extraParams) {
    Object.entries(options.extraParams).forEach(([key, value]) => {
      // Skip undefined/null/empty strings, but keep 0, false, etc.
      if (value !== '' && value !== null && value !== undefined) {
        templateParams[key] = value;
      }
    });
  }

  console.log('[sendNotificationEmail] Requested params:', {
    toEmail,
    subject,
    headline,
    bodyText: bodyText.substring(0, 100),
    options,
  });
  console.log('[sendNotificationEmail] Final EmailJS template params (empty strings filtered):', templateParams);

  return sendEmail(NOTIFICATION_TEMPLATE_ID, templateParams);
};

export const sendReceiptSummaryEmail = async (
  toEmail: string,
  subject: string,
  headline: string,
  bodyText: string,
  detailsHtml: string,
  footerText?: string
) => {
  return sendEmail(RECEIPT_TEMPLATE_ID, {
    to_email: toEmail,
    subject,
    headline,
    body_text: bodyText,
    details_html: detailsHtml,
    footer_text: footerText || '',
  });
};

export const sendVerificationEmail = async (
  toEmail: string,
  code: string,
  method: 'code' | 'link',
  verificationLink?: string
) => {
  const subject = 'Verify your Ancar Motors Inc email address';
  const headline = 'Please verify your email address';
  const bodyText =
    method === 'link'
      ? `Click the button below to confirm your email address and complete your account setup.`
      : `Enter the verification code below in your Ancar Motors account to confirm your email address.`;

  const detailsHtml = method === 'code'
    ? `<div style="font-size:16px; line-height:1.5;">Your verification code is:<br /><strong style="font-size:24px; color:#2563eb;">${code}</strong></div>`
    : `<div style="font-size:16px; line-height:1.5;">Your verification link is ready. Click the button below to verify your email.</div>`;

  return sendNotificationEmail(toEmail, subject, headline, bodyText, {
    buttonText: method === 'link' ? 'Verify Email' : 'Verify Now',
    buttonUrl: method === 'link' ? verificationLink || '' : '',
    detailsHtml,
    footerText: 'If you did not request this, you can safely ignore this email.',
    extraParams: {
      code,
      otp: code,
      verification_code: code,
      verification_link: verificationLink || '',
      link: verificationLink || '',
    },
  });
};

export const sendPasswordChangeVerificationEmail = async (
  toEmail: string,
  code: string,
  method: 'code' | 'link',
  verificationLink?: string
) => {
  const subject = 'Confirm your password change';
  const headline = 'Password change verification required';
  const bodyText =
    method === 'link'
      ? `We received a request to change your password. Use the link below to confirm it.`
      : `We received a request to change your password. Enter the one-time code below to continue.`;

  const detailsHtml = method === 'code'
    ? `<div style="font-size:16px; line-height:1.5;">Your password verification code is:<br /><strong style="font-size:24px; color:#2563eb;">${code}</strong></div>`
    : `<div style="font-size:16px; line-height:1.5;">Click the button below to verify and continue changing your password.</div>`;

  return sendNotificationEmail(toEmail, subject, headline, bodyText, {
    buttonText: method === 'link' ? 'Verify Password Change' : 'Proceed',
    buttonUrl: method === 'link' ? verificationLink || '' : '',
    detailsHtml,
    footerText: 'If you did not request a password change, please ignore this email or contact support immediately.',
    extraParams: {
      code,
      otp: code,
      verification_code: code,
      verification_link: verificationLink || '',
      link: verificationLink || '',
    },
  });
};

export const sendTestDriveReceiptEmail = async (
  toEmail: string,
  userName: string,
  vehicleName: string,
  vehicleModel: string,
  requestedDate: string,
  requestedTime: string,
  additionalDetails?: string
) => {
  const subject = 'Your Ancar Motors test drive request';
  const headline = 'Test drive request confirmed';
  const bodyText = `Thank you for requesting a test drive with Ancar Motors Inc. Here are the details of your scheduled visit.`;
  const detailsHtml = `
    <table style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>Customer</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${userName}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>Vehicle</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${vehicleName} (${vehicleModel})</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>Date</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${requestedDate}</td></tr>
      <tr><td style="padding:8px;"><strong>Time</strong></td><td style="padding:8px;">${requestedTime}</td></tr>
    </table>
    ${additionalDetails ? `<div style="margin-top:12px;font-size:14px;color:#374151;">${additionalDetails}</div>` : ''}
  `;

  return sendEmail(RECEIPT_TEMPLATE_ID, {
    to_email: toEmail,
    subject,
    headline,
    body_text: bodyText,
    details_html: detailsHtml,
    footer_text: 'We will contact you with any further scheduling updates.',
  });
};

export const sendOrderReceiptEmail = async (
  toEmail: string,
  order: any,
  user: any,
  vehicle: any
) => {
  const subject = `Order Receipt - ${order.order_code}`;
  const headline = 'Your Order Has Been Confirmed';
  const bodyText = `Thank you for your purchase from Ancar Motors Inc. Your order has been successfully placed and is now being processed.`;

  const detailsHtml = `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Order Details</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;border:1px solid #e5e7eb;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Order Code</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${order.order_code}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Order Date</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${new Date(order.order_timestamp).toLocaleDateString()}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Status</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${order.product_status}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Customer Information</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;border:1px solid #e5e7eb;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Name</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${user.user_name}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Email</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${user.user_email}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Phone</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${user.user_phone_number || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Address</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${user.user_address || 'N/A'}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Vehicle Details</h3>
      <div style="display: flex; align-items: flex-start; border: 1px solid #e5e7eb; padding: 15px; background-color: #f9fafb;">
        ${vehicle.vehicle_img_url ? `<img src="${vehicle.vehicle_img_url}" alt="${vehicle.vehicle_name}" style="width: 120px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 4px;" />` : ''}
        <div style="flex: 1;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937;">${vehicle.vehicle_name}</h4>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${vehicle.vehicle_make} ${vehicle.vehicle_model} ${vehicle.vehicle_year}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">Color: ${vehicle.vehicle_color}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">Fuel Type: ${vehicle.vehicle_fuel_type}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">Transmission: ${vehicle.vehicle_transmission || 'N/A'}</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Order Summary</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;border:1px solid #e5e7eb;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Quantity</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${order.product_quantity}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Unit Price</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${formatAmount(order.product_base_price)}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Total Amount</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-weight: bold;">${formatAmount(order.product_total_price)}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Payment Method</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${order.product_payment}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Shipping Option</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${order.product_shipping_option}</td>
        </tr>
      </table>
    </div>
  `;

  return sendEmail(RECEIPT_TEMPLATE_ID, {
    to_email: toEmail,
    subject,
    headline,
    body_text: bodyText,
    details_html: detailsHtml,
    footer_text: 'Thank you for choosing Ancar Motors Inc. We will keep you updated on your order status.',
  });
};

export const sendOrderStatusEmail = async (
  toEmail: string,
  orderCode: string,
  status: 'confirmed' | 'processing' | 'out_for_delivery' | 'completed' | 'canceled',
  order: any,
  vehicle: any
) => {
  const statusConfig = {
    confirmed: {
      subject: `Order Confirmed - ${orderCode}`,
      headline: 'Your Order Has Been Confirmed',
      bodyText: 'Great news! Your order has been confirmed and is now being prepared for processing.',
      color: '#10b981'
    },
    processing: {
      subject: `Order Processing - ${orderCode}`,
      headline: 'Your Order is Being Processed',
      bodyText: 'Your order is currently being processed. We are preparing your vehicle for delivery.',
      color: '#f59e0b'
    },
    out_for_delivery: {
      subject: `Order Out for Delivery - ${orderCode}`,
      headline: 'Your Order is Out for Delivery',
      bodyText: 'Your order is now out for delivery. Our delivery team will contact you shortly.',
      color: '#3b82f6'
    },
    completed: {
      subject: `Order Completed - ${orderCode}`,
      headline: 'Your Order Has Been Completed',
      bodyText: 'Congratulations! Your order has been successfully completed. Thank you for choosing Ancar Motors Inc.',
      color: '#10b981'
    },
    canceled: {
      subject: `Order Canceled - ${orderCode}`,
      headline: 'Your Order Has Been Canceled',
      bodyText: 'We regret to inform you that your order has been canceled. Please contact our support team for more information.',
      color: '#ef4444'
    }
  };

  const config = statusConfig[status];

  const detailsHtml = `
    <div style="margin-bottom: 20px;">
      <h3 style="color: ${config.color}; margin-bottom: 10px;">Order Information</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;border:1px solid #e5e7eb;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Order Code</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${orderCode}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Status</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-weight: bold; color: ${config.color};">${status.toUpperCase()}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Order Date</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${new Date(order.order_timestamp).toLocaleDateString()}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Vehicle Details</h3>
      <div style="display: flex; align-items: flex-start; border: 1px solid #e5e7eb; padding: 15px; background-color: #f9fafb;">
        ${vehicle.vehicle_img_url ? `<img src="${vehicle.vehicle_img_url}" alt="${vehicle.vehicle_name}" style="width: 120px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 4px;" />` : ''}
        <div style="flex: 1;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937;">${vehicle.vehicle_name}</h4>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${vehicle.vehicle_make} ${vehicle.vehicle_model} ${vehicle.vehicle_year}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">Quantity: ${order.product_quantity}</p>
        </div>
      </div>
    </div>

    ${status === 'out_for_delivery' ? `
    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 8px 0; color: #92400e;">Delivery Information</h4>
      <p style="margin: 0; font-size: 14px; color: #92400e;">Our delivery team will contact you within the next 24 hours to schedule the delivery. Please ensure someone is available to receive the vehicle.</p>
    </div>
    ` : ''}

    ${status === 'completed' ? `
    <div style="background-color: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 8px 0; color: #065f46;">Order Completed Successfully</h4>
      <p style="margin: 0; font-size: 14px; color: #065f46;">Your vehicle has been successfully delivered. We hope you enjoy your new ${vehicle.vehicle_make} ${vehicle.vehicle_model}!</p>
    </div>
    ` : ''}
  `;

  return sendEmail(NOTIFICATION_TEMPLATE_ID, {
    to_email: toEmail,
    subject: config.subject,
    headline: config.headline,
    body_text: config.bodyText,
    details_html: detailsHtml,
    footer_text: status === 'canceled' ? 'Please contact our support team if you have any questions about this cancellation.' : 'Thank you for choosing Ancar Motors Inc.',
  });
};

export const sendBankPaymentEmail = async (
  toEmail: string,
  user: any,
  order: any,
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    reference: string;
  }
) => {
  const subject = `Bank Payment Instructions - Order ${order.order_code}`;
  const headline = 'Bank Payment Required';
  const bodyText = 'Please complete your payment using the bank details provided below. Your order will be processed once payment is confirmed.';

  const detailsHtml = `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Payment Information</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;border:1px solid #e5e7eb;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Order Code</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${order.order_code}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Total Amount</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-weight: bold; color: #dc2626;">${formatAmount(order.product_total_price)}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Payment Reference</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-weight: bold;">${bankDetails.reference}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Bank Transfer Details</h3>
      <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 4px;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;"><strong>Bank Name:</strong></td>
            <td style="padding:8px 0;">${bankDetails.bankName}</td>
          </tr>
          <tr style="background-color: rgba(255,255,255,0.5);">
            <td style="padding:8px 0;"><strong>Account Name:</strong></td>
            <td style="padding:8px 0;">${bankDetails.accountName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><strong>Account Number:</strong></td>
            <td style="padding:8px 0;font-family: monospace; font-weight: bold;">${bankDetails.accountNumber}</td>
          </tr>
        </table>
      </div>
    </div>

    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 8px 0; color: #92400e;">Important Payment Instructions</h4>
      <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
        <li>Please include the payment reference (${bankDetails.reference}) in your transfer description</li>
        <li>Payment must be made within 48 hours to secure your order</li>
        <li>Send payment confirmation to our email or upload receipt in your account</li>
        <li>Processing will begin once payment is verified</li>
      </ul>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Customer Details</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;border:1px solid #e5e7eb;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Name</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${user.user_name}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Email</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${user.user_email}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Phone</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${user.user_phone_number || 'N/A'}</td>
        </tr>
      </table>
    </div>
  `;

  return sendEmail(RECEIPT_TEMPLATE_ID, {
    to_email: toEmail,
    subject,
    headline,
    body_text: bodyText,
    details_html: detailsHtml,
    footer_text: 'Please contact us if you have any questions about the payment process.',
  });
};

export const sendInstallmentPaymentEmail = async (
  toEmail: string,
  user: any,
  order: any,
  installmentDetails: {
    totalAmount: number;
    downPayment: number;
    installmentAmount: number;
    numberOfInstallments: number;
    interestRate: number;
    schedule: Array<{
      installmentNumber: number;
      dueDate: string;
      amount: number;
      remainingBalance: number;
    }>;
  }
) => {
  const subject = `Installment Payment Schedule - Order ${order.order_code}`;
  const headline = 'Your Installment Payment Plan';
  const bodyText = 'Your installment payment plan has been set up. Please review the payment schedule and details below.';

  const detailsHtml = `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Installment Summary</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;border:1px solid #e5e7eb;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Order Code</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${order.order_code}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Total Amount</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${formatAmount(installmentDetails.totalAmount)}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Down Payment</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${formatAmount(installmentDetails.downPayment)}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Monthly Installment</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-weight: bold;">${formatAmount(installmentDetails.installmentAmount)}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Number of Installments</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${installmentDetails.numberOfInstallments}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Interest Rate</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${installmentDetails.interestRate}%</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Payment Schedule</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;border:1px solid #e5e7eb;">
        <thead>
          <tr style="background-color:#2563eb;color:white;">
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Installment #</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Due Date</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Amount</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Remaining Balance</th>
          </tr>
        </thead>
        <tbody>
          ${installmentDetails.schedule.map((payment, index) => `
            <tr style="${index % 2 === 0 ? 'background-color:#f9fafb;' : ''}">
              <td style="padding:8px;border:1px solid #e5e7eb;">${payment.installmentNumber}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${new Date(payment.dueDate).toLocaleDateString()}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${formatAmount(payment.amount)}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${formatAmount(payment.remainingBalance)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 8px 0; color: #92400e;">Payment Instructions</h4>
      <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
        <li>Payments are due on the 1st of each month</li>
        <li>Late payments may incur additional fees</li>
        <li>You will receive payment reminders 3 days before due date</li>
        <li>Contact us immediately if you cannot make a payment</li>
        <li>Early payments can be arranged with prior notice</li>
      </ul>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #2563eb; margin-bottom: 10px;">Customer Information</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;border:1px solid #e5e7eb;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Name</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${user.user_name}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Email</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${user.user_email}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Phone</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${user.user_phone_number || 'N/A'}</td>
        </tr>
      </table>
    </div>
  `;

  return sendEmail(RECEIPT_TEMPLATE_ID, {
    to_email: toEmail,
    subject,
    headline,
    body_text: bodyText,
    details_html: detailsHtml,
    footer_text: 'Please keep this schedule for your records. Contact us if you need to modify your payment plan.',
  });
};
