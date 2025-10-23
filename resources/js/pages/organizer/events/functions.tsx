import React, { useState, useEffect } from 'react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Clock, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { Event, EventFunction } from '@/types';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/ConfirmationModal';

interface EventWithFunctions extends Event {
    functions: EventFunction[];
}

interface FunctionsPageProps {
    event: EventWithFunctions;
}

export default function FunctionsPage({ event }: FunctionsPageProps) {
    const { flash } = usePage().props as any;
    const [functionToDelete, setFunctionToDelete] = useState<EventFunction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTogglingVisibility, setIsTogglingVisibility] = useState<number | null>(null);

    // Manejar mensajes flash de Laravel
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, {
                description: 'La operación se completó correctamente'
            });
        }
        
        if (flash.error) {
            toast.error('Error en la operación', {
                description: flash.error
            });
        }
    }, [flash]);

    const handleDeleteFunction = () => {
        if (!functionToDelete) return;

        setIsDeleting(true);
        
        router.delete(route('organizer.events.functions.destroy', { event: event.id, function: functionToDelete.id }), {
            preserveScroll: true,
            onStart: () => {
                toast.loading('Eliminando función...', { id: 'delete-function' });
            },
            onSuccess: () => {
                toast.success('Función eliminada exitosamente', {
                    id: 'delete-function',
                    description: `La función "${functionToDelete.name}" ha sido eliminada correctamente`
                });
                setFunctionToDelete(null);
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors)[0] as string;
                toast.error('Error al eliminar la función', {
                    id: 'delete-function',
                    description: errorMessage || 'No se pudo eliminar la función. Intenta nuevamente.'
                });
            },
            onFinish: () => {
                setIsDeleting(false);
            }
        });
    };

    const handleToggleVisibility = (func: EventFunction) => {
        setIsTogglingVisibility(func.id);
        
        router.patch(route('organizer.events.functions.update', { event: event.id, function: func.id }), {
            is_active: !func.is_active,
            name: func.name,
            description: func.description,
            start_time: func.start_time,
            end_time: func.end_time,
        }, {
            preserveScroll: true,
            onStart: () => {
                toast.loading(func.is_active ? 'Desactivando función...' : 'Activando función...', { 
                    id: `toggle-function-${func.id}` 
                });
            },
            onSuccess: () => {
                toast.success(`Función ${func.is_active ? 'desactivada' : 'activada'} exitosamente`, {
                    id: `toggle-function-${func.id}`,
                    description: `La función "${func.name}" ahora está ${func.is_active ? 'inactiva' : 'activa'}`
                });
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors)[0] as string;
                toast.error('Error al cambiar el estado', {
                    id: `toggle-function-${func.id}`,
                    description: errorMessage || 'No se pudo cambiar el estado de la función.'
                });
            },
            onFinish: () => {
                setIsTogglingVisibility(null);
            }
        });
    };
    
    const formatDateTime = (dateTime?: string | null) => {
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
                                <Button>
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
                                                        <Badge variant={func.is_active ? 'default' : 'secondary'}     className={func.is_active ? "" : "bg-gray-300 text-gray-600"}
>
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
                                                            <span>{formatDateTime(func.start_time).time} hs  {func.end_time ? '- ' + formatDateTime(func.end_time).time + ' hs' : ''}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                        variant={func.is_active ? "default" : "secondary"}
                                                        size="icon"
                                                        onClick={() => handleToggleVisibility(func)}
                                                        disabled={isTogglingVisibility === func.id}
                                                        title={func.is_active ? 'Desactivar función' : 'Activar función'}
                                                        className={func.is_active ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-gray-300 text-gray-600 hover:bg-gray-400"}
                                                    >
                                                        {func.is_active ? (
                                                            <Eye className="h-4 w-4" />
                                                        ) : (
                                                            <EyeOff className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Link href={route('organizer.events.functions.edit', { event: event.id, function: func.id })}>
                                                        <Button variant="outline" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="icon"
                                                        onClick={() => setFunctionToDelete(func)}
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
            
            {/* Modal de confirmación para eliminar función */}
            <ConfirmationModal
                isOpen={!!functionToDelete}
                onClose={() => setFunctionToDelete(null)}
                onConfirm={handleDeleteFunction}
                accionTitulo="Eliminación"
                accion="eliminar"
                pronombre="la"
                entidad="función"
                accionando="Eliminando"
                nombreElemento={functionToDelete?.name}
                advertencia="Esta acción no se puede deshacer. Si hay entradas vendidas para esta función, no se podrá eliminar."
                confirmVariant="destructive"
                isLoading={isDeleting}
            />
        </>
    );
}