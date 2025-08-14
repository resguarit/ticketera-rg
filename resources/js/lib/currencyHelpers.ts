/**
 * Helpers para formateo de moneda y números
 */

export const formatCurrency = (amount: number, showCurrency = true): string => {
  const formatted = amount.toLocaleString('es-AR');
  return showCurrency ? `$${formatted} ARS` : `$${formatted}`;
};

export const formatPrice = (price: number): string => {
  return `$${price.toLocaleString('es-AR')}`;
};

export const formatPriceWithCurrency = (price: number): string => {
  return `$${price.toLocaleString('es-AR')} ARS`;
};

export const formatNumber = (number: number): string => {
  return number.toLocaleString('es-AR');
};
