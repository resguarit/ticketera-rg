import { useState, useMemo, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Layers, Plus, ScanLine, MoreVertical, Download, ClipboardCheck,
    Ban, Loader2, AlertTriangle, Info, Printer,
} from 'lucide-react';
import { Event, EventRelations } from '@/types/models/event';
import { formatCurrency } from '@/lib/currencyHelpers';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketTypeSummary { id: number; name: string; price: number; }
interface EventFunctionItem { id: number; date: string; ticket_types: TicketTypeSummary[]; }
interface PromoterItem { id: number; name: string; }
interface BatchStats { total: number; inactive: number; available: number; sold: number; cancelled: number; }

interface BatchItem {
    id: number;
    type: 'require_activation' | 'pre_activated';
    quantity: number;
    is_reconciled: boolean;
    description: string | null;
    created_at: string;
    event_function: { id: number; date: string } | null;
    ticket_type: TicketTypeSummary | null;
    promoter: { id: number; name: string } | null;
    stats: BatchStats;
}

interface BatchesPageProps {
    auth: any;
    event: Event & EventRelations;
    batches: BatchItem[];
    eventFunctions: EventFunctionItem[];
    promoters: PromoterItem[];
    platform_fee: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TypeBadge = ({ type }: { type: BatchItem['type'] }) =>
    type === 'pre_activated' ? (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Pre-activado</Badge>
    ) : (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">Para Activar</Badge>
    );

const StatusBadge = ({ batch }: { batch: BatchItem }) => {
    if (batch.type === 'require_activation') {
        const all = batch.stats.inactive + batch.stats.sold + batch.stats.cancelled;
        const voidAll = batch.stats.cancelled > 0 && batch.stats.inactive === 0 && batch.stats.sold === 0;
        if (voidAll) return <Badge variant="destructive" className="bg-red-100 text-red-700">Anulado</Badge>;
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{batch.stats.inactive} inactivas</Badge>;
    }
    if (batch.is_reconciled) return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Rendido</Badge>;
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pendiente</Badge>;
};

// ─── Create Modal ─────────────────────────────────────────────────────────────

function CreateBatchModal({
    open, onClose, event, eventFunctions, promoters,
}: {
    open: boolean;
    onClose: () => void;
    event: Event & EventRelations;
    eventFunctions: EventFunctionItem[];
    promoters: PromoterItem[];
}) {
    const [functionId, setFunctionId] = useState('');
    const [ticketTypeId, setTicketTypeId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [type, setType] = useState<'require_activation' | 'pre_activated'>('pre_activated');
    const [promoterId, setPromoterId] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const selectedFunction = eventFunctions.find(f => String(f.id) === functionId);
    const ticketTypes = selectedFunction?.ticket_types ?? [];

    const reset = () => {
        setFunctionId(''); setTicketTypeId(''); setQuantity('');
        setType('pre_activated'); setPromoterId(''); setDescription('');
    };

    const handleClose = () => { reset(); onClose(); };

    const handleSubmit = () => {
        if (!functionId || !ticketTypeId || !quantity) {
            toast.error('Completá función, tipo de entrada y cantidad.');
            return;
        }
        setLoading(true);
        router.post(
            route('organizer.events.batches.store', event.id),
            {
                event_function_id: Number(functionId),
                ticket_type_id: Number(ticketTypeId),
                quantity: Number(quantity),
                type,
                promoter_id: promoterId ? Number(promoterId) : null,
                description: description || null,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => { handleClose(); toast.success('Lote creado correctamente.'); },
                onError: (errors: any) => {
                    toast.error(errors?.general ?? 'Error al crear el lote.');
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={open => !open && handleClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-600" />
                        Generar Nuevo Lote
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Tipo */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: 'pre_activated', label: 'Pre-activado', desc: 'Para promotores. Se rinden al final.' },
                            { value: 'require_activation', label: 'Para Activar', desc: 'Nacen inactivas. Se cobran en puerta.' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setType(opt.value as typeof type)}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${
                                    type === opt.value
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <p className="font-semibold text-sm">{opt.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                            </button>
                        ))}
                    </div>

                    {/* Función */}
                    <div className="space-y-1.5">
                        <Label>Función</Label>
                        <Select value={functionId} onValueChange={v => { setFunctionId(v); setTicketTypeId(''); }}>
                            <SelectTrigger><SelectValue placeholder="Seleccioná una función" /></SelectTrigger>
                            <SelectContent>
                                {eventFunctions.map(f => (
                                    <SelectItem key={f.id} value={String(f.id)}>{f.date}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tipo de ticket */}
                    <div className="space-y-1.5">
                        <Label>Tipo de Entrada</Label>
                        <Select value={ticketTypeId} onValueChange={setTicketTypeId} disabled={!functionId}>
                            <SelectTrigger><SelectValue placeholder={functionId ? 'Seleccioná tipo' : 'Elegí una función primero'} /></SelectTrigger>
                            <SelectContent>
                                {ticketTypes.map(t => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name} — {formatCurrency(t.price)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cantidad */}
                    <div className="space-y-1.5">
                        <Label>Cantidad de entradas</Label>
                        <Input
                            type="number" min={1} max={5000}
                            placeholder="Ej: 100"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                        />
                    </div>

                    {/* Promotor (opcional) */}
                    <div className="space-y-1.5">
                        <Label>Promotor <span className="text-gray-400 font-normal">(opcional)</span></Label>
                        <Select value={promoterId} onValueChange={setPromoterId}>
                            <SelectTrigger><SelectValue placeholder="Sin promotor asignado" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin promotor</SelectItem>
                                {promoters.map(p => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                        <Label>Descripción <span className="text-gray-400 font-normal">(opcional)</span></Label>
                        <Input
                            placeholder="Ej: Fila A, Platea sector 3..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creando...</> : 'Generar Lote'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Reconcile Modal ──────────────────────────────────────────────────────────

interface TicketItem {
    id: number;
    unique_code: string;
    status: string;
    order_id: number | null;
}

function ReconcileModal({
    open, batch, event, platformFee, onClose,
}: {
    open: boolean;
    batch: BatchItem | null;
    event: Event & EventRelations;
    platformFee: number;
    onClose: () => void;
}) {
    const lastBatch = useRef(batch);
    if (batch) lastBatch.current = batch;
    const currentBatch = batch || lastBatch.current;

    const [tickets, setTickets] = useState<TicketItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [salesChannel, setSalesChannel] = useState('box_office');
    const [applyFee, setApplyFee] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (batch) {
            setFetching(true);
            axios.get(route('organizer.events.batches.tickets', { event: event.id, batch: batch.id }))
                .then(res => {
                    const fetchedTickets = res.data.tickets as TicketItem[];
                    setTickets(fetchedTickets);
                    // Select all by default
                    setSelectedIds(new Set(fetchedTickets.map(t => t.id)));
                })
                .catch(err => {
                    toast.error('Error al cargar los tickets del lote.');
                })
                .finally(() => {
                    setFetching(false);
                });
        } else {
            setTickets([]);
            setSelectedIds(new Set());
        }
    }, [batch, event.id]);

    const toggleTicket = (id: number, status: string, order_id: number | null) => {
        if (status === 'used' || order_id !== null) return; // Cannot toggle used or already sold tickets
        
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const paidTicketsCount = useMemo(() => tickets.filter(t => t.order_id !== null).length, [tickets]);
    const soldCount = selectedIds.size - paidTicketsCount; // Delta count for this reconciliation
    const returnedCount = tickets.length - selectedIds.size;
    const unitPrice = currentBatch?.ticket_type?.price ?? 0;
    const feeRate = applyFee ? platformFee / 100 : 0;
    const subtotal = soldCount * unitPrice;
    const total = subtotal * (1 + feeRate);

    const handleExecute = () => {
        if (!currentBatch) return;
        if (soldCount === 0 && returnedCount === 0) return;
        setLoading(true);
        router.post(
            route('organizer.events.batches.reconcile', { event: event.id, batch: currentBatch.id }),
            {
                sold_ticket_ids: Array.from(selectedIds),
                sales_channel: salesChannel,
                apply_fee: applyFee,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success(`Lote #${currentBatch.id} rendido. ${soldCount} nuevas entradas facturadas.`);
                    onClose();
                },
                onError: (errors: any) => {
                    toast.error(errors?.general ?? 'Error al rendir el lote.');
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    const usedCount = tickets.filter(t => t.status === 'used').length;

    return (
        <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden p-0">
                {currentBatch && (
                    <>
                        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
                            <DialogTitle className="flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                                Rendir Lote #{currentBatch.id}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Info del lote */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                        <p className="text-gray-700">
                            <span className="font-semibold">Tipo:</span> {currentBatch.ticket_type?.name ?? '—'} — {formatCurrency(unitPrice)}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Total entregadas:</span> {currentBatch.quantity}
                        </p>
                        {currentBatch.promoter && (
                            <p className="text-gray-700">
                                <span className="font-semibold">Promotor:</span> {currentBatch.promoter.name}
                            </p>
                        )}
                        <p className="text-gray-500 mt-2 text-xs">
                            Seleccioná las entradas que fueron <strong>vendidas</strong>. Las entradas que ya han ingresado (estado "Usado") están seleccionadas obligatoriamente. Las no seleccionadas serán anuladas (devueltas).
                        </p>
                    </div>

                    {/* Lista de entradas */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center mb-2">
                            <Label>Detalle de Entradas</Label>
                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                {selectedIds.size} de {tickets.length} seleccionadas
                            </span>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                            {fetching ? (
                                <div className="p-8 flex justify-center items-center text-gray-400">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto bg-gray-50 divide-y divide-gray-100 p-1">
                                    {tickets.map(t => {
                                        const isChecked = selectedIds.has(t.id);
                                        const isUsed = t.status === 'used';
                                        
                                        return (
                                            <label 
                                                key={t.id} 
                                                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors select-none
                                                    ${isUsed ? 'opacity-75 cursor-not-allowed bg-gray-100 hover:bg-gray-100' : 'hover:bg-white'}
                                                    ${isChecked && !isUsed ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : ''}
                                                `}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                                    checked={isChecked}
                                                    disabled={isUsed || t.order_id !== null}
                                                    onChange={() => toggleTicket(t.id, t.status, t.order_id)}
                                                />
                                                <div className="flex-1 flex justify-between items-center">
                                                    <span className="font-mono text-sm font-semibold text-gray-700">{t.unique_code}</span>
                                                    {isUsed ? (
                                                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] px-1.5 py-0 h-5">Ingresado (Usado)</Badge>
                                                    ) : t.order_id !== null ? (
                                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] px-1.5 py-0 h-5">Incluido en orden #{t.order_id}</Badge>
                                                    ) : t.status === 'available' ? (
                                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] px-1.5 py-0 h-5">Disponible</Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] px-1.5 py-0 h-5">{t.status}</Badge>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cálculo dinámico */}
                    {!fetching && tickets.length > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Entradas Vendidas</span>
                                <span className="font-bold text-gray-900">{soldCount} {usedCount > 0 && <span className="text-xs font-normal text-emerald-600 ml-1">({usedCount} ya ingresadas)</span>}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-red-500">Cartones Devueltos (Anular)</span>
                                <span className="font-bold text-red-600">{returnedCount}</span>
                            </div>
                            <div className="border-t border-emerald-200/50 my-2 pt-2 flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">{formatCurrency(subtotal)}</span>
                            </div>
                            {applyFee && feeRate > 0 && (
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Cargo de servicio ({platformFee}%)</span>
                                    <span>{formatCurrency(subtotal * feeRate)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold border-t border-emerald-200 pt-2 mt-1">
                                <span>Total a facturar</span>
                                <span className="text-emerald-700">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    )}

                    {/* Canal de venta */}
                    <div className="space-y-1.5">
                        <Label>Canal de venta para la rendición</Label>
                        <Select value={salesChannel} onValueChange={setSalesChannel}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="box_office">Boletería (Box Office)</SelectItem>
                                <SelectItem value="sales_point">Punto de Venta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fee toggle */}
                    {platformFee > 0 && (
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={applyFee}
                                onChange={e => setApplyFee(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                            />
                            <span className="text-sm text-gray-700">
                                Incluir cargo de servicio ({platformFee}%) en la rendición
                            </span>
                        </label>
                    )}
                </div>

                        <DialogFooter className="flex-shrink-0 px-6 py-4 border-t bg-gray-50">
                            <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                            <Button
                                onClick={handleExecute}
                                disabled={loading || fetching}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</> : 'Ejecutar Conciliación'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ─── Void Confirm Modal ───────────────────────────────────────────────────────

function VoidModal({
    open, batch, event, onClose,
}: {
    open: boolean;
    batch: BatchItem | null;
    event: Event & EventRelations;
    onClose: () => void;
}) {
    const lastBatch = useRef(batch);
    if (batch) lastBatch.current = batch;
    const currentBatch = batch || lastBatch.current;

    const [loading, setLoading] = useState(false);

    const handleVoid = () => {
        if (!currentBatch) return;
        setLoading(true);
        router.patch(
            route('organizer.events.batches.void', { event: event.id, batch: currentBatch.id }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success(`Lote #${currentBatch.id} anulado.`);
                    onClose();
                },
                onError: (errors: any) => {
                    toast.error(errors?.general ?? 'Error al anular el lote.');
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-sm text-center">
                {currentBatch && (
                    <>
                        <DialogHeader>
                            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                                <AlertTriangle className="w-7 h-7 text-red-600" />
                            </div>
                            <DialogTitle>Anular Lote #{currentBatch.id}</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-600 mt-1">
                            Se cancelarán todas las entradas <strong>no vendidas</strong> de este lote.
                            Las entradas ya activadas/vendidas no se verán afectadas.
                        </p>
                        <DialogFooter className="mt-4 sm:justify-center gap-2">
                            <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                            <Button
                                onClick={handleVoid}
                                disabled={loading}
                                variant="destructive"
                            >
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Anulando...</> : 'Anular Lote'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BatchesIndex({
    auth, event, batches, eventFunctions, promoters, platform_fee,
}: BatchesPageProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [reconcileBatch, setReconcileBatch] = useState<BatchItem | null>(null);
    const [voidBatch, setVoidBatch] = useState<BatchItem | null>(null);

    const handleDownload = (batch: BatchItem) => {
        window.open(route('organizer.events.batches.download-pdf', { event: event.id, batch: batch.id }), '_blank');
    };

    return (
        <>
            <Head title={`Lotes — ${event.name}`} />

            <EventManagementLayout event={event} activeTab="batches">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-sm">
                                <Layers className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Gestión de Lotes de Entradas</h1>
                                <p className="text-sm text-gray-500">
                                    {batches.length} lote{batches.length !== 1 ? 's' : ''} registrado{batches.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50"
                                onClick={() => window.location.href = route('organizer.events.batches.activation', event.id)}
                            >
                                <ScanLine className="w-4 h-4" />
                                <span className="hidden sm:inline">Modo Activación en Puerta</span>
                                <span className="sm:hidden">Activación</span>
                            </Button>
                            <Button
                                onClick={() => setCreateOpen(true)}
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                <Plus className="w-4 h-4" />
                                Generar Nuevo Lote
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    {batches.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
                            <Layers className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No hay lotes creados aún</p>
                            <p className="text-gray-400 text-sm mt-1">Generá tu primer lote de entradas pre-impresas.</p>
                            <Button
                                onClick={() => setCreateOpen(true)}
                                className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                <Plus className="w-4 h-4" />Generar Nuevo Lote
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">#</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Función</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo de Entrada</th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-600">Cantidad</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Promotor</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-600">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {batches.map(batch => {
                                            const canReconcile = batch.type === 'pre_activated';
                                            const isVoided = batch.stats.cancelled > 0 && batch.stats.inactive === 0 && batch.stats.available === 0 && batch.stats.sold === 0;

                                            return (
                                                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className="font-mono text-gray-500 text-xs">#{batch.id}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <TypeBadge type={batch.type} />
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 text-xs">
                                                        {batch.event_function?.date ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{batch.ticket_type?.name ?? '—'}</p>
                                                            {batch.ticket_type && (
                                                                <p className="text-xs text-gray-400">{formatCurrency(batch.ticket_type.price)}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div>
                                                            <span className="font-bold text-gray-900">{batch.quantity}</span>
                                                            <div className="flex justify-center gap-1 mt-1 flex-wrap">
                                                                {batch.stats.inactive > 0 && (
                                                                    <span className="text-xs text-orange-600 bg-orange-50 px-1.5 rounded">{batch.stats.inactive} inact.</span>
                                                                )}
                                                                {batch.stats.available > 0 && (
                                                                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 rounded">{batch.stats.available} disp.</span>
                                                                )}
                                                                {batch.stats.sold > 0 && (
                                                                    <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 rounded">{batch.stats.sold} vend.</span>
                                                                )}
                                                                {batch.stats.cancelled > 0 && (
                                                                    <span className="text-xs text-red-600 bg-red-50 px-1.5 rounded">{batch.stats.cancelled} anul.</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {batch.promoter?.name ?? <span className="text-gray-400 italic">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge batch={batch} />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="w-8 h-8">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem onClick={() => handleDownload(batch)} className="gap-2 cursor-pointer">
                                                                    <Printer className="w-4 h-4 text-gray-500" />
                                                                    Descargar QRs (PDF)
                                                                </DropdownMenuItem>
                                                                {canReconcile && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => setReconcileBatch(batch)}
                                                                            className="gap-2 cursor-pointer text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50"
                                                                        >
                                                                            <ClipboardCheck className="w-4 h-4" />
                                                                            {batch.is_reconciled ? 'Rendir nuevos' : 'Rendir Lote'}
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                {!batch.is_reconciled && !isVoided && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => setVoidBatch(batch)}
                                                                            className="gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                        >
                                                                            <Ban className="w-4 h-4" />
                                                                            Anular Lote
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </EventManagementLayout>

            {/* Modals */}
            <CreateBatchModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                event={event}
                eventFunctions={eventFunctions}
                promoters={promoters}
            />
            <ReconcileModal
                open={!!reconcileBatch}
                batch={reconcileBatch}
                event={event}
                platformFee={platform_fee}
                onClose={() => setReconcileBatch(null)}
            />
            <VoidModal
                open={!!voidBatch}
                batch={voidBatch}
                event={event}
                onClose={() => setVoidBatch(null)}
            />
        </>
    );
}
