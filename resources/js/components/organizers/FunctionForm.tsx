import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Event, EventFunction } from '@/types';
import { toast } from 'sonner';

interface FunctionFormProps {
    event: Event;
    functionData?: EventFunction;
    isEditing?: boolean;
}

export default function FunctionForm({ event, functionData, isEditing = false }: FunctionFormProps) {
    const { data, setData, processing, errors } = useForm({
        name: functionData?.name || '',
        description: functionData?.description || '',
        start_time: functionData?.start_time ? functionData.start_time.slice(0, 16) : '',
        end_time: functionData?.end_time ? functionData.end_time.slice(0, 16) : '',
        is_active: functionData?.is_active ?? true,
    });

    const validateForm = (): boolean => {
        // Validar nombre
        if (!data.name.trim()) {
            toast.error('Nombre requerido', {
                description: 'El nombre de la función es obligatorio'
            });
            return false;
        }

        // Validar fecha y hora de inicio
        if (!data.start_time) {
            toast.error('Fecha de inicio requerida', {
                description: 'La fecha y hora de inicio es obligatoria'
            });
            return false;
        }

        // Validar que la fecha de fin sea posterior a la de inicio
        if (data.end_time && new Date(data.end_time) <= new Date(data.start_time)) {
            toast.error('Fecha de fin inválida', {
                description: 'La fecha de fin debe ser posterior a la fecha de inicio'
            });
            return false;
        }

        // Validar que la fecha de inicio no sea en el pasado
        const startDate = new Date(data.start_time);
        const now = new Date();
        if (startDate < now && !isEditing) {
            toast.error('Fecha inválida', {
                description: 'La fecha de inicio no puede ser en el pasado'
            });
            return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Ejecutar validaciones del frontend
        if (!validateForm()) {
            return;
        }

        const url = isEditing
            ? route('organizer.events.functions.update', { event: event.id, function: functionData!.id })
            : route('organizer.events.functions.store', event.id);

        const method = isEditing ? 'put' : 'post';

        router[method](url, data, {
            preserveScroll: true,
            onStart: () => {
                const message = isEditing ? 'Actualizando función...' : 'Creando función...';
                toast.loading(message, { id: 'function-submit' });
            },
            onSuccess: () => {
                const message = isEditing 
                    ? 'Función actualizada exitosamente' 
                    : 'Función creada exitosamente';
                const description = isEditing 
                    ? 'Los cambios han sido guardados correctamente'
                    : 'La función ha sido agregada al evento correctamente';
                    
                toast.success(message, {
                    id: 'function-submit',
                    description: description
                });
            },
            onError: (errors) => {
                // Manejar errores específicos del servidor
                if (errors.name) {
                    toast.error('Error en el nombre', {
                        id: 'function-submit',
                        description: Array.isArray(errors.name) ? errors.name[0] : errors.name
                    });
                } else if (errors.start_time) {
                    toast.error('Error en la fecha de inicio', {
                        id: 'function-submit',
                        description: Array.isArray(errors.start_time) ? errors.start_time[0] : errors.start_time
                    });
                } else if (errors.end_time) {
                    toast.error('Error en la fecha de fin', {
                        id: 'function-submit',
                        description: Array.isArray(errors.end_time) ? errors.end_time[0] : errors.end_time
                    });
                } else {
                    const firstError = Object.values(errors)[0];
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    
                    toast.error('Error al procesar la función', {
                        id: 'function-submit',
                        description: errorMessage || 'Verifica todos los campos e intenta nuevamente'
                    });
                }
                
                console.error('Form errors:', errors);
            }
        });
    };

    // Función para validar en tiempo real mientras el usuario escribe
    const handleNameChange = (value: string) => {
        setData('name', value);
        // Si había un error y ahora tiene contenido, limpiar visualmente
        if (value.trim() && errors.name) {
            // El error se limpiará automáticamente con la próxima validación
        }
    };

    const handleStartTimeChange = (value: string) => {
        setData('start_time', value);
        // Si había un error y ahora tiene contenido, limpiar visualmente
        if (value && errors.start_time) {
            // El error se limpiará automáticamente con la próxima validación
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Editar Función' : 'Crear Nueva Función'}</CardTitle>
                    <CardDescription>
                        {isEditing ? 'Modifica los detalles de la función.' : 'Completa los detalles para una nueva función en tu evento.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-3">
                        <Label htmlFor="name">
                            Nombre de la Función <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Ej: Función Tarde, 2da Fecha"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="description">Descripción (Opcional)</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Añade una breve descripción para esta función."
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="start_time">
                                Fecha y Hora de Inicio <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="start_time"
                                type="datetime-local"
                                value={data.start_time}
                                onChange={(e) => handleStartTimeChange(e.target.value)}
                                className={errors.start_time ? 'border-red-500' : ''}
                            />
                            {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="end_time">Fecha y Hora de Fin (Opcional)</Label>
                            <Input
                                id="end_time"
                                type="datetime-local"
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                                className={errors.end_time ? 'border-red-500' : ''}
                                min={data.start_time} // Restricción HTML5
                            />
                            {errors.end_time && <p className="text-sm text-red-600">{errors.end_time}</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            className="bg-primary"
                            onCheckedChange={(checked) => setData('is_active', checked)}
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">
                            Función Activa
                        </Label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary-hover">
                            {processing ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Función')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}