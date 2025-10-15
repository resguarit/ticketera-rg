import { FormEventHandler } from 'react';
import { Link } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import InputError from '@/components/input-error';
import type { TicketType } from '@/types/models/ticketType';
import type { Sector } from '@/types/models/sector';

interface SectorWithAvailability {
    id: number;
    name: string;
    capacity: number;
    used_capacity: number;
    available_capacity: number;
}

// Extender el tipo base para el formulario
export interface TicketTypeFormData extends Partial<TicketType> {
    // Campos específicos para tandas en el formulario
    create_stages?: boolean;
    stages_count?: number;
    price_increment?: number;
}

interface TicketTypeFormProps {
    data: TicketTypeFormData;
    setData: (key: keyof TicketTypeFormData | any, value: any) => void;
    errors: Partial<Record<keyof TicketTypeFormData, string>>;
    processing: boolean;
    onSubmit: FormEventHandler;
    sectors: Sector[];
    sectorsWithAvailability?: SectorWithAvailability[];
    submitText: string;
    cancelUrl: string;
    maxQuantity?: number;
}

export function TicketTypeForm({ data, setData, errors, processing, onSubmit, sectors, sectorsWithAvailability, submitText, cancelUrl, maxQuantity }: TicketTypeFormProps) {
    const selectedSector = sectors.find(s => s.id.toString() === data.sector_id?.toString());
    const selectedSectorAvailability = sectorsWithAvailability?.find(s => s.id.toString() === data.sector_id?.toString());
    const isBundle = data.is_bundle || false;
    const bundleQuantity = data.bundle_quantity || 1;
    const createStages = data.create_stages || false;
    const stagesCount = data.stages_count || 2;
    const priceIncrement = data.price_increment || 0;
    
    // Calcular cantidad real de entradas
    const realQuantity = isBundle ? (data.quantity || 0) * bundleQuantity : (data.quantity || 0);
    
    // Determinar si se superará la capacidad
    const availableCapacity = selectedSectorAvailability?.available_capacity || 0;
    const willExceedCapacity = realQuantity > availableCapacity && availableCapacity >= 0;

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
                            {sectors.map(sector => {
                                const sectorAvailability = sectorsWithAvailability?.find(s => s.id === sector.id);
                                const availabilityText = sectorAvailability 
                                    ? ` - Disponible: ${sectorAvailability.available_capacity}/${sector.capacity}`
                                    : ` (${sector.capacity} asientos)`;
                                
                                return (
                                    <SelectItem key={sector.id} value={sector.id.toString()}>
                                        {sector.name}{availabilityText}
                                    </SelectItem>
                                );
                            })}
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

            {/* NUEVA SECCIÓN: Configuración de Lote */}
            <div className="bg-muted/50 rounded-lg py-4 space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="is_bundle" 
                        checked={isBundle} 
                        onCheckedChange={checked => {
                            setData('is_bundle', Boolean(checked));
                            if (!checked) {
                                setData('bundle_quantity', null);
                            }
                        }} 
                    />
                    <Label htmlFor="is_bundle" className="font-medium">Este es un lote de entradas</Label>
                </div>
                
                {isBundle && (
                    <div className="space-y-2">
                        <Label htmlFor="bundle_quantity">Cantidad de entradas por lote</Label>
                        <Input
                            id="bundle_quantity"
                            type="number"
                            value={data.bundle_quantity || ''}
                            onChange={e => setData('bundle_quantity', parseInt(e.target.value) || null)}
                            required={isBundle}
                            min="2"
                            max="20"
                            placeholder="Ej: 4 para pack x4"
                        />
                        <p className="text-sm text-muted-foreground">
                            Cuántas entradas individuales incluye cada lote que se venda
                        </p>
                        <InputError message={errors.bundle_quantity} />
                    </div>
                )}
                
                {isBundle && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Lote de entradas:</strong> Cuando alguien compre 1 unidad de este tipo, 
                            recibirá {bundleQuantity} entradas individuales válidas para el evento.
                        </AlertDescription>
                    </Alert>
                )}
                
                <InputError message={errors.is_bundle} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="price">Precio {isBundle ? 'del Lote' : ''} (ARS)</Label>
                    <Input id="price" type="number" value={data.price} onChange={e => setData('price', e.target.value)} required min="0" step="0.01" />
                    {isBundle && data.price && bundleQuantity > 1 && (
                        <p className="text-sm text-green-600">
                            Precio por entrada individual: ${((data.price || 0) / bundleQuantity).toFixed(2)}
                        </p>
                    )}
                    <InputError message={errors.price} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quantity">
                        Cantidad de {isBundle ? 'Lotes' : 'Entradas'} Disponibles
                    </Label>
                    <Input
                        id="quantity"
                        type="number"
                        value={data.quantity}
                        onChange={e => setData('quantity', e.target.value)}
                        required
                        min="1"
                    />
                    {selectedSector && selectedSectorAvailability && (
                        <div className="text-sm space-y-1">
                            <p className="text-muted-foreground">
                                Capacidad total del sector: {selectedSector.capacity}
                            </p>
                            <p className="text-orange-600">
                                Ya asignadas: {selectedSectorAvailability.used_capacity}
                            </p>
                            <p className={`font-medium ${selectedSectorAvailability.available_capacity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Disponibles: {selectedSectorAvailability.available_capacity}
                            </p>
                            {isBundle && (
                                <p className={realQuantity > selectedSectorAvailability.available_capacity ? 'text-red-600 font-medium' : 'text-blue-600'}>
                                    Entradas reales que se generarán: {realQuantity}
                                </p>
                            )}
                        </div>
                    )}
                    
                    {/* Mensaje de advertencia si se supera la capacidad */}
                    {willExceedCapacity && selectedSectorAvailability && (
                        <Alert className="border-primary bg-primary/10">
                            <Info className="h-4 w-4 text-primary" />
                            <AlertDescription className="text-primary">
                                <strong>Advertencia:</strong> Estás superando la capacidad disponible del sector por{' '}
                                {realQuantity - selectedSectorAvailability.available_capacity} entradas.
                                Esto puede generar sobreventa. 
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <InputError message={errors.quantity} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="max_purchase_quantity">
                        Máximo {isBundle ? 'Lotes' : 'Entradas'} por Compra
                    </Label>
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
                        Cantidad máxima de {isBundle ? 'lotes' : 'entradas'} que puede comprar un cliente en una sola transacción
                        {isBundle && data.max_purchase_quantity && (
                            <><br />
                            <span className="text-blue-600">
                                Máximo de entradas reales por compra: {(data.max_purchase_quantity || 0) * bundleQuantity}
                            </span></>
                        )}
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
                    <Label htmlFor="sales_end_date">Fin de Venta (Opcional)</Label>
                    <Input id="sales_end_date" type="datetime-local" value={data.sales_end_date || ''} onChange={e => setData('sales_end_date', e.target.value || null)} />
                    <InputError message={errors.sales_end_date} />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox id="is_hidden" checked={data.is_hidden} onCheckedChange={checked => setData('is_hidden', Boolean(checked))} />
                <Label htmlFor="is_hidden">Ocultar este tipo de entrada al público</Label>
                <InputError message={errors.is_hidden} />
            </div>

            {/* SECCIÓN NUEVA: Configuración de Tandas */}
            <div className="bg-muted/50 rounded-lg py-4 space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="create_stages" 
                        checked={createStages} 
                        onCheckedChange={checked => setData('create_stages', Boolean(checked))} 
                    />
                    <Label htmlFor="create_stages" className="font-medium">
                        Crear entrada por tandas
                    </Label>
                </div>
                
                {createStages && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Número de tandas</Label>
                                <Input
                                    type="number"
                                    min="2"
                                    max="10"
                                    value={stagesCount}
                                    onChange={(e) => setData('stages_count', parseInt(e.target.value) || 2)}
                                />
                                <InputError message={errors.stages_count} />
                            </div>
                            <div>
                                <Label>Incremento de precio (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="10"
                                    value={priceIncrement}
                                    onChange={(e) => setData('price_increment', parseInt(e.target.value) || 0)}
                                />
                                <InputError message={errors.price_increment} />
                            </div>
                        </div>
                        
                        {/* Preview de las tandas */}
                        <div className="border rounded p-3 space-y-2">
                            <Label className="text-sm font-medium">Vista previa de tandas:</Label>
                            {Array.from({length: stagesCount}, (_, i) => {
                                const stagePrice = (data.price || 0) * (1 + (priceIncrement / 100 * i));
                                return (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>{data.name || 'Entrada'} {i + 1}</span>
                                        <span>${stagePrice.toFixed(2)}</span>
                                        <span className={i === 0 ? 'text-green-600' : 'text-gray-500'}>
                                            {i === 0 ? 'Activa' : 'Oculta'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Sistema de tandas:</strong> Se crearán {stagesCount} entradas diferentes.
                                Solo la primera estará visible inicialmente. Cuando se agote, se activará automáticamente la siguiente.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Button variant="outline" asChild>
                    <Link href={cancelUrl}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={processing} className="hover:bg-primary-hover">
                    {processing ? 'Guardando...' : submitText}
                </Button>
            </div>
        </form>
    );
}