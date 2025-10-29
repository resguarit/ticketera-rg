import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { PageProps } from '@/types/ui/ui';
import { Ciudad, Provincia } from '@/types';
import VenueForm from './VenueForm';
import BackButton from '@/components/Backbutton';

interface CreateVenueProps extends PageProps {
    provincias: Provincia[];
    ciudades: Ciudad[];
}

export default function CreateVenue() {
    const { provincias, ciudades } = usePage<CreateVenueProps>().props;
    const { data, setData, post, processing, errors, progress } = useForm({
        name: '',
        address: '',
        provincia_id_or_name: '',
        ciudad_name: '',
        coordinates: '',
        banner: null as File | null,
        referring: '',
        sectors: [], // <-- AÑADIR CAMPO
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.venues.store'));
    };

    return (
        <>
            <Head title="Crear Recinto" />
            <div className="container mx-auto p-6">
                <div className="flex items-center mb-6 gap-4">
                    <BackButton href={route('admin.venues.index')} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear Recinto</h1>
                        <p className="text-gray-600 mt-1">
                            Completa los datos para registrar un nuevo lugar para tus eventos.
                        </p>
                    </div>
                </div>

                <Card className="max-w-4xl mx-auto bg-white">
                    <CardContent>
                        <VenueForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            provincias={provincias}
                            ciudades={ciudades}
                            submitText="Crear Recinto"
                            progress={progress}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CreateVenue.layout = (page: any) => <AppLayout children={page} />;