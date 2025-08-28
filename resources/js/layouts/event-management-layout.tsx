import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Settings, Users, BarChart3, Calendar, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EventFunction } from '@/types/models/eventFunction';
import { Event, EventRelations } from '@/types/models/event';

interface EventFunctionDetail extends EventFunction {
    date: string;       
    time: string;       
    formatted_date: string; 
    day_name: string;
}

interface EventWithDetails extends Event, EventRelations {
    functions: EventFunctionDetail[];
}

interface EventManagementLayoutProps {
    event: EventWithDetails;
    activeTab?: string;
    children: React.ReactNode;
}

export default function EventManagementLayout({ 
    event, 
    activeTab = 'overview', 
    children 
}: EventManagementLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigationItems = [
        { 
            name: 'Resumen', 
            id: 'overview', 
            icon: BarChart3, 
            href: route('organizer.events.manage', event.id) 
        },
        { 
            name: 'Funciones', 
            id: 'functions', 
            icon: Calendar, 
            href: `#functions` // TODO: Agregar ruta cuando esté disponible
        },
        { 
            name: 'Entradas', 
            id: 'tickets', 
            icon: Ticket, 
            href: route('organizer.events.tickets', event.id)
        },
        { 
            name: 'Asistentes', 
            id: 'attendees', 
            icon: Users, 
            href: `#attendees` // TODO: Agregar ruta cuando esté disponible
        },
        { 
            name: 'Configuración', 
            id: 'settings', 
            icon: Settings, 
            href: `#settings` // TODO: Agregar ruta cuando esté disponible
        },
    ];

    return (
        <>
            <Head title={`Gestión - ${event.name}`} />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <Link 
                                    href={route('organizer.events.index')}
                                    className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-1" />
                                    Volver a eventos
                                </Link>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        Gestión del evento
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        {event.name}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(route('event.detail', event.id), '_blank')}
                                >
                                    Ver como público
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
                        <nav className="mt-8 px-4">
                            <div className="space-y-1">
                                {navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className={cn(
                                                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                                isActive
                                                    ? 'bg-indigo-100 text-indigo-700'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'mr-3 h-5 w-5 transition-colors',
                                                    isActive
                                                        ? 'text-indigo-500'
                                                        : 'text-gray-400 group-hover:text-gray-500'
                                                )}
                                            />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>

                    {/* Main content */}
                    <div className="flex-1">
                        <main className="p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
