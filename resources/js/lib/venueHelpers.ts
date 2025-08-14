/**
 * Helpers para información de venues/recintos
 */

export const getVenueLocation = (venue: any): string => {
  return `${venue.name}, ${venue.city}`;
};

export const getVenueFullAddress = (venue: any): string => {
  return `${venue.address}, ${venue.city}`;
};

export const getVenueCompleteAddress = (venue: any): string => {
  return `${venue.address}, ${venue.city}, ${venue.province}`;
};
