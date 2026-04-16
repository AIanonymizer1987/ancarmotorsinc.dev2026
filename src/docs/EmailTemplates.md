# EmailJS Template Setup for Ancar Motors

This project uses only two EmailJS templates for all notification and receipt emails.

## Template 1: Notification / Verification
Use this template for:
- Email verification
- Password change verification
- Order status notices
- Installment payment notices
- Scheduled test drive notifications

### Template variables
- `subject`
- `headline`
- `body_text`
- `button_text`
- `button_url`
- `details_html`
- `footer_text`

### Suggested layout
- Header with logo and `headline`
- Intro paragraph using `body_text`
- A button using `button_text` / `button_url` (hidden if empty)
- A details section with raw HTML from `details_html`
- Footer text from `footer_text`

## Template 2: Receipt / Order Summary
Use this template for:
- Order receipts
- Test drive receipts
- Installment payment receipts

### Template variables
- `subject`
- `headline`
- `body_text`
- `details_html`
- `footer_text`

### Suggested layout
- Header with logo and `headline`
- Intro paragraph using `body_text`
- A table or summary section using `details_html`
- Footer text using `footer_text`

## EmailJS Variables in this project
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`
- `VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID`
- `VITE_EMAILJS_RECEIPT_TEMPLATE_ID`

If you only have one template available, use the notification template for everything and reserve the receipt template for actual order or test drive summaries.
