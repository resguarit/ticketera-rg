/**
 * Helpers para cálculos de tickets y eventos
 */

export const getAvailabilityText = (available: number, total: number): string => {
  return `${available} de ${total} disponibles`;
};

export const calculateSalesPercentage = (sold: number, total: number): number => {
  return total > 0 ? Math.round((sold / total) * 100) : 0;
};

export const calculateTicketSubtotal = (price: number, quantity: number): number => {
  return price * quantity;
};

export const calculateTotalRevenue = (functions: any[]): number => {
  return functions.reduce((sum, func) => 
    sum + func.ticket_types.reduce((funcSum: number, ticket: any) => 
      funcSum + (ticket.quantity_sold * ticket.price), 0), 0
  );
};

export const calculateFunctionRevenue = (ticketTypes: any[]): number => {
  return ticketTypes.reduce((sum, t) => sum + (t.quantity_sold * t.price), 0);
};

// NUEVO: Helper para calcular tickets reales considerando bundles
export const calculateRealTicketCount = (ticketTypes: any[], selectedTickets: Record<number, number>): number => {
  return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
    const ticket = ticketTypes.find((t: any) => t.id === Number(ticketId));
    if (!ticket) return total;
    
    const realQuantity = ticket.is_bundle ? quantity * (ticket.bundle_quantity || 1) : quantity;
    return total + realQuantity;
  }, 0);
};

// NUEVO: Helper para formatear información de bundle
export const formatBundleInfo = (ticket: any, quantity: number): string => {
  if (!ticket.is_bundle) return `${quantity} entradas`;
  
  const bundleQuantity = ticket.bundle_quantity || 1;
  const realTickets = quantity * bundleQuantity;
  
  return `${quantity} lotes (${realTickets} entradas)`;
};
