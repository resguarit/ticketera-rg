import { useForm, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Event, EventFunction } from '@/types';
import { toast } from 'sonner';
import { Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import BackButton from '../Backbutton';

interface EventStatus {
    value: string;
    label: string;
    color: string;
}

interface EventFunctionWithStatus extends EventFunction {
    status?: string;
    status_label?: string;
    status_color?: string;
}

interface FunctionFormProps {
    event: Event;
    functionData?: EventFunctionWithStatus;
    statuses?: EventStatus[];
    isEditing?: boolean;
}

// Función para convertir fecha del servidor al formato datetime-local
const formatDateTimeForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    try {
        // Si ya está en formato ISO, lo usamos directamente
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        // Obtener componentes de fecha y hora
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

export default function FunctionForm({ event, functionData, statuses = [], isEditing = false }: FunctionFormProps) {
    const { data, setData, processing, errors } = useForm({
        name: functionData?.name || '',
        description: functionData?.description || '',
        start_time: formatDateTimeForInput(functionData?.start_time),
        end_time: formatDateTimeForInput(functionData?.end_time),
        is_active: functionData?.is_active ?? true,
        status: isEditing ? (functionData?.status || 'upcoming') : 'upcoming',
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

        // Validar que la fecha de inicio no sea en el pasado (solo para nuevas funciones)
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
                } else if (errors.status) {
                    toast.error('Error en el estado', {
                        id: 'function-submit',
                        description: Array.isArray(errors.status) ? errors.status[0] : errors.status
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
    };

    const handleStartTimeChange = (value: string) => {
        setData('start_time', value);
    };

    // Función para obtener badge de estado seleccionado
    const getSelectedStatusBadge = () => {
        const selectedStatus = statuses.find(s => s.value === data.status);
        if (!selectedStatus) return null;

        const colorMap: Record<string, string> = {
            'green': 'bg-green-500',
            'blue': 'bg-blue-500',
            'red': 'bg-red-500',
            'gray': 'bg-gray-500',
            'yellow': 'bg-yellow-500',
            'orange': 'bg-orange-500',
        };

        const badgeColor = colorMap[selectedStatus.color] || 'bg-gray-500';

        return (
            <Badge className={`${badgeColor} text-white border-0`}>
                {selectedStatus.label}
            </Badge>
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader className='pb-0'>
                    <CardTitle className='text-lg'>Información de la Función</CardTitle>
                    <CardDescription>
                        {isEditing 
                            ? 'Actualiza la información de la función del evento.'
                            : 'Completa los datos para crear una nueva función. El estado inicial será "Próximamente".'
                        }
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
                        <Label htmlFor="description">Descripción</Label>
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
                            <Label htmlFor="start_date">
                                Fecha de Inicio <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={data.start_time ? data.start_time.split('T')[0] : ''}
                                onChange={(e) => {
                                    const currentTime = data.start_time ? data.start_time.split('T')[1] || '09:00' : '09:00';
                                    const newDateTime = e.target.value ? `${e.target.value}T${currentTime}` : '';
                                    setData('start_time', newDateTime);
                                    handleStartTimeChange(newDateTime);
                                }}
                                className={errors.start_time ? 'border-red-500' : ''}
                            />
                            {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="start_time">
                                Hora de Inicio <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={data.start_time ? data.start_time.split('T')[1] || '' : ''} 
                                onValueChange={(value) => {
                                    const currentDate = data.start_time ? data.start_time.split('T')[0] : '';
                                    if (currentDate && value) {
                                        const newDateTime = `${currentDate}T${value}`;
                                        setData('start_time', newDateTime);
                                        handleStartTimeChange(newDateTime);
                                    }
                                }}
                            >
                                <SelectTrigger className={errors.start_time ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Seleccionar hora" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 48 }, (_, i) => {
                                        const hour = Math.floor(i / 2);
                                        const minute = i % 2 === 0 ? '00' : '30';
                                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                        return (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="end_date">Fecha de Fin</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={data.end_time ? data.end_time.split('T')[0] : ''}
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        setData('end_time', '');
                                        return;
                                    }
                                    const currentTime = data.end_time ? data.end_time.split('T')[1] || '21:00' : '21:00';
                                    setData('end_time', `${e.target.value}T${currentTime}`);
                                }}
                                className={errors.end_time ? 'border-red-500' : ''}
                                min={data.start_time ? data.start_time.split('T')[0] : ''}
                            />
                            {errors.end_date && <p className="text-sm text-red-600">{errors.end_time}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="end_time">Hora de Fin</Label>
                            <Select 
                                value={data.end_time ? data.end_time.split('T')[1] || '' : ''} 
                                onValueChange={(value) => {
                                    const currentDate = data.end_time ? data.end_time.split('T')[0] : '';
                                    if (currentDate && value) {
                                        setData('end_time', `${currentDate}T${value}`);
                                    }
                                }}
                                disabled={!data.end_time || !data.end_time.includes('T')}
                            >
                                <SelectTrigger className={errors.end_time ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Seleccionar hora" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 48 }, (_, i) => {
                                        const hour = Math.floor(i / 2);
                                        const minute = i % 2 === 0 ? '00' : '30';
                                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                        return (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Campo de Estado - Solo visible al editar */}
                    {isEditing && statuses && statuses.length > 0 && (
                        <div className="grid gap-3">
                            <Label htmlFor="status">
                                Estado de la Función <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-3">
                                <Select 
                                    value={data.status} 
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger className={`flex-1 ${errors.status ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Selecciona un estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map(status => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {getSelectedStatusBadge()}
                            </div>
                            {errors.status && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.status}
                                </p>
                            )}
                            <p className="text-sm text-gray-500">
                                El estado define cómo se muestra la función (en venta, agotado, finalizado, etc.)
                            </p>
                        </div>
                    )}

                    {/* Visibilidad */}
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3 flex-1">
                                {data.is_active ? (
                                    <Eye className="w-5 h-5 text-graty-500" />
                                ) : (
                                    <EyeOff className="w-5 h-5 text-gray-500" />
                                )}
                                <div>
                                    <Label htmlFor="is_active" className="cursor-pointer font-medium">
                                        {data.is_active ? 'Función Visible' : 'Función Oculta'}
                                    </Label>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {data.is_active 
                                            ? 'La función es visible para el público y se pueden comprar entradas'
                                            : 'La función está oculta y no se pueden comprar entradas'
                                        }
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked)}
                            />
                        </div>
                    </div>

                    {/* Información adicional */}
                    {isEditing && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Nota:</strong> El estado y la visibilidad son independientes. Puedes tener una función "En venta" pero oculta, 
                                o una función "Agotada" pero visible para que los usuarios la vean.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Link 
                            href={route('organizer.events.functions', event.id)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancelar
                        </Link>
                        
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="min-w-[120px] bg-primary hover:bg-primary-hover"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {isEditing ? 'Actualizando...' : 'Guardando...'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEditing ? 'Guardar Cambios' : 'Crear Función'}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}