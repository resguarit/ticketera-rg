import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Plus, Copy, DollarSign, TrendingUp, StickyNote, Check } from 'lucide-react'; // Agregue Check para feedback
import { formatCurrency } from '@/lib/currencyHelpers';
import { toast } from 'sonner';

interface CodeDetail {
    code: string;
    sales_count: number;
    revenue: number;
    link: string;
    discount_value: number;
}

interface Promoter {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    codes: CodeDetail[];
    total_sales: number;
    total_revenue: number;
}

interface Props {
    event: any;
    promoters: Promoter[];
}

export default function PromotersIndex({ event, promoters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        notes: '',
        code: '',
        discount_value: 0 // Iniciamos en 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('organizer.events.promoters.store', event.id), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            }
        });
    };

    // Lógica de copiado robusta (Estilo Admin Panel)
    const copyToClipboard = (text: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                toast.success("Enlace copiado al portapapeles");
            });
        } else {
            // Fallback para navegadores viejos o contextos no seguros
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success("Enlace copiado al portapapeles");
            } catch (err) {
                toast.error("No se pudo copiar el enlace");
            }
            document.body.removeChild(textArea);
        }
    };

    const totalSales = promoters.reduce((acc, p) => acc + p.total_sales, 0);
    const totalRevenue = promoters.reduce((acc, p) => acc + p.total_revenue, 0);

    return (
        <EventManagementLayout event={event} activeTab="promoters">
            <Head title={`Vendedores - ${event.name}`} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6 text-gray-600" /> Gestion de vendedores
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Gestiona embajadores, asigna códigos y monitorea comisiones.
                    </p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" /> Nuevo Vendedor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Crear Vendedor</DialogTitle>
                            <DialogDescription>Genera un código de tracking para un nuevo vendedor.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="name">Nombre Completo</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Ej: Juan Pérez"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="notes">Notas Internas</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder="Ej: Alias CBU, detalles de comisión..."
                                        className="resize-none h-20"
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 pb-2 rounded-b-lg">
                                <h4 className="text-sm font-medium mb-3 text-blue-700">Configuración del Código</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="code">Código (Referencia)</Label>
                                        <Input
                                            id="code"
                                            value={data.code}
                                            onChange={e => setData('code', e.target.value.toUpperCase())}
                                            placeholder="JUAN10"
                                            className="font-mono uppercase tracking-widest border-blue-200 focus-visible:ring-blue-500"
                                            required
                                        />
                                        {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="value">Descuento (%)</Label>
                                        <Input
                                            type="number"
                                            id="value"
                                            value={0} // FORZADO A 0 VISUALMENTE
                                            disabled // BLOQUEADO
                                            className="bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-[10px] text-gray-500">Descuento deshabilitado (Solo Tracking).</p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={processing} className="w-full">
                                    {processing ? 'Guardando...' : 'Crear Vendedor'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas Referidas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSales}</div>
                        <p className="text-xs text-muted-foreground">Entradas vendidas por promotores</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Generados</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Recaudación total vía links</p>
                    </CardContent>
                </Card>
            </div>

            {/* Listado */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[25%]">Vendedor</TableHead>
                                <TableHead>Códigos y Enlaces</TableHead>
                                <TableHead className="text-right">Total Ventas</TableHead>
                                <TableHead className="text-right">Total ($)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promoters.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        No hay vendedores asignados a este evento.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                promoters.map((promoter) => (
                                    <TableRow key={promoter.id} className="align-top">
                                        <TableCell>
                                            <div className="font-medium text-base">{promoter.name}</div>
                                            <div className="text-xs text-muted-foreground">{promoter.email || promoter.phone || '-'}</div>
                                            {promoter.notes && (
                                                <div className="mt-2 text-xs bg-yellow-50 text-yellow-700 p-1.5 rounded border border-yellow-100 flex gap-1 items-start">
                                                    <StickyNote className="w-3 h-3 min-w-3 mt-0.5" />
                                                    <span>{promoter.notes}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {/* AQUÍ ESTA EL SCROLL MÁGICO: max-h-[160px] permite ver aprox 2 items completos y scroll si hay más */}
                                            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                                {promoter.codes.map((codeDetail, idx) => (
                                                    <div key={idx} className="flex flex-col gap-1 p-2 rounded bg-white border border-gray-100 shadow-sm hover:border-blue-100 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5 uppercase tracking-wide bg-gray-100 text-gray-700 border-gray-200">
                                                                {codeDetail.code}
                                                            </Badge>
                                                            <div className="text-xs text-gray-500 font-medium">
                                                                {codeDetail.sales_count} ventas • {formatCurrency(codeDetail.revenue)}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <code className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-1 rounded flex-1 truncate select-all border border-gray-100">
                                                                {codeDetail.link}
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                                onClick={() => copyToClipboard(codeDetail.link)}
                                                                title="Copiar enlace"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-lg pt-4 align-top">
                                            {promoter.total_sales}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-lg text-green-700 pt-4 align-top">
                                            {formatCurrency(promoter.total_revenue)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </EventManagementLayout>
    );
}