import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Calendar, 
    MapPin, 
    Edit, 
    Settings, 
    MoreVertical,
    Star,
    Users,
    Clock
} from 'lucide-react';
import { formatDate, formatDateReadable, formatRelativeTime, formatDateForCard } from '@/lib/dateHelpers';

import { Event, Category, Venue, Organizer, EventFunction } from '@/types';

interface EventFunctionDetail extends EventFunction {
    date: string;       
    time: string;       
    formatted_date: string; 
    day_name: string;
}

interface EventDetail extends Event {
    category: Category;
    venue: Venue;
    organizer: Organizer;
    functions: EventFunctionDetail[];
}

export default function OrganizerEventCard({ event }: { event: EventDetail }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Obtener la próxima función
    const nextFunction = event.functions && event.functions.length > 0 
        ? event.functions.sort((a, b) => new Date(a.formatted_date + ' ' + a.time).getTime() - new Date(b.formatted_date + ' ' + b.time).getTime())[0]
        : null;

    const { month, day } = nextFunction ? formatDateForCard(nextFunction.date) : { month: '', day: '' };

    const handleViewPublic = () => {
            router.visit(route('event.detail', event.id));
    };

    const handleArchive = () => {
        router.patch(route('organizer.events.toggleArchive', event.id), {}, {
            preserveScroll: true,
        });
    };

    return (

        <Card className="flex flex-col bg-white py-0 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 gap-0">
            {/* Header con fecha y título (altura fija) */}
            <Link href={route('organizer.events.manage', event.id)}>
            <div className="bg-gradient-to-r from-primary to-chart-5 text-white px-4 py-3 rounded-t-lg relative flex flex-col justify-center min-h-[112px]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {nextFunction && (
                            <div className="bg-white/20 rounded px-2 py-1 text-center min-w-[50px]">
                                <div className="text-xs font-medium">{month}</div>
                                <div className="text-lg font-bold">{day}</div>
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-lg leading-tight">{event.name}</h3>
                            <p className="text-indigo-100 text-sm">By {event.organizer.name}</p>
                        </div>
                    </div>
                    {event.featured && (
                        <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                            <Star className="w-3 h-3 fill-current" />
                            Destacado
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido principal (se expandirá para llenar el espacio) */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Wrapper para el contenido variable que crece */}
                <div className="flex-grow">
                    {/* Información del evento */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>{event.category.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{event.functions?.length || 0} función{event.functions?.length !== 1 ? 'es' : ''}</span>
                        </div>
                        {nextFunction && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>Próxima: {nextFunction.date} • {nextFunction.time}</span>
                            </div>
                        )}
                    </div>

                    {/* Descripción (con altura mínima para 2 líneas) */}
                    <div className="mb-4 min-h-[44px]">
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                            {event.description}
                        </p>
                    </div>

                    {/* Banner (con altura mínima para mantener el espacio) */}
                    <div className="mb-4 min-h-[108px]">
                        {event.image_url && (
                            <>
                                <div className="text-sm font-medium text-gray-700 mb-2">Banner</div>
                                <img
                                    src={event.image_url}
                                    alt={`Banner de ${event.name}`}

                                    className="w-full h-20 object-cover rounded border"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            </>
                        )}
                    </div>

                    {/* Funciones */}
                    <div className="mb-4">
                        {event.functions && event.functions.length > 0 && (
                            <>
                                <div className="text-sm font-medium text-gray-700 mb-2">Funciones</div>
                                <div className="space-y-1">
                                    {event.functions.slice(0, 3).map((func) => (
                                        <div key={func.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                            <span className="font-medium">{func.name}</span>
                                            <span className="text-gray-600">{func.date} • {func.time}</span>
                                        </div>
                                    ))}
                                    {event.functions.length > 3 && (
                                        <div className="text-xs text-gray-500 text-center">
                                            +{event.functions.length - 3} funciones más
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Botones de acción (se alinearán en la parte inferior) */}
                <div className="flex gap-2 mt-auto pt-4">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={route('organizer.events.edit', event.id)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={route('organizer.events.manage', event.id)}>
                            <Settings className="w-4 h-4 mr-1" />
                            Gestionar
                        </Link>
                    </Button>
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                        
                        {dropdownOpen && (
                            <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                    <button className="w-full hover:cursor-pointer px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" onClick={handleViewPublic}>
                                        Ver como público
                                    </button>
                                    <hr className="my-1" />
                                    {event.is_archived ? (
                                        <button className="w-full hover:cursor-pointer px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50" onClick={handleArchive}>
                                            Desarchivar evento
                                        </button>
                                    ) : (
                                        <button className="w-full hover:cursor-pointer px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50" onClick={handleArchive}>
                                            Archivar evento
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </Link>
        </Card>
    );
}
