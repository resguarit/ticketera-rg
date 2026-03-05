import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft, ScanLine, Banknote, CreditCard, QrCode,
    CheckCircle2, XCircle, Clock, Loader2, Search,
} from 'lucide-react';
import { Event, EventRelations } from '@/types/models/event';
import { formatCurrency } from '@/lib/currencyHelpers';

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'cash' | 'pos' | 'qr';

interface InactiveTicket {
    unique_code: string;
    batch_id: number;
    ticket_type: string | null;
    description: string | null;
}

interface RecentActivation {
    id: number;
    time: string;
    payment_method: string;
    total_amount: number;
    ticket_count: number;
}

interface ActivationPageProps {
    auth: any;
    event: Event & EventRelations;
    platform_fee: number;
    today_count: number;
    today_revenue: number;
    recent_activations: RecentActivation[];
    inactive_tickets: InactiveTicket[];
}

// ─── Method Config ────────────────────────────────────────────────────────────

const methodConfig: Record<PaymentMethod, { label: string; icon: React.ReactNode; activeClass: string; badgeClass: string }> = {
    cash: {
        label: 'Efectivo',
        icon: <Banknote className="w-4 h-4" />,
        activeClass: 'border-emerald-500 bg-emerald-500 text-white',
        badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    pos: {
        label: 'Posnet',
        icon: <CreditCard className="w-4 h-4" />,
        activeClass: 'border-blue-500 bg-blue-500 text-white',
        badgeClass: 'bg-blue-100 text-blue-800',
    },
    qr: {
        label: 'QR',
        icon: <QrCode className="w-4 h-4" />,
        activeClass: 'border-violet-500 bg-violet-500 text-white',
        badgeClass: 'bg-violet-100 text-violet-800',
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BatchActivation({
    auth, event, platform_fee,
    today_count: initCount, today_revenue: initRevenue,
    recent_activations: initActivations,
    inactive_tickets,
}: ActivationPageProps) {
    const [code, setCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [applyFee, setApplyFee] = useState(true);
    const [loading, setLoading] = useState(false);
    const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [todayCount, setTodayCount] = useState(initCount);
    const [todayRevenue, setTodayRevenue] = useState(initRevenue);
    const [activations, setActivations] = useState<RecentActivation[]>(initActivations);

    const inputRef = useRef<HTMLInputElement>(null);

    // Filter suggestions based on current input
    const suggestions = code.trim().length >= 2
        ? inactive_tickets
            .filter(t => t.unique_code.toLowerCase().includes(code.toLowerCase().trim()))
            .slice(0, 8)
        : [];

    // Keyboard shortcuts F1/F2/F3
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'F1') { e.preventDefault(); setPaymentMethod('cash'); inputRef.current?.focus(); }
            if (e.key === 'F2') { e.preventDefault(); setPaymentMethod('pos'); inputRef.current?.focus(); }
            if (e.key === 'F3') { e.preventDefault(); setPaymentMethod('qr'); inputRef.current?.focus(); }
            if (e.key === 'Escape') { setShowSuggestions(false); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleActivate = async (overrideCode?: string) => {
        const finalCode = (overrideCode ?? code).trim();
        if (!finalCode) return;

        setLoading(true);
        setLastResult(null);
        setShowSuggestions(false);

        try {
            const res = await axios.post(
                route('organizer.events.batches.activate', event.id),
                { unique_code: finalCode, payment_method: paymentMethod, apply_fee: applyFee }
            );

            const data = res.data.data;
            const now = new Date();

            const newAct: RecentActivation = {
                id: data.order_id,
                time: now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                payment_method: paymentMethod,
                total_amount: data.total_amount,
                ticket_count: 1,
            };
            setActivations(prev => [newAct, ...prev].slice(0, 20));
            setTodayCount(c => c + 1);
            setTodayRevenue(r => r + data.total_amount);

            setLastResult({ success: true, message: `✓ ${data.ticket_type_name} — ${formatCurrency(data.total_amount)}` });
            setCode('');
        } catch (err: any) {
            setLastResult({ success: false, message: err.response?.data?.message ?? 'Error desconocido' });
            setCode('');
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSelect = (ticket: InactiveTicket) => {
        setCode(ticket.unique_code);
        setShowSuggestions(false);
        setTimeout(() => inputRef.current?.focus(), 10);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { setShowSuggestions(false); handleActivate(); }
        if (e.key === 'Escape') setShowSuggestions(false);
    };

    return (
        <>
            <Head title={`Activación — ${event.name}`} />

            <EventManagementLayout event={event} activeTab="batches">
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <Link href={route('organizer.events.batches.index', event.id)}>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-800 -ml-2">
                                <ArrowLeft className="w-4 h-4" />
                                Volver a Lotes
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2 ml-1">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                                <ScanLine className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Activación en Puerta</h1>
                                <p className="text-xs text-gray-500">Escanear QR o buscar por código</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* ── LEFT: Scan + Search panel ── */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* Search / Scan input */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Search className="w-4 h-4 text-violet-500" />
                                        Código de ticket
                                        <span className="text-xs font-normal text-gray-400">(escaneá o escribí para buscar)</span>
                                    </Label>

                                    {/* Input with dropdown */}
                                    <div className="relative">
                                        <Input
                                            ref={inputRef}
                                            type="text"
                                            value={code}
                                            onChange={e => {
                                                setCode(e.target.value);
                                                setShowSuggestions(true);
                                                setLastResult(null);
                                            }}
                                            onKeyDown={handleKeyDown}
                                            onFocus={() => code.trim().length >= 2 && setShowSuggestions(true)}
                                            placeholder="Ej: BAT-..."
                                            disabled={loading}
                                            autoComplete="off"
                                            autoFocus
                                            className="font-mono text-base h-12 pr-10 border-2 focus:border-violet-400"
                                        />
                                        {loading && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                                            </div>
                                        )}

                                        {/* Suggestions dropdown */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto divide-y divide-gray-50">
                                                {suggestions.map(t => (
                                                    <button
                                                        key={t.unique_code}
                                                        type="button"
                                                        onMouseDown={e => { e.preventDefault(); handleSelect(t); }}
                                                        className="w-full text-left px-4 py-3 hover:bg-violet-50 flex items-center justify-between gap-3 transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-mono text-sm font-semibold text-gray-900">{t.unique_code}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {t.ticket_type}
                                                                {t.description && <span className="ml-2 text-gray-400">· {t.description}</span>}
                                                            </p>
                                                        </div>
                                                        <Badge className="bg-orange-100 text-orange-800 text-xs shrink-0">Inactiva</Badge>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Result feedback */}
                                    {lastResult && (
                                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                                            lastResult.success
                                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                                                : 'bg-red-50 border border-red-200 text-red-700'
                                        }`}>
                                            {lastResult.success
                                                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                : <XCircle className="w-4 h-4 shrink-0" />
                                            }
                                            {lastResult.message}
                                        </div>
                                    )}
                                </div>

                                {/* Payment methods */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        Método de pago <span className="text-xs font-normal text-gray-400">(F1/F2/F3)</span>
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.keys(methodConfig) as PaymentMethod[]).map((pm, i) => {
                                            const cfg = methodConfig[pm];
                                            const isActive = paymentMethod === pm;
                                            return (
                                                <button
                                                    key={pm}
                                                    type="button"
                                                    onClick={() => { setPaymentMethod(pm); inputRef.current?.focus(); }}
                                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                                                        isActive
                                                            ? cfg.activeClass
                                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {cfg.icon}
                                                    <span>{cfg.label}</span>
                                                    <span className={`text-xs ${isActive ? 'opacity-70' : 'opacity-40'}`}>F{i + 1}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Fee toggle */}
                                {platform_fee > 0 && (
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={applyFee}
                                            onChange={e => { setApplyFee(e.target.checked); inputRef.current?.focus(); }}
                                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                        />
                                        <span className="text-sm text-gray-600">
                                            Cobrar cargo de servicio ({platform_fee}%)
                                        </span>
                                    </label>
                                )}

                                {/* Activate button */}
                                <Button
                                    onClick={() => handleActivate()}
                                    disabled={!code.trim() || loading}
                                    className="w-full h-11 font-semibold bg-violet-600 hover:bg-violet-700 text-white"
                                >
                                    {loading
                                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Activando...</>
                                        : <><CheckCircle2 className="w-4 h-4 mr-2" />Activar Entrada (Enter)</>
                                    }
                                </Button>
                            </div>

                            {/* Available tickets count */}
                            <p className="text-xs text-gray-400 text-center">
                                {inactive_tickets.length} entrada{inactive_tickets.length !== 1 ? 's' : ''} pendiente{inactive_tickets.length !== 1 ? 's' : ''} de activar
                            </p>
                        </div>

                        {/* ── RIGHT: History ── */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden" style={{ maxHeight: '70vh' }}>
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-700">Historial de hoy</span>
                                <Badge variant="secondary" className="ml-auto text-xs">{activations.length}</Badge>
                            </div>

                            {activations.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                                    Sin activaciones hoy
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                                    {activations.map((act, idx) => {
                                        const cfg = methodConfig[act.payment_method as PaymentMethod] ?? methodConfig.cash;
                                        return (
                                            <div key={`${act.id}-${idx}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                                                <span className="text-xs font-mono text-gray-400 shrink-0 w-10">{act.time}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-1 ${cfg.badgeClass}`}>
                                                    {cfg.label}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900 tabular-nums shrink-0">
                                                    {formatCurrency(act.total_amount)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Total</span>
                                    <span className="font-bold text-emerald-700">{formatCurrency(todayRevenue)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </EventManagementLayout>
        </>
    );
}
