{{-- filepath: resources/views/pdfs/reports/users.blade.php --}}
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
        .kpi-table td { padding: 15px 10px; text-align: center; border-right: 1px solid #000; border-bottom: none; }
        .kpi-table td:last-child { border-right: none; }
        .kpi-label { display: block; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; margin-bottom: 5px; color: #555; }
        .kpi-value { font-size: 16px; font-weight: bold; color: #000; }

        .section-title { font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 15px; padding-bottom: 5px; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }

        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; border-top: 1px solid #000; padding-top: 10px; color: #555; }
        
        .progress-bar { width: 100%; height: 20px; background-color: #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 5px; }
        .progress-fill { height: 100%; background-color: #000; }
        
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 9px; font-weight: bold; }
        .badge-dark { background-color: #000; color: white; }
        .badge-light { background-color: #666; color: white; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="border:none; vertical-align: bottom;">
                <div class="header-title">{{ $title }}</div>
                <div style="font-size: 12px; margin-top: 5px;">RG ENTRADAS - REPORTE DE USUARIOS</div>
            </td>
            <td style="border:none; vertical-align: bottom;" class="header-meta">
                <strong>Período:</strong> {{ $startDate }} - {{ $endDate }}<br>
                <strong>Generado:</strong> {{ $generatedAt }}
            </td>
        </tr>
    </table>

    {{-- KPIs Principales --}}
    <table class="kpi-table">
        <tr>
            <td style="background-color: #eee; width: 20%;">
                <span class="kpi-label">Total Usuarios</span>
                <span class="kpi-value">{{ number_format($userStats['totalUsers']) }}</span>
            </td>
            <td style="width: 20%;">
                <span class="kpi-label">Usuarios Activos</span>
                <span class="kpi-value">{{ number_format($userStats['activeUsers']) }}</span>
            </td>
            <td style="width: 20%;">
                <span class="kpi-label">Usuarios Nuevos</span>
                <span class="kpi-value">{{ number_format($userStats['newUsers']) }}</span>
            </td>
            <td style="width: 20%;">
                <span class="kpi-label">Con Teléfono</span>
                <span class="kpi-value">{{ number_format($userStats['usersWithPhone']) }}</span>
            </td>
            <td style="width: 20%;">
                <span class="kpi-label">Tasa Verificación</span>
                <span class="kpi-value">{{ $userStats['verificationRate'] }}%</span>
            </td>
        </tr>
    </table>

    {{-- Estadísticas de Verificación --}}
    <div class="section-title">Estado de Verificación de Usuarios</div>
    <table class="table-formal">
        <thead>
            <tr>
                <th style="width: 40%;">Estado</th>
                <th class="text-right" style="width: 20%;">Cantidad</th>
                <th class="text-right" style="width: 20%;">Porcentaje</th>
                <th style="width: 20%;"></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="font-bold">
                    Email Verificado
                </td>
                <td class="text-right">{{ number_format($verificationStats['verified']) }}</td>
                <td class="text-right font-bold">{{ $verificationStats['verifiedPercentage'] }}%</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {{ $verificationStats['verifiedPercentage'] }}%;"></div>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="font-bold">
                    Email Pendiente
                </td>
                <td class="text-right">{{ number_format($verificationStats['pending']) }}</td>
                <td class="text-right font-bold">{{ $verificationStats['pendingPercentage'] }}%</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {{ $verificationStats['pendingPercentage'] }}%; background-color: #666;"></div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>

    {{-- Estadísticas de Información de Contacto --}}
    <div class="section-title">Información de Contacto</div>
    <table class="table-formal">
        <thead>
            <tr>
                <th style="width: 40%;">Tipo de Dato</th>
                <th class="text-right" style="width: 20%;">Con Información</th>
                <th class="text-right" style="width: 20%;">Sin Información</th>
                <th class="text-right" style="width: 20%;">% Completitud</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="font-bold">Número de Teléfono</td>
                <td class="text-right">{{ number_format($contactStats['withPhone']) }}</td>
                <td class="text-right" style="color: #999;">{{ number_format($contactStats['withoutPhone']) }}</td>
                <td class="text-right font-bold">{{ $contactStats['phonePercentage'] }}%</td>
            </tr>
            <tr>
                <td class="font-bold">Dirección</td>
                <td class="text-right">{{ number_format($contactStats['withAddress']) }}</td>
                <td class="text-right" style="color: #999;">{{ number_format($contactStats['withoutAddress']) }}</td>
                <td class="text-right font-bold">{{ $contactStats['addressPercentage'] }}%</td>
            </tr>
            <tr>
                <td class="font-bold">DNI</td>
                <td class="text-right">{{ number_format($contactStats['withDni']) }}</td>
                <td class="text-right" style="color: #999;">{{ number_format($contactStats['withoutDni']) }}</td>
                <td class="text-right font-bold">{{ $contactStats['dniPercentage'] }}%</td>
            </tr>
        </tbody>
    </table>

    {{-- Top 15 Compradores --}}
    <div class="section-title">Top 15 Compradores</div>
    <table class="table-formal">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">Usuario</th>
                <th style="width: 20%;">Email</th>
                <th class="text-right" style="width: 15%;">Órdenes</th>
                <th class="text-right" style="width: 20%;">Total Gastado</th>
            </tr>
        </thead>
        <tbody>
            @if(!empty($topBuyers) && count($topBuyers) > 0)
                @foreach($topBuyers as $index => $buyer)
                    <tr>
                        <td class="text-center" style="font-weight: bold;">{{ $index + 1 }}</td>
                        <td class="font-bold">{{ $buyer['name'] }}</td>
                        <td style="font-size: 9px; color: #555;">{{ $buyer['email'] }}</td>
                        <td class="text-right">{{ number_format($buyer['totalOrders']) }}</td>
                        <td class="text-right font-bold">${{ number_format($buyer['totalSpent'], 2, ',', '.') }}</td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="6" style="text-align: center; color: #999; padding: 20px;">
                        No hay datos de compradores en este período
                    </td>
                </tr>
            @endif
        </tbody>
    </table>

    {{-- Tendencia de Registros --}}
    <div class="section-title">Tendencia de Registros por Mes</div>
    <table class="table-formal">
        <thead>
            <tr>
                <th style="width: 30%;">Mes</th>
                <th class="text-right" style="width: 20%;">Nuevos Registros</th>
                <th class="text-right" style="width: 20%;">Registros Verificados</th>
                <th class="text-right" style="width: 15%;">Tasa Verificación</th>
                <th style="width: 15%;"></th>
            </tr>
        </thead>
        <tbody>
            @if(!empty($registrationTrends) && count($registrationTrends) > 0)
                @foreach($registrationTrends as $trend)
                    <tr>
                        <td class="font-bold">{{ $trend['month'] }}</td>
                        <td class="text-right">{{ number_format($trend['newUsers']) }}</td>
                        <td class="text-right">{{ number_format($trend['verifiedUsers']) }}</td>
                        <td class="text-right font-bold">{{ $trend['verificationRate'] }}%</td>
                        <td>
                            <div class="progress-bar" style="height: 12px;">
                                <div class="progress-fill" style="width: {{ $trend['verificationRate'] }}%;"></div>
                            </div>
                        </td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="5" style="text-align: center; color: #999; padding: 20px;">
                        No hay datos de registros en este período
                    </td>
                </tr>
            @endif
        </tbody>
    </table>

    {{-- Resumen de Actividad --}}
    <div class="section-title">Resumen de Actividad de Usuarios</div>
    <table style="width: 100%; border: 1px solid #ddd;">
        <tr>
            <td style="width: 50%; padding: 15px; border-right: 1px solid #ddd; border-bottom: none;">
                <strong style="display: block; margin-bottom: 10px; font-size: 12px;">Usuarios con Compras</strong>
                <div style="font-size: 24px; font-weight: bold; color: #000;">
                    {{ number_format($activityStats['usersWithOrders']) }}
                </div>
                <div style="color: #666; font-size: 10px; margin-top: 5px;">
                    {{ $activityStats['usersWithOrdersPercentage'] }}% del total
                </div>
            </td>
            <td style="width: 50%; padding: 15px; border-bottom: none;">
                <strong style="display: block; margin-bottom: 10px; font-size: 12px;">Usuarios sin Compras</strong>
                <div style="font-size: 24px; font-weight: bold; color: #666;">
                    {{ number_format($activityStats['usersWithoutOrders']) }}
                </div>
                <div style="color: #666; font-size: 10px; margin-top: 5px;">
                    {{ $activityStats['usersWithoutOrdersPercentage'] }}% del total
                </div>
            </td>
        </tr>
        <tr>
            <td style="width: 50%; padding: 15px; border-right: 1px solid #ddd; border-bottom: none;">
                <strong style="display: block; margin-bottom: 10px; font-size: 12px;">Valor Promedio de Compra</strong>
                <div style="font-size: 24px; font-weight: bold; color: #000;">
                    ${{ number_format($activityStats['avgOrderValue'], 2, ',', '.') }}
                </div>
                <div style="color: #666; font-size: 10px; margin-top: 5px;">
                    Por usuario comprador
                </div>
            </td>
            <td style="width: 50%; padding: 15px; border-bottom: none;">
                <strong style="display: block; margin-bottom: 10px; font-size: 12px;">Total Gastado por Todos</strong>
                <div style="font-size: 24px; font-weight: bold; color: #000;">
                    ${{ number_format($activityStats['totalRevenue'], 2, ',', '.') }}
                </div>
                <div style="color: #666; font-size: 10px; margin-top: 5px;">
                    En el período seleccionado
                </div>
            </td>
        </tr>
    </table>

    <div class="footer">
        CONFIDENCIAL | Documento Comercial | Página 1
    </div>
</body>
</html>