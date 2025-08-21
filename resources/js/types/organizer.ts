export interface PersonItem {
  id: number;
  name: string;
  last_name: string;
  phone: string | null;
  dni?: string | null;
  address?: string | null;
}

export interface EventItem {
  id: number;
  name: string;
  description: string;
  banner_url: string | null;
  created_at: string;
  category: { id: number; name: string };
  venue: { id: number; name: string; address: string; city: string };
}

export interface UserItem {
  id: number;
  email: string;
  role: string;
  created_at: string;
  organizer_id?: number | null;
  person: PersonItem;
}

export interface OrganizerItem {
  id: number;
  name: string;
  referring: string;
  email: string;
  phone: string;
  logo_url: string | null;
  image_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  tax: string | null;
  created_at: string;
  events: EventItem[];
  users: UserItem[];
}

export interface CredentialsFlash { email: string; password: string; }
