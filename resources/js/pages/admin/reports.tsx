import { useState } from 'react';
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
import { Head } from '@inertiajs/react';

// Mock data para reportes
const salesData = {
    totalRevenue: 2450000,
    monthlyRevenue: 340000,
    totalTickets: 15420,
    monthlyTickets: 2180,
    averageTicketPrice: 8500,
    conversionRate: 12.5,
    growthRate: 18.5
};

const topEvents = [
    {
        id: 1,
        name: "Festival de Música Electrónica 2024",
        category: "música",
        revenue: 450000,
        tickets_sold: 2850,
        growth: "+25%",
        status: "active"
    },
    {
        id: 2,
        name: "Concierto Sinfónico de Primavera",
        category: "música",
        revenue: 320000,
        tickets_sold: 1200,
        growth: "+18%",
        status: "completed"
    },
    {
        id: 3,
        name: "Copa Mundial de Fútbol",
        category: "deportes",
        revenue: 280000,
        tickets_sold: 1850,
        growth: "+12%",
        status: "active"
    },
    {
        id: 4,
        name: "Teatro: Romeo y Julieta",
        category: "teatro",
        revenue: 95000,
        tickets_sold: 580,
        growth: "+8%",
        status: "completed"
    },
    {
        id: 5,
        name: "Conferencia Tech 2024",
        category: "conferencia",
        revenue: 75000,
        tickets_sold: 450,
        growth: "+15%",
        status: "active"
    }
];

const monthlyData = [
    { month: "Ene", revenue: 180000, tickets: 950 },
    { month: "Feb", revenue: 220000, tickets: 1200 },
    { month: "Mar", revenue: 340000, tickets: 1850 },
    { month: "Abr", revenue: 280000, tickets: 1420 },
    { month: "May", revenue: 320000, tickets: 1680 },
    { month: "Jun", revenue: 450000, tickets: 2350 }
];

const categoryData = [
    { category: "Música", percentage: 45, revenue: 1102500, color: "bg-purple-500" },
    { category: "Deportes", percentage: 25, revenue: 612500, color: "bg-blue-500" },
    { category: "Teatro", percentage: 15, revenue: 367500, color: "bg-orange-500" },
    { category: "Conferencias", percentage: 10, revenue: 245000, color: "bg-green-500" },
    { category: "Otros", percentage: 5, revenue: 122500, color: "bg-gray-500" }
];

const userDemographics = [
    { age: "18-25", percentage: 30, users: 4626 },
    { age: "26-35", percentage: 35, users: 5397 },
    { age: "36-45", percentage: 20, users: 3084 },
    { age: "46-55", percentage: 10, users: 1542 },
    { age: "56+", percentage: 5, users: 771 }
];

export default function Reports({ auth }: any) {
    const [timeRange, setTimeRange] = useState("6m");
    const [reportType, setReportType] = useState("sales");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = (type: string) => {
        setIsGenerating(true);
        // Simular generación de reporte
        setTimeout(() => {
            setIsGenerating(false);
            console.log(`Generando reporte de ${type}`);
        }, 2000);
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case "música": return "🎵";
            case "deportes": return "⚽";
            case "teatro": return "🎭";
            case "conferencia": return "💼";
            default: return "📅";
        }
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
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Select value={timeRange} onValueChange={setTimeRange}>
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
                                onClick={() => handleGenerateReport('complete')}
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
                                        <p className="text-2xl font-bold text-black">${salesData.totalRevenue.toLocaleString()}</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                            <span className="text-green-600 text-sm font-medium">+{salesData.growthRate}%</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
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
                                        <p className="text-2xl font-bold text-black">{salesData.totalTickets.toLocaleString()}</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                                            <span className="text-blue-600 text-sm font-medium">+22%</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
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
                                        <p className="text-2xl font-bold text-black">${salesData.averageTicketPrice.toLocaleString()}</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                                            <span className="text-purple-600 text-sm font-medium">+8%</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
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
                                            <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
                                            <span className="text-orange-600 text-sm font-medium">+3.2%</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

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
                                                <span>Tendencia de Ventas (Últimos 6 meses)</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {monthlyData.map((data, index) => (
                                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                                <span className="text-white font-bold">{data.month}</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-black">${data.revenue.toLocaleString()}</p>
                                                                <p className="text-gray-600 text-sm">{data.tickets} tickets vendidos</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-32">
                                                            <Progress value={(data.revenue / 500000) * 100} className="h-2" />
                                                        </div>
                                                    </div>
                                                ))}
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
                                                <p className="text-2xl font-bold text-green-900">${salesData.monthlyRevenue.toLocaleString()}</p>
                                                <p className="text-green-700 text-sm">{salesData.monthlyTickets} tickets</p>
                                            </div>

                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-blue-800 font-medium">Promedio Diario</span>
                                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <p className="text-2xl font-bold text-blue-900">${Math.round(salesData.monthlyRevenue / 30).toLocaleString()}</p>
                                                <p className="text-blue-700 text-sm">{Math.round(salesData.monthlyTickets / 30)} tickets</p>
                                            </div>

                                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-purple-800 font-medium">Proyección Anual</span>
                                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <p className="text-2xl font-bold text-purple-900">${(salesData.monthlyRevenue * 12).toLocaleString()}</p>
                                                <p className="text-purple-700 text-sm">{(salesData.monthlyTickets * 12).toLocaleString()} tickets</p>
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
                                        <span>Top 5 Eventos por Ingresos</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {topEvents.map((event, index) => (
                                            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
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
                                                    <p className="text-xl font-bold text-black">${event.revenue.toLocaleString()}</p>
                                                    <p className="text-gray-600 text-sm">{event.tickets_sold} tickets</p>
                                                    <div className="flex items-center justify-end mt-1">
                                                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                                                        <span className="text-green-600 text-xs font-medium">{event.growth}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
                                                        <span className="text-gray-600">{demo.users.toLocaleString()} usuarios ({demo.percentage}%)</span>
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
                                                <p className="text-2xl font-bold text-blue-900">15,420</p>
                                            </div>
                                            <div className="p-4 bg-green-50 rounded-lg text-center">
                                                <p className="text-green-600 text-sm font-medium">Nuevos (Mes)</p>
                                                <p className="text-2xl font-bold text-green-900">1,247</p>
                                            </div>
                                            <div className="p-4 bg-purple-50 rounded-lg text-center">
                                                <p className="text-purple-600 text-sm font-medium">Activos</p>
                                                <p className="text-2xl font-bold text-purple-900">12,891</p>
                                            </div>
                                            <div className="p-4 bg-orange-50 rounded-lg text-center">
                                                <p className="text-orange-600 text-sm font-medium">Retención</p>
                                                <p className="text-2xl font-bold text-orange-900">83.6%</p>
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
                                        {categoryData.map((category, index) => (
                                            <div key={index} className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 rounded ${category.color}`}></div>
                                                        <span className="text-black font-medium">{category.category}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-black font-semibold">${category.revenue.toLocaleString()}</p>
                                                        <p className="text-gray-600 text-sm">{category.percentage}%</p>
                                                    </div>
                                                </div>
                                                <Progress value={category.percentage} className="h-3" />
                                            </div>
                                        ))}
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
                                    onClick={() => handleGenerateReport('sales')}
                                >
                                    <BarChart3 className="w-6 h-6 mb-2" />
                                    <span>Reporte de Ventas</span>
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="h-20 flex-col border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => handleGenerateReport('events')}
                                >
                                    <Calendar className="w-6 h-6 mb-2" />
                                    <span>Reporte de Eventos</span>
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="h-20 flex-col border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => handleGenerateReport('users')}
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