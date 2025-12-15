import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import BackButton from '@/components/Backbutton';
import type { PageProps, Event } from '@/types';

interface NewCuotaProps extends PageProps {
    events: Pick<Event, 'id' | 'name'>[];
}

export default function NewCuota() {
    const { events, errors } = usePage<NewCuotaProps>().props;
    const { data, setData, post, processing } = useForm<{
        event_id: number | '';
        bin: string;
        cantidad_cuotas: number;
        banco: string;
        habilitada: boolean;
    }>({
        event_id: '',
        bin: '',
        cantidad_cuotas: 1,
        banco: '',
        habilitada: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.cuotas.store'));
    };

    return (
        <>
            <Head title="Crear Cuota" />
            <div className="container mx-auto p-6">
                <div className="flex items-center mb-6 gap-4">
                    <BackButton href={route('admin.cuotas.index')} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Cuota</h1>
                        <p className="text-gray-600 mt-1">
                            Asocia una cuota a un evento y define BIN, banco y cantidad de cuotas.
                        </p>
                    </div>
                </div>

                <Card className="max-w-2xl mx-auto bg-white">
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="event_id">
                                    Evento <span className="text-red-500">*</span>
                                </Label>
                                <Select value={String(data.event_id)} onValueChange={(v) => setData('event_id', Number(v))}>
                                    <SelectTrigger id="event_id">
                                        <SelectValue placeholder="Selecciona un evento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {events.map((e) => (
                                            <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={(errors as any)?.event_id} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="bin">
                                        BIN <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="bin" value={data.bin} onChange={(e) => setData('bin', e.target.value)} placeholder="Ej: 450799" />
                                    <InputError message={(errors as any)?.bin} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="banco">Banco</Label>
                                    <Input id="banco" value={data.banco} onChange={(e) => setData('banco', e.target.value)} placeholder="Ej: Banco Nación" />
                                    <InputError message={(errors as any)?.banco} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="cantidad_cuotas">
                                        Cantidad de cuotas <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="cantidad_cuotas"
                                        type="number"
                                        min={1}
                                        value={data.cantidad_cuotas}
                                        onChange={(e) => setData('cantidad_cuotas', Number(e.target.value))}
                                    />
                                    <InputError message={(errors as any)?.cantidad_cuotas} />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <Checkbox id="habilitada" checked={data.habilitada} onCheckedChange={(v) => setData('habilitada', Boolean(v))} />
                                    <Label htmlFor="habilitada">Habilitada</Label>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end gap-4 pt-4 border-t">
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.cuotas.index')}>Cancelar</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary-hover text-white">
                                    {processing ? 'Guardando...' : 'Crear Cuota'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

NewCuota.layout = (page: any) => <AppLayout children={page} />;
