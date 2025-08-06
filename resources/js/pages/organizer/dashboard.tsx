import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth, organizer }: { auth: any; organizer: any }) {
    return (
        <>
            <Head title="Organizer Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            ¡Bienvenido a tu panel, {auth.user.name}!
                            {organizer && <p className="mt-2">Gestionando como: <strong>{organizer.name}</strong></p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Organizador
Dashboard.layout = (page: any) => <AppLayout children={page} />;