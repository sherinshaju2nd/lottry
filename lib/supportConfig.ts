// Shared "Support Us" payment configuration (UPI + Buy Me a Coffee).
// Used by the /support page and the sidebar SupportUsCard.

export const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/sherin80";
export const UPI_ID = "sherinshaju80-2@okicici";
export const UPI_PAYEE_NAME = "Sherin Shaju";

export const getCleanUpiAmount = (amt: string): string => {
  const num = parseFloat(amt);
  return Number.isNaN(num) || num <= 0 ? "50.00" : num.toFixed(2);
};

/** Builds a UPI deep link. Omit the amount to let the payer choose it in GPay / PhonePe / Paytm. */
export const getUpiPayUrl = (amt?: string): string => {
  const amountPart = amt ? `&am=${getCleanUpiAmount(amt)}` : "";
  return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}${amountPart}&cu=INR&tn=${encodeURIComponent("Kerala Lottery App Support")}`;
};
