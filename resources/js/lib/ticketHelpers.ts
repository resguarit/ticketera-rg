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
