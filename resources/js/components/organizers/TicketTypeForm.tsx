import { FormEventHandler } from 'react';
import { Link } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import type { TicketType } from '@/types/models/ticketType';
import type { Sector } from '@/types/models/sector';

// Extender el tipo base para el formulario
export interface TicketTypeFormData extends Partial<TicketType> {
    // Puedes agregar campos temporales si lo necesitas, pero los principales ya están en TicketType
}

interface TicketTypeFormProps {
    data: TicketTypeFormData;
    setData: (key: keyof TicketTypeFormData | any, value: any) => void;
    errors: Partial<Record<keyof TicketTypeFormData, string>>;
    processing: boolean;
    onSubmit: FormEventHandler;
    sectors: Sector[];
    submitText: string;
    cancelUrl: string;
    maxQuantity?: number;
}

export function TicketTypeForm({ data, setData, errors, processing, onSubmit, sectors, submitText, cancelUrl, maxQuantity }: TicketTypeFormProps) {
    const selectedSector = sectors.find(s => s.id.toString() === data.sector_id?.toString());

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Entrada</Label>
                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sector_id">Sector</Label>
                    <Select value={data.sector_id !== undefined ? data.sector_id.toString() : ''} onValueChange={value => setData('sector_id', value)} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un sector" />
                        </SelectTrigger>
                        <SelectContent>
                            {sectors.map(sector => (
                                <SelectItem key={sector.id} value={sector.id.toString()}>{sector.name} ({sector.capacity} asientos)</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.sector_id} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea id="description" value={data.description ?? ''} onChange={e => setData('description', e.target.value)} />
                <InputError message={errors.description} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="price">Precio (ARS)</Label>
                    <Input id="price" type="number" value={data.price} onChange={e => setData('price', e.target.value)} required min="0" step="0.01" />
                    <InputError message={errors.price} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad Disponible</Label>
                    <Input
                        id="quantity"
                        type="number"
                        value={data.quantity}
                        onChange={e => setData('quantity', e.target.value)}
                        required
                        min="1"
                        max={maxQuantity}
                    />
                    {selectedSector && (
                        <p className="text-sm text-muted-foreground">
                            Capacidad máxima del sector: {selectedSector.capacity}
                        </p>
                    )}
                    <InputError message={errors.quantity} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="max_purchase_quantity">Máximo por Compra</Label>
                    <Input
                        id="max_purchase_quantity"
                        type="number"
                        value={data.max_purchase_quantity}
                        onChange={e => setData('max_purchase_quantity', e.target.value)}
                        required
                        min="1"
                        max="50"
                    />
                    <p className="text-sm text-muted-foreground">
                        Cantidad máxima que puede comprar un cliente en una sola transacción
                    </p>
                    <InputError message={errors.max_purchase_quantity} />
                </div>
                <div className="space-y-2">
                    {/* Espacio para mantener el layout */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="sales_start_date">Inicio de Venta</Label>
                    <Input id="sales_start_date" type="datetime-local" value={data.sales_start_date} onChange={e => setData('sales_start_date', e.target.value)} required />
                    <InputError message={errors.sales_start_date} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sales_end_date">Fin de Venta</Label>
                    <Input id="sales_end_date" type="datetime-local" value={data.sales_end_date} onChange={e => setData('sales_end_date', e.target.value)} required />
                    <InputError message={errors.sales_end_date} />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox id="is_hidden" checked={data.is_hidden} onCheckedChange={checked => setData('is_hidden', Boolean(checked))} />
                <Label htmlFor="is_hidden">Ocultar este tipo de entrada al público</Label>
                <InputError message={errors.is_hidden} />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Button variant="outline" asChild>
                    <Link href={cancelUrl}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : submitText}
                </Button>
            </div>
        </form>
    );
}