{{-- filepath: resources/views/pdfs/order-tickets.blade.php --}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tickets - Orden {{ 'TM-' . date('Y') . '-' . str_pad($order->id, 6, '0', STR_PAD_LEFT) }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .page-header {
            text-align: center;
            padding: 20px 0;
            margin-bottom: 30px;
        }
        
        .order-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .order-subtitle {
            font-size: 14px;
            color: #666;
        }
        
        .ticket-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto 30px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            page-break-inside: avoid;
        }
        
        .ticket-header {
            background: #f8f9fa;
            border-bottom: 1px solid #ddd;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 120px;
        }
        
        .event-banner {
            width: 200px;
            height: 100px;
            border-radius: 4px;
            background: #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            font-size: 10px;
            text-align: center;
            overflow: hidden;
        }
        
        .event-banner img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .event-info-header {
            flex: 1;
            margin: 0 20px;
            text-align: center;
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
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo-rg {
            background: #1a365d;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            text-align: center;
        }
        
        .ticket-body {
            padding: 20px;
        }
        
        .ticket-details-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
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
            color: #000;
            font-size: 11px;
            flex: 1;
        }
        
        .qr-code {
            width: 120px;
            height: 120px;
            margin: 0 auto 10px;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            font-size: 8px;
            color: #666;
        }
        
        .qr-code img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .qr-code-text {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            color: #000;
            margin-top: 5px;
        }
        
        .ticket-footer {
            background: #f8f9fa;
            padding: 12px 20px;
            font-size: 9px;
            color: #666;
            text-align: center;
            border-top: 1px solid #ddd;
        }
        
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="page-header">
        <div class="order-title">Tickets de tu Compra</div>
        <div class="order-subtitle">Orden: TM-{{ date('Y') }}-{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}</div>
        <div class="order-subtitle">Cliente: {{ $person->name }} {{ $person->last_name }}</div>
    </div>

    @foreach($ticketsByEvent as $eventId => $tickets)
        @php
            $firstTicket = $tickets->first();
            $event = $firstTicket->ticketType->eventFunction->event;
            $function = $firstTicket->ticketType->eventFunction;
        @endphp
        
        @foreach($tickets as $index => $ticket)
            @if($index > 0)
                <div class="page-break"></div>
            @endif
            
            <div class="ticket-container">
                <!-- Header con banner, info del evento y logo -->
                <div class="ticket-header">
                    <!-- Banner del evento (izquierda) -->
                    <div class="event-banner">
                        @if($event->image_url)
                            <img src="{{ $event->image_url }}" alt="{{ $event->name }}">
                        @else
                            Banner del Evento
                        @endif
                    </div>
                    
                    <!-- Información del evento (centro) -->
                    <div class="event-info-header">
                        <div class="event-title">{{ $event->name }}</div>
                        <div class="event-date-time">
                            {{ $function->start_time ? $function->start_time->format('D d M, Y - H:i') . 'hs' : 'Fecha por confirmar' }}
                        </div>
                        <div class="event-location">
                            {{ $event->venue->name }}, {{ $event->venue->ciudad ? $event->venue->ciudad->name : '' }}, {{ $event->venue->ciudad && $event->venue->ciudad->provincia ? $event->venue->ciudad->provincia->name : '' }}
                        </div>
                    </div>
                    
                    <!-- Logo RG (derecha) -->
                    <div class="logo-container">
                        <div class="logo-rg">
                            RG<br>
                            <small style="font-size: 8px;">RG ENTRADAS</small>
                        </div>
                    </div>
                </div>
                
                <!-- Body con detalles del ticket -->
                <div class="ticket-body">
                    <div class="ticket-details-grid">
                        <!-- Información del ticket (izquierda) -->
                        <div class="ticket-info-left">
                            <div class="detail-row">
                                <div class="detail-label">Orden N°:</div>
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
                                <div class="detail-value" style="color: #0066cc;">
                                    {{ $event->organizer->email ?? 'info@rgentradas.com' }}
                                </div>
                            </div>
                        </div>
                        
                        <!-- QR Code (derecha) -->
                        <div class="ticket-info-right">
                            <div class="qr-code">
                                @if(isset($ticket->qrCode))
                                    {!! '<img src="data:image/svg+xml;base64,' . $ticket->qrCode . '" width="120" height="120" alt="QR Code" />' !!}
                                @else
                                    <!-- Fallback si no hay QR -->
                                    ████████████<br>
                                    ████████████<br>
                                    ████████████<br>
                                    ████████████
                                @endif
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
        @endforeach
    @endforeach
</body>
</html>
