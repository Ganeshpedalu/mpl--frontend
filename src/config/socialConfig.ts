// Social Media and Contact Configuration
// Update these values as needed

export interface SocialConfig {
  whatsapp: {
    groupLink: string; // WhatsApp group invite link (e.g., https://chat.whatsapp.com/...)
    contactNumber: string; // WhatsApp contact number (e.g., 918779490153)
  };
  contact: {
    phone: string;
    email: string;
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

export const socialConfig: SocialConfig = {
  whatsapp: {
    groupLink: 'https://chat.whatsapp.com/IhYtNpBENJhKh01YbLsJPa?mode=hqrt3', // Update with your WhatsApp group invite link
    contactNumber: '918779490153', // Update with your WhatsApp contact number
  },
  contact: {
    phone: '+918779490153',
    email: 'surajchavan@gmail.com',
  },
  social: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
  },
};

// Helper function to get WhatsApp group link
export const getWhatsAppGroupLink = (): string => {
  return socialConfig.whatsapp.groupLink;
};

// Helper function to get WhatsApp contact link
export const getWhatsAppContactLink = (): string => {
  return `https://wa.me/${socialConfig.whatsapp.contactNumber}`;
};

