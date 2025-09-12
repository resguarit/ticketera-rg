{{-- filepath: resources/views/pdfs/ticket.blade.php --}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket - {{ $event->name }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .ticket-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        /* Header */
        .ticket-header {
            background: #f8f9fa;
            border-bottom: 1px solid #ddd;
            padding: 15px 20px;
            min-height: 120px;
            position: relative;
            overflow: hidden;
        }
        
        .header-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .header-table td {
            padding: 0;
            vertical-align: top;
        }
        
        .event-banner {
            width: 200px;
            height: 100px;
            border-radius: 4px;
            background: #e9ecef;
            float: left;
            overflow: hidden;
            display: block;
        }
        
        .event-banner img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .event-info-header {
            position: absolute;
            color: black;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            width: 250px;
        }
        
        .event-title {
            font-size: 18px;
            font-weight: bold;
            color: #000;
            margin-bottom: 5px;
        }
        
        .event-date-time {
            font-size: 14px;
            color: #666;
            margin-bottom: 3px;
        }
        
        .event-location {
            font-size: 12px;
            color: #666;
        }
        
        .logo-container {
            width: 80px;
            height: 100px;
            float: right;
            display: block;
            text-align: center;
        }
        
        .logo-rg {
            background: #1a365d;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
        }
        
        /* Body */
        .ticket-body {
            padding: 20px;
        }
        
        .ticket-details-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .ticket-info-left {
            width: 65%;
        }
        
        .ticket-info-right {
            width: 30%;
            text-align: right;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 8px;
        }
        
        .detail-label {
            font-weight: bold;
            width: 120px;
            color: #000;
            font-size: 11px;
        }
        
        .detail-value {
            font-size: 11px;
            flex: 1;
        }
        
        /* QR */
        .qr-code {
            width: 110px;
            height: 110px;
            margin: 0 auto 8px;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #666;
        }
        
        .qr-code-text {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            color: #000;
        }
        
        /* Footer */
        .ticket-footer {
            background: #f8f9fa;
            padding: 12px 20px;
            font-size: 9px;
            color: #666;
            text-align: center;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <!-- Header -->
        <div class="ticket-header">
            <table class="header-table">
                <tr>
                    <!-- Banner del evento (izquierda) -->
                    <td class="header-banner">
                        <div class="event-banner">
                            @if($event->image_url)
                                <img src="{{ $event->image_url }}" alt="{{ $event->name }}">
                            @else
                                <div style="padding: 20px; text-align: center; color: #666;">
                                    {{ $event->name }}
                                </div>
                            @endif
                        </div>
                    </td>
                    
                    <!-- Información del evento (centro) -->
                    <td class="header-info">
                        <div class="event-title">{{ $event->name }}</div>
                        <div class="event-date-time">
                            {{ $function->start_time ? $function->start_time->format('D d M, Y – H:i') . 'hs' : 'Fecha por confirmar' }}
                        </div>
                        <div class="event-location">
                            {{ $event->venue->name }}, {{ $event->venue->ciudad ? $event->venue->ciudad->name : '' }}{{ $event->venue->ciudad && $event->venue->ciudad->provincia ? ', '.$event->venue->ciudad->provincia->name : '' }}
                        </div>
                    </td>
                    
                    <!-- Logo RG (derecha) -->
                    <td class="header-logo">
                        <div class="logo-rg">
                            RG<br>
                            <small style="font-size: 8px;">RG ENTRADAS</small>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- Body -->
        <div class="ticket-body">
            <div class="ticket-details-grid">
                <div class="ticket-info-left">
                    <div class="detail-row">
                        <div class="detail-label">Orden Nº:</div>
                        <div class="detail-value">{{ str_pad($ticket->order->id, 5, '0', STR_PAD_LEFT) }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Tipo de Entrada:</div>
                        <div class="detail-value">{{ $ticket->ticketType->name }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Precio:</div>
                        <div class="detail-value">${{ number_format($ticket->ticketType->price, 2, ',', '.') }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Organizador:</div>
                        <div class="detail-value">{{ $event->organizer->business_name }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Contacto:</div>
                        <div class="detail-value" style="color:#0066cc;">
                            {{ $event->organizer->email ?? 'info@rgentradas.com' }}
                        </div>
                    </div>
                </div>
                
                <div class="ticket-info-right">
                    <div class="qr-code">
                        <!-- Aquí va el QR generado -->
                        QR
                    </div>
                    <div class="qr-code-text">{{ $ticket->unique_code }}</div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="ticket-footer">
            <p>Ticket generado el {{ now()->format('d/m/Y H:i') }} | RG ENTRADAS - Sistema de Gestión de Eventos</p>
            <p>Este ticket es válido solo para la fecha y evento indicados. No se admiten devoluciones.</p>
        </div>
    </div>
</body>
</html>
