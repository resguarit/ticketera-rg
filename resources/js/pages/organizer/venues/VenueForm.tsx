import { useState, FormEventHandler, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Check, ChevronsUpDown, UploadCloud, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Ciudad, Venue } from '@/types';

interface VenueFormData {
    name: string;
    address: string;
    ciudad_id: string;
    coordinates: string;
    banner: File | null;
    referring: string;
}

interface VenueFormProps {
    data: VenueFormData;
    setData: (key: keyof VenueFormData, value: any) => void;
    errors: Partial<Record<keyof VenueFormData, string>>;
    processing: boolean;
    onSubmit: FormEventHandler;
    ciudades: (Ciudad & { provincia: { name: string } })[];
    submitText: string;
    venue?: Venue; // Opcional, para la vista previa de la imagen existente
    progress?: { percentage: number } | null;
}

export default function VenueForm({ data, setData, errors, processing, onSubmit, ciudades, submitText, venue, progress }: VenueFormProps) {
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

    useEffect(() => {
        // Si estamos editando y hay un banner_url, lo mostramos
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
            // Si se cancela la selección, volvemos a la imagen original si existe
            setBannerPreview(venue?.banner_url || null);
        }
    };

    const removeBanner = () => {
        setBannerPreview(null);
        setData('banner', null);
        // Si estamos en modo edición, necesitamos una forma de decirle al backend que elimine la imagen.
        // Inertia no maneja bien `null` para archivos, pero al no enviar el campo 'banner', el backend no lo actualizará.
        // Para una eliminación explícita, se necesitaría un campo adicional como 'remove_banner'. Por ahora, esto solo lo quita de la subida actual.
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Recinto</Label>
                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ciudad_id">Ciudad</Label>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between">
                                {data.ciudad_id
                                    ? `${ciudades.find(c => c.id.toString() === data.ciudad_id)?.name}, ${ciudades.find(c => c.id.toString() === data.ciudad_id)?.provincia.name}`
                                    : "Seleccionar ciudad..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar ciudad..." />
                                <CommandEmpty>No se encontró la ciudad.</CommandEmpty>
                                <CommandGroup className="max-h-60 overflow-y-auto">
                                    {ciudades.map((ciudad) => (
                                        <CommandItem
                                            key={ciudad.id}
                                            value={`${ciudad.name}, ${ciudad.provincia.name}`}
                                            onSelect={() => {
                                                setData('ciudad_id', ciudad.id.toString());
                                                setPopoverOpen(false);
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", data.ciudad_id === ciudad.id.toString() ? "opacity-100" : "opacity-0")} />
                                            {ciudad.name}, {ciudad.provincia.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <InputError message={errors.ciudad_id} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea id="address" value={data.address} onChange={e => setData('address', e.target.value)} required />
                <InputError message={errors.address} />
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