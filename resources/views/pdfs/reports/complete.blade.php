{{-- filepath: resources/views/pdfs/reports/complete.blade.php --}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', 'Helvetica', sans-serif; font-size: 11px; color: #000; line-height: 1.5; margin: 30px; }
        
        .header-table { width: 100%; border-bottom: 2px solid #000; margin-bottom: 30px; padding-bottom: 10px; }
        .header-title { font-size: 20px; text-transform: uppercase; font-weight: bold; }
        .header-meta { text-align: right; font-size: 10px; color: #444; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ccc; }
        
        .table-formal th { background-color: #000; color: #fff; text-transform: uppercase; font-size: 10px; font-weight: bold; border-bottom: none; }
        .table-formal tr:nth-child(even) { background-color: #f9f9f9; }
        
        .kpi-table { margin-bottom: 40px; border: 1px solid #000; }
        .kpi-table td { width: 25%; padding: 15px 10px; text-align: center; border-right: 1px solid #000; border-bottom: none; }
        .kpi-table td:last-child { border-right: none; }
        .kpi-label { display: block; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; margin-bottom: 5px; color: #555; }
        .kpi-value { font-size: 16px; font-weight: bold; color: #000; }

        .section-title { font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 15px; padding-bottom: 5px; font-weight: bold; margin-top: 30px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }

        .page-break { page-break-after: always; }
        
        .detail-list { width: 100%; border: 1px solid #ddd; }
        .detail-list td { border: none; border-bottom: 1px solid #eee; padding: 10px; }
        .detail-list tr:last-child td { border-bottom: none; }

        .footer { text-align: center; font-size: 9px; border-top: 1px solid #000; padding-top: 10px; color: #555; margin-top: 40px; }
        .empty-state { color: #999; padding: 20px; text-align: center; font-style: italic; }
    </style>
</head>
<body>

    {{-- PÁGINA 1: PORTADA Y RESUMEN EJECUTIVO --}}
    <table class="header-table">
        <tr>
            <td style="border:none; vertical-align: bottom;">
                <div class="header-title">{{ $title }}</div>
                <div style="font-size: 12px; margin-top: 5px;">RG ENTRADAS - INFORME INTEGRAL</div>
            </td>
            <td style="border:none; vertical-align: bottom;" class="header-meta">
                <strong>Período:</strong> {{ $startDate }} - {{ $endDate }}<br>
                <strong>Generado:</strong> {{ $generatedAt }}
            </td>
        </tr>
    </table>

    <div class="section-title">Resumen Ejecutivo</div>
    <table class="kpi-table">
        <tr>
            <td style="background-color: #eee;">
                <span class="kpi-label">Ingresos Totales</span>
                <span class="kpi-value">${{ number_format($salesData['totalRevenue'] ?? 0, 2, ',', '.') }}</span>
            </td>
            <td>
                <span class="kpi-label">Ingresos Netos</span>
                <span class="kpi-value">${{ number_format($salesData['netRevenue'] ?? 0, 2, ',', '.') }}</span>
            </td>
            <td>
                <span class="kpi-label">Total Tickets</span>
                <span class="kpi-value">{{ number_format($salesData['totalTickets'] ?? 0) }}</span>
            </td>
            <td>
                <span class="kpi-label">Órdenes</span>
                <span class="kpi-value">{{ number_format($salesData['totalOrders'] ?? 0) }}</span>
            </td>
        </tr>
    </table>

    <table class="detail-list">
        <tr>
            <td><strong>Ingreso Neto (Sin Cargo por Servicio):</strong></td>
            <td class="text-right">${{ number_format($salesData['netRevenue'] ?? 0, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td><strong>Total Ingresos por Cargo de Servicio:</strong></td>
            <td class="text-right">${{ number_format($salesData['totalServiceFees'] ?? 0, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td><strong>Órdenes Procesadas:</strong></td>
            <td class="text-right">{{ number_format($salesData['totalOrders'] ?? 0) }}</td>
        </tr>
        <tr>
            <td><strong>Precio Promedio por Ticket:</strong></td>
            <td class="text-right">${{ number_format($salesData['avgTicketPrice'] ?? 0, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td><strong>Valor Promedio de Orden:</strong></td>
            <td class="text-right">${{ number_format($salesData['avgOrderValue'] ?? 0, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td><strong>Total Eventos:</strong></td>
            <td class="text-right">{{ $eventsData['totalEvents'] ?? 0 }}</td>
        </tr>
        <tr>
            <td><strong>Eventos Activos:</strong></td>
            <td class="text-right">{{ $eventsData['activeEvents'] ?? 0 }}</td>
        </tr>
        <tr>
            <td><strong>Eventos Finalizados:</strong></td>
            <td class="text-right">{{ $eventsData['completedEvents'] ?? 0 }}</td>
        </tr>
        <tr>
            <td><strong>Base de Usuarios:</strong></td>
            <td class="text-right">{{ number_format($userStats['totalUsers'] ?? 0) }}</td>
        </tr>
        <tr>
            <td><strong>Usuarios Activos:</strong></td>
            <td class="text-right">{{ number_format($userStats['activeUsers'] ?? 0) }}</td>
        </tr>
    </table>

    <div class="footer">CONFIDENCIAL | Informe Integral | Página 1</div>
    <div class="page-break"></div>

    {{-- PÁGINA 2: DESGLOSE MENSUAL DE VENTAS --}}
    <div class="section-title">Desglose Mensual de Ventas</div>
    <table class="table-formal">
        <thead>
            <tr>
                <th>Mes</th>
                <th class="text-right">Tickets Vendidos</th>
                <th class="text-right">Ingresos Totales</th>
                <th class="text-right">Ingresos Netos</th>
                <th class="text-right">Cargo por Servicio</th>
            </tr>
        </thead>
        <tbody>
            @if(!empty($monthlyData) && count($monthlyData) > 0)
                @foreach($monthlyData as $month)
                    <tr>
                        <td class="font-bold">{{ $month['month'] }}</td>
                        <td class="text-right">{{ number_format($month['tickets']) }}</td>
                        <td class="text-right font-bold">${{ number_format($month['revenue'], 2, ',', '.') }}</td>
                        <td class="text-right" style="color: #555;">${{ number_format($month['netRevenue'], 2, ',', '.') }}</td>
                        <td class="text-right" style="color: #555;">${{ number_format($month['serviceFees'], 2, ',', '.') }}</td>
                    </tr>
                @endforeach
                <tr style="background-color: #f0f0f0; font-weight: bold;">
                    <td>TOTAL</td>
                    <td class="text-right">{{ number_format(array_sum(array_column($monthlyData, 'tickets'))) }}</td>
                    <td class="text-right">${{ number_format(array_sum(array_column($monthlyData, 'revenue')), 2, ',', '.') }}</td>
                    <td class="text-right">${{ number_format(array_sum(array_column($monthlyData, 'netRevenue')), 2, ',', '.') }}</td>
                    <td class="text-right">${{ number_format(array_sum(array_column($monthlyData, 'serviceFees')), 2, ',', '.') }}</td>
                </tr>
            @else
                <tr>
                    <td colspan="5" class="empty-state">No hay datos de ventas mensuales en este período</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">CONFIDENCIAL | Informe Integral | Página 2</div>
    <div class="page-break"></div>

    {{-- PÁGINA 3: TOP 15 EVENTOS --}}
    <div class="section-title">Ranking de Ingresos por Evento</div>
    <table class="table-formal">
        <thead>
            <tr>
                <th style="width: 5%">#</th>
                <th>Evento</th>
                <th>Detalle (Lugar / Categoría)</th>
                <th class="text-right">Tickets Vendidos</th>
                <th class="text-right">Ingresos</th>
            </tr>
        </thead>
        <tbody>
            @if(!empty($topEvents) && count($topEvents) > 0)
                @foreach(array_slice($topEvents, 0, 15) as $index => $event)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td class="font-bold">{{ $event['name'] }}</td>
                        <td style="font-size: 10px; color: #555;">
                            {{ $event['venue'] ?? '-' }} • {{ $event['category'] }}
                        </td>
                        <td class="text-center">{{ number_format($event['ticketsSold'] ?? 0) }}</td>
                        <td class="text-right font-bold">${{ number_format($event['revenue'] ?? 0, 2, ',', '.') }}</td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="5" class="empty-state">No hay eventos con ventas en este período</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">CONFIDENCIAL | Informe Integral | Página 3</div>
    <div class="page-break"></div>

    {{-- PÁGINA 4: RENDIMIENTO POR CATEGORÍAS --}}
    <div class="section-title">Rendimiento por Categorías</div>
    <table class="table-formal">
        <thead>
            <tr>
                <th>Categoría</th>
                <th class="text-right">Eventos</th>
                <th class="text-right">Ingresos Totales</th>
                <th class="text-right">% del Total</th>
            </tr>
        </thead>
        <tbody>
            @if(!empty($categoryStats) && count($categoryStats) > 0)
                @php
                    $totalCategoryRevenue = array_sum(array_column($categoryStats, 'revenue'));
                @endphp
                @foreach($categoryStats as $category)
                    <tr>
                        <td class="font-bold">{{ $category['name'] ?? 'Sin nombre' }}</td>
                        <td class="text-center">{{ $category['eventsCount'] ?? 0 }}</td>
                        <td class="text-right font-bold">${{ number_format($category['revenue'] ?? 0, 2, ',', '.') }}</td>
                        <td class="text-right">
                            {{ $totalCategoryRevenue > 0 ? number_format(($category['revenue'] / $totalCategoryRevenue) * 100, 1) : 0 }}%
                        </td>
                    </tr>
                @endforeach
                <tr style="background-color: #f0f0f0; font-weight: bold;">
                    <td>TOTAL</td>
                    <td class="text-center">{{ array_sum(array_column($categoryStats, 'eventsCount')) }}</td>
                    <td class="text-right">${{ number_format($totalCategoryRevenue, 2, ',', '.') }}</td>
                    <td class="text-right">100%</td>
                </tr>
            @else
                <tr>
                    <td colspan="4" class="empty-state">No hay datos de categorías en este período</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="section-title">Venues Más Activos</div>
    <table class="table-formal">
        <thead>
            <tr>
                <th>Venue</th>
                <th>Ciudad</th>
                <th class="text-right">Eventos</th>
                <th class="text-right">Ingresos</th>
            </tr>
        </thead>
        <tbody>
            @if(!empty($venueStats) && count($venueStats) > 0)
                @foreach(array_slice($venueStats, 0, 10) as $venue)
                    <tr>
                        <td class="font-bold">{{ $venue['name'] }}</td>
                        <td style="font-size: 10px; color: #555;">{{ $venue['city'] ?? 'Sin ciudad' }}</td>
                        <td class="text-center">{{ $venue['events_count'] }}</td>
                        <td class="text-right font-bold">${{ number_format($venue['total_revenue'], 2, ',', '.') }}</td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="4" class="empty-state">No hay datos de venues en este período</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">CONFIDENCIAL | Informe Integral | Página 4</div>

</body>
</html>