export interface PaymentConfig {
  upiId: string;
  qrCode: string; // URL or path to QR code image
  paytm: {
    number: string;
    upiId?: string;
  };
  phonepe: {
    number: string;
    upiId?: string;
  };
  gpay: {
    number: string;
    upiId?: string;
  };
  amount: number;
}

export const paymentConfig: PaymentConfig = {
  upiId: 'chavansuraj481-1@okaxis',
  qrCode: '/images/gallery/paymentQr.jpeg', // Path to QR code image in public folder
  paytm: {
    number: '8779490153',
    upiId: 'chavansuraj481-1@okaxis',
  },
  phonepe: {
    number: '8779490153',
    upiId: 'chavansuraj481-1@okaxis',
  },
  gpay: {
    number: '8779490153',
    upiId: 'chavansuraj481-1@okaxis',
  },
  amount: 300,
};

