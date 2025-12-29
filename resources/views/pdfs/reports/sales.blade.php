{{-- filepath: resources/views/pdfs/reports/sales.blade.php --}}
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

        .section-title { font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 15px; padding-bottom: 5px; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }

        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; border-top: 1px solid #000; padding-top: 10px; color: #555; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="border:none; vertical-align: bottom;">
                <div class="header-title">{{ $title }}</div>
                <div style="font-size: 12px; margin-top: 5px;">RG ENTRADAS - REPORTE DE VENTAS</div>
            </td>
            <td style="border:none; vertical-align: bottom;" class="header-meta">
                <strong>Período:</strong> {{ $startDate }} - {{ $endDate }}<br>
                <strong>Generado:</strong> {{ $generatedAt }}
            </td>
        </tr>
    </table>

    <table class="kpi-table">
        <tr>
            <td style="background-color: #eee;">
                <span class="kpi-label">Ingresos Totales</span>
                <span class="kpi-value">${{ number_format($salesData['totalRevenue'], 2, ',', '.') }}</span>
            </td>
            <td>
                <span class="kpi-label">Ingresos Netos</span>
                <span class="kpi-value">${{ number_format($salesData['netRevenue'], 2, ',', '.') }}</span>
                <span class="kpi-label" style="font-size: 8px; color: #555;">(No Incluye Cargo por Servicio)</span>

            </td>
            <td>
                <span class="kpi-label">Ingresos Cargo por Servicio</span>
                <span class="kpi-value">${{ number_format($salesData['totalServiceFees'], 2, ',', '.') }}</span>
            </td>
            <td>
                <span class="kpi-label">Tickets Emitidos</span>
                <span class="kpi-value">{{ number_format($salesData['totalTickets']) }}</span>
                <span class="kpi-label" style="font-size: 8px; color: #555;">(Incluye lotes)</span>
            </td>
            <td>
                <span class="kpi-label">Órdenes</span>
                <span class="kpi-value">{{ number_format($salesData['totalOrders']) }}</span>
            </td>
        </tr>
    </table>

    <div class="section-title">Desglose Mensual</div>
    <table class="table-formal">
        <thead>
            <tr>
                <th>Mes</th>
                <th class="text-right">Tickets Vendidos</th>
                <th class="text-right">Ingresos Totales</th>
                <th class="text-right">Ingresos Netos</th>
                <th class="text-right">Ingresos Cargo por Servicio</th>
            </tr>
        </thead>
        <tbody>
            @foreach($monthlyData as $month)
                <tr>
                    <td class="font-bold">{{ $month['month'] }}</td>
                    <td class="text-right">{{ number_format($month['tickets']) }}</td>
                    <td class="text-right font-bold">${{ number_format($month['revenue'], 2, ',', '.') }}</td>
                    <td class="text-right" style="color: #555;">${{ number_format($month['netRevenue'], 2, ',', '.') }}</td>
                    <td class="text-right" style="color: #555;">${{ number_format($month['serviceFees'], 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <br>

    <div class="section-title">Ranking de Ingresos por Evento</div>
    <table class="table-formal">
        <thead>
            <tr>
                <th>Evento</th>
                <th>Detalle (Lugar / Categoría)</th>
                <th class="text-right">Volumen (Tickets)</th>
                <th class="text-right">Ingresos</th>
            </tr>
        </thead>
        <tbody>
            @foreach($topEvents as $event)
                <tr>
                    <td class="font-bold">{{ $event['name'] }}</td>
                    <td style="font-size: 10px; color: #555;">
                        {{ $event['venue'] ?? '-' }} • {{ $event['category'] }}
                    </td>
                    <td class="text-center">{{ number_format($event['ticketsSold']) }}</td>
                    <td class="text-right font-bold">${{ number_format($event['revenue'], 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        CONFIDENCIAL | Documento Comercial | Página 1
    </div>
</body>
</html>