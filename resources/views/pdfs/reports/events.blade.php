{{-- filepath: resources/views/pdfs/reports/events.blade.php --}}
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
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header p { font-size: 14px; opacity: 0.9; }
        
        .summary-stats {
            display: flex;
            margin-bottom: 30px;
            gap: 15px;
        }
        
        .summary-card {
            flex: 1;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        
        .summary-value {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .summary-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin: 30px 0 15px;
            border-bottom: 2px solid #28a745;
            padding-bottom: 5px;
        }
        
        .event-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .event-card {
            flex: 1;
            background: white;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 8px;
            min-width: 280px;
        }
        
        .event-header {
            margin-bottom: 10px;
        }
        
        .event-title {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .event-meta {
            font-size: 10px;
            color: #666;
            margin-bottom: 3px;
        }
        
        .event-stats {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 14px;
            font-weight: bold;
            color: #28a745;
        }
        
        .stat-text {
            font-size: 9px;
            color: #666;
        }
        
        .category-section {
            margin: 30px 0;
        }
        
        .category-item {
            background: white;
            border: 1px solid #ddd;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .category-name {
            font-weight: bold;
            color: #333;
        }
        
        .category-stats {
            text-align: right;
            font-size: 11px;
        }
        
        .venue-section {
            margin: 30px 0;
        }
        
        .venue-item {
            background: white;
            border: 1px solid #ddd;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 4px;
        }
        
        .venue-name {
            font-weight: bold;
            color: #333;
            font-size: 14px;
        }
        
        .venue-location {
            font-size: 11px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .venue-stats {
            font-size: 11px;
            color: #28a745;
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

    <!-- Resumen General -->
    <div class="summary-stats">
        <div class="summary-card">
            <div class="summary-value">{{ $eventsData['totalEvents'] }}</div>
            <div class="summary-label">Total Eventos</div>
        </div>
        <div class="summary-card">
            <div class="summary-value">{{ $eventsData['activeEvents'] }}</div>
            <div class="summary-label">Eventos Activos</div>
        </div>
        <div class="summary-card">
            <div class="summary-value">{{ $eventsData['completedEvents'] }}</div>
            <div class="summary-label">Eventos Finalizados</div>
        </div>
        <div class="summary-card">
            <div class="summary-value">{{ $eventsData['avgTicketsPerEvent'] }}</div>
            <div class="summary-label">Promedio Tickets</div>
        </div>
    </div>

    <!-- Top Eventos -->
    <h3 class="section-title">Eventos Destacados por Rendimiento</h3>
    <div class="event-grid">
        @foreach(array_slice($topEvents, 0, 6) as $event)
            <div class="event-card">
                <div class="event-header">
                    <div class="event-title">{{ $event['name'] }}</div>
                    <div class="event-meta">{{ $event['category'] }}</div>
                    <div class="event-meta">{{ $event['venue'] ?? 'Sin venue' }}, {{ $event['city'] ?? 'Sin ciudad' }}</div>
                </div>
                <div class="event-stats">
                    <div class="stat-item">
                        <div class="stat-number">${{ number_format($event['revenue'], 0, ',', '.') }}</div>
                        <div class="stat-text">Ingresos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">{{ $event['ticketsSold'] }}</div>
                        <div class="stat-text">Tickets</div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <!-- Análisis por Categorías -->
    <div class="category-section">
        <h3 class="section-title">Rendimiento por Categorías</h3>
        @foreach($categoryStats as $category)
            <div class="category-item">
                <div>
                    <div class="category-name">{{ $category['name'] }}</div>
                </div>
                <div class="category-stats">
                    <div><strong>${{ number_format($category['revenue'], 2, ',', '.') }}</strong></div>
                    <div>{{ $category['eventsCount'] }} eventos</div>
                </div>
            </div>
        @endforeach
    </div>

    <!-- Análisis por Venues -->
    <div class="venue-section">
        <h3 class="section-title">Venues Más Activos</h3>
        @foreach(array_slice($venueStats, 0, 10) as $venue)
            <div class="venue-item">
                <div class="venue-name">{{ $venue['name'] }}</div>
                <div class="venue-location">{{ $venue['city'] ?? 'Sin ciudad' }}</div>
                <div class="venue-stats">
                    {{ $venue['events_count'] }} eventos • ${{ number_format($venue['total_revenue'], 2, ',', '.') }} en ingresos
                </div>
            </div>
        @endforeach
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>RG ENTRADAS - Sistema de Gestión de Eventos | Reporte de Eventos</p>
        <p>Análisis del rendimiento y distribución de eventos en la plataforma</p>
    </div>
</body>
</html>