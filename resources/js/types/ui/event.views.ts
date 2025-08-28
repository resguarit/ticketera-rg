import { Event } from '../models/event';
import { Organizer } from '../models/organizer';
import { Venue } from '../models/venue';
import { EventFunction } from '../models/eventFunction'; // Suponiendo que tienes este modelo
import { Category } from '../models';

/**
 * Un Evento que SIEMPRE incluye la información de su Organizador.
 * Corresponde a un `Event::with('organizer')->get()` en Laravel.
 *
 * El tipo `Event & { ... }` significa:
 * "Un objeto que tiene TODAS las propiedades de Event Y ADEMÁS
 * una propiedad 'organizer' que es de tipo Organizer".
 */
export type EventWithOrganizer = Event & {
    organizer: Organizer;
};

/**
 * Un Evento que incluye su Organizador y su Sede (Venue).
 * Corresponde a un `Event::with(['organizer', 'venue'])->get()`.
 */
export type EventWithDetails = Event & {
    category: Category;
    organizer: Organizer;
    venue: Venue;
};

/**
 * Un Evento completo con todas sus relaciones principales (uno a uno/muchos).
 * Corresponde a `Event::with(['organizer', 'venue', 'functions'])->get()`.
 * Nota que `functions` es un array porque es una relación uno-a-muchos.
 */
export type EventComplete = Event & {
    category: Category;
    organizer: Organizer;
    venue: Venue;
    functions: EventFunction[]; // La relación `hasMany` se convierte en un array de su tipo.
};
