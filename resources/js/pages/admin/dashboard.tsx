import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }: any) {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            ¡Bienvenido al Panel de Administración, {auth.user.name}!
                        </div>
                    </div> 
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
Dashboard.layout = (page: any) => <AppLayout children={page} />;