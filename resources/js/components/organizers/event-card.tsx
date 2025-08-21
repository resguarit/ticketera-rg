import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
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

interface Event {
    id: number;
    name: string;
    description: string;
    image_url: string | null;
    featured: boolean;
    category: {
        id: number;
        name: string;
    };
    venue: {
        id: number;
        name: string;
        address: string;
    };
    organizer: {
        id: number;
        name: string;
    };
    functions: Array<{
        id: number;
        name: string;
        start_time: string; // Raw datetime para compatibilidad
        end_time: string;   // Raw datetime para compatibilidad
        date: string;       // Formato: "23 ago 2025"
        time: string;       // Formato: "20:00"
        formatted_date: string; // Formato: "2025-08-23"
        day_name: string;   // Formato: "Saturday"
        is_active: boolean;
    }>;
}

export default function OrganizerEventCard({ event }: { event: Event }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Obtener la próxima función
    const nextFunction = event.functions && event.functions.length > 0 
        ? event.functions.sort((a, b) => new Date(a.formatted_date + ' ' + a.time).getTime() - new Date(b.formatted_date + ' ' + b.time).getTime())[0]
        : null;

    const { month, day } = nextFunction ? formatDateForCard(nextFunction.date) : { month: '', day: '' };

    return (
        <Card className="bg-white py-0 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header con fecha y título */}
            <div className="bg-indigo-600 text-white px-4 py-3 rounded-t-lg relative">
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

            {/* Contenido principal */}
            <div className="p-4">
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

                {/* Descripción */}
                <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                        {event.description}
                    </p>
                </div>

                {console.log(event)}

                {/* Banner si existe */}
                {event.image_url && (
                    <div className="mb-4">
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
                    </div>
                )}

                {/* Funciones */}
                {event.functions && event.functions.length > 0 && (
                    <div className="mb-4">
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
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`#`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`#`}>
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
                                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                                        Ver estadísticas
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                                        Duplicar evento
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                                        Exportar datos
                                    </button>
                                    <hr className="my-1" />
                                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50">
                                        Archivar evento
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
