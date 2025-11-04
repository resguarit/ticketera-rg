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
import type { PageProps, Event, Cuota } from '@/types';

interface EditCuotaProps extends PageProps {
	cuota: Cuota & { event?: Pick<Event, 'id' | 'name'> };
	events: Pick<Event, 'id' | 'name'>[];
}

export default function EditCuota() {
	const { cuota, events, errors } = usePage<EditCuotaProps>().props;
	const { data, setData, post, processing } = useForm<{
		_method: 'PUT';
		event_id: number;
		bin: string;
		cantidad_cuotas: number;
		banco: string;
		habilitada: boolean;
	}>({
		_method: 'PUT',
		event_id: cuota.event_id,
		bin: cuota.bin,
		cantidad_cuotas: cuota.cantidad_cuotas,
		banco: cuota.banco || '',
		habilitada: Boolean(cuota.habilitada),
	});

	const submit: FormEventHandler = (e) => {
		e.preventDefault();
		post(route('admin.cuotas.update', cuota.id));
	};

	return (
		<>
			<Head title={`Editar Cuota: ${cuota.bin}`} />
			<div className="container mx-auto p-6">
				<Card className="max-w-2xl mx-auto bg-white">
					<CardHeader>
						<CardTitle>Editar Cuota</CardTitle>
						<CardDescription>Actualiza los datos de la cuota.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={submit} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="event_id">Evento</Label>
								<Select value={String(data.event_id)} onValueChange={(v) => setData('event_id', Number(v))}>
									<SelectTrigger id="event_id">
										<SelectValue />
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
									<Input id="bin" value={data.bin} onChange={(e) => setData('bin', e.target.value)} />
									<InputError message={(errors as any)?.bin} />
								</div>
								<div className="space-y-2">
									<Label htmlFor="banco">Banco</Label>
									<Input id="banco" value={data.banco} onChange={(e) => setData('banco', e.target.value)} />
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
									{processing ? 'Guardando...' : 'Guardar Cambios'}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

EditCuota.layout = (page: any) => <AppLayout children={page} />;
