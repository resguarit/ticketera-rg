import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
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
				<Card className="max-w-2xl mx-auto bg-white">
					<CardHeader>
						<CardTitle>Crear Nueva Cuota</CardTitle>
						<CardDescription>Asocia una cuota a un evento y define BIN, banco y cantidad de cuotas.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={submit} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="event_id">Evento</Label>
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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="bin">BIN</Label>
									<Input id="bin" value={data.bin} onChange={(e) => setData('bin', e.target.value)} placeholder="Ej: 450799" />
									<InputError message={(errors as any)?.bin} />
								</div>
								<div className="space-y-2">
									<Label htmlFor="banco">Banco</Label>
									<Input id="banco" value={data.banco} onChange={(e) => setData('banco', e.target.value)} placeholder="Ej: Banco Nación" />
									<InputError message={(errors as any)?.banco} />
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="cantidad_cuotas">Cantidad de cuotas</Label>
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
							<div className="flex justify-end">
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
