import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, CreditCard, Filter } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ConfirmationModal from '@/components/ConfirmationModal';
import type { PageProps, Cuota, Event } from '@/types';

interface CuotasIndexProps extends PageProps {
	cuotas: (Cuota & { event: Pick<Event, 'id' | 'name'> })[];
}

export default function CuotasIndex() {
	const { cuotas } = usePage<CuotasIndexProps>().props;
	const { delete: deleteCuota, patch } = useForm();

	const [selectedEventId, setSelectedEventId] = useState<string>('all');
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [cuotaToDelete, setCuotaToDelete] = useState<Cuota | null>(null);

	const eventsForFilter = useMemo(() => {
		const unique = new Map<number, { id: number; name: string }>();
		cuotas.forEach(c => {
			if (c.event) unique.set(c.event.id, c.event);
		});
		return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
	}, [cuotas]);

	const filteredCuotas = useMemo(() => {
		if (selectedEventId === 'all') return cuotas;
		const id = Number(selectedEventId);
		return cuotas.filter(c => c.event_id === id);
	}, [cuotas, selectedEventId]);

	const enabledCuotas = filteredCuotas.filter(c => !!c.habilitada);
	const disabledCuotas = filteredCuotas.filter(c => !c.habilitada);

	const handleDeleteCuota = (cuotaId: number) => {
		deleteCuota(route('admin.cuotas.destroy', cuotaId), {
			onSuccess: () => setCuotaToDelete(null)
		});
	};

	const handleEnableCuota = (cuotaId: number) => {
		patch(route('admin.cuotas.enable', cuotaId));
	};

	return (
		<>
			<Head title="Gestión de Cuotas" />

			<div className="container mx-auto p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Gestionar Cuotas</h1>
						<p className="text-gray-600 mt-1">
							Filtra por evento y administra cuotas habilitadas o deshabilitadas.
						</p>
					</div>
					<Button asChild className="bg-primary hover:bg-primary-hover text-white">
						<Link href={route('admin.cuotas.new')}>
							<Plus className="w-4 h-4 mr-2" />
							Crear Cuota
						</Link>
					</Button>
				</div>

				<Card className="mb-6 bg-white">
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
							<div className="md:col-span-1">
								<label htmlFor="event" className="text-sm font-medium text-gray-700 flex items-center gap-2">
									<Filter className="w-4 h-4" /> Evento
								</label>
								<Select value={selectedEventId} onValueChange={setSelectedEventId}>
									<SelectTrigger id="event" className="mt-1">
										<SelectValue placeholder="Todos los eventos" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todos</SelectItem>
										{eventsForFilter.map(e => (
											<SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{cuotas.length === 0 ? (
					<div className="text-center py-12">
						<div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
							<CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cuotas creadas</h3>
							<p className="text-gray-600 mb-4">Crea tu primera cuota para asociarla a un evento.</p>
							<Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
								<Link href={route('admin.cuotas.new')}>
									<Plus className="w-4 h-4 mr-2" />
									Crear tu primera cuota
								</Link>
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-8">
						<section>
							<div className="flex items-center justify-between mb-3">
								<h2 className="text-lg font-semibold text-black flex items-center gap-2">
									<Badge className='outline'>Habilitadas</Badge>
									<span className="text-gray-600 text-sm">{enabledCuotas.length}</span>
								</h2>
							</div>
							{enabledCuotas.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{enabledCuotas.map(c => (
										<Card key={c.id} className="bg-white shadow-lg border-gray-200">
											<CardHeader className="pb-0">
												<CardTitle className="text-black text-base flex items-center justify-between">
													<span>{c.event?.name ?? 'Evento'}</span>
													<Badge>Habilitada</Badge>
												</CardTitle>
												<CardDescription>BIN: {c.bin}</CardDescription>
											</CardHeader>
											<CardContent className="pt-4">
												<div className="flex items-center justify-between">
													<div>
														<p className="text-sm text-gray-600">Banco</p>
														<p className="font-medium text-black">{c.banco || '—'}</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">Cuotas</p>
														<p className="font-medium text-black">{c.cantidad_cuotas}</p>
													</div>
												</div>
												<div className="flex gap-2 mt-4 justify-end">
													<Button asChild size="sm" variant="outline">
														<Link href={route('admin.cuotas.edit', c.id)}>
															<Edit className="w-4 h-4 mr-1" /> Editar
														</Link>
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onClick={() => { setCuotaToDelete(c); setIsConfirmModalOpen(true); }}
													>
														<Trash2 className="w-4 h-4 mr-1" /> Deshabilitar
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<p className="text-gray-500">No hay cuotas habilitadas para este evento.</p>
							)}
						</section>

						<section>
							<div className="flex items-center justify-between mb-3">
								<h2 className="text-lg font-semibold text-black flex items-center gap-2">
									<Badge variant="outline">Deshabilitadas</Badge>
									<span className="text-gray-600 text-sm">{disabledCuotas.length}</span>
								</h2>
							</div>
							{disabledCuotas.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{disabledCuotas.map(c => (
										<Card key={c.id} className="bg-white shadow-sm border-gray-200 opacity-90">
											<CardHeader className="pb-0">
												<CardTitle className="text-black text-base flex items-center justify-between">
													<span>{c.event?.name ?? 'Evento'}</span>
													<Badge variant="outline">Deshabilitada</Badge>
												</CardTitle>
												<CardDescription>BIN: {c.bin}</CardDescription>
											</CardHeader>
											<CardContent className="pt-4">
												<div className="flex items-center justify-between">
													<div>
														<p className="text-sm text-gray-600">Banco</p>
														<p className="font-medium text-black">{c.banco || '—'}</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">Cuotas</p>
														<p className="font-medium text-black">{c.cantidad_cuotas}</p>
													</div>
												</div>
												<div className="flex gap-2 mt-4 justify-end">
													<Button asChild size="sm" variant="outline">
														<Link href={route('admin.cuotas.edit', c.id)}>
															<Edit className="w-4 h-4 mr-1" /> Editar
														</Link>
													</Button>
													<Button size="sm" onClick={() => handleEnableCuota(c.id)}>
														Rehabilitar
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<p className="text-gray-500">No hay cuotas deshabilitadas para este filtro.</p>
							)}
						</section>
					</div>
				)}
			</div>

			<ConfirmationModal
				isOpen={isConfirmModalOpen}
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={() => { if (cuotaToDelete) handleDeleteCuota(cuotaToDelete.id); }}
				accionTitulo="Deshabilitar"
				accion="Deshabilitar"
				pronombre="esta"
				entidad="cuota"
				accionando="deshabilitando"
				nombreElemento={cuotaToDelete ? `${cuotaToDelete.bin} (${cuotaToDelete.cantidad_cuotas})` : undefined}
				advertencia="La cuota no se eliminará, solo quedará deshabilitada y seguirá visible."
				confirmVariant='destructive'
				isLoading={false}
			/>
		</>
	);
}

CuotasIndex.layout = (page: any) => <AppLayout children={page} />;
