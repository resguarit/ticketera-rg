import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { 
    BarChart3, 
    LineChart, 
    TrendingUp, 
    TrendingDown, 
    Users, 
    Calendar,
    DollarSign,
    Download,
    RefreshCw,
    PieChart,
    FileText,
    EyeOff
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
        status_label: string;
        status_color: string;
        is_active: boolean;
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
    [key: string]: any;
}

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num);
};

export default function Reports({ auth }: any) {
    const { salesData, topEvents, monthlyData, categoryData, userDemographics, timeRange } = usePage<ReportsProps>().props;
    
    const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);
    const [reportType, setReportType] = useState("sales");
    const [isGenerating, setIsGenerating] = useState(false);
    const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);

    const handleTimeRangeChange = (newTimeRange: string) => {
        setCurrentTimeRange(newTimeRange);
        router.get(route('admin.reports.index'), { timeRange: newTimeRange }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const loadRealTimeStats = async () => {
        try {
            const response = await fetch(route('admin.reports.real-time'));
            const stats: RealTimeStats = await response.json();
            setRealTimeStats(stats);
        } catch (error) {
            console.error('Error loading real-time stats:', error);
        }
    };

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
            console.log(result.message);
        } catch (error) {
            console.error('Error generando reporte:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadReport = async (reportType: string) => {
        setIsGenerating(true);
        
        try {
            const downloadUrl = route('admin.reports.download', {
                reportType: reportType,
                timeRange: currentTimeRange
            });
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`Descargando reporte de ${reportType}...`);
        } catch (error) {
            console.error('Error descargando reporte:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const getEventStatusBadge = (status: string, statusLabel: string, statusColor: string, isActive: boolean) => {
        const colorMap: Record<string, string> = {
            'green': 'bg-green-500 hover:bg-green-600',
            'blue': 'bg-blue-500 hover:bg-blue-600',
            'red': 'bg-red-500 hover:bg-red-600',
            'gray': 'bg-gray-500 hover:bg-gray-600',
            'yellow': 'bg-yellow-500 hover:bg-yellow-600',
            'orange': 'bg-orange-500 hover:bg-orange-600',
        };

        const badgeColor = colorMap[statusColor] || 'bg-gray-500 hover:bg-gray-600';
        
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${badgeColor} text-white border-0 text-xs`}>
                    {statusLabel}
                </Badge>
                {!isActive && (
                    <Badge className="bg-gray-400 hover:bg-gray-500 text-white border-0 text-xs">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Oculto
                    </Badge>
                )}
            </div>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    };

    const getMaxRevenue = () => {
        if (monthlyData.length === 0) return 1;
        return Math.max(...monthlyData.map(m => m.revenue));
    };

    return (
        <>
            <Head title="Reportes" />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">
                                Reportes y Analíticas
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                                Análisis detallado del rendimiento de la plataforma
                            </p>
                            {realTimeStats && (
                                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                    Última actualización: {realTimeStats.last_update}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                            <Select value={currentTimeRange} onValueChange={handleTimeRangeChange}>
                                <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300 text-black">
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
                                className="border-gray-300 text-black hover:bg-gray-50 w-full sm:w-auto"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Actualizar</span>
                            </Button>
                            
                            <Button 
                                className="bg-primary text-white hover:bg-primary-hover w-full sm:w-auto"
                                onClick={() => handleDownloadReport('complete')}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="hidden sm:inline">Generando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Download className="w-4 h-4" />
                                        <span className="hidden sm:inline">Exportar Reporte</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Ingresos Totales</p>
                                        <p className="text-lg sm:text-2xl font-bold text-black truncate">{formatCurrency(salesData.totalRevenue)}</p>
                                        <div className="flex items-center mt-2">
                                            {salesData.growthRate >= 0 ? (
                                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 flex-shrink-0" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1 flex-shrink-0" />
                                            )}
                                            <span className={`text-xs sm:text-sm font-medium ${
                                                salesData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {salesData.growthRate >= 0 ? '+' : ''}{salesData.growthRate}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                        <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Tickets Vendidos</p>
                                        <p className="text-lg sm:text-2xl font-bold text-black">{formatNumber(salesData.totalTickets)}</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-chart-2 mr-1 flex-shrink-0" />
                                            <span className="text-chart-2 text-xs sm:text-sm font-medium">+22%</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-2 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Precio Promedio</p>
                                        <p className="text-lg sm:text-2xl font-bold text-black truncate">{formatCurrency(salesData.averageTicketPrice)}</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-chart-3 mr-1 flex-shrink-0" />
                                            <span className="text-chart-3 text-xs sm:text-sm font-medium">+8%</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-3 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Tasa de Conversión</p>
                                        <p className="text-lg sm:text-2xl font-bold text-black">{salesData.conversionRate}%</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-chart-4 mr-1 flex-shrink-0" />
                                            <span className="text-chart-4 text-xs sm:text-sm font-medium">+3.2%</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-4 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats en tiempo real */}
                    {realTimeStats && (
                        <Card className="bg-gradient-to-r from-primary to-chart-4 text-white mb-6 sm:mb-8">
                            <CardContent className="p-4 sm:p-6">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
                                    <div>
                                        <p className="text-blue-100 text-xs sm:text-sm">Ventas Hoy</p>
                                        <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(realTimeStats.today_sales)}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-xs sm:text-sm">Tickets Hoy</p>
                                        <p className="text-lg sm:text-2xl font-bold">{realTimeStats.today_tickets}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-xs sm:text-sm">Eventos Activos</p>
                                        <p className="text-lg sm:text-2xl font-bold">{realTimeStats.active_events}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-xs sm:text-sm">Total Usuarios</p>
                                        <p className="text-lg sm:text-2xl font-bold">{realTimeStats.total_users}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tabs de Reportes */}
                    <Tabs value={reportType} onValueChange={setReportType}>
                        <TabsList className="bg-gray-100 border border-gray-300 mb-6 sm:mb-8 w-full sm:w-auto overflow-x-auto flex-nowrap">
                            <TabsTrigger value="sales" className="data-[state=active]:bg-white data-[state=active]:text-black text-xs sm:text-sm whitespace-nowrap">
                                Ventas
                            </TabsTrigger>
                            <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:text-black text-xs sm:text-sm whitespace-nowrap">
                                Eventos
                            </TabsTrigger>
                            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-black text-xs sm:text-sm whitespace-nowrap">
                                Usuarios
                            </TabsTrigger>
                            <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:text-black text-xs sm:text-sm whitespace-nowrap">
                                Categorías
                            </TabsTrigger>
                        </TabsList>

                        {/* Reporte de Ventas */}
                        <TabsContent value="sales">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                                <div className="lg:col-span-2">
                                    <Card className="bg-white border-gray-200 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-black flex items-center space-x-2 text-base sm:text-lg">
                                                <LineChart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                                <span>Tendencia de Ventas</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 sm:space-y-4">
                                                {monthlyData.length > 0 ? monthlyData.map((data, index) => (
                                                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-black text-sm sm:text-base">{data.month}</p>
                                                            <p className="text-xs sm:text-sm text-gray-600">{data.tickets} tickets</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[100px] sm:min-w-[150px]">
                                                                <div 
                                                                    className="h-full bg-gradient-to-r from-primary to-chart-4"
                                                                    style={{ width: `${(data.revenue / getMaxRevenue()) * 100}%` }}
                                                                />
                                                            </div>
                                                            <p className="font-bold text-black text-sm sm:text-base whitespace-nowrap">{formatCurrency(data.revenue)}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-8">
                                                        <LineChart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No hay datos de ventas</h3>
                                                        <p className="text-sm sm:text-base text-gray-500">No se encontraron ventas en el período seleccionado</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div>
                                    <Card className="bg-white border-gray-200 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-black text-base sm:text-lg">Métricas Clave</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 sm:space-y-4">
                                            <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-green-800 font-medium text-sm sm:text-base">Este Mes</span>
                                                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                </div>
                                                <p className="text-xl sm:text-2xl font-bold text-green-900">{formatCurrency(salesData.monthlyRevenue)}</p>
                                                <p className="text-green-700 text-xs sm:text-sm">{salesData.monthlyTickets} tickets</p>
                                            </div>

                                            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-blue-800 font-medium text-sm sm:text-base">Promedio Diario</span>
                                                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                                </div>
                                                <p className="text-xl sm:text-2xl font-bold text-blue-900">{formatCurrency(Math.round(salesData.monthlyRevenue / 30))}</p>
                                                <p className="text-blue-700 text-xs sm:text-sm">{Math.round(salesData.monthlyTickets / 30)} tickets</p>
                                            </div>

                                            <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-purple-800 font-medium text-sm sm:text-base">Proyección Anual</span>
                                                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                                                </div>
                                                <p className="text-xl sm:text-2xl font-bold text-purple-900">{formatCurrency(salesData.monthlyRevenue * 12)}</p>
                                                <p className="text-purple-700 text-xs sm:text-sm">{formatNumber(salesData.monthlyTickets * 12)} tickets</p>
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
                                    <CardTitle className="text-black flex items-center space-x-2 text-base sm:text-lg">
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                        <span>Top {topEvents.length} Eventos por Ingresos</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 sm:space-y-4">
                                        {topEvents.length > 0 ? topEvents.map((event, index) => (
                                            <div key={event.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                                                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary to-chart-4 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-bold text-sm sm:text-base">#{index + 1}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                                            <p className="text-base sm:text-lg font-bold text-black truncate">{event.name}</p>
                                                            {getEventStatusBadge(event.status, event.status_label, event.status_color, event.is_active)}
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-gray-600">{event.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-left sm:text-right pl-11 sm:pl-0">
                                                    <p className="text-lg sm:text-xl font-bold text-black">{formatCurrency(event.revenue)}</p>
                                                    <p className="text-gray-600 text-xs sm:text-sm">{event.tickets_sold} tickets</p>
                                                    <div className="flex items-center sm:justify-end mt-1">
                                                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                                                        <span className="text-xs sm:text-sm text-green-600 font-medium">{event.growth}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-8">
                                                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No hay datos de eventos</h3>
                                                <p className="text-sm sm:text-base text-gray-500">No se encontraron eventos con ventas en el período seleccionado</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Reporte de Usuarios */}
                        <TabsContent value="users">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black flex items-center space-x-2 text-base sm:text-lg">
                                            <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                            <span>Estadísticas de Usuarios</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 sm:space-y-4">
                                            {userDemographics.map((demo, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex justify-between text-xs sm:text-sm">
                                                        <span className="font-medium text-black">{demo.age}</span>
                                                        <span className="text-gray-600">{demo.percentage}% ({demo.users.toLocaleString()})</span>
                                                    </div>
                                                    <Progress value={demo.percentage} className="h-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black text-base sm:text-lg">Resumen de Usuarios</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg text-center">
                                                <p className="text-blue-600 text-xs sm:text-sm font-medium">Total Usuarios</p>
                                                <p className="text-xl sm:text-2xl font-bold text-blue-900">{userDemographics.reduce((sum, demo) => sum + demo.users, 0).toLocaleString()}</p>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-green-50 rounded-lg text-center">
                                                <p className="text-green-600 text-xs sm:text-sm font-medium">Verificados</p>
                                                <p className="text-xl sm:text-2xl font-bold text-green-900">
                                                    {Math.round(
                                                        userDemographics.reduce((sum, demo) => sum + demo.users, 0) * 0.85
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-purple-50 rounded-lg text-center">
                                                <p className="text-purple-600 text-xs sm:text-sm font-medium">Con Teléfono</p>
                                                <p className="text-xl sm:text-2xl font-bold text-purple-900">
                                                    {Math.round(
                                                        userDemographics.reduce((sum, demo) => sum + demo.users, 0) * 0.72
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-orange-50 rounded-lg text-center">
                                                <p className="text-orange-600 text-xs sm:text-sm font-medium">Sin Verificar</p>
                                                <p className="text-xl sm:text-2xl font-bold text-orange-900">
                                                    {Math.round(
                                                        userDemographics.reduce((sum, demo) => sum + demo.users, 0) * 0.15
                                                    ).toLocaleString()}
                                                </p>
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
                                    <CardTitle className="text-black flex items-center space-x-2 text-base sm:text-lg">
                                        <PieChart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                        <span>Distribución por Categorías</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 sm:space-y-6">
                                        {categoryData.length > 0 ? categoryData.map((category, index) => (
                                            <div key={index} className="space-y-2 sm:space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div 
                                                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: category.color }}
                                                        />
                                                        <span className="font-semibold text-black text-sm sm:text-base">{category.category}</span>
                                                    </div>
                                                    <div className="text-left sm:text-right pl-5 sm:pl-0">
                                                        <p className="font-bold text-black text-sm sm:text-base">{formatCurrency(category.revenue)}</p>
                                                        <p className="text-xs sm:text-sm text-gray-600">{category.percentage}%</p>
                                                    </div>
                                                </div>
                                                <Progress value={category.percentage} className="h-2 sm:h-3" />
                                            </div>
                                        )) : (
                                            <div className="text-center py-8">
                                                <PieChart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No hay datos de categorías</h3>
                                                <p className="text-sm sm:text-base text-gray-500">No se encontraron ventas por categorías en el período seleccionado</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Acciones Rápidas */}
                    <Card className="bg-white border-gray-200 shadow-lg mt-6 sm:mt-8">
                        <CardHeader>
                            <CardTitle className="text-black flex items-center space-x-2 text-base sm:text-lg">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                <span>Generar Reportes Específicos</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                <Button 
                                    variant="outline" 
                                    className="h-16 sm:h-20 flex-col border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => handleDownloadReport('sales')}
                                    disabled={isGenerating}
                                >
                                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                                    <span className="text-xs sm:text-sm">Reporte de Ventas</span>
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="h-16 sm:h-20 flex-col border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => handleDownloadReport('events')}
                                    disabled={isGenerating}
                                >
                                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                                    <span className="text-xs sm:text-sm">Reporte de Eventos</span>
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="h-16 sm:h-20 flex-col border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => handleDownloadReport('users')}
                                    disabled={isGenerating}
                                >
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                                    <span className="text-xs sm:text-sm">Reporte de Usuarios</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Reports.layout = (page: any) => <AppLayout children={page} />;