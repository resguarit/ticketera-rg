{{-- filepath: resources/views/pdfs/reports/complete.blade.php --}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            margin-bottom: 40px;
        }
        
        .header h1 { font-size: 32px; margin-bottom: 8px; }
        .header p { font-size: 16px; opacity: 0.9; }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
        }
        
        .stats-overview {
            display: flex;
            margin-bottom: 30px;
            gap: 15px;
        }
        
        .stat-card {
            flex: 1;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Período: {{ $period }} | {{ $startDate }} - {{ $endDate }}</p>
        <p>Generado el {{ $generatedAt }}</p>
    </div>

    <!-- Resumen Ejecutivo -->
    <div class="section">
        <h2 class="section-title">Resumen Ejecutivo</h2>
        <div class="stats-overview">
            <div class="stat-card">
                <div class="stat-value">${{ number_format($salesData['totalRevenue'], 2, ',', '.') }}</div>
                <div class="stat-label">Ingresos Totales</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{{ number_format($salesData['totalTickets']) }}</div>
                <div class="stat-label">Tickets Vendidos</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{{ $eventsData['totalEvents'] }}</div>
                <div class="stat-label">Total Eventos</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{{ number_format($userStats['totalUsers']) }}</div>
                <div class="stat-label">Total Usuarios</div>
            </div>
        </div>
    </div>

    <div class="page-break"></div>

    <!-- Análisis de Ventas -->
    <div class="section">
        <h2 class="section-title">Análisis de Ventas</h2>
        <p><strong>Ingresos Totales:</strong> ${{ number_format($salesData['totalRevenue'], 2, ',', '.') }}</p>
        <p><strong>Tickets Vendidos:</strong> {{ number_format($salesData['totalTickets']) }}</p>
        <p><strong>Precio Promedio por Ticket:</strong> ${{ number_format($salesData['avgTicketPrice'], 2, ',', '.') }}</p>
        <p><strong>Órdenes Procesadas:</strong> {{ number_format($salesData['totalOrders']) }}</p>
    </div>

    <!-- Top Eventos -->
    <div class="section">
        <h2 class="section-title">Top 10 Eventos por Ingresos</h2>
        @foreach(array_slice($topEvents, 0, 10) as $index => $event)
            <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                <strong>{{ $index + 1 }}. {{ $event['name'] }}</strong><br>
                <span style="color: #666; font-size: 11px;">
                    {{ $event['category'] }} • {{ $event['venue'] ?? 'Sin venue' }} • 
                    ${{ number_format($event['revenue'], 2, ',', '.') }} • 
                    {{ $event['ticketsSold'] }} tickets
                </span>
            </div>
        @endforeach
    </div>

    <div class="page-break"></div>

    <!-- Análisis por Categorías -->
    <div class="section">
        <h2 class="section-title">Análisis por Categorías</h2>
        @foreach($categoryStats as $category)
            <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span><strong>{{ $category['name'] }}</strong></span>
                <span style="color: #666;">
                    ${{ number_format($category['revenue'], 2, ',', '.') }} • 
                    {{ $category['eventsCount'] }} eventos
                </span>
            </div>
        @endforeach
    </div>

    <!-- Análisis de Usuarios -->
    <div class="section">
        <h2 class="section-title">Análisis de Usuarios</h2>
        <p><strong>Total de Usuarios:</strong> {{ number_format($userStats['totalUsers']) }}</p>
        <p><strong>Nuevos Usuarios (período):</strong> {{ number_format($userStats['newUsers']) }}</p>
        <p><strong>Usuarios Activos:</strong> {{ number_format($userStats['activeUsers']) }}</p>
        <p><strong>Gasto Promedio por Orden:</strong> ${{ number_format($userStats['avgOrderValue'], 2, ',', '.') }}</p>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>RG ENTRADAS - Sistema de Gestión de Eventos | Reporte Completo de la Plataforma</p>
        <p>Este documento contiene información confidencial y es solo para uso interno administrativo</p>
    </div>
</body>
</html>