import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Settings, Users, BarChart3, Calendar, Ticket, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EventFunction } from '@/types/models/eventFunction';
import { Event, EventRelations } from '@/types/models/event';
import { Toaster } from 'sonner';


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
            href: route('organizer.events.functions', event.id)
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
            href: route('organizer.events.attendees', event.id)
        },
    ];

    return (
        <>
            <Head title={`Gestión - ${event.name}`} />
            <Toaster 
                position="top-right"
                richColors
                expand={true}
                duration={4000}
                toastOptions={{
                    style: {
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        color: '#374151',
                    },
                }}
            />
            <div className="min-h-screen bg-gray-50">
                {/* Header mejorado */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            {/* Sección izquierda: Back button + Info del evento */}
                            <div className="flex items-center space-x-6">
                                <Link 
                                    href={route('organizer.events.index')}
                                    className="group"
                                >
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                                        Volver a eventos
                                    </Button>
                                </Link>
                                
                                <div className="border-l border-gray-300 h-8"></div>
                                
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">
                                                {event.name}
                                            </h1>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Activo
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            Gestión del evento
                                            {event.venue && (
                                                <span className="ml-2 text-gray-400">
                                                    • {event.venue.name}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Sección derecha: Acciones */}
                            <div className="flex items-center space-x-3">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                    onClick={() => window.open(route('event.detail', event.id), '_blank')}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Vista previa
                                    <ExternalLink className="w-3 h-3 ml-2 opacity-60" />
                                </Button>
                                
                                <Button 
                                    variant="default" 
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configurar
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
