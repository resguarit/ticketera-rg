import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import OrganizerEventCard from '@/components/organizers/event-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
        start_time: string;
        end_time: string;
        is_active: boolean;
    }>;
}

export default function EventsIndex({ auth, organizer, events }: { 
    auth: any; 
    organizer: any; 
    events: Event[] 
}) {
    const { user } = auth;

    return (
        <>
            <Head title="Mis Eventos" />

            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mis Eventos</h1>
                        <p className="text-gray-600 mt-1">
                            Gestiona y supervisa todos tus eventos
                        </p>
                    </div>
                    <Link href={route('organizer.events.create')}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Evento
                        </Button>
                    </Link>
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
                                No tienes eventos creados
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Comienza creando tu primer evento para gestionar tus presentaciones
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
