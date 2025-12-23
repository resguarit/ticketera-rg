import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Settings, Users, BarChart3, Calendar, Ticket, ExternalLink, Eye, QrCode, Megaphone, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EventFunction } from '@/types/models/eventFunction';
import { Event, EventRelations } from '@/types/models/event';
import { Toaster } from 'sonner';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";


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
            name: 'Tipos de Entradas',
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
        {
            name: 'Gestion de Entradas',
            id: 'access',
            icon: QrCode,
            href: route('organizer.events.access', event.id)
        },
        {
            name: 'Vendedores',
            id: 'promoters',
            icon: Megaphone,
            href: route('organizer.events.promoters.index', event.id)
        }
    ];

    const NavContent = () => (
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
    );

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
                <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 sm:h-20">
                            {/* Sección izquierda: Back button + Info del evento */}
                            <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                                {/* Mobile Menu Trigger */}
                                <div className="md:hidden">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="ghost" size="icon" className="-ml-2">
                                                <Menu className="h-6 w-6 text-gray-500" />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                                            <SheetHeader className="p-6 border-b bg-gray-50">
                                                <SheetTitle className="text-left flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                                        <Calendar className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span className="truncate">{event.name}</span>
                                                </SheetTitle>
                                            </SheetHeader>
                                            <div className="p-4">
                                                <NavContent />
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </div>

                                <Link
                                    href={route('organizer.events.index')}
                                    className="group shrink-0"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 px-2 sm:px-3"
                                    >
                                        <ArrowLeft className="w-4 h-4 sm:mr-2 group-hover:-translate-x-0.5 transition-transform" />
                                        <span className="hidden sm:inline">Volver a eventos</span>
                                    </Button>
                                </Link>

                                <div className="hidden sm:block border-l border-gray-300 h-8"></div>

                                <div className="flex items-center gap-3 sm:space-x-4 min-w-0 flex-1">
                                    <div className="flex-shrink-0 hidden sm:block">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                                                {event.name}
                                            </h1>
                                            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shrink-0">
                                                Activo
                                            </span>
                                        </div>
                                        <p className="hidden sm:block text-sm text-gray-600 mt-0.5 truncate">
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
                            <div className="flex items-center shrink-0 ml-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors hidden sm:flex"
                                    onClick={() => window.open(route('event.detail', event.id), '_blank')}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Vista previa
                                    <ExternalLink className="w-3 h-3 ml-2 opacity-60" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-500 sm:hidden"
                                    onClick={() => window.open(route('event.detail', event.id), '_blank')}
                                >
                                    <Eye className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex w-full">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] shrink-0">
                        <nav className="mt-8 px-4 sticky top-28">
                            <NavContent />
                        </nav>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
