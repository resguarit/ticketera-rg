import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import OrganizerEventCard from '@/components/organizers/event-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Event, Category, Venue, Organizer, EventFunction } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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

interface EventsIndexProps {
    auth: any;
    events: EventDetail[];
    filters: {
        include_archived: boolean;
    };
}

export default function EventsIndex({ auth, events, filters }: EventsIndexProps) {
    const { user } = auth;

    const handleToggleArchived = (checked: boolean | 'indeterminate') => {
        router.get(route('organizer.events.index'), {
            include_archived: checked
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Mis Eventos" />

            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mis Eventos</h1>
                        <p className="text-gray-600 mt-1">
                            Gestiona y supervisa todos tus eventos
                        </p>
                    </div>
                    <Link href={route('organizer.events.create')}>
                        <Button className="bg-primary hover:bg-primary-hover text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Evento
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-2 mb-6">
                    <Checkbox
                        id="include_archived"
                        checked={filters.include_archived}
                        onCheckedChange={handleToggleArchived}
                    />
                    <Label htmlFor="include_archived" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mostrar eventos archivados
                    </Label>
                </div>


                {/* Events Grid */}
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <OrganizerEventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-lg p-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No se encontraron eventos
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {filters.include_archived 
                                    ? "No tienes ningún evento, ni siquiera archivado."
                                    : "No tienes eventos activos. Intenta crear uno nuevo o revisa tus eventos archivados."
                                }
                            </p>
                            <Link href={route('organizer.events.create')}>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear tu primer evento
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// Asignamos el Layout de Organizador
EventsIndex.layout = (page: any) => <AppLayout children={page} />;
