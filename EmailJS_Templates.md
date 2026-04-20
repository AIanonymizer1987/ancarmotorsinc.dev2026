# EmailJS Templates for Ancar Motors Inc.

This document contains all the EmailJS templates you need to create for your application.

## Template IDs (Add to your .env file)

```env
VITE_EMAILJS_SERVICE_ID=service_hhwzshz
VITE_EMAILJS_PUBLIC_KEY=OMnRruT1S-TVzXGJ-
VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID=template_5wvlb5q
VITE_EMAILJS_RECEIPT_TEMPLATE_ID=template_order_receipt

# The current code uses `VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID` for email verification, password verification, and other notification messages.
# `VITE_EMAILJS_RECEIPT_TEMPLATE_ID` is used for receipts and order/test drive summaries.
```

## 1. Email Verification Template (template_email_verification)

**Subject:** {{subject}}

**HTML Content:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{headline}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">{{headline}}</h1>
  </div>

  <div style="background-color: white; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">{{body_text}}</p>

    {{{details_html}}}

    {{#if button_url}}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{button_url}}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">{{button_text}}</a>
    </div>
    {{/if}}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      <p style="margin: 0;">{{footer_text}}</p>
      <p style="margin: 10px 0 0 0;">Best regards,<br>Ancar Motors Inc. Team</p>
    </div>
  </div>
</body>
</html>
```

## 2. Password Reset Template (template_password_reset)

**Subject:** {{subject}}

**HTML Content:** (Same as Email Verification Template above)

## 3. Order Receipt Template (template_order_receipt)

**Subject:** {{subject}}

**HTML Content:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{headline}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">{{headline}}</h1>
  </div>

  <div style="background-color: white; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">{{body_text}}</p>

    {{{details_html}}}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      <p style="margin: 0;">{{footer_text}}</p>
      <p style="margin: 10px 0 0 0;">Best regards,<br>Ancar Motors Inc. Team</p>
    </div>
  </div>
</body>
</html>
```

## 4. Order Status Template (template_order_status)

**Subject:** {{subject}}

**HTML Content:** (Same as Order Receipt Template above)

## 5. Bank Payment Template (template_bank_payment)

**Subject:** {{subject}}

**HTML Content:** (Same as Order Receipt Template above)

## 6. Installment Payment Template (template_installment_payment)

**Subject:** {{subject}}

**HTML Content:** (Same as Order Receipt Template above)

## How to Create Templates in EmailJS

1. Go to your [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Select your service
3. Click "Email Templates" → "Create New Template"
4. Copy the HTML content above for each template
5. Set the template ID in the settings (match the IDs in your .env file)
6. Save each template

## Template Variables

Each template uses these variables:
- `{{subject}}` - Email subject
- `{{headline}}` - Main heading
- `{{body_text}}` - Main body text
- `{{details_html}}` - HTML content with order/vehicle details
- `{{button_text}}` - Button text (optional)
- `{{button_url}}` - Button URL (optional)
- `{{footer_text}}` - Footer text

## Usage Examples

```typescript
// Email verification
await sendVerificationEmail(user.email, code, 'link', verificationLink);

// Password reset
await sendPasswordChangeVerificationEmail(user.email, code, 'code');

// Order receipt
await sendOrderReceiptEmail(user.email, order, user, vehicle);

// Order status update
await sendOrderStatusEmail(user.email, orderCode, 'confirmed', order, vehicle);

// Bank payment
await sendBankPaymentEmail(user.email, user, order, bankDetails);

// Installment payment
await sendInstallmentPaymentEmail(user.email, user, order, installmentDetails);
```</content>
<parameter name="filePath">c:\Users\Dan\project\ancarmotorsinc.dev2026\EmailJS_Templates.md