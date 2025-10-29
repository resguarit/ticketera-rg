import { FormEventHandler, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import type { TicketType } from '@/types/models/ticketType';
import type { Sector } from '@/types/models/sector';

interface SectorWithAvailability {
    id: number;
    name: string;
    capacity: number;
    used_by_others?: number; // Para modo edición
    current_ticket_sold?: number; // Para modo edición
    current_ticket_original?: number; // Para modo edición
    used_capacity?: number; // Para modo creación
    available_capacity: number;
    original_available_capacity?: number; // Para modo edición
}

// Extender el tipo base para el formulario
export interface TicketTypeFormData extends Partial<TicketType> {
    // Campos específicos para tandas en el formulario
    create_stages?: boolean;
    stages_count?: number;
    price_increment?: number;
    stage_names?: string[]; // Nuevo campo para nombres personalizados
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
    hasSales?: boolean; // Nueva prop
    isEditing?: boolean; // Nueva prop
}

export function TicketTypeForm({ 
    data, 
    setData, 
    errors, 
    processing, 
    onSubmit, 
    sectors, 
    sectorsWithAvailability, 
    submitText, 
    cancelUrl, 
    maxQuantity,
    hasSales = false,
    isEditing = false
}: TicketTypeFormProps) {
    const selectedSector = sectors.find(s => s.id.toString() === data.sector_id?.toString());
    const selectedSectorAvailability = sectorsWithAvailability?.find(s => s.id.toString() === data.sector_id?.toString());
    const isBundle = data.is_bundle || false;
    const bundleQuantity = data.bundle_quantity || 1;
    const createStages = data.create_stages || false;
    const stagesCount = data.stages_count || 2;
    const priceIncrement = data.price_increment || 0;
    
    // Calcular cantidad real de entradas
    const realQuantity = isBundle ? (data.quantity || 0) * bundleQuantity : (data.quantity || 0);
    
    // Determinar capacidad disponible según el modo
    const availableCapacity = selectedSectorAvailability?.available_capacity || 0;
    const originalAvailableCapacity = selectedSectorAvailability?.original_available_capacity || availableCapacity;
    const willExceedCapacity = realQuantity > availableCapacity && availableCapacity >= 0;

    // Función para calcular la cantidad por defecto según disponibilidad
    const getDefaultQuantity = () => {
        if (!selectedSectorAvailability) return 1;
        
        if (isEditing) {
            // En modo edición, usar disponibilidad actual
            return Math.max(1, availableCapacity);
        } else {
            // En modo creación, usar disponibilidad total
            return Math.max(1, selectedSectorAvailability.available_capacity);
        }
    };

    // Función para generar nombres por defecto de las tandas
    const generateDefaultStageNames = (baseName: string, count: number): string[] => {
        return Array.from({length: count}, (_, i) => `${baseName || 'Entrada'} ${i + 1}`);
    };

    // Función para actualizar nombres de tandas
    const updateStageNames = (index: number, newName: string) => {
        const currentNames = data.stage_names || generateDefaultStageNames(data.name || 'Entrada', stagesCount);
        const updatedNames = [...currentNames];
        updatedNames[index] = newName;
        setData('stage_names', updatedNames);
    };

    // Efecto para actualizar cantidad cuando cambia el sector
    useEffect(() => {
        if (data.sector_id && selectedSectorAvailability) {
            const defaultQuantity = getDefaultQuantity();
            
            // Solo actualizar si no hay cantidad establecida o si cambió el sector
            if (!data.quantity || data.quantity === 0) {
                setData('quantity', defaultQuantity);
            }
        }
    }, [data.sector_id, selectedSectorAvailability, isEditing]);

    // Efecto para ajustar cantidad cuando cambia el tipo de bundle
    useEffect(() => {
        if (isBundle && bundleQuantity > 1 && selectedSectorAvailability) {
            const maxPossibleLots = Math.floor(selectedSectorAvailability.available_capacity / bundleQuantity);
            
            // Si la cantidad actual como lotes excede lo posible, ajustar
            if (data.quantity && data.quantity > maxPossibleLots) {
                setData('quantity', Math.max(1, maxPossibleLots));
            } else if (!data.quantity || data.quantity === 0) {
                setData('quantity', Math.max(1, maxPossibleLots));
            }
        }
    }, [isBundle, bundleQuantity, selectedSectorAvailability]);

    // Efecto para generar nombres por defecto cuando cambia el nombre base o el número de tandas
    useEffect(() => {
        if (createStages && (!data.stage_names || data.stage_names.length !== stagesCount)) {
            const defaultNames = generateDefaultStageNames(data.name || 'Entrada', stagesCount);
            setData('stage_names', defaultNames);
        }
    }, [createStages, stagesCount, data.name]);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Entrada <span className="text-red-500">*</span></Label>
                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)}  />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sector_id">Sector <span className="text-red-500">*</span></Label>
                    <Select value={data.sector_id !== undefined ? data.sector_id.toString() : ''} onValueChange={value => setData('sector_id', value)} >
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
            <div className=" rounded-lg py-4 space-y-4">
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
                        <Label htmlFor="bundle_quantity">Cantidad de entradas por lote <span className="text-red-500">*</span></Label>
                        <Input
                            id="bundle_quantity"
                            type="number"
                            value={data.bundle_quantity || ''}
                            onChange={e => setData('bundle_quantity', parseInt(e.target.value) || null)}
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
                    <Label htmlFor="price">Precio {isBundle ? 'del Lote' : ''} (ARS) <span className="text-red-500">*</span></Label>
                    <Input 
                        id="price" 
                        type="number" 
                        value={data.price} 
                        onChange={e => setData('price', e.target.value)} 
                        min="0" 
                        step="0.01"
                        disabled={hasSales} // Deshabilitar si hay ventas
                        className={hasSales ? 'bg-gray-100 cursor-not-allowed' : ''}

                    />
                    {hasSales && (
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>No se puede modificar el precio cuando ya hay ventas realizadas</span>
                        </div>
                    )}
                    {isBundle && data.price && bundleQuantity > 1 && (
                        <p className="text-sm text-green-600">
                            Precio por entrada individual: ${((data.price || 0) / bundleQuantity).toFixed(2)}
                        </p>
                    )}
                    <InputError message={errors.price} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quantity">
                        Cantidad de {isBundle ? 'Lotes' : 'Entradas'} Disponibles <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="quantity"
                        type="number"
                        value={data.quantity || ''}
                        onChange={e => {
                            const value = parseInt(e.target.value) || 0;
                            setData('quantity', value);
                        }}
                        min={hasSales ? (data.quantity_sold || 0) : "1"}
                        placeholder={selectedSectorAvailability ? `Disponible: ${availableCapacity}` : "1"}
                    />
                    
                    {/* Mostrar sugerencia de cantidad recomendada */}
                    {selectedSectorAvailability && !data.quantity && (
                        <div className="text-sm text-blue-600">
                            💡 Sugerencia: {getDefaultQuantity()} {isBundle ? 'lotes' : 'entradas'} 
                            {isBundle && ` (${getDefaultQuantity() * bundleQuantity} entradas reales)`}
                        </div>
                    )}
                    
                    {selectedSector && selectedSectorAvailability && (
                        <div className="text-sm space-y-2 p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-900">
                                Información del sector: {selectedSector.name}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Capacidad total:</p>
                                    <p className="font-medium">{selectedSector.capacity}</p>
                                </div>
                                
                                {isEditing && (
                                    <>
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground">Usadas por otros tipos:</p>
                                            <p className="text-orange-600">{selectedSectorAvailability.used_by_others}</p>
                                        </div>
                                        
                                        {hasSales && (
                                            <>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">Ya vendidas de este tipo:</p>
                                                    <p className="text-red-600 font-medium">{selectedSectorAvailability.current_ticket_sold}</p>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">Configuradas originalmente:</p>
                                                    <p className="text-blue-600">{selectedSectorAvailability.current_ticket_original}</p>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                                
                                {!isEditing && (
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground">Ya asignadas:</p>
                                        <p className="text-orange-600">{selectedSectorAvailability.used_capacity}</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="pt-2 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Disponibles actualmente:</span>
                                    <span className={`font-medium ${availableCapacity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {availableCapacity}
                                    </span>
                                </div>
                                
                                {isEditing && !hasSales && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Disponibles sin configuración previa:</span>
                                        <span className="text-blue-600">{originalAvailableCapacity}</span>
                                    </div>
                                )}
                            </div>
                            
                            {isBundle && (
                                <div className="pt-2 border-t">
                                    <p className={realQuantity > availableCapacity ? 'text-red-600 font-medium' : 'text-blue-600'}>
                                        Entradas reales que se generarán: {realQuantity}
                                    </p>
                                    {bundleQuantity > 1 && (
                                        <p className="text-sm text-muted-foreground">
                                            Lotes máximos posibles: {Math.floor(availableCapacity / bundleQuantity)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Mensaje de advertencia si se supera la capacidad */}
                    {willExceedCapacity && selectedSectorAvailability && (
                        <Alert className="border-amber-500 bg-amber-50">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                <strong>Advertencia de sobreventa:</strong> Estás superando la capacidad disponible del sector por{' '}
                                {realQuantity - availableCapacity} entradas.
                                {isEditing ? ' Esto afectará la disponibilidad para otros tipos de entrada.' : ' Esto puede generar sobreventa.'}
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    {/* Mensaje informativo sobre las limitaciones */}
                    {hasSales && (
                        <Alert className="border-blue-500 bg-blue-50">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800 text-sm">
                                Ya hay {selectedSectorAvailability?.current_ticket_sold} {isBundle ? 'lotes' : 'entradas'} vendidas.
                                No puedes reducir la cantidad por debajo de este número.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <InputError message={errors.quantity} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="max_purchase_quantity">
                        Máximo {isBundle ? 'Lotes' : 'Entradas'} por Compra <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="max_purchase_quantity"
                        type="number"
                        value={data.max_purchase_quantity}
                        onChange={e => setData('max_purchase_quantity', e.target.value)}
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

            {/* FECHAS DE VENTA CON SELECTORES SEPARADOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Label className="text-base font-medium">Inicio de Venta <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="sales_start_date">Fecha</Label>
                            <Input 
                                id="sales_start_date"
                                type="date"
                                value={data.sales_start_date ? data.sales_start_date.split('T')[0] : ''} 
                                onChange={(e) => {
                                    const currentTime = data.sales_start_date ? data.sales_start_date.split('T')[1] || '09:00' : '09:00';
                                    setData('sales_start_date', e.target.value ? `${e.target.value}T${currentTime}` : '');
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="sales_start_time">Hora</Label>
                            <Select 
                                value={data.sales_start_date ? data.sales_start_date.split('T')[1] || '' : ''} 
                                onValueChange={(value) => {
                                    const currentDate = data.sales_start_date ? data.sales_start_date.split('T')[0] : '';
                                    if (currentDate && value) {
                                        setData('sales_start_date', `${currentDate}T${value}`);
                                    }
                                }}
                            >
                                <SelectTrigger>
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
                    <InputError message={errors.sales_start_date} />
                </div>
                
                <div className="space-y-4">
                    <Label className="text-base font-medium">Fin de Venta (Opcional)</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="sales_end_date">Fecha</Label>
                            <Input 
                                id="sales_end_date"
                                type="date"
                                value={data.sales_end_date ? data.sales_end_date.split('T')[0] : ''} 
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        setData('sales_end_date', '');
                                        return;
                                    }
                                    const currentTime = data.sales_end_date ? data.sales_end_date.split('T')[1] || '21:00' : '21:00';
                                    setData('sales_end_date', `${e.target.value}T${currentTime}`);
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="sales_end_time">Hora</Label>
                            <Select 
                                value={data.sales_end_date ? data.sales_end_date.split('T')[1] || '' : ''} 
                                onValueChange={(value) => {
                                    const currentDate = data.sales_end_date ? data.sales_end_date.split('T')[0] : '';
                                    if (currentDate && value) {
                                        setData('sales_end_date', `${currentDate}T${value}`);
                                    }
                                }}
                                disabled={!data.sales_end_date || !data.sales_end_date.includes('T')}
                            >
                                <SelectTrigger>
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
                    <InputError message={errors.sales_end_date} />
                </div>
            </div>

            <div className="flex items-center space-x-2 py-4">
                <Checkbox id="is_hidden" checked={data.is_hidden} onCheckedChange={checked => setData('is_hidden', Boolean(checked))} />
                <Label htmlFor="is_hidden">Ocultar este tipo de entrada al público</Label>
                <InputError message={errors.is_hidden} />
            </div>

            {/* SECCIÓN NUEVA: Configuración de Tandas */}
            <div className="rounded-lg py-4 space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="create_stages" 
                        checked={createStages} 
                        onCheckedChange={checked => {
                            setData('create_stages', Boolean(checked));
                            if (checked) {
                                // Generar nombres por defecto al activar tandas
                                const defaultNames = generateDefaultStageNames(data.name || 'Entrada', stagesCount);
                                setData('stage_names', defaultNames);
                            } else {
                                setData('stage_names', undefined);
                            }
                        }} 
                    />
                    <Label htmlFor="create_stages" className="font-medium">
                        Crear entrada por tandas
                    </Label>
                </div>
                
                {createStages && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Número de tandas <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    min="2"
                                    max="10"
                                    value={stagesCount}
                                    onChange={(e) => {
                                        const newCount = parseInt(e.target.value) || 2;
                                        setData('stages_count', newCount);
                                        // Regenerar nombres para el nuevo número de tandas
                                        const defaultNames = generateDefaultStageNames(data.name || 'Entrada', newCount);
                                        setData('stage_names', defaultNames);
                                    }}
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
                        
                        {/* Vista previa de las tandas con nombres editables */}
                        <div className="border rounded p-4 space-y-3">
                            <Label className="text-sm font-medium">Vista previa de tandas:</Label>
                            <p className="text-xs text-muted-foreground mb-3">
                                Puedes personalizar los nombres de cada tanda (ej: "Early Bird", "General", "Last Chance")
                            </p>
                            
                            <div className="space-y-3">
                                {Array.from({length: stagesCount}, (_, i) => {
                                    const stagePrice = (data.price || 0) * (1 + (priceIncrement / 100 * i));
                                    const currentNames = data.stage_names || generateDefaultStageNames(data.name || 'Entrada', stagesCount);
                                    const stageName = currentNames[i] || `${data.name || 'Entrada'} ${i + 1}`;
                                    
                                    return (
                                        <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                            <div className="flex-1">
                                                <Label htmlFor={`stage_name_${i}`} className="text-xs text-muted-foreground">
                                                    Tanda {i + 1}:
                                                </Label>
                                                <Input
                                                    id={`stage_name_${i}`}
                                                    value={stageName}
                                                    onChange={(e) => updateStageNames(i, e.target.value)}
                                                    className="text-sm"
                                                    placeholder={`${data.name || 'Entrada'} ${i + 1}`}
                                                />
                                            </div>
                                            
                                            <div className="text-right">
                                                <p className="text-sm font-medium">${stagePrice.toFixed(2)}</p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    i === 0 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {i === 0 ? 'Activa' : 'Oculta'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Sistema de tandas:</strong> Se crearán {stagesCount} entradas diferentes con los nombres personalizados.
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