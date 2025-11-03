/**
 * Helpers para información de venues/recintos
 */

export const getVenueLocation = (venue: any): string => {
  if (!venue) return 'Ubicación no disponible';
  
  const parts = [];
  
  if (venue.name) parts.push(venue.name);
  if (venue.ciudad?.name) parts.push(venue.ciudad.name);
  if (venue.ciudad?.provincia?.name) parts.push(venue.ciudad.provincia.name);
  
  return parts.length > 0 ? parts.join(', ') : 'Ubicación no disponible';
};

export const getVenueFullAddress = (venue: any): string => {
  if (!venue) return 'Dirección no disponible';
  
  const parts = [];
  
  if (venue.address) parts.push(venue.address);
  if (venue.ciudad?.name) parts.push(venue.ciudad.name);
  
  return parts.length > 0 ? parts.join(', ') : 'Dirección no disponible';
};

export const getVenueCompleteAddress = (venue: any): string => {
  if (!venue) return 'Dirección no disponible';
  
  const parts = [];
  
  if (venue.address) parts.push(venue.address);
  if (venue.ciudad?.name) parts.push(venue.ciudad.name);
  if (venue.ciudad?.provincia?.name) parts.push(venue.ciudad.provincia.name);
  
  return parts.length > 0 ? parts.join(', ') : 'Dirección no disponible';
};
