import { Head, router } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet } from 'lucide-react';
import SettlementTable from '@/components/Settlements/SettlementTable';
import { Event, EventRelations } from '@/types/models/event';

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
    event: Event & EventRelations;
    functions: EventFunction[];
    settlements: Settlement[];
    selectedFunctionId: number | null;
}

export default function Index({ auth, event, functions, settlements, selectedFunctionId }: Props) {
    const handleFunctionChange = (functionId: string) => {
        router.get(route('organizer.events.settlements.index', event.id), {
            function_id: functionId,
        });
    };

    const handleExportSettlements = () => {
        if (selectedFunctionId) {
            window.location.href = route('organizer.events.settlements.export-settlements', {
                event: event.id,
                function_id: selectedFunctionId,
            });
        }
    };

    const handleExportTickets = () => {
        if (selectedFunctionId) {
            window.location.href = route('organizer.events.settlements.export-tickets', {
                event: event.id,
                function_id: selectedFunctionId,
            });
        }
    };

    return (
        <>
            <Head title={`Liquidaciones - ${event.name}`} />

            <EventManagementLayout event={event} activeTab="settlements">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Liquidaciones</h2>
                        <p className="text-gray-600 mt-2">
                            Visualiza las transferencias realizadas por las entradas vendidas
                        </p>
                    </div>

                    {/* Selector de Función */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Seleccionar Función</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-md">
                                <Select
                                    value={selectedFunctionId?.toString() || ''}
                                    onValueChange={handleFunctionChange}
                                    disabled={functions.length === 0}
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
                        </CardContent>
                    </Card>

                    {/* Acciones y Tabla */}
                    {selectedFunctionId && (
                        <>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button variant="outline" onClick={handleExportTickets}>
                                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                                    Exportar Entradas Vendidas
                                </Button>
                                <Button variant="outline" onClick={handleExportSettlements}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar Liquidaciones
                                </Button>
                            </div>

                            <SettlementTable
                                settlements={settlements}
                                isReadOnly={true}
                            />
                        </>
                    )}

                    {functions.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-600">Este evento no tiene funciones configuradas</p>
                        </div>
                    )}
                </div>
            </EventManagementLayout>
        </>
    );
}
