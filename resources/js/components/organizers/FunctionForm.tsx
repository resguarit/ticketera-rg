import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Event, EventFunction } from '@/types';

interface FunctionFormProps {
    event: Event;
    functionData?: EventFunction;
    isEditing?: boolean;
}

export default function FunctionForm({ event, functionData, isEditing = false }: FunctionFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: functionData?.name || '',
        description: functionData?.description || '',
        start_time: functionData?.start_time ? functionData.start_time.slice(0, 16) : '',
        end_time: functionData?.end_time ? functionData.end_time.slice(0, 16) : '',
        is_active: functionData?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditing
            ? route('organizer.events.functions.update', { event: event.id, function: functionData!.id })
            : route('organizer.events.functions.store', event.id);
        
        isEditing ? put(url) : post(url);
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
                        <Label htmlFor="name">Nombre de la Función</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ej: Función Tarde, 2da Fecha"
                        />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="description">Descripción (Opcional)</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Añade una breve descripción para esta función."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="start_time">Fecha y Hora de Inicio</Label>
                            <Input
                                id="start_time"
                                type="datetime-local"
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="end_time">Fecha y Hora de Fin (Opcional)</Label>
                            <Input
                                id="end_time"
                                type="datetime-local"
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                            />
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