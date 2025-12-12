import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Search, QrCode, CheckCircle, History, RefreshCw,
    Smartphone, AlertTriangle, Monitor, RotateCcw, Ticket
} from 'lucide-react';
import { PaginatedResponse } from '@/types/ui/ui';
import { Event, EventRelations } from '@/types/models/event';

interface ScanLog {
    result: string;
    device_name: string;
    scanned_at: string;
}

interface TicketForControl {
    id: number;
    unique_code: string;
    status: 'available' | 'used' | 'cancelled';
    owner_name: string;
    owner_dni: string;
    ticket_type: string;
    function_name: string;
    is_bundle: boolean;
    bundle_reference: string | null;
    device_used: string | null;
    validated_at: string | null;
    last_scan_result: string | null;
    scan_history: ScanLog[];
}

interface EventFunctionSimple {
    id: number;
    name: string;
    start_time_formatted: string;
}

interface EventFunctionDetail extends EventFunctionSimple {
    date: string;
    time: string;
    formatted_date: string;
    day_name: string;
    start_time: string;
}

interface EventWithDetails extends Event, EventRelations {
    functions: EventFunctionDetail[];
}

interface EventAccessProps {
    event: EventWithDetails;
    tickets: PaginatedResponse<TicketForControl>;
    functions: EventFunctionSimple[];
    filters: {
        search?: string;
        status?: string;
        function_id?: string;
    };
    stats: {
        entered: number;
        pending: number;
    };
}

export default function EventAccess({
    event,
    tickets,
    functions,
    filters,
    stats
}: EventAccessProps) {

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [functionFilter, setFunctionFilter] = useState(filters.function_id || 'all');

    const [historyModal, setHistoryModal] = useState<{
        isOpen: boolean;
        ticket: TicketForControl | null;
    }>({
        isOpen: false,
        ticket: null,
    });

    const applyFilters = (newParams: any) => {
        const params = {
            search: searchQuery,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            function_id: functionFilter !== 'all' ? functionFilter : undefined,
            ...newParams,
        };

        Object.keys(params).forEach(key => {
            if (params[key] === undefined || params[key] === '') delete params[key];
        });

        router.get(
            route('organizer.events.access', event.id),
            params,
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSearch = () => applyFilters({ search: searchQuery });

    const handleStatusFilter = (val: string) => {
        setStatusFilter(val);
        applyFilters({ status: val === 'all' ? undefined : val });
    };

    const handleFunctionFilter = (val: string) => {
        setFunctionFilter(val);
        applyFilters({ function_id: val === 'all' ? undefined : val });
    };

    const handleRefresh = () => {
        router.reload({ only: ['tickets', 'stats'] }); // Recargamos tickets Y stats
    };

    const handleToggleStatus = (ticket: TicketForControl) => {
        const newStatus = ticket.status === 'available' ? 'used' : 'available';

        router.post(
            route('organizer.events.access.toggle', { event: event.id, ticket: ticket.id }),
            { status: newStatus },
            { preserveScroll: true }
        );
    };

    const openHistory = (ticket: TicketForControl) => {
        setHistoryModal({ isOpen: true, ticket });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'used':
                return <Badge className="bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200">Ingresó</Badge>;
            case 'available':
                return <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200">Disponible</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <EventManagementLayout event={event} activeTab="access">
            <Head title={`Control de Accesos - ${event.name}`} />

            <div className="space-y-6">

                {/* --- BARRA SUPERIOR DE CONTROL --- */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                            {/* Título y Descripción + Stats Vertical Divider */}
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Monitor className="w-5 h-5 text-blue-600" />
                                        Control de Accesos
                                    </CardTitle>
                                    <CardDescription>
                                        Gestión operativa en tiempo real para puertas.
                                    </CardDescription>
                                </div>

                                {/* --- NUEVO: BARRA VERTICAL Y STATS --- */}
                                <div className="hidden md:block h-10 w-px bg-gray-200 mx-2"></div>

                                <div className="flex gap-6 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Ingresaron</span>
                                        <span className="text-2xl font-bold text-gray-800">{stats.entered}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Faltan</span>
                                        <span className="text-2xl font-bold text-gray-500">{stats.pending}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Botón Actualizar */}
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleRefresh} title="Recargar datos">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Actualizar
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            {/* Buscador Principal */}
                            <div className="w-full md:flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="Escanear o buscar código / DNI / Nombre..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10 h-12 text-lg"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Filtros */}
                            <div className="w-full md:w-48">
                                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="available">🟢 Disponibles</SelectItem>
                                        <SelectItem value="used">⚪ Ingresados</SelectItem>
                                        <SelectItem value="cancelled">🔴 Cancelados</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full md:w-56">
                                <Select value={functionFilter} onValueChange={handleFunctionFilter}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Función" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las funciones</SelectItem>
                                        {functions.map(f => (
                                            <SelectItem key={f.id} value={f.id.toString()}>
                                                {f.name} ({f.start_time_formatted})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button className="h-12" onClick={handleSearch}>
                                Buscar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* --- LISTADO DE TICKETS --- */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="w-[100px]">Código</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Asistente</TableHead>
                                    <TableHead>Tipo de Entrada</TableHead>
                                    <TableHead>Último Movimiento</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Ticket className="h-8 w-8 mb-2 opacity-20" />
                                                <p>No se encontraron tickets con estos criterios.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tickets.data.map((ticket) => (
                                        <TableRow key={ticket.id} className={ticket.status === 'used' ? 'bg-gray-50' : ''}>
                                            <TableCell>
                                                <div className="font-mono font-bold text-base tracking-wide text-gray-700">
                                                    {ticket.unique_code.slice(-6)}
                                                </div>
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {ticket.unique_code.slice(0, -6)}...
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(ticket.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-900">{ticket.owner_name}</div>
                                                <div className="text-sm text-gray-500">{ticket.owner_dni}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{ticket.ticket_type}</div>
                                                <div className="text-xs text-gray-500">{ticket.function_name}</div>
                                                {ticket.is_bundle && (
                                                    <Badge variant="secondary" className="mt-1 text-[10px]">
                                                        Pack x{ticket.bundle_reference}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {ticket.validated_at ? (
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-medium text-gray-700">
                                                            {ticket.validated_at}
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Smartphone className="w-3 h-3" />
                                                            {ticket.device_used || 'Desconocido'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openHistory(ticket)}
                                                        title="Ver historial de escaneos"
                                                    >
                                                        <History className="h-4 w-4 text-gray-500" />
                                                    </Button>

                                                    {ticket.status !== 'cancelled' && (
                                                        <Button
                                                            size="sm"
                                                            variant={ticket.status === 'available' ? 'default' : 'outline'}
                                                            className={ticket.status === 'available'
                                                                ? "bg-blue-600 hover:bg-blue-700"
                                                                : "border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                                                            }
                                                            onClick={() => handleToggleStatus(ticket)}
                                                        >
                                                            {ticket.status === 'available' ? (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4 mr-1.5" />
                                                                    Validar
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <RotateCcw className="w-4 h-4 mr-1.5" />
                                                                    Liberar
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* Paginación simple */}
                    {tickets.links && tickets.data.length > 0 && (
                        <div className="p-4 border-t flex justify-center">
                            <div className="flex items-center space-x-2">
                                {tickets.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-md transition-colors ${link.active
                                            ? 'bg-black text-white'
                                            : link.url
                                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                : 'text-gray-400 pointer-events-none'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveState
                                        preserveScroll
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* --- MODAL DE HISTORIAL --- */}
            <Dialog open={historyModal.isOpen} onOpenChange={(open) => !open && setHistoryModal({ ...historyModal, isOpen: false })}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-gray-500" />
                            Historial del Ticket
                        </DialogTitle>
                        <DialogDescription>
                            Registro de actividad para el código <span className="font-mono font-bold">{historyModal.ticket?.unique_code}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto pr-2">
                        {historyModal.ticket?.scan_history && historyModal.ticket.scan_history.length > 0 ? (
                            historyModal.ticket.scan_history.map((log, index) => (
                                <div
                                    key={index}
                                    className={`flex items-start gap-3 p-3 rounded-lg border ${log.result === 'success' || log.result.includes('manual_override')
                                        ? 'bg-green-50 border-green-100'
                                        : 'bg-red-50 border-red-100'
                                        }`}
                                >
                                    <div className="mt-0.5">
                                        {log.result === 'success' || log.result.includes('manual_override') ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-sm text-gray-900">
                                                {log.result === 'success' ? 'Validación Exitosa' :
                                                    log.result.includes('manual_override') ? 'Cambio Manual' :
                                                        'Intento Fallido'}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {log.scanned_at}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Dispositivo: {log.device_name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 font-mono">
                                            Respuesta: {log.result}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No hay registros de escaneo para este ticket.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </EventManagementLayout>
    );
}