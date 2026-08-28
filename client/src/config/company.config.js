/**
 * Company configuration for Tax Invoice and Shipping Labels.
 * Update these values with your actual business details.
 */
export const COMPANY_INFO = {
  name: 'Synera',
  legalName: 'Synera Private Limited',
  address: {
    street: 'Mr Classic, HSR Layout',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
  },
  gstin: '09AAACM1234A1Z5',
  pan: 'AAACM1234A',
  cin: 'U74999UP2024PTC123456',
  email: 'billing@synera.com',
  phone: '+91 98765 43210',
  website: 'https://syneraaa.vercel.app',
  logo: '/synera-logo.png',
  bankDetails: {
    bankName: 'HDFC Bank',
    accountNumber: '50100XXXXXXXXX',
    ifscCode: 'HDFC0001234',
    branch: 'Koramangala 6th block',
  },
  terms: [
    'All disputes are subject to Bengaluru jurisdiction.',
    'E&OE — Errors and Omissions Excepted.',
  ],
}

/**
 * GST rate configuration
 * Adjust based on product categories
 */
export const GST_CONFIG = {
  defaultRate: 18, // percentage
  isInterState: false, // false = CGST+SGST, true = IGST
}
