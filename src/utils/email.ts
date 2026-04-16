import * as emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const NOTIFICATION_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const RECEIPT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_RECEIPT_TEMPLATE_ID;

const sendEmail = async (templateId: string, templateParams: Record<string, unknown>) => {
  if (!SERVICE_ID || !PUBLIC_KEY || !templateId) {
    throw new Error('EmailJS configuration is missing. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_PUBLIC_KEY and template IDs.');
  }
  return emailjs.send(SERVICE_ID, templateId, templateParams, PUBLIC_KEY);
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
  }
) => {
  return sendEmail(NOTIFICATION_TEMPLATE_ID, {
    to_email: toEmail,
    subject,
    headline,
    body_text: bodyText,
    button_text: options?.buttonText || '',
    button_url: options?.buttonUrl || '',
    details_html: options?.detailsHtml || '',
    footer_text: options?.footerText || '',
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
  summaryHtml: string
) => {
  const subject = 'Your order receipt from Ancar Motors Inc';
  const headline = 'Order receipt confirmed';
  const bodyText = `Thank you for your purchase. Your order is being processed and we have all the details below.`;

  return sendEmail(RECEIPT_TEMPLATE_ID, {
    to_email: toEmail,
    subject,
    headline,
    body_text: bodyText,
    details_html: summaryHtml,
    footer_text: 'If you have any questions, reply to this email or contact our support team.',
  });
};

export const sendOrderStatusNoticeEmail = async (
  toEmail: string,
  orderCode: string,
  status: string,
  detailsHtml: string
) => {
  const subject = `Order status updated: ${orderCode}`;
  const headline = 'Order status changed';
  const bodyText = `Your order status has been updated to ${status}. Here are the latest details for your reference.`;

  return sendNotificationEmail(toEmail, subject, headline, bodyText, {
    detailsHtml,
    footerText: 'You will be notified again whenever the order status changes.',
  });
};

export const sendInstallmentPaymentNoticeEmail = async (
  toEmail: string,
  orderCode: string,
  installmentHtml: string
) => {
  const subject = `Installment payment schedule for ${orderCode}`;
  const headline = 'Installment payment details';
  const bodyText = `Your installment payment plan has been updated. Review the schedule and amounts below.`;

  return sendNotificationEmail(toEmail, subject, headline, bodyText, {
    detailsHtml: installmentHtml,
    footerText: 'Please keep this email for your records and reach out if you have any questions.',
  });
};
