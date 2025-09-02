import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, MoreVertical, MapPin, Calendar, Box, Building2, Search, X as XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageProps } from '@/types/ui/ui';
import { Venue } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Extender el tipo base Venue para la lista
interface VenueIndexItem extends Venue {
    full_address: string;
    eventos_count: number;
    sectors_count: number;
    city: string;
    province: string;
}

interface VenueIndexProps extends PageProps {
    venues: VenueIndexItem[];
}

export default function VenuesIndex() {
    const { venues } = usePage<VenueIndexProps>().props;
    const { delete: deleteVenue } = useForm();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const provinces = useMemo(() => {
        const allProvinces = venues.map(v => v.province).filter((p): p is string => !!p);
        return [...new Set(allProvinces)].sort();
    }, [venues]);

    const cities = useMemo(() => {
        if (!selectedProvince) return [];
        const allCities = venues
            .filter(v => v.province === selectedProvince)
            .map(v => v.city)
            .filter((c): c is string => !!c);
        return [...new Set(allCities)].sort();
    }, [venues, selectedProvince]);

    const filteredVenues = useMemo(() => {
        return venues.filter(venue => {
            const nameMatch = venue.name.toLowerCase().includes(searchTerm.toLowerCase());
            const provinceMatch = !selectedProvince || venue.province === selectedProvince;
            const cityMatch = !selectedCity || venue.city === selectedCity;
            return nameMatch && provinceMatch && cityMatch;
        });
    }, [venues, searchTerm, selectedProvince, selectedCity]);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedProvince('');
        setSelectedCity('');
    };

    return (
        <>
            <Head title="Gestionar Recintos" />

            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestionar Recintos</h1>
                        <p className="text-gray-600 mt-1">
                            Administra los lugares donde se realizarán tus eventos.
                        </p>
                    </div>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Link href={route('admin.venues.create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Recinto
                        </Link>
                    </Button>
                </div>

                <Card className="mb-6 bg-white border-none shadow-none">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label htmlFor="search" className="text-sm font-medium text-gray-700">Buscar por nombre</label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Ej: Estadio Centenario"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="province" className="text-sm font-medium text-gray-700">Provincia</label>
                                <Select 
                                    value={selectedProvince} 
                                    onValueChange={(value) => { 
                                        // Si el valor es el especial 'all', lo convertimos a cadena vacía.
                                        const newValue = value === 'all' ? '' : value;
                                        setSelectedProvince(newValue); 
                                        setSelectedCity(''); 
                                    }}
                                >
                                    <SelectTrigger id="province" className="mt-1">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Usamos un valor especial como 'all' en lugar de "" */}
                                        <SelectItem value="all">Todas</SelectItem>
                                        {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="city" className="text-sm font-medium text-gray-700">Ciudad</label>
                                <Select 
                                    value={selectedCity} 
                                    onValueChange={(value) => {
                                        // Hacemos lo mismo para el selector de ciudad
                                        const newValue = value === 'all' ? '' : value;
                                        setSelectedCity(newValue);
                                    }} 
                                    disabled={!selectedProvince}
                                >
                                    <SelectTrigger id="city" className="mt-1">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Usamos un valor especial como 'all' en lugar de "" */}
                                        <SelectItem value="all">Todas</SelectItem>
                                        {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {(searchTerm || selectedProvince || selectedCity) && (
                            <div className="mt-4">
                                <Button variant="ghost" onClick={resetFilters} className="text-sm text-indigo-600 hover:text-indigo-800">
                                    <XIcon className="w-4 h-4 mr-2" />
                                    Limpiar filtros
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {venues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVenues.map((venue) => (
                            <Card key={venue.id} className="bg-white pt-0 pb-2 shadow-lg border-gray-200 flex flex-col">
                                <CardHeader className="relative p-0">
                                    <img
                                        src={venue.banner_url || 'https://via.placeholder.com/400x200?text=Sin+Imagen'}
                                        alt={`Banner de ${venue.name}`}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('admin.venues.edit', venue.id)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Editar</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            disabled={venue.eventos_count > 0}
                                                            onSelect={(e) => e.preventDefault()}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Eliminar</span>
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent className="bg-white">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción no se puede deshacer. Se eliminará el recinto permanentemente.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteVenue(route('admin.venues.destroy', venue.id))}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Sí, eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow pt-0 px-4 pb-4 flex flex-col">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-black">{venue.name}</CardTitle>
                                        <CardDescription className="flex flex-col items-start text-sm text-gray-600 mt-1">
                                            <span>{venue.referring}</span>
                                            <div className="flex items-start mt-2">
                                            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                            <span>{venue.full_address}</span>
                                            </div>
                                        </CardDescription>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 mt-auto pt-4 border-t">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" /> {venue.eventos_count} Evento(s)
                                        </div>
                                        <div className="flex items-center">
                                            <Box className="w-4 h-4 mr-2" /> {venue.sectors_count} Sector(es)
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes recintos creados</h3>
                            <p className="text-gray-600 mb-4">
                                Comienza creando tu primer recinto para poder asociarlo a tus eventos.
                            </p>
                            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Link href={route('admin.venues.create')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear tu primer recinto
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
                {venues.length > 0 && filteredVenues.length === 0 && (
                     <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                            <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron recintos</h3>
                            <p className="text-gray-600 mb-4">
                                Prueba a cambiar los filtros o a limpiar la búsqueda.
                            </p>
                            <Button onClick={resetFilters} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <XIcon className="w-4 h-4 mr-2" />
                                Limpiar filtros
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

VenuesIndex.layout = (page: any) => <AppLayout children={page} />;