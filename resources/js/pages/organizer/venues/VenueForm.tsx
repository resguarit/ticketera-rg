import { useState, FormEventHandler, useEffect, useMemo, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import { Check, ChevronsUpDown, UploadCloud, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Ciudad, Provincia, Venue } from '@/types';

interface VenueFormData {
    name: string;
    address: string;
    provincia_id_or_name: string;
    ciudad_name: string;
    coordinates: string;
    banner: File | null;
    referring: string;
}

interface VenueFormProps {
    data: VenueFormData;
    setData: (key: keyof VenueFormData | any, value: any) => void;
    errors: Partial<Record<keyof VenueFormData, string>>;
    processing: boolean;
    onSubmit: FormEventHandler;
    provincias: Provincia[];
    ciudades: Ciudad[];
    submitText: string;
    venue?: Venue & { provincia_id?: number };
    progress?: { percentage: number } | null;
}

// Componente interno para manejar eventos del mapa
function MapEvents({ onMapClick, onMarkerDragEnd }: { onMapClick: (latlng: L.LatLng) => void, onMarkerDragEnd: (latlng: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });

    return null; // Este componente no renderiza nada
}

export default function VenueForm({ data, setData, errors, processing, onSubmit, provincias, ciudades, submitText, venue, progress }: VenueFormProps) {
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [provinciaPopover, setProvinciaPopover] = useState(false);
    const [ciudadPopover, setCiudadPopover] = useState(false);
    const [provinciaSearch, setProvinciaSearch] = useState(
        provincias.find(p => p.id.toString() === data.provincia_id_or_name)?.name || data.provincia_id_or_name || ''
    );
    const [ciudadSearch, setCiudadSearch] = useState(data.ciudad_name || '');

    const initialCenter = useMemo((): [number, number] => {
        if (data.coordinates) {
            const [lat, lng] = data.coordinates.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                return [lat, lng];
            }
        }
        return [-34.6037, -58.3816]; // Default a Buenos Aires
    }, []);

    const [markerPosition, setMarkerPosition] = useState<[number, number]>(initialCenter);

    const handleMapClick = useCallback((latlng: L.LatLng) => {
        const { lat, lng } = latlng;
        setMarkerPosition([lat, lng]);
        setData('coordinates', `${lat},${lng}`);
    }, [setData]);

    const handleMarkerDragEnd = useCallback((e: L.LeafletEvent) => {
        const marker = e.target;
        if (marker != null) {
            const { lat, lng } = marker.getLatLng();
            setMarkerPosition([lat, lng]);
            setData('coordinates', `${lat},${lng}`);
        }
    }, [setData]);

    const filteredCiudades = useMemo(() => {
        if (!data.provincia_id_or_name || !isFinite(parseInt(data.provincia_id_or_name))) {
            return [];
        }
        return ciudades.filter(c => c.provincia_id.toString() === data.provincia_id_or_name);
    }, [data.provincia_id_or_name, ciudades]);

    useEffect(() => {
        if (venue?.banner_url) {
            setBannerPreview(venue.banner_url);
        }
    }, [venue]);

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('banner', file);
        if (file) {
            setBannerPreview(URL.createObjectURL(file));
        } else {
            setBannerPreview(venue?.banner_url || null);
        }
    };

    const removeBanner = () => {
        setBannerPreview(null);
        setData('banner', null);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre del Recinto</Label>
                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                <InputError message={errors.name} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="provincia">Provincia</Label>
                    <Popover open={provinciaPopover} onOpenChange={setProvinciaPopover}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                                <span className="truncate">
                                    {provinciaSearch || "Seleccionar provincia..."}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command shouldFilter={false}>
                                <CommandInput 
                                    placeholder="Buscar o crear provincia..." 
                                    value={provinciaSearch}
                                    onValueChange={(search) => {
                                        setProvinciaSearch(search);
                                        setData('provincia_id_or_name', search);
                                    }} 
                                />
                                <CommandList>
                                    <CommandEmpty>No se encontró. Presiona Enter para crear.</CommandEmpty>
                                    <CommandGroup>
                                        {provincias.filter(p => p.name.toLowerCase().includes(provinciaSearch.toLowerCase())).map((provincia) => (
                                            <CommandItem
                                                key={provincia.id}
                                                value={provincia.name}
                                                onSelect={(currentValue) => {
                                                    setProvinciaSearch(currentValue);
                                                    setData('provincia_id_or_name', provincia.id.toString());
                                                    setData('ciudad_name', '');
                                                    setCiudadSearch('');
                                                    setProvinciaPopover(false);
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", data.provincia_id_or_name === provincia.id.toString() ? "opacity-100" : "opacity-0")} />
                                                {provincia.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <InputError message={errors.provincia_id_or_name} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Popover open={ciudadPopover} onOpenChange={setCiudadPopover}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between" disabled={!data.provincia_id_or_name}>
                                <span className="truncate">
                                    {ciudadSearch || "Seleccionar ciudad..."}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command shouldFilter={false}>
                                <CommandInput 
                                    placeholder="Buscar o crear ciudad..." 
                                    value={ciudadSearch}
                                    onValueChange={(search) => {
                                        setCiudadSearch(search);
                                        setData('ciudad_name', search);
                                    }}
                                />
                                <CommandList>
                                    <CommandEmpty>No se encontró. Presiona Enter para crear.</CommandEmpty>
                                    <CommandGroup>
                                        {filteredCiudades.filter(c => c.name.toLowerCase().includes(ciudadSearch.toLowerCase())).map((ciudad) => (
                                            <CommandItem
                                                key={ciudad.id}
                                                value={ciudad.name}
                                                onSelect={(currentValue) => {
                                                    setCiudadSearch(currentValue);
                                                    setData('ciudad_name', currentValue);
                                                    setCiudadPopover(false);
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", data.ciudad_name === ciudad.name ? "opacity-100" : "opacity-0")} />
                                                {ciudad.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <InputError message={errors.ciudad_name} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea id="address" value={data.address} onChange={e => setData('address', e.target.value)} required />
                <InputError message={errors.address} />
            </div>

            <div className="space-y-2">
                <Label>Ubicación en el Mapa</Label>
                <div className="h-96 w-full rounded-lg overflow-hidden border z-0">
                    <MapContainer center={initialCenter} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker 
                            position={markerPosition} 
                            draggable={true}
                            eventHandlers={{
                                dragend: handleMarkerDragEnd,
                            }}
                        />
                        <MapEvents onMapClick={handleMapClick} onMarkerDragEnd={handleMarkerDragEnd} />
                    </MapContainer>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="coordinates">Coordenadas (Lat, Lng)</Label>
                <Input 
                    id="coordinates" 
                    value={data.coordinates} 
                    onChange={e => {
                        setData('coordinates', e.target.value);
                        const [lat, lng] = e.target.value.split(',').map(Number);
                        if (!isNaN(lat) && !isNaN(lng)) {
                            setMarkerPosition([lat, lng]);
                        }
                    }} 
                    placeholder="Ej: -34.6037,-58.3816"
                />
                <InputError message={errors.coordinates} />
            </div>

            <div className="space-y-2">
                <Label>Banner del Recinto (Opcional)</Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    {bannerPreview ? (
                        <div className="relative text-center">
                            <img src={bannerPreview} alt="Vista previa" className="mx-auto h-40 rounded-lg object-contain" />
                            <button type="button" onClick={removeBanner} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <label htmlFor="banner" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                                    <span>Sube un archivo</span>
                                    <input id="banner" name="banner" type="file" className="sr-only" onChange={handleBannerChange} accept="image/*" />
                                </label>
                                <p className="pl-1">o arrástralo aquí</p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF hasta 2MB</p>
                        </div>
                    )}
                </div>
                {progress && (
                    <div className="w-full bg-gray-200 rounded-full mt-2">
                        <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress.percentage}%` }}>
                            {progress.percentage}%
                        </div>
                    </div>
                )}
                <InputError message={errors.banner} />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Button variant="outline" asChild>
                    <Link href={route('organizer.venues.index')}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                    {processing ? 'Guardando...' : submitText}
                </Button>
            </div>
        </form>
    );
}