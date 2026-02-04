import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, FileSpreadsheet } from 'lucide-react';
import SettlementTable from '@/components/Settlements/SettlementTable';
import SettlementForm from '@/components/Settlements/SettlementForm';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Event {
    id: number;
    name: string;
    organizer_name: string;
}

interface EventFunction {
    id: number;
    name: string;
    start_time: string;
}

interface Settlement {
    id: number;
    transfer_date: string;
    quantity: number;
    amount_unit_gross: number;
    amount_total_gross: number;
    amount_unit_net: number;
    amount_total_net: number;
    discounts: number;
    discount_observation: string | null;
    total_transfer: number;
    attachment_path: string | null;
    attachment_url: string | null;
}

interface Props {
    auth: any;
    events: Event[];
    functions: EventFunction[];
    settlements: Settlement[];
    selectedEventId: number | null;
    selectedFunctionId: number | null;
}

export default function Index({ auth, events, functions, settlements, selectedEventId, selectedFunctionId }: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [settlementToDelete, setSettlementToDelete] = useState<number | null>(null);

    const handleEventChange = (eventId: string) => {
        router.get(route('admin.settlements.index'), { event_id: eventId });
    };

    const handleFunctionChange = (functionId: string) => {
        router.get(route('admin.settlements.index'), {
            event_id: selectedEventId,
            function_id: functionId,
        });
    };

    const handleEdit = (settlement: Settlement) => {
        setEditingSettlement(settlement);
        setIsFormOpen(true);
    };

    const handleDelete = (settlementId: number) => {
        setSettlementToDelete(settlementId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (settlementToDelete) {
            router.delete(route('admin.settlements.destroy', settlementToDelete), {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSettlementToDelete(null);
                },
            });
        }
    };

    const handleExportSettlements = () => {
        if (selectedFunctionId) {
            window.location.href = route('admin.settlements.export-settlements', {
                function_id: selectedFunctionId,
            });
        }
    };

    const handleExportTickets = () => {
        if (selectedFunctionId) {
            window.location.href = route('admin.settlements.export-tickets', {
                function_id: selectedFunctionId,
            });
        }
    };

    return (
        <>
            <Head title="Liquidaciones" />

            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    {/* Header with Title and Selectors */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-black">Liquidaciones</h1>
                                <p className="text-gray-600 mt-2">
                                    Gestiona las transferencias realizadas a organizadores por las entradas vendidas
                                </p>
                            </div>

                            {/* Selectors on the right for desktop, below for mobile */}
                            <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[500px]">
                                {/* Selector de Evento */}
                                <div className="flex-1">
                                    <Select
                                        value={selectedEventId?.toString() || ''}
                                        onValueChange={handleEventChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar evento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {events.map((event) => (
                                                <SelectItem key={event.id} value={event.id.toString()}>
                                                    {event.name} - {event.organizer_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Selector de Función */}
                                <div className="flex-1">
                                    <Select
                                        value={selectedFunctionId?.toString() || ''}
                                        onValueChange={handleFunctionChange}
                                        disabled={!selectedEventId || functions.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar función" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {functions.map((func) => (
                                                <SelectItem key={func.id} value={func.id.toString()}>
                                                    {func.name} - {func.start_time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Acciones y Tabla */}
                    {selectedFunctionId && (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button onClick={() => setIsFormOpen(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nueva Liquidación
                                    </Button>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="outline" onClick={handleExportTickets}>
                                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                                        Exportar Entradas Vendidas
                                    </Button>
                                    <Button variant="outline" onClick={handleExportSettlements}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Exportar Liquidaciones
                                    </Button>
                                </div>
                            </div>

                            <SettlementTable
                                settlements={settlements}
                                isReadOnly={false}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </>
                    )}

                    {!selectedEventId && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-600">Selecciona un evento para comenzar</p>
                        </div>
                    )}

                    {selectedEventId && !selectedFunctionId && functions.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-600">Este evento no tiene funciones configuradas</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {selectedFunctionId && (
                <SettlementForm
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingSettlement(null);
                    }}
                    settlement={editingSettlement}
                    functionId={selectedFunctionId}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente esta liquidación.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;
