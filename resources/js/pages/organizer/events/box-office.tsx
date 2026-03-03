import { useState, useCallback, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Minus, Plus, ShoppingCart, Mail, Printer, RefreshCw,
    CheckCircle2, Banknote, CreditCard, QrCode,
    AlertCircle, Ticket, TrendingUp, Clock, ChevronDown,
} from 'lucide-react';
import { Event, EventRelations } from '@/types/models/event';
import { formatCurrency } from '@/lib/currencyHelpers';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketTypeWithAvailability {
    id: number;
    name: string;
    price: number;
    available: number;
    sold: number;
    sector?: { name: string } | null;
}

interface EventFunctionItem {
    id: number;
    name: string;
    date: string;
    time: string;
    day_name: string;
    ticketTypes: TicketTypeWithAvailability[];
}

interface MethodStats {
    revenue: number;
    tickets: number;
    count: number;
}

interface SaleStats {
    revenue: number;
    tickets: number;
    by_method: Record<string, MethodStats>;
}

interface RecentSale {
    id: number;
    transaction_id: string | null;
    order_date: string;
    order_full_date: string;
    payment_method: string;
    total_amount: number;
    ticket_count: number;
    ticket_types: { name: string; quantity: number }[];
}

interface Stats {
    today: SaleStats;
    total: SaleStats;
    recent_sales: RecentSale[];
}

interface BoxOfficeProps {
    auth: any;
    event: Event & EventRelations;
    eventFunctions: EventFunctionItem[];
    platform_fee: number;
    stats: Stats;
}

type PaymentMethod = 'cash' | 'pos' | 'qr';

interface CartItem {
    ticketType: TicketTypeWithAvailability;
    quantity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const methodConfig: Record<string, { label: string; icon: React.ReactNode; color: string; badgeClass: string }> = {
    cash: {
        label: 'Efectivo',
        icon: <Banknote className="w-5 h-5" />,
        color: 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100',
        badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    pos: {
        label: 'Posnet',
        icon: <CreditCard className="w-5 h-5" />,
        color: 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100',
        badgeClass: 'bg-blue-100 text-blue-800',
    },
    qr: {
        label: 'MercadoPago QR',
        icon: <QrCode className="w-5 h-5" />,
        color: 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100',
        badgeClass: 'bg-sky-100 text-sky-800',
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BoxOffice({ auth, event, eventFunctions, platform_fee, stats: initialStats }: BoxOfficeProps) {
    // ── Local state ───────────────────────────────────────────────────────────
    const [selectedFunctionId, setSelectedFunctionId] = useState<number | null>(
        eventFunctions.length > 0 ? eventFunctions[0].id : null
    );
    const [cart, setCart] = useState<Record<number, number>>({});
    const [contactEmail, setContactEmail] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [applyFee, setApplyFee] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stats, setStats] = useState<Stats>(initialStats);
    const [statsOpen, setStatsOpen] = useState(false);
    const [successModal, setSuccessModal] = useState<{
        open: boolean; orderId: number | null; printUrl: string | null; quantitySold: number;
    }>({ open: false, orderId: null, printUrl: null, quantitySold: 0 });

    // ── Derived ───────────────────────────────────────────────────────────────
    const currentFunction = eventFunctions.find(f => f.id === selectedFunctionId);
    const ticketTypes = currentFunction?.ticketTypes ?? [];
    const cartItems: CartItem[] = ticketTypes
        .filter(tt => (cart[tt.id] ?? 0) > 0)
        .map(tt => ({ ticketType: tt, quantity: cart[tt.id] }));

    const subtotal   = cartItems.reduce((s, i) => s + i.ticketType.price * i.quantity, 0);
    const feeRate    = applyFee ? platform_fee / 100 : 0;
    const feeAmount  = subtotal * feeRate;
    const total      = subtotal + feeAmount;
    const totalQty   = cartItems.reduce((s, i) => s + i.quantity, 0);

    // ── Keyboard shortcut Enter ───────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && !successModal.open) {
                e.preventDefault();
                handleSubmit();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });

    // ── Cart helpers ──────────────────────────────────────────────────────────
    const updateCart = useCallback((ttId: number, delta: number, max: number) => {
        setCart(prev => {
            const cur = prev[ttId] ?? 0;
            const next = Math.max(0, Math.min(cur + delta, max));
            if (next === 0) { const { [ttId]: _, ...rest } = prev; return rest; }
            return { ...prev, [ttId]: next };
        });
    }, []);

    const resetForm = () => {
        setCart({});
        setContactEmail('');
        setPaymentMethod(null);
        setApplyFee(true);
    };

    // ── Optimistic stats update after a sale ──────────────────────────────────
    const updateStatsAfterSale = (sale: RecentSale, saleTotal: number, method: string, qty: number) => {
        setStats(prev => {
            const todayByMethod = { ...prev.today.by_method };
            const totalByMethod = { ...prev.total.by_method };

            const updateMethod = (map: Record<string, MethodStats>) => {
                const existing = map[method] ?? { revenue: 0, tickets: 0, count: 0 };
                return {
                    ...map,
                    [method]: {
                        revenue: existing.revenue + saleTotal,
                        tickets: existing.tickets + qty,
                        count: existing.count + 1,
                    },
                };
            };

            return {
                today: {
                    revenue: prev.today.revenue + saleTotal,
                    tickets: prev.today.tickets + qty,
                    by_method: updateMethod(todayByMethod),
                },
                total: {
                    revenue: prev.total.revenue + saleTotal,
                    tickets: prev.total.tickets + qty,
                    by_method: updateMethod(totalByMethod),
                },
                recent_sales: [sale, ...prev.recent_sales].slice(0, 15),
            };
        });
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (cartItems.length === 0) { toast.error('Seleccioná al menos un ticket antes de confirmar.'); return; }
        if (!paymentMethod)          { toast.error('Seleccioná el método de pago.'); return; }
        if (cartItems.length > 1)    { toast.error('Por ahora solo se puede procesar un tipo de ticket por venta.'); return; }

        const item = cartItems[0];
        setIsSubmitting(true);

        try {
            const response = await axios.post(route('organizer.events.box-office.store', event.id), {
                ticket_type_id: item.ticketType.id,
                quantity:       item.quantity,
                payment_method: paymentMethod,
                contact_email:  contactEmail || null,
                apply_fee:      applyFee,
            });

            const data = response.data;
            const now  = new Date();

            // Optimistic update
            const newSale: RecentSale = {
                id:              data.order_id,
                transaction_id:  data.transaction_id ?? null,
                order_date:      now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                order_full_date: now.toLocaleString('es-AR'),
                payment_method:  paymentMethod,
                total_amount:    total,
                ticket_count:    item.quantity,
                ticket_types:    [{ name: item.ticketType.name, quantity: item.quantity }],
            };
            updateStatsAfterSale(newSale, total, paymentMethod, item.quantity);

            toast.success(`¡Venta registrada! ${item.quantity} entrada${item.quantity > 1 ? 's' : ''} emitida${item.quantity > 1 ? 's' : ''}.`);
            setSuccessModal({ open: true, orderId: data.order_id, printUrl: data.print_url, quantitySold: item.quantity });
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Ocurrió un error al procesar la venta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextSale = () => {
        setSuccessModal({ open: false, orderId: null, printUrl: null, quantitySold: 0 });
        resetForm();
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <>
            <Head title={`Boletería — ${event.name}`} />

            <EventManagementLayout event={event} activeTab="box-office">
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Boletería</h1>
                            <p className="text-sm text-gray-500">Venta presencial · Consumidor Final</p>
                        </div>
                        <button
                            onClick={() => setStatsOpen(o => !o)}
                            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                statsOpen
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                    : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5" />
                            Recaudación
                            <ChevronDown className={`w-3 h-3 transition-transform ${statsOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* ── Stats panel (collapsible) ── */}
                    {statsOpen && <StatsBar stats={stats} />}

                    {eventFunctions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                            <AlertCircle className="w-12 h-12 opacity-40" />
                            <p className="text-lg font-medium">No hay funciones activas para este evento.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-5">
                            {/* ── LEFT: Ticket selector ── */}
                            <div className="flex-1 space-y-4">
                                {eventFunctions.length > 1 && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Función</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {eventFunctions.map(fn => (
                                                <button key={fn.id}
                                                    onClick={() => { setSelectedFunctionId(fn.id); setCart({}); }}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${selectedFunctionId === fn.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    {fn.name} — {fn.date} {fn.time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {ticketTypes.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
                                        <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p>No hay tipos de ticket disponibles para esta función.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {ticketTypes.map(tt => {
                                            const qty = cart[tt.id] ?? 0;
                                            const isOut = tt.available === 0;
                                            return (
                                                <div key={tt.id} className={`bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between gap-4 transition-all ${isOut ? 'opacity-50 border-gray-200' : qty > 0 ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-gray-900 text-base truncate">{tt.name}</p>
                                                            {tt.sector?.name && <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">{tt.sector.name}</Badge>}
                                                            {isOut && <Badge className="text-xs bg-red-100 text-red-700 border-red-200">Sin stock</Badge>}
                                                        </div>
                                                        <p className="text-xl font-bold text-indigo-600 mt-1">{formatCurrency(tt.price)}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{tt.available} disponible{tt.available !== 1 ? 's' : ''}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <button disabled={qty === 0} onClick={() => updateCart(tt.id, -1, tt.available)} className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><Minus className="w-4 h-4" /></button>
                                                        <span className="w-8 text-center font-bold text-xl text-gray-900 tabular-nums">{qty}</span>
                                                        <button disabled={isOut || qty >= tt.available} onClick={() => updateCart(tt.id, +1, tt.available)} className="w-10 h-10 rounded-full border-2 border-indigo-400 bg-indigo-50 flex items-center justify-center text-indigo-700 hover:bg-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><Plus className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Recent sales table */}
                                <RecentSalesTable sales={stats.recent_sales} />
                            </div>

                            {/* ── RIGHT: Checkout panel ── */}
                            <div className="lg:w-96 shrink-0">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5 sticky top-28">
                                    {/* Summary */}
                                    <div>
                                        <h2 className="font-semibold text-gray-900 text-base mb-3">Resumen</h2>
                                        {cartItems.length === 0 ? (
                                            <div className="text-center py-6 text-gray-400">
                                                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">Seleccioná entradas para comenzar</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {cartItems.map(item => (
                                                    <div key={item.ticketType.id} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-700"><span className="font-bold text-gray-900">{item.quantity}×</span> {item.ticketType.name}</span>
                                                        <span className="font-semibold text-gray-900">{formatCurrency(item.ticketType.price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                                {feeAmount > 0 && (
                                                    <div className="flex justify-between items-center text-sm text-gray-500 border-t border-dashed pt-2 mt-2">
                                                        <span>Cargo de servicio ({(feeRate * 100).toFixed(0)}%)</span>
                                                        <span>{formatCurrency(feeAmount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center border-t pt-3 mt-2">
                                                    <span className="font-bold text-gray-900 text-base">Total</span>
                                                    <span className="font-bold text-indigo-700 text-2xl">{formatCurrency(total)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Fee toggle */}
                                    {platform_fee > 0 && (
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input type="checkbox" checked={applyFee} onChange={e => setApplyFee(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-sm text-gray-600">Cobrar cargo de servicio ({(platform_fee).toFixed(0)}%)</span>
                                        </label>
                                    )}

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="contact_email" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5" />Email del comprador <span className="text-gray-400 font-normal">(opcional)</span>
                                        </Label>
                                        <Input id="contact_email" type="email" placeholder="nombre@email.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="text-sm" />
                                        {contactEmail && <p className="text-xs text-indigo-600">Los QRs se enviarán a este email.</p>}
                                    </div>

                                    {/* Payment method */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Método de pago</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {(Object.keys(methodConfig) as PaymentMethod[]).map(pm => (
                                                <button key={pm} onClick={() => setPaymentMethod(pm)}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${paymentMethod === pm ? methodConfig[pm].color + ' shadow-sm ring-2 ring-offset-1 ring-current' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    {methodConfig[pm].icon}{methodConfig[pm].label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Confirm */}
                                    <Button onClick={handleSubmit} disabled={cartItems.length === 0 || !paymentMethod || isSubmitting}
                                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md disabled:opacity-50 transition-all"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" />Procesando...</span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5" />Confirmar Pago y Emitir
                                                {totalQty > 0 && <Badge className="bg-white/20 text-white border-0 ml-1">{totalQty}</Badge>}
                                            </span>
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-gray-400">También podés presionar Enter ↵</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </EventManagementLayout>

            {/* Success modal */}
            <Dialog open={successModal.open} onOpenChange={open => !open && handleNextSale()}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg mb-4">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-gray-900">¡Venta registrada!</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 space-y-3 text-gray-600">
                        <p className="text-base"><span className="font-semibold text-gray-900">{successModal.quantitySold}</span> entrada{successModal.quantitySold > 1 ? 's' : ''} emitida{successModal.quantitySold > 1 ? 's' : ''} correctamente.</p>
                        {contactEmail && <p className="text-sm text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">QR enviado a <span className="font-semibold">{contactEmail}</span></p>}
                        <p className="text-sm text-gray-400">Orden #{successModal.orderId}</p>
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                        <Button onClick={() => successModal.printUrl && window.open(successModal.printUrl, '_blank')} variant="outline" className="w-full gap-2 border-gray-300 text-gray-700 hover:bg-gray-50">
                            <Printer className="w-4 h-4" />Imprimir Entradas (QR)
                        </Button>
                        <Button onClick={handleNextSale} className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold">
                            <RefreshCw className="w-4 h-4" />Vender a otro cliente
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: Stats }) {
    const [view, setView] = useState<'today' | 'total'>('today');
    const data = view === 'today' ? stats.today : stats.total;

    const methods = ['cash', 'pos', 'qr'] as const;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            {/* Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-700">Recaudación</span>
                </div>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium">
                    <button onClick={() => setView('today')} className={`px-3 py-1.5 transition-colors ${view === 'today' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Hoy</button>
                    <button onClick={() => setView('total')} className={`px-3 py-1.5 transition-colors ${view === 'total' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Total evento</button>
                </div>
            </div>

            {/* Main stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total revenue */}
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-lg p-3 border border-indigo-100">
                    <p className="text-xs text-indigo-600 font-medium mb-1">Recaudado</p>
                    <p className="text-lg font-bold text-indigo-800 tabular-nums">{formatCurrency(data.revenue)}</p>
                </div>

                {/* Tickets */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-1">Entradas</p>
                    <p className="text-lg font-bold text-gray-800 tabular-nums">{data.tickets}</p>
                </div>

                {/* By payment method */}
                {methods.map(method => {
                    const m = data.by_method[method];
                    const cfg = methodConfig[method];
                    return (
                        <div key={method} className={`rounded-lg p-3 border ${m ? cfg.badgeClass + ' border-current/20' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-3.5 h-3.5 [&>svg]:w-full [&>svg]:h-full">{cfg.icon}</span>
                                <p className="text-xs font-medium truncate">{cfg.label}</p>
                            </div>
                            <p className="text-base font-bold tabular-nums">{m ? formatCurrency(m.revenue) : '—'}</p>
                            {m && <p className="text-xs opacity-70 mt-0.5">{m.tickets} entrada{m.tickets !== 1 ? 's' : ''}</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Recent Sales Table ───────────────────────────────────────────────────────

function RecentSalesTable({ sales }: { sales: RecentSale[] }) {
    if (sales.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Últimas ventas</span>
                <Badge variant="secondary" className="ml-auto text-xs">{sales.length}</Badge>
            </div>
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {sales.map(sale => {
                    const cfg = methodConfig[sale.payment_method] ?? methodConfig['cash'];
                    return (
                        <div key={sale.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            {/* Time */}
                            <span className="text-xs font-mono text-gray-400 shrink-0 w-10">{sale.order_date}</span>

                            {/* Ticket types */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 truncate">
                                    {sale.ticket_types.map(t => `${t.quantity}× ${t.name}`).join(', ')}
                                </p>
                                {sale.transaction_id && (
                                    <p className="text-xs text-gray-400 truncate">{sale.transaction_id}</p>
                                )}
                            </div>

                            {/* Payment badge */}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.badgeClass}`}>
                                {cfg.label}
                            </span>

                            {/* Amount */}
                            <span className="text-sm font-bold text-gray-900 shrink-0 tabular-nums">
                                {formatCurrency(sale.total_amount)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
