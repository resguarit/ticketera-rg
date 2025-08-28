import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageProps } from '@/types/ui/ui';
import { Ciudad } from '@/types';
import VenueForm from './VenueForm';

interface CreateVenueProps extends PageProps {
    ciudades: (Ciudad & { provincia: { name: string } })[];
}

export default function CreateVenue() {
    const { ciudades } = usePage<CreateVenueProps>().props;
    const { data, setData, post, processing, errors, progress } = useForm({
        name: '',
        address: '',
        ciudad_id: '',
        coordinates: '',
        banner: null as File | null,
        referring: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('organizer.venues.store'));
    };

    return (
        <>
            <Head title="Crear Nuevo Recinto" />
            <div className="container mx-auto p-6">
                <Card className="max-w-4xl mx-auto bg-white">
                    <CardHeader>
                        <CardTitle>Crear Nuevo Recinto</CardTitle>
                        <CardDescription>Completa los datos para registrar un nuevo lugar para tus eventos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VenueForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
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