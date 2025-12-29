import type { Ciudad } from './ciudad';
import type { Event } from './event';
import type { Sector } from './sector';

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  province?: string;
  full_address: string;
  eventos_count: number;
  sectors_count: number;
  coordinates?: string;
  google_maps_url?: string; // NUEVO
  banner_url?: string;
  referring?: string;
  ciudad_id?: number;
  provincia_id?: number;
  ciudad?: {
    id: number;
    name: string;
    provincia_id: number;
  };
  sectors?: Sector[];
}

export interface VenueRelations {
  ciudad: Ciudad;
  eventos: Event[];
  sectors: Sector[];
}
