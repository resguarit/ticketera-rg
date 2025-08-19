import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import OrganizerEventCard from '@/components/organizers/event-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function EventsIndex({ auth, organizer, events }: { auth: any; organizer: any; events: any[] }) {
    const { user } = auth;

    return (
        <>
            <Head title="Organizer Events" />

            <div className='w-full p-4 flex '>
                <Link href={route('organizer.events.create')}>
                    <Button variant='default' className='bg-primary text-white'>
                        <Plus /> Create Event
                    </Button>
                </Link>
            </div>

            <div className="container mx-auto p-4"  >
                {events.length > 0 ? (
                    <ul>
                        {events.map(event => (
                            <OrganizerEventCard key={event.id} event={event} />
                        ))}
                    </ul>
                ) : (
                    <p>No events found.</p>
                )}
            </div>
        </>
    );
}

// Asignamos el Layout de Organizador
EventsIndex.layout = (page: any) => <AppLayout children={page} />;
