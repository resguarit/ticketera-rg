/**
 * Helpers para formateo de moneda y números
 */

export const formatCurrency = (amount: number, showCurrency = true): string => {
  // Verificar si tiene decimales distintos de 0
  const hasDecimals = amount % 1 !== 0;
  
  const formatted = amount.toLocaleString('es-AR', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
  return showCurrency ? `$${formatted} ARS` : `$${formatted}`;
};

export const formatPrice = (price: number): string => {
  const hasDecimals = price % 1 !== 0;
  
  return `$${price.toLocaleString('es-AR', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  })}`;
};

export const formatPriceWithCurrency = (price: number): string => {
  const hasDecimals = price % 1 !== 0;
  
  return `$${price.toLocaleString('es-AR', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  })} ARS`;
};

export const formatNumber = (number: number): string => {
  return number.toLocaleString('es-AR');
};
