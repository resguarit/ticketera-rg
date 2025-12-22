import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Star } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatPrice } from '@/lib/currencyHelpers';

interface EventCardProps {
    event: {
        id: number;
        name: string;
        description?: string;
        image_url?: string;
        featured?: boolean;
        location: string;
        city?: string;
        province?: string;
        category: string;
        date: string;
        time?: string;
        price?: number;
        has_ticket_types?: boolean;
        status?: string; // NUEVO: Estado del evento
    };
    className?: string;
}

export default function EventCard({ event, className = '' }: EventCardProps) {
    // Extraer día, mes y año de la fecha
    const dateObj = new Date(event.date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleString('es-ES', { month: 'short' });
    const year = dateObj.getFullYear();
    
    // Extraer hora y minutos del tiempo
    const timeHour = event.time ? event.time.split(':')[0] : '00';
    const timeMinutes = event.time ? event.time.split(':')[1] : '00';

    // Determinar si el evento está agotado
    const isSoldOut = event.status === 'sold_out';

    return (
        <Link href={`/events/${event.id}`} className={`block ${className}`}>
            {/* Diseño para pantallas menores a sm (móvil) */}
            <div className="sm:hidden">
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
                    {/* Bandera diagonal AGOTADO - Mobile */}
                    {isSoldOut && (
                        <div className="absolute top-0 right-0 z-10 overflow-hidden w-24 h-24">
                            <div className="absolute top-4 -right-8 w-32 bg-red-600 text-white text-xs font-bold py-1 text-center transform rotate-45 shadow-md">
                                AGOTADO
                            </div>
                        </div>
                    )}

                    <div className="flex h-32">
                        {/* Imagen izquierda */}
                        <div className="w-32 h-32 flex-shrink-0 relative">
                            <img 
                                src={event.image_url || "/placeholder.svg?height=400&width=800"} 
                                alt={event.name} 
                                className={`w-full h-full object-cover ${isSoldOut ? 'opacity-60 grayscale' : ''}`}
                            />
                        </div>
                        
                        {/* Contenido derecha */}
                        <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
                            {/* Top section */}
                            <div className="overflow-hidden flex-1">
                                <div className="flex items-center gap-1 mb-1">
                                    <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                    <span className="text-xs text-gray-500 uppercase truncate">
                                        {event.location}
                                    </span>
                                </div>
                                
                                {/* Título con altura máxima exacta para 2 líneas */}
                                <h3 className="text-sm font-bold text-black uppercase leading-tight line-clamp-2 max-h-[2.5rem] overflow-hidden">
                                    {event.name}
                                </h3>
                            </div>
                            
                            {/* Bottom section - Fecha y hora */}
                            <div className="flex gap-4 flex-shrink-0">
                                <div className="flex items-center gap-1">
                                    <span className="text-2xl font-bold text-black leading-none">{day}</span>
                                    <div className="leading-none">
                                        <div className="text-xs font-bold text-black capitalize">{month}</div>
                                        <div className="text-xs font-bold text-black">{year}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    <span className="text-2xl font-bold text-black leading-none">{timeHour}</span>
                                    <div className="leading-none">
                                        <div className="text-xs font-bold text-black">{timeMinutes}</div>
                                        <div className="text-xs font-bold text-black">hrs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Diseño original para pantallas sm y mayores */}
            <div className="hidden sm:block">
                <div className="w-full h-[440px] bg-white rounded-2xl overflow-hidden shadow-lg hover:transform hover:scale-105 transition-all duration-300 flex flex-col relative">
                    {/* Bandera diagonal AGOTADO - Desktop */}
                    {isSoldOut && (
                        <div className="absolute top-0 right-0 z-10 overflow-hidden w-32 h-32">
                            <div className="absolute top-6 -right-10 w-40 bg-red-600 text-white text-sm font-bold py-2 text-center transform rotate-45 shadow-lg">
                                AGOTADO
                            </div>
                        </div>
                    )}

                    {/* Header section with dark background - altura fija */}
                    <div className="relative h-[260px] overflow-hidden flex-shrink-0">
                        {/* Background image */}
                        <div className="absolute inset-0">
                            <img 
                                src={event.image_url || "/placeholder.svg?height=400&width=800"} 
                                alt={event.name} 
                                className={`w-full h-full object-cover transition-all duration-300 ${isSoldOut ? 'opacity-60 grayscale' : ''}`}
                            />
                        </div>
                    </div>

                    {/* Bottom section with white background */}
                    <div className="p-4 bg-white flex-1 flex flex-col justify-between overflow-hidden">
                        <div className="overflow-hidden flex-1">
                            {/* Location */}
                            <div className="flex items-center gap-2 mb-3 h-6">
                                <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                <span className="text-gray-600 text-sm font-medium uppercase truncate">
                                    {event.location}{event.city && `, ${event.city}`}
                                </span>
                            </div>

                            {/* Event title - altura máxima exacta para 2 líneas */}
                            <h2 className="text-black text-xl font-bold mb-4 leading-tight tracking-wide uppercase line-clamp-2 max-h-[3rem] overflow-hidden">
                                {event.name}
                            </h2>
                        </div>

                        {/* Date and time - siempre al final */}
                        <div className="flex gap-6 mt-auto flex-shrink-0">
                            <div className="text-center">
                                <div className="flex gap-[2px] flex-row items-center">
                                    <div className="text-4xl font-bold text-black">{day}</div>
                                    <div className="gap-0">
                                        <div className="capitalize text-start font-bold text-black leading-none pt-1">
                                            {month}<br />{year}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="flex gap-[2px] flex-row items-center">
                                    <div className="text-4xl font-bold text-black">{timeHour}</div>
                                    <div className="gap-0">
                                        <div className=" text-start font-bold text-black leading-none pt-1">
                                            {timeMinutes}<br />hrs
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}