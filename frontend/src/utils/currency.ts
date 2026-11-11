/**
 * Official Indian Rupee (INR) Formatter for Ever Grow Schools ERP
 * Conforms to RBI / Indian numbering standard (e.g. ₹26,000.00, ₹1,84,000.00)
 */
export const formatINR = (amount: number | string | null | undefined): string => {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatINRLarge = (amount: number | string | null | undefined): string => {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export default formatINR;
