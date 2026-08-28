/**
 * Company / Seller Information
 *
 * Used for invoice PDFs, packing slips, and shipping labels.
 * These values are synced with the frontend config at H:\bdm\src\config\company.config.js
 */

module.exports = {
    name: "Synera",
    legalName: "Synera Private Limited",

    // Tax identifiers (India)
    gstin: "09AAACM1234A1Z5",
    pan: "AAACM1234A",
    cin: "U74999UP2024PTC123456",

    // Registered address
    address: {
        addressLine1: "",
        street: "Mr Classic, HSR Layout",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        country: "India"
    },

    // Contact
    phone: "+91 98765 43210",
    email: "billing@synera.com",
    website: "https://syneraaa.vercel.app",

    // Bank details (for invoice payment info)
    bankDetails: {
        bankName: "HDFC Bank",
        accountNumber: "50100XXXXXXXXX",
        ifscCode: "HDFC0001234",
        branch: "Koramangala 6th block",
        accountType: "Current"
    },

    // Invoice defaults
    invoiceDefaults: {
        currency: "INR",
        currencySymbol: "₹",
        termsAndConditions: [
            "All disputes are subject to Bengaluru jurisdiction.",
            "E&OE — Errors and Omissions Excepted."
        ],
        notes: "Thank you for your business."
    }
};
