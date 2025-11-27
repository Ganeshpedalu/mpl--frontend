# Configuration Files

This directory contains configuration files for the application.

## API Configuration (`apiConfig.ts`)

The API configuration file manages API endpoints dynamically based on the environment.

### Setup

1. **Development Mode**: Automatically uses `http://localhost:4000` when running locally
2. **Production Mode**: Update the `productionConfig.baseUrl` with your live API URL

### Example Configuration

```typescript
const productionConfig: ApiConfig = {
  baseUrl: 'https://your-api-domain.com', // Update this
  endpoints: {
    register: '/api/register',
    details: '/api/details',
  },
};
```

### Usage

```typescript
import { getApiUrl, getApiUrlWithParams } from '../config/apiConfig';

// Get full URL for an endpoint
const registerUrl = getApiUrl('register');

// Get URL with query parameters
const detailsUrl = getApiUrlWithParams('details', { mobileNumber: '1234567890' });
```

## Payment Configuration (`paymentConfig.ts`)

The payment configuration file contains all payment-related information.

### Setup

1. Update `upiId` with your UPI ID
2. Add your QR code image to `public/images/payment-qr.png`
3. Update payment method details (Paytm, PhonePe, GPay)
4. Set the registration amount

### Example Configuration

```typescript
export const paymentConfig: PaymentConfig = {
  upiId: 'yourname@upi',
  qrCode: '/images/payment-qr.png',
  paytm: {
    number: '+91 9876543210',
    upiId: 'yourname@paytm',
  },
  phonepe: {
    number: '+91 9876543210',
    upiId: 'yourname@ybl',
  },
  gpay: {
    number: '+91 9876543210',
    upiId: 'yourname@okaxis',
  },
  amount: 300,
};
```

## Social Configuration (`socialConfig.ts`)

The social configuration file contains all social media links and contact information.

### Setup

1. Update `whatsapp.groupLink` with your WhatsApp group invite link
2. Update `whatsapp.contactNumber` with your WhatsApp contact number
3. Update contact information (phone, email)
4. Update social media links (Facebook, Instagram, Twitter)

### Example Configuration

```typescript
export const socialConfig: SocialConfig = {
  whatsapp: {
    groupLink: 'https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK', // WhatsApp group invite link
    contactNumber: '918779490153', // WhatsApp number without + or spaces
  },
  contact: {
    phone: '+918779490153',
    email: 'surajchavan@gmail.com',
  },
  social: {
    facebook: 'https://facebook.com/yourpage',
    instagram: 'https://instagram.com/yourpage',
    twitter: 'https://twitter.com/yourpage',
  },
};
```

### Usage

```typescript
import { getWhatsAppGroupLink, getWhatsAppContactLink, socialConfig } from '../config/socialConfig';

// Get WhatsApp group link
const groupLink = getWhatsAppGroupLink();

// Get WhatsApp contact link
const contactLink = getWhatsAppContactLink();

// Access other social links
const facebookLink = socialConfig.social.facebook;
```

### WhatsApp Group Link

To get your WhatsApp group invite link:
1. Open your WhatsApp group
2. Tap on group name → Invite via link
3. Copy the invite link (format: `https://chat.whatsapp.com/...`)
4. Update `whatsapp.groupLink` in `socialConfig.ts`

## Notes

- All configuration values are loaded dynamically
- No need to rebuild when changing config values (except for API base URL in production)
- Environment detection is automatic based on hostname
- Update social links in one place and they'll be used throughout the app
