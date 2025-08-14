import { useState, useEffect } from 'react';
import { formatNumber } from '@/lib/currencyHelpers';
import { 
    BarChart3, 
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Calendar,
    Download,
    Filter,
    Eye,
    RefreshCw,
    FileText,
    PieChart,
    LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
// import { PageProps } from '@/types';

interface RealTimeStats {
    today_sales: number;
    today_tickets: number;
    active_events: number;
    total_users: number;
    last_update: string;
}

interface ReportsProps {
    salesData: {
        totalRevenue: number;
        monthlyRevenue: number;
        totalTickets: number;
        monthlyTickets: number;
        averageTicketPrice: number;
        conversionRate: number;
        growthRate: number;
    };
    topEvents: Array<{
        id: number;
        name: string;
        category: string;
        revenue: number;
        tickets_sold: number;
        growth: string;
        status: string;
    }>;
    monthlyData: Array<{
        month: string;
        revenue: number;
        tickets: number;
    }>;
    categoryData: Array<{
        category: string;
        percentage: number;
        revenue: number;
        color: string;
    }>;
    userDemographics: Array<{
        age: string;
        percentage: number;
        users: number;
    }>;
    timeRange: string;
    [key: string]: any; // Index signature para satisfacer PageProps
}

export default function Reports({ auth }: any) {
    const { salesData, topEvents, monthlyData, categoryData, userDemographics, timeRange } = usePage<ReportsProps>().props;
    
    const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);
    const [reportType, setReportType] = useState("sales");
    const [isGenerating, setIsGenerating] = useState(false);
    const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);

    // Actualizar datos cuando cambia el rango de tiempo
    const handleTimeRangeChange = (newTimeRange: string) => {
        setCurrentTimeRange(newTimeRange);
        router.get(route('admin.reports.index'), { timeRange: newTimeRange }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Cargar estadísticas en tiempo real
    const loadRealTimeStats = async () => {
        try {
            const response = await fetch(route('admin.reports.real-time'));
            const stats: RealTimeStats = await response.json();
            setRealTimeStats(stats);
        } catch (error) {
            console.error('Error loading real-time stats:', error);
        }
    };

    // Cargar estadísticas cada 30 segundos
    useEffect(() => {
        loadRealTimeStats();
        const interval = setInterval(loadRealTimeStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleGenerateReport = async (type: string) => {
        setIsGenerating(true);
        
        try {
            const response = await fetch(route('admin.reports.export', { 
                type, 
                timeRange: currentTimeRange 
            }));
            const result = await response.json();
            
            // Mostrar mensaje de éxito (puedes usar toast aquí)
            console.log(result.message);
            
        } catch (error) {
            console.error('Error generando reporte:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadReport = async (reportType: string, format: string = 'pdf') => {
        try {
            const response = await fetch(route('admin.reports.download', {
                type: format,
                report: reportType,
                timeRange: currentTimeRange
            }));
            const result = await response.json();
            
            // Simular descarga
            console.log(result.message);
            
        } catch (error) {
            console.error('Error descargando reporte:', error);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case "música": return "🎵";
            case "deportes": return "⚽";
            case "teatro": return "🎭";
            case "conferencias": return "💼";
            case "arte": return "🎨";
            case "cine": return "🎬";
            case "gastronomía": return "🍽️";
            default: return "📅";
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    };

    // Manejar caso cuando monthlyData está vacío
    const getMaxRevenue = () => {
        if (monthlyData.length === 0) return 1;
        return Math.max(...monthlyData.map(m => m.revenue));
    };

    return (
        <>
            <Head title="Reportes - Panel Admin" />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-black mb-2">
                                Reportes y Analíticas
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Análisis detallado del rendimiento de la plataforma
                            </p>
                            {realTimeStats && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Última actualización: {realTimeStats.last_update}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Select value={currentTimeRange} onValueChange={handleTimeRangeChange}>
                                <SelectTrigger className="w-40 bg-white border-gray-300 text-black">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-300">
                                    <SelectItem value="1m">Último mes</SelectItem>
                                    <SelectItem value="3m">Últimos 3 meses</SelectItem>
                                    <SelectItem value="6m">Últimos 6 meses</SelectItem>
                                    <SelectItem value="1y">Último año</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Button 
                                variant="outline" 
                                className="border-gray-300 text-black hover:bg-gray-50"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Actualizar
                            </Button>
                            
                            <Button 
                                className="bg-black text-white hover:bg-gray-800"
                                onClick={() => handleDownloadReport('complete')}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Generando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Download className="w-4 h-4" />
                                        <span>Exportar Reporte</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
                                        <p className="text-2xl font-bold text-black">{formatCurrency(salesData.totalRevenue)}</p>
                                        <div className="flex items-center mt-2">
                                            {salesData.growthRate >= 0 ? (
                                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                            )}
                                            <span className={`text-sm font-medium ${
                                                salesData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {salesData.growthRate >= 0 ? '+' : ''}{salesData.growthRate}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Tickets Vendidos</p>
                                        <p className="text-2xl font-bold text-black">{formatNumber(salesData.totalTickets)}</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="w-4 h-4 text-chart-2 mr-1" />
                                            <span className="text-chart-2 text-sm font-medium">+22%</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-2 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Precio Promedio</p>
                                        <p className="text-2xl font-bold text-black">{formatCurrency(salesData.averageTicketPrice)}</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="w-4 h-4 text-chart-3 mr-1" />
                                            <span className="text-chart-3 text-sm font-medium">+8%</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-3 rounded-lg flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Tasa de Conversión</p>
                                        <p className="text-2xl font-bold text-black">{salesData.conversionRate}%</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="w-4 h-4 text-chart-4 mr-1" />
                                            <span className="text-chart-4 text-sm font-medium">+3.2%</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-4 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats en tiempo real */}
                    {realTimeStats && (
                        <Card className="bg-gradient-to-r from-primary to-chart-4 text-white mb-8">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <p className="text-blue-100 text-sm">Ventas Hoy</p>
                                        <p className="text-2xl font-bold">{formatCurrency(realTimeStats.today_sales)}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-sm">Tickets Hoy</p>
                                        <p className="text-2xl font-bold">{realTimeStats.today_tickets}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-sm">Eventos Activos</p>
                                        <p className="text-2xl font-bold">{realTimeStats.active_events}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-sm">Total Usuarios</p>
                                        <p className="text-2xl font-bold">{realTimeStats.total_users}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tabs de Reportes */}
                    <Tabs value={reportType} onValueChange={setReportType}>
                        <TabsList className="bg-gray-100 border border-gray-300 mb-8">
                            <TabsTrigger value="sales" className="data-[state=active]:bg-white data-[state=active]:text-black">
                                Ventas
                            </TabsTrigger>
                            <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:text-black">
                                Eventos
                            </TabsTrigger>
                            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-black">
                                Usuarios
                            </TabsTrigger>
                            <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:text-black">
                                Categorías
                            </TabsTrigger>
                        </TabsList>

                        {/* Reporte de Ventas */}
                        <TabsContent value="sales">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <Card className="bg-white border-gray-200 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-black flex items-center space-x-2">
                                                <LineChart className="w-5 h-5" />
                                                <span>Tendencia de Ventas</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {monthlyData.length > 0 ? monthlyData.map((data, index) => (
                                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-12 h-12 bg-gradient-to-r from-primary to-chart-4 rounded-lg flex items-center justify-center">
                                                                <span className="text-white font-bold">{data.month}</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-black">{formatCurrency(data.revenue)}</p>
                                                                <p className="text-gray-600 text-sm">{data.tickets} tickets vendidos</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-32">
                                                            <Progress value={Math.max(data.revenue / getMaxRevenue() * 100, 5)} className="h-2" />
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-8">
                                                        <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay datos de ventas</h3>
                                                        <p className="text-gray-500">No se encontraron ventas en el período seleccionado</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div>
                                    <Card className="bg-white border-gray-200 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-black">Métricas Clave</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-green-800 font-medium">Este Mes</span>
                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                </div>
                                                <p className="text-2xl font-bold text-green-900">{formatCurrency(salesData.monthlyRevenue)}</p>
                                                <p className="text-green-700 text-sm">{salesData.monthlyTickets} tickets</p>
                                            </div>

                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-blue-800 font-medium">Promedio Diario</span>
                                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(Math.round(salesData.monthlyRevenue / 30))}</p>
                                                <p className="text-blue-700 text-sm">{Math.round(salesData.monthlyTickets / 30)} tickets</p>
                                            </div>

                                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-purple-800 font-medium">Proyección Anual</span>
                                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <p className="text-2xl font-bold text-purple-900">{formatCurrency(salesData.monthlyRevenue * 12)}</p>
                                                <p className="text-purple-700 text-sm">{formatNumber(salesData.monthlyTickets * 12)} tickets</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Reporte de Eventos */}
                        <TabsContent value="events">
                            <Card className="bg-white border-gray-200 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-black flex items-center space-x-2">
                                        <Calendar className="w-5 h-5" />
                                        <span>Top {topEvents.length} Eventos por Ingresos</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {topEvents.length > 0 ? topEvents.map((event, index) => (
                                            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-chart-4 rounded-lg flex items-center justify-center">
                                                        <span className="text-white font-bold">#{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-black">{event.name}</h3>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-sm">{getCategoryIcon(event.category)}</span>
                                                            <Badge className="bg-gray-200 text-gray-800 border-0 text-xs">
                                                                {event.category}
                                                            </Badge>
                                                            <Badge className={`border-0 text-xs ${
                                                                event.status === 'active' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                                                            }`}>
                                                                {event.status === 'active' ? 'Activo' : 'Completado'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-black">{formatCurrency(event.revenue)}</p>
                                                    <p className="text-gray-600 text-sm">{event.tickets_sold} tickets</p>
                                                    <div className="flex items-center justify-end mt-1">
                                                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                                                        <span className="text-green-600 text-xs font-medium">{event.growth}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-8">
                                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay datos de eventos</h3>
                                                <p className="text-gray-500">No se encontraron eventos con ventas en el período seleccionado</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Reporte de Usuarios */}
                        <TabsContent value="users">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black flex items-center space-x-2">
                                            <Users className="w-5 h-5" />
                                            <span>Demografía por Edad</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {userDemographics.map((demo, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-black font-medium">{demo.age} años</span>
                                                        <span className="text-gray-600">{formatNumber(Math.round(demo.users))} usuarios ({demo.percentage}%)</span>
                                                    </div>
                                                    <Progress value={demo.percentage} className="h-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black">Resumen de Usuarios</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-blue-50 rounded-lg text-center">
                                                <p className="text-blue-600 text-sm font-medium">Total Usuarios</p>
                                                <p className="text-2xl font-bold text-blue-900">{userDemographics.reduce((sum, demo) => sum + demo.users, 0).toLocaleString()}</p>
                                            </div>
                                            <div className="p-4 bg-green-50 rounded-lg text-center">
                                                <p className="text-green-600 text-sm font-medium">Más Activos</p>
                                                <p className="text-2xl font-bold text-green-900">
                                                    {userDemographics.length > 0 
                                                        ? userDemographics.find(d => d.percentage === Math.max(...userDemographics.map(ud => ud.percentage)))?.age || 'N/A'
                                                        : 'N/A'
                                                    }
                                                </p>
                                            </div>
                                            <div className="p-4 bg-purple-50 rounded-lg text-center">
                                                <p className="text-purple-600 text-sm font-medium">Promedio</p>
                                                <p className="text-2xl font-bold text-purple-900">
                                                    {userDemographics.length > 0 
                                                        ? Math.round(userDemographics.reduce((sum, demo) => sum + demo.users, 0) / userDemographics.length).toLocaleString()
                                                        : '0'
                                                    }
                                                </p>
                                            </div>
                                            <div className="p-4 bg-orange-50 rounded-lg text-center">
                                                <p className="text-orange-600 text-sm font-medium">Crecimiento</p>
                                                <p className="text-2xl font-bold text-orange-900">+12.5%</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Reporte de Categorías */}
                        <TabsContent value="categories">
                            <Card className="bg-white border-gray-200 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-black flex items-center space-x-2">
                                        <PieChart className="w-5 h-5" />
                                        <span>Distribución por Categorías</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {categoryData.length > 0 ? categoryData.map((category, index) => (
                                            <div key={index} className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 rounded`} style={{ backgroundColor: category.color }}></div>
                                                        <span className="text-black font-medium">{category.category}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-black font-semibold">{formatCurrency(category.revenue)}</p>
                                                        <p className="text-gray-600 text-sm">{category.percentage}%</p>
                                                    </div>
                                                </div>
                                                <Progress value={category.percentage} className="h-3" />
                                            </div>
                                        )) : (
                                            <div className="text-center py-8">
                                                <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay datos de categorías</h3>
                                                <p className="text-gray-500">No se encontraron ventas por categorías en el período seleccionado</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Acciones Rápidas */}
                    <Card className="bg-white border-gray-200 shadow-lg mt-8">
                        <CardHeader>
                            <CardTitle className="text-black flex items-center space-x-2">
                                <FileText className="w-5 h-5" />
                                <span>Generar Reportes Específicos</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button 
                                    variant="outline" 
                                    className="h-20 flex-col border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => handleDownloadReport('sales')}
                                >
                                    <BarChart3 className="w-6 h-6 mb-2" />
                                    <span>Reporte de Ventas</span>
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="h-20 flex-col border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => handleDownloadReport('events')}
                                >
                                    <Calendar className="w-6 h-6 mb-2" />
                                    <span>Reporte de Eventos</span>
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="h-20 flex-col border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => handleDownloadReport('users')}
                                >
                                    <Users className="w-6 h-6 mb-2" />
                                    <span>Reporte de Usuarios</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
Reports.layout = (page: any) => <AppLayout children={page} />;