{{-- filepath: resources/views/pdfs/reports/sales.blade.php --}}
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
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header p { font-size: 14px; opacity: 0.9; }
        
        .stats-grid {
            display: flex;
            margin-bottom: 30px;
            gap: 15px;
        }
        
        .stat-card {
            flex: 1;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        
        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
        }
        
        .chart-section {
            margin: 30px 0;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
        }
        
        .monthly-data {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .month-item {
            flex: 1;
            background: white;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            min-width: 120px;
        }
        
        .month-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .month-revenue {
            font-size: 14px;
            color: #28a745;
            margin-bottom: 3px;
        }
        
        .month-tickets {
            font-size: 11px;
            color: #666;
        }
        
        .top-events {
            margin-top: 30px;
        }
        
        .event-item {
            background: white;
            border: 1px solid #ddd;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .event-info h4 {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 3px;
        }
        
        .event-info p {
            font-size: 11px;
            color: #666;
        }
        
        .event-stats {
            text-align: right;
        }
        
        .event-revenue {
            font-size: 14px;
            font-weight: bold;
            color: #28a745;
        }
        
        .event-tickets {
            font-size: 11px;
            color: #666;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #666;
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

    <!-- Estadísticas Principales -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${{ number_format($salesData['totalRevenue'], 2, ',', '.') }}</div>
            <div class="stat-label">Ingresos Totales</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ number_format($salesData['totalTickets']) }}</div>
            <div class="stat-label">Tickets Vendidos</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ number_format($salesData['totalOrders']) }}</div>
            <div class="stat-label">Órdenes Procesadas</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${{ number_format($salesData['avgTicketPrice'], 2, ',', '.') }}</div>
            <div class="stat-label">Precio Promedio</div>
        </div>
    </div>

    <!-- Datos Mensuales -->
    <div class="chart-section">
        <h3 class="section-title">Evolución Mensual</h3>
        <div class="monthly-data">
            @foreach($monthlyData as $month)
                <div class="month-item">
                    <div class="month-name">{{ $month['month'] }}</div>
                    <div class="month-revenue">${{ number_format($month['revenue'], 0, ',', '.') }}</div>
                    <div class="month-tickets">{{ $month['tickets'] }} tickets</div>
                </div>
            @endforeach
        </div>
    </div>

    <!-- Top Eventos -->
    <div class="top-events">
        <h3 class="section-title">Eventos con Mayores Ingresos</h3>
        @foreach($topEvents as $event)
            <div class="event-item">
                <div class="event-info">
                    <h4>{{ $event['name'] }}</h4>
                    <p>{{ $event['category'] }} • {{ $event['venue'] ?? 'Sin venue' }} • {{ $event['city'] ?? 'Sin ciudad' }}</p>
                </div>
                <div class="event-stats">
                    <div class="event-revenue">${{ number_format($event['revenue'], 2, ',', '.') }}</div>
                    <div class="event-tickets">{{ $event['ticketsSold'] }} tickets</div>
                </div>
            </div>
        @endforeach
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>RG ENTRADAS - Sistema de Gestión de Eventos | Reporte generado automáticamente</p>
        <p>Este reporte contiene información confidencial de la plataforma</p>
    </div>
</body>
</html>