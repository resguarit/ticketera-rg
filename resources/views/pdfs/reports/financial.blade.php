{{-- filepath: resources/views/pdfs/reports/financial.blade.php --}}
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
            background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header p { font-size: 14px; opacity: 0.9; }
        
        .financial-overview {
            display: flex;
            margin-bottom: 30px;
            gap: 15px;
        }
        
        .financial-card {
            flex: 1;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        
        .financial-value {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        .neutral { color: #333; }
        
        .financial-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin: 30px 0 15px;
            border-bottom: 2px solid #dc3545;
            padding-bottom: 5px;
        }
        
        .organizer-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .organizer-table th,
        .organizer-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .organizer-table th {
            background: #f8f9fa;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        .organizer-table td {
            font-size: 11px;
        }
        
        .payment-methods {
            display: flex;
            gap: 20px;
            margin: 20px 0;
        }
        
        .payment-item {
            flex: 1;
            background: white;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .payment-method {
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }
        
        .payment-stats {
            font-size: 11px;
            color: #666;
        }
        
        .fee-breakdown {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .fee-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 11px;
        }
        
        .fee-total {
            border-top: 1px solid #ffeaa7;
            padding-top: 8px;
            font-weight: bold;
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

    <!-- Resumen Financiero -->
    <div class="financial-overview">
        <div class="financial-card">
            <div class="financial-value positive">${{ number_format($financialData['totalRevenue'], 2, ',', '.') }}</div>
            <div class="financial-label">Ingresos Brutos</div>
        </div>
        <div class="financial-card">
            <div class="financial-value negative">-${{ number_format($financialData['totalServiceFees'], 2, ',', '.') }}</div>
            <div class="financial-label">Comisiones Cobradas</div>
        </div>
        <div class="financial-card">
            <div class="financial-value negative">-${{ number_format($financialData['totalTaxes'], 2, ',', '.') }}</div>
            <div class="financial-label">Impuestos</div>
        </div>
        <div class="financial-card">
            <div class="financial-value positive">${{ number_format($financialData['netRevenue'], 2, ',', '.') }}</div>
            <div class="financial-label">Ingresos Netos</div>
        </div>
    </div>

    <!-- Desglose de Comisiones -->
    <div class="fee-breakdown">
        <h4>Análisis de Comisiones</h4>
        <div class="fee-item">
            <span>Porcentaje de comisión promedio:</span>
            <span><strong>{{ number_format($financialData['feePercentage'], 1) }}%</strong></span>
        </div>
        <div class="fee-item">
            <span>Total recaudado en comisiones:</span>
            <span><strong>${{ number_format($financialData['totalServiceFees'], 2, ',', '.') }}</strong></span>
        </div>
        <div class="fee-item fee-total">
            <span>Margen operativo:</span>
            <span><strong>{{ number_format(($financialData['totalServiceFees'] / $financialData['totalRevenue']) * 100, 1) }}%</strong></span>
        </div>
    </div>

    <!-- Top Organizadores -->
    <h3 class="section-title">Top Organizadores por Ingresos</h3>
    <table class="organizer-table">
        <thead>
            <tr>
                <th>Organizador</th>
                <th>Nombre Comercial</th>
                <th>Eventos</th>
                <th>Tickets Vendidos</th>
                <th>Ingresos Generados</th>
            </tr>
        </thead>
        <tbody>
            @foreach(array_slice($organizerStats, 0, 10) as $organizer)
                <tr>
                    <td>{{ $organizer['name'] }}</td>
                    <td>{{ $organizer['business_name'] ?? 'N/A' }}</td>
                    <td>{{ $organizer['events_count'] }}</td>
                    <td>{{ number_format($organizer['tickets_sold']) }}</td>
                    <td>${{ number_format($organizer['total_revenue'], 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Métodos de Pago -->
    <h3 class="section-title">Distribución por Métodos de Pago</h3>
    <div class="payment-methods">
        @foreach($paymentMethodStats as $method)
            <div class="payment-item">
                <div class="payment-method">{{ ucfirst($method['payment_method']) }}</div>
                <div style="font-size: 16px; font-weight: bold; color: #28a745; margin: 8px 0;">
                    ${{ number_format($method['total_revenue'], 2, ',', '.') }}
                </div>
                <div class="payment-stats">
                    {{ $method['orders_count'] }} transacciones<br>
                    Promedio: ${{ number_format($method['total_revenue'] / $method['orders_count'], 2, ',', '.') }}
                </div>
            </div>
        @endforeach
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>RG ENTRADAS - Sistema de Gestión de Eventos | Reporte Financiero</p>
        <p>Información confidencial - Solo para uso interno administrativo</p>
    </div>
</body>
</html>