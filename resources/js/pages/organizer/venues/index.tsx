import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, MoreVertical, MapPin, Calendar, Box, Building2 } from 'lucide-react';

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

interface VenueIndexProps extends PageProps {
    venues: (Venue & {
        full_address: string;
        eventos_count: number;
        sectors_count: number;
    })[];
}

export default function VenuesIndex() {
    const { venues } = usePage<VenueIndexProps>().props;
    const { delete: deleteVenue } = useForm();

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
                        <Link href={route('organizer.venues.create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Recinto
                        </Link>
                    </Button>
                </div>

                {venues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {venues.map((venue) => (
                            <Card key={venue.id} className="bg-white shadow-lg border-gray-200 flex flex-col pt-0 pb-6">
                                <CardHeader className="relative px-0 pb-0">
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
                                                        <Link href={route('organizer.venues.edit', venue.id)}>
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
                                                        onClick={() => deleteVenue(route('organizer.venues.destroy', venue.id))}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Sí, eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardTitle className="text-lg font-bold text-black">{venue.name}</CardTitle>
                                    <CardDescription className="flex items-start text-sm text-gray-600 mt-1">
                                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{venue.full_address}</span>
                                    </CardDescription>
                                    <div className="flex justify-between text-sm text-gray-500 mt-4 pt-4 border-t">
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
                                <Link href={route('organizer.venues.create')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear tu primer recinto
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

VenuesIndex.layout = (page: any) => <AppLayout children={page} />;