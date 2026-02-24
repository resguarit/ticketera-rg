import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    AreaChart, Area, XAxis, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    Play, LayoutGrid, Users, Clock, ArrowLeft,
    Trophy, Flag, Zap, Ticket, X, ChevronRight, ChevronLeft, Share2, CheckCircle2
} from 'lucide-react';

interface WrappedProps {
    event: { id: number; name: string };
    report: any; // Mismo JSON del servicio
    shareUrl?: string | null;
    isShared?: boolean;
}

export default function EventWrapped({ event, report, shareUrl, isShared = false }: WrappedProps) {
    const [viewMode, setViewMode] = useState<'dashboard' | 'stories'>('dashboard');
    const [copied, setCopied] = useState(false);

    const handleCopyShareLink = async () => {
        if (!shareUrl) return;

        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        } else {
            // Fallback for non-HTTPS (e.g. local dev servers)
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;

            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }

            document.body.removeChild(textArea);
        }
    };

    return (
        <>
            <Head title={`Event Wrapped - ${event.name}`} />

            <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-fuchsia-500/30">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 max-w-7xl mx-auto">
                    <div>
                        {!isShared && (
                            <Link href={`/organizer/events/${event.id}/access`} className="inline-flex items-center text-slate-400 hover:text-fuchsia-400 transition-colors mb-2 text-sm">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Volver al control de acceso
                            </Link>
                        )}
                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent tracking-tighter">
                            {event.name} <span className="text-white">Wrapped</span>
                        </h1>
                        <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm font-medium">
                            <Flag className="w-4 h-4" /> Resumen estadístico post-evento
                        </p>
                    </div>

                    <div className="flex bg-slate-900 rounded-full p-1 border border-slate-800 shadow-inner">
                        <button
                            onClick={() => setViewMode('dashboard')}
                            className={`px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center ${viewMode === 'dashboard' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            <LayoutGrid className="w-4 h-4 mr-2" /> <span className="hidden md:inline">Panel</span>
                        </button>
                        <button
                            onClick={() => setViewMode('stories')}
                            className={`px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center ${viewMode === 'stories' ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.3)]' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Play className="w-4 h-4 mr-2" /> <span className="hidden md:inline">Stories</span>
                        </button>
                        {!isShared && shareUrl && (
                            <button
                                onClick={handleCopyShareLink}
                                className={`px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center ml-1 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4 mr-1 md:mr-2" /> : <Share2 className="w-4 h-4 mr-1 md:mr-2" />}
                                <span className="hidden md:inline">{copied ? 'Copiado!' : 'Compartir'}</span>
                            </button>
                        )}
                    </div>
                </header>

                <main className="max-w-7xl mx-auto">
                    {viewMode === 'dashboard' ? (
                        <DashboardView report={report} />
                    ) : (
                        <StoriesView report={report} isShared={isShared} onClose={() => setViewMode('dashboard')} />
                    )}
                </main>
            </div>
        </>
    );
}

// -----------------------------------------------------------------------------
// DASHBOARD MODE (Bento Grid)
// -----------------------------------------------------------------------------
function DashboardView({ report }: { report: any }) {
    // Parsea data curva ingreso
    const curveData = Object.entries(report.entry_curve).map(([time, count]) => ({
        time,
        ingresos: count
    }));

    const att = report.attendance || {};
    const attendanceData = [
        { name: 'Compradores Ingresaron', value: att.buyers_attended || 0, color: '#d946ef' }, // fuchsia-500
        { name: 'Invitados Ingresaron', value: att.guests_attended || 0, color: '#3b82f6' },    // blue-500
        { name: 'Compradores No-Show', value: att.buyers_no_show || 0, color: '#701a75' },
        { name: 'Invitados No-Show', value: att.guests_no_show || 0, color: '#1e3a8a' }
    ];

    const buyersTotal = att.total_buyers || 1;
    const guestsTotal = att.total_guests || 1;
    const buyersNoShowPerc = Math.round(((att.buyers_no_show || 0) / buyersTotal) * 100);
    const guestsNoShowPerc = Math.round(((att.guests_no_show || 0) / guestsTotal) * 100);

    const [showDuplicates, setShowDuplicates] = useState(false);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">

            {/* Tarjeta 1: Asistencia (Ocupa 2 cols o 1 en móvil) */}
            <div className="md:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group hover:border-fuchsia-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="flex-1 z-10 w-full">
                    <h3 className="text-slate-400 font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5 text-fuchsia-400" /> Total Asistentes Reales
                    </h3>
                    <div className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
                        {att.total_attended || 0}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                            <div>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 block">Compradores</span>
                                <div className="text-fuchsia-500 font-black text-3xl">{att.buyers_attended || 0} <span className="text-sm font-medium text-slate-500">/ {att.total_buyers || 0}</span></div>
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                                <span className="text-rose-400 font-bold">{buyersNoShowPerc}% No-Show</span> ({att.buyers_no_show || 0} ausentes)
                            </div>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                            <div>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 block">Invitados</span>
                                <div className="text-blue-500 font-black text-3xl">{att.guests_attended || 0} <span className="text-sm font-medium text-slate-500">/ {att.total_guests || 0}</span></div>
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                                <span className="text-rose-400 font-bold">{guestsNoShowPerc}% No-Show</span> ({att.guests_no_show || 0} ausentes)
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-40 w-40 z-10 hidden md:block">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={attendanceData} innerRadius={45} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                                {attendanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tarjeta 2: Pico de Caos */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
                <h3 className="text-slate-400 font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" /> El Pico de Caos
                </h3>
                <div className="mt-8 relative z-10">
                    <div className="text-5xl font-black text-white tracking-tighter mb-1">
                        {report.peak_minute?.formatted || '--:--'}
                    </div>
                    <p className="text-slate-400 text-sm">
                        Minuto más intenso con <span className="text-amber-400 font-bold">{report.peak_minute?.total || 0} ingresos</span> simultáneos.
                    </p>
                </div>
            </div>

            {/* Tarjeta 3: Curva de Ingreso (Ocupa 3 columnas enteras abajo) */}
            <div className="md:col-span-3 bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 relative group hover:border-indigo-500/30 transition-colors">
                <h3 className="text-slate-400 font-semibold mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" /> Curva de Ingreso (Timeline)
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} dy={10} axisLine={false} tickLine={false} />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '16px', backdropFilter: 'blur(8px)' }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="ingresos" stroke="#818cf8" strokeWidth={4} fillOpacity={1} fill="url(#colorIngresos)" animationDuration={1500} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tarjeta 4: Top Escaneador */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 relative group hover:border-emerald-500/30 transition-colors flex flex-col max-h-[300px]">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <h3 className="text-slate-400 font-semibold mb-4 flex items-center gap-2 shrink-0">
                    <Trophy className="w-5 h-5 text-emerald-400" /> Ranking Porteros
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 space-y-3">
                    {report.top_scanners?.map((scanner: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${idx === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{idx + 1}</span>
                                <span className={`font-medium truncate max-w-[120px] ${idx === 0 ? 'text-white' : 'text-slate-300'}`} title={scanner.device}>{scanner.device}</span>
                            </div>
                            <span className="font-bold text-emerald-400">{scanner.total_success}</span>
                        </div>
                    ))}
                    {!report.top_scanners?.length && <p className="text-slate-500 text-sm">No hay datos de escaneos.</p>}
                </div>
            </div>

            {/* Tarjeta 5: Fallas / Colados */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 relative group hover:border-rose-500/30 transition-colors flex flex-col max-h-[300px]">
                <h3 className="text-slate-400 font-semibold mb-2 flex items-center gap-2 shrink-0">
                    <Ticket className="w-5 h-5 text-rose-400" /> Doble ingreso detectado
                </h3>

                {showDuplicates ? (
                    <div className="mt-4 flex-1 flex flex-col overflow-hidden relative z-10">
                        <div className="flex justify-between items-center mb-2 shrink-0">
                            <span className="text-slate-300 text-sm font-medium">Tickets duplicados:</span>
                            <button onClick={() => setShowDuplicates(false)} className="text-slate-500 hover:text-white text-xs underline">Volver</button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {report.duplicate_entries?.detail?.map((dup: any, idx: number) => (
                                <div key={idx} className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 flex justify-between items-center text-sm">
                                    <span className="font-mono text-slate-300 truncate mr-2" title={dup.unique_code}>{dup.unique_code || `ID: ${dup.issued_ticket_id}`}</span>
                                    <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-xs font-bold">{dup.scan_count}x</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 relative z-10 flex-1 flex flex-col justify-center">
                        <div className="text-5xl font-black text-white tracking-tighter mb-1">
                            {report.duplicate_entries?.total || 0}
                        </div>
                        <p className="text-slate-400 text-sm mb-4">
                            Tickets que pasaron <span className="text-rose-400 font-bold">más de una vez</span> por el escáner.
                        </p>
                        {(report.duplicate_entries?.total || 0) > 0 && (
                            <button
                                onClick={() => setShowDuplicates(true)}
                                className="mt-auto self-start text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Ver códigos detectados
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Tarjeta 6: Apertura y Cierre */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 flex flex-col justify-center">
                <div className="space-y-4">
                    <div>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Apertura de puertas</span>
                        <div className="text-white font-medium text-lg">{report.opening_closing?.opening?.formatted?.split(' ')[1] || '--:--'} hs</div>
                    </div>
                    <div className="h-px bg-slate-800/50 w-full"></div>
                    <div>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Último ingreso</span>
                        <div className="text-white font-medium text-lg">{report.opening_closing?.closing?.formatted?.split(' ')[1] || '--:--'} hs</div>
                    </div>
                </div>
            </div>

        </div>
    );
}

// -----------------------------------------------------------------------------
// STORIES MODE (Carrusel full inmersivo)
// -----------------------------------------------------------------------------
function StoriesView({ report, isShared, onClose }: { report: any, isShared: boolean, onClose: () => void }) {
    const [currentStory, setCurrentStory] = useState(0);
    const totalStories = 3;
    const STORY_DURATION = 5000; // 5 segundos por historia
    const [progress, setProgress] = useState(0);

    const nextStory = () => {
        if (currentStory < totalStories - 1) {
            setCurrentStory(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const prevStory = () => {
        if (currentStory > 0) {
            setCurrentStory(prev => prev - 1);
            setProgress(0);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    nextStory();
                    return 0;
                }
                return p + (100 / (STORY_DURATION / 50)); // Actualiza cada 50ms
            });
        }, 50);

        return () => clearInterval(interval);
    }, [currentStory]);


    const att = report.attendance || {};
    const buyersTotal = att.total_buyers || 1;
    const guestsTotal = att.total_guests || 1;
    const buyersNoShowPerc = Math.round(((att.buyers_no_show || 0) / buyersTotal) * 100);
    const guestsNoShowPerc = Math.round(((att.guests_no_show || 0) / guestsTotal) * 100);

    const runnersUp = report.top_scanners?.slice(1) || [];

    // Contenido de las historias
    const stories = [
        // STORY 1: Asistencia
        <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-24 h-24 bg-fuchsia-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(217,70,239,0.4)]">
                <Users className="w-12 h-12 text-fuchsia-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-medium text-fuchsia-300 mb-2 tracking-wide">¡Explotó la noche!</h2>
            <div className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {att.total_attended || 0}
            </div>
            <p className="text-xl md:text-2xl text-slate-300 font-light mb-8">almas presentes.</p>

            <div className="flex justify-center gap-6 text-left w-full max-w-sm">
                <div className="bg-black/30 backdrop-blur border border-white/10 p-4 rounded-2xl flex-1">
                    <p className="text-sm text-fuchsia-400 mb-1">Compradores</p>
                    <p className="text-3xl font-bold text-white mb-2">{att.buyers_attended || 0}</p>
                    <p className="text-[#a1a1aa] text-xs leading-tight">({buyersNoShowPerc}% se lo perdieron)</p>
                </div>
                <div className="bg-black/30 backdrop-blur border border-white/10 p-4 rounded-2xl flex-1">
                    <p className="text-sm text-blue-400 mb-1">Invitados</p>
                    <p className="text-3xl font-bold text-white mb-2">{att.guests_attended || 0}</p>
                    <p className="text-[#a1a1aa] text-xs leading-tight">({guestsNoShowPerc}% se lo perdieron)</p>
                </div>
            </div>
        </div>,

        // STORY 2: El Caos
        <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(245,158,11,0.4)]">
                <Zap className="w-12 h-12 text-amber-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-medium text-amber-300 mb-2 tracking-wide">El pico de locura absoluta</h2>
            <div className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {report.peak_minute?.formatted || '--:--'}
            </div>
            <p className="text-xl md:text-2xl text-slate-300 font-light max-w-lg mx-auto">
                Fue el minuto exacto donde <span className="font-bold text-amber-400">{report.peak_minute?.total || 0} tickets</span> volaron por las puertas simultáneamente.
            </p>
        </div>,

        // STORY 3: MVP Scanners
        <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-in slide-in-from-right-12 duration-700">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                <Trophy className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-medium text-emerald-300 mb-4 tracking-wide">El MVP de la puerta</h2>
            <div className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2 max-w-2xl mx-auto break-words leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {report.top_scanners?.[0]?.device || 'Nadie'}
            </div>
            <p className="text-lg md:text-xl text-slate-300 font-light mb-8">
                Validó <span className="font-bold text-emerald-400 text-3xl mx-2">{report.top_scanners?.[0]?.total_success || 0}</span> tickets en total.
            </p>

            {runnersUp.length > 0 && (
                <div className="w-full max-w-sm bg-black/30 backdrop-blur rounded-2xl p-4 border border-white/5 flex flex-col max-h-[250px] relative z-20 pointer-events-auto">
                    <p className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider shrink-0">Top Seguidores</p>
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-30">
                        {runnersUp.map((scanner: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-black/20 p-2 rounded-lg text-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-emerald-500/50 font-bold text-xs">#{i + 2}</span>
                                    <span className="text-slate-300 font-medium truncate pr-2">{scanner.device}</span>
                                </div>
                                <span className="text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded">{scanner.total_success}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    ];

    // Background gradients para cada historia
    const bgs = [
        'bg-gradient-to-br from-slate-900 via-fuchsia-950 to-slate-950',
        'bg-gradient-to-br from-slate-900 via-amber-950 to-slate-950',
        'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950',
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <div className={`relative w-full h-full max-w-md md:max-w-2xl mx-auto md:h-[800px] md:rounded-[3rem] overflow-hidden ${bgs[currentStory]} transition-colors duration-1000`}>

                {/* Barras de progreso */}
                <div className="absolute top-0 left-0 right-0 p-4 md:pt-8 md:px-8 flex gap-2 z-20">
                    {Array.from({ length: totalStories }).map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-white transition-all duration-75 ease-linear"
                                style={{
                                    width: idx < currentStory ? '100%' : idx === currentStory ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Controles top */}
                {!isShared && (
                    <div className="absolute top-10 right-4 md:right-8 z-20">
                        <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                )}
                {isShared && (
                    <div className="absolute bottom-4 right-4 z-20 opacity-50 text-[10px] uppercase font-bold text-white flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-full border border-white/10">
                        Ticketera RG <Ticket className="w-3 h-3" />
                    </div>
                )}

                {/* Contenido (Click áreas) */}
                <div className="flex h-full w-full relative">
                    <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={prevStory} />
                    <div className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer" onClick={nextStory} />

                    <div className="w-full h-full pb-20 pt-16 relative z-0">
                        {stories[currentStory]}
                    </div>
                </div>

                {/* Indicadores en móvil/desktop si quieres */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 text-white/50 z-20 pointer-events-none">
                    <span className="flex items-center text-sm uppercase tracking-widest font-bold">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Atrás // Toca // Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                </div>
            </div>
        </div>
    );
}
