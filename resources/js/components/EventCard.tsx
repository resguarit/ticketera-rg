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

    return (
        <Link href={`/events/${event.id}`} className={`block ${className}`}>
            <div className="w-full h-[440px] bg-white rounded-2xl overflow-hidden shadow-lg hover:transform hover:scale-105 transition-all duration-300 flex flex-col">
                {/* Header section with dark background - altura fija */}
                <div className="relative h-[260px] overflow-hidden flex-shrink-0">
                    {/* Background image */}
                    <div className="absolute inset-0">
                        <img 
                            src={event.image_url || "/placeholder.svg?height=400&width=800"} 
                            alt={event.name} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                </div>

                {/* Bottom section with white background - flex para distribuir contenido */}
                <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                    <div>
                        {/* Location - altura fija */}
                        <div className="flex items-center gap-2 mb-3 h-6">
                            <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <span className="text-gray-600 text-sm font-medium uppercase truncate">
                                {event.location}{event.city && `, ${event.city}`}
                            </span>
                        </div>

                        {/* Event title - altura fija con line-clamp */}
                        <h2 className="text-black text-xl font-bold mb-4 leading-tight tracking-wide uppercase line-clamp-2 min-h-[3.5rem]">
                            {event.name}
                        </h2>
                    </div>

                    {/* Date and time - siempre al final */}
                    <div className="flex gap-6 mt-auto">
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
        </Link>
    );
}