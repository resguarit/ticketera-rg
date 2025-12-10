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
            min-height: 140px;
            position: relative;
        }
        
        .header-top {
            width: 100%;
            height: 80px;
            margin-bottom: 15px;
            overflow: hidden;
        }
        
        .event-banner {
            width: 200px;
            height: 80px;
            border-radius: 4px;
            background: #e9ecef;
            overflow: hidden;
            float: left;
        }
        
        .event-banner img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .logo-rg {
            background: transparent;
            color: white;
            padding: 4px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            text-align: center;
            width: 100px;
            height: 100px;
            float: right;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo-rg img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .event-info-bottom {
            text-align: left;
            padding-left: 0;
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
        
        /* Body */
        .ticket-body {
            padding: 20px;
        }
        
        .ticket-details-grid {
            display: flex;
            margin-bottom: 15px;
        }
        
        .ticket-info-left {
            width: 65%;
        }
        
        .ticket-info-right {
            width: 100%;
            text-align: center;
            margin-top: 40px;
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
            width: 220px;
            height: 220px;
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
            margin-top: 5px;
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
            <!-- Top: Banner (izquierda) y Logo (derecha) -->
            <div class="header-top">
                
                <!-- Logo RG (derecha) -->
                <div class="logo-rg">
                    <img src="{{ public_path('images/logo_ticketera.png') }}" alt="RG Entradas">
                </div>
            </div>
            
            <!-- Bottom: Información del evento (alineada a la izquierda) -->
            <div class="event-info-bottom">
                <div class="event-title">{{ $event->name }}</div>
                <div class="event-date-time">
                    {{ $function->start_time ? $function->start_time->locale('es')->translatedFormat('D d M Y - H:i') . 'hs' : 'Fecha por confirmar' }}
                </div>
                <div class="event-location">
                    {{ $event->venue->name }}, {{ $event->venue->ciudad ? $event->venue->ciudad->name : '' }}{{ $event->venue->ciudad && $event->venue->ciudad->provincia ? ', '.$event->venue->ciudad->provincia->name : '' }}
                </div>
            </div>
        </div>
        
        <!-- Body -->
        <div class="ticket-body">
            <div class="ticket-details-grid">
                <div class="ticket-info-left">
                    <div class="detail-row">
                        <div class="detail-label">Orden Nº:</div>
                        <div class="detail-value">{{ $orderNumber }}</div>
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
                        <div class="detail-value">{{ $event->organizer->name }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Contacto:</div>
                        <div class="detail-value" style="color:#0066cc;">
                            {{ $event->organizer->email ?? 'info@rgentradas.com' }}
                        </div>
                    </div>
                </div>
                
                <div class="ticket-info-right">
                    <img src="data:image/svg+xml;base64,{{ $qrCode }}" alt="Código QR">
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
