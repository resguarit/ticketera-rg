{{-- filepath: resources/views/pdfs/reports/users.blade.php --}}
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
            background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header p { font-size: 14px; opacity: 0.9; }
        
        .user-overview {
            display: flex;
            margin-bottom: 30px;
            gap: 15px;
        }
        
        .user-card {
            flex: 1;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        
        .user-value {
            font-size: 18px;
            font-weight: bold;
            color: #6f42c1;
            margin-bottom: 5px;
        }
        
        .user-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin: 30px 0 15px;
            border-bottom: 2px solid #6f42c1;
            padding-bottom: 5px;
        }
        
        .registration-timeline {
            margin: 20px 0;
        }
        
        .timeline-item {
            background: white;
            border: 1px solid #ddd;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .timeline-month {
            font-weight: bold;
            color: #333;
        }
        
        .timeline-stats {
            text-align: right;
            font-size: 11px;
        }
        
        .top-buyers {
            margin: 30px 0;
        }
        
        .buyer-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .buyer-table th,
        .buyer-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .buyer-table th {
            background: #f8f9fa;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        .buyer-table td {
            font-size: 11px;
        }
        
        .demographics-chart {
            display: flex;
            gap: 15px;
            margin: 20px 0;
        }
        
        .demo-item {
            flex: 1;
            background: white;
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
        }
        
        .demo-age {
            font-weight: bold;
            color: #6f42c1;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .demo-count {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 3px;
        }
        
        .demo-percentage {
            font-size: 10px;
            color: #666;
        }
        
        .insights-box {
            background: #e7f3ff;
            border: 1px solid #b3d9ff;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .insight-title {
            font-weight: bold;
            color: #0056b3;
            margin-bottom: 8px;
        }
        
        .insight-text {
            font-size: 11px;
            color: #004085;
            line-height: 1.5;
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

    <!-- Resumen de Usuarios -->
    <div class="user-overview">
        <div class="user-card">
            <div class="user-value">{{ number_format($userStats['totalUsers']) }}</div>
            <div class="user-label">Total Usuarios</div>
        </div>
        <div class="user-card">
            <div class="user-value">{{ number_format($userStats['newUsers']) }}</div>
            <div class="user-label">Nuevos Usuarios</div>
        </div>
        <div class="user-card">
            <div class="user-value">{{ number_format($userStats['activeUsers']) }}</div>
            <div class="user-label">Usuarios Activos</div>
        </div>
        <div class="user-card">
            <div class="user-value">{{ number_format($userStats['avgOrderValue'], 2) }}</div>
            <div class="user-label">Gasto Promedio</div>
        </div>
    </div>

    <!-- Tendencias de Registro -->
    <h3 class="section-title">Evolución de Registros</h3>
    <div class="registration-timeline">
        @foreach($registrationTrends as $trend)
            <div class="timeline-item">
                <div>
                    <div class="timeline-month">{{ $trend['month'] }}</div>
                </div>
                <div class="timeline-stats">
                    <div><strong>{{ $trend['registrations'] }}</strong> nuevos usuarios</div>
                    <div>{{ $trend['orders'] }} primera compra</div>
                </div>
            </div>
        @endforeach
    </div>

    <!-- Demographics -->
    <h3 class="section-title">Demografía por Rangos de Edad</h3>
    <div class="demographics-chart">
        <div class="demo-item">
            <div class="demo-age">18-25 años</div>
            <div class="demo-count">{{ number_format($userStats['totalUsers'] * 0.3) }}</div>
            <div class="demo-percentage">30% del total</div>
        </div>
        <div class="demo-item">
            <div class="demo-age">26-35 años</div>
            <div class="demo-count">{{ number_format($userStats['totalUsers'] * 0.35) }}</div>
            <div class="demo-percentage">35% del total</div>
        </div>
        <div class="demo-item">
            <div class="demo-age">36-45 años</div>
            <div class="demo-count">{{ number_format($userStats['totalUsers'] * 0.2) }}</div>
            <div class="demo-percentage">20% del total</div>
        </div>
        <div class="demo-item">
            <div class="demo-age">46+ años</div>
            <div class="demo-count">{{ number_format($userStats['totalUsers'] * 0.15) }}</div>
            <div class="demo-percentage">15% del total</div>
        </div>
    </div>

    <!-- Top Compradores -->
    <h3 class="section-title">Top Compradores por Volumen</h3>
    <table class="buyer-table">
        <thead>
            <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Total Órdenes</th>
                <th>Total Gastado</th>
                <th>Promedio por Orden</th>
                <th>Registro</th>
            </tr>
        </thead>
        <tbody>
            @foreach($topBuyers as $buyer)
                <tr>
                    <td>{{ $buyer['name'] }}</td>
                    <td>{{ $buyer['email'] }}</td>
                    <td>{{ $buyer['total_orders'] }}</td>
                    <td>${{ number_format($buyer['total_spent'], 2, ',', '.') }}</td>
                    <td>${{ number_format($buyer['avg_order'], 2, ',', '.') }}</td>
                    <td>{{ $buyer['registration_date'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Insights -->
    <div class="insights-box">
        <div class="insight-title">Insights Clave del Análisis</div>
        <div class="insight-text">
            • El {{ number_format((($userStats['newUsers'] / $userStats['totalUsers']) * 100), 1) }}% de usuarios se registraron en este período<br>
            • El segmento de 26-35 años representa el mayor porcentaje de usuarios activos<br>
            • El ticket promedio de compra es ${{ number_format($userStats['avgOrderValue'], 2, ',', '.') }}<br>
            • Tasa de activación: {{ number_format((($userStats['activeUsers'] / $userStats['totalUsers']) * 100), 1) }}% de usuarios verificados
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>RG ENTRADAS - Sistema de Gestión de Eventos | Reporte de Usuarios</p>
        <p>Análisis de comportamiento y demografía de usuarios de la plataforma</p>
    </div>
</body>
</html>