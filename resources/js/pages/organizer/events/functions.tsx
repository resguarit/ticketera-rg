import React, { useState } from 'react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { Link, Head, router } from '@inertiajs/react';
import { Event, EventFunction } from '@/types';
import { Badge } from '@/components/ui/badge';
import ConfirmationModal from '@/components/ConfirmationModal';

interface EventWithFunctions extends Event {
    functions: EventFunction[];
}

interface FunctionsPageProps {
    event: EventWithFunctions;
}

export default function FunctionsPage({ event }: FunctionsPageProps) {
    // Estados para el modal de confirmación
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [functionToDelete, setFunctionToDelete] = useState<EventFunction | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDeleteFunction = () => {
        if (!functionToDelete) return;
        
        setIsLoading(true);
        router.delete(route('organizer.events.functions.destroy', { 
            event: event.id, 
            function: functionToDelete.id 
        }), {
            preserveScroll: true,
            onSuccess: () => {
                setIsConfirmModalOpen(false);
                setFunctionToDelete(null);
            },
            onError: (errors) => {
                console.error('Error eliminando función:', errors);
            },
            onFinish: () => setIsLoading(false)
        });
    };

    const openDeleteModal = (func: EventFunction) => {
        setFunctionToDelete(func);
        setIsConfirmModalOpen(true);
    };
    
    const formatDateTime = (dateTime: string) => {
        if (!dateTime) return { date: '-', time: '-' };
        const date = new Date(dateTime);
        return {
            date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
            time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        };
    };

    return (
        <>
            <EventManagementLayout event={event} activeTab="functions">
                <Head title={`Funciones de ${event.name}`} />
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Gestión de Funciones</CardTitle>
                                <CardDescription>
                                    Añade, edita o elimina las funciones de tu evento.
                                </CardDescription>
                            </div>
                            <Link href={route('organizer.events.functions.create', event.id)}>
                                <Button className="bg-primary hover:bg-primary-hover">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear Función
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg">
                                {event.functions.length > 0 ? (
                                    <ul className="divide-y">
                                        {event.functions.map((func) => (
                                            <li key={func.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-semibold text-foreground">{func.name}</h3>
                                                        <Badge variant={func.is_active ? 'default' : 'secondary'}>
                                                            {func.is_active ? 'Activa' : 'Inactiva'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{func.description}</p>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDateTime(func.start_time).date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{formatDateTime(func.start_time).time} hs</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link href={route('organizer.events.functions.edit', { event: event.id, function: func.id })}>
                                                        <Button variant="outline" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="icon"
                                                        onClick={() => openDeleteModal(func)}
                                                        disabled={isLoading}
                                                        type="button"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center p-12">
                                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-semibold">No hay funciones creadas</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Crea la primera función para empezar a vender entradas.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </EventManagementLayout>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setFunctionToDelete(null);
                }}
                onConfirm={handleDeleteFunction}
                accionTitulo="Eliminación"
                accion="Eliminar"
                pronombre="esta"
                entidad="función"
                accionando="eliminando"
                nombreElemento={functionToDelete?.name}
                advertencia="Todos los datos asociados a la función también serán eliminados."
                confirmVariant='destructive'
                isLoading={isLoading}
            />
        </>
    );
}