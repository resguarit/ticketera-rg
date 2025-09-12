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
            line-height: 1.5;
            color: #000;
        }
        
        .page-header {
            text-align: center;
            padding: 15px 0;
            border-bottom: 2px solid #000;
            margin-bottom: 25px;
        }
        
        .order-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .order-subtitle {
            font-size: 12px;
            color: #444;
        }
        
        .ticket-container {
            width: 100%;
            margin-bottom: 25px;
            border: 1px solid #000;
            border-radius: 6px;
            page-break-inside: avoid;
        }
        
        .ticket-header {
            padding: 12px;
            text-align: center;
            border-bottom: 1px solid #000;
            background: #f5f5f5;
        }
        
        .ticket-title {
            font-size: 18px;
            font-weight: bold;
        }
        
        .ticket-body {
            padding: 15px;
            background: #fff;
        }
        
        .ticket-info {
            display: flex;
            justify-content: space-between;
        }
        
        .ticket-left, .ticket-right {
            width: 48%;
        }
        
        .info-label {
            font-weight: bold;
            color: #333;
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        
        .info-value {
            font-size: 12px;
            margin-bottom: 8px;
            color: #000;
        }
        
        .qr-section {
            text-align: center;
            padding: 12px;
            border-top: 1px dashed #000;
            margin-top: 10px;
        }
        
        .qr-code {
            width: 90px;
            height: 90px;
            margin: 0 auto 6px;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
        }
        
        .unique-code {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            color: #000;
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
                <div class="ticket-header">
                    <div class="ticket-title">{{ $event->name }}</div>
                </div>
                
                <div class="ticket-body">
                    <div class="ticket-info">
                        <div class="ticket-left">
                            <div class="info-label">Evento</div>
                            <div class="info-value">{{ $event->name }}</div>
                            
                            <div class="info-label">Fecha y Hora</div>
                            <div class="info-value">
                                {{ $function->start_time ? $function->start_time->format('d/m/Y - H:i') : 'Por confirmar' }}
                            </div>
                            
                            <div class="info-label">Ubicación</div>
                            <div class="info-value">
                                {{ $event->venue->name }}<br>
                                @if($event->venue->ciudad)
                                    {{ $event->venue->ciudad->name }}
                                    @if($event->venue->ciudad->provincia)
                                        , {{ $event->venue->ciudad->provincia->name }}
                                    @endif
                                @endif
                            </div>
                        </div>
                        
                        <div class="ticket-right">
                            <div class="info-label">Titular</div>
                            <div class="info-value">{{ $person->name }} {{ $person->last_name }}</div>
                            
                            <div class="info-label">Tipo de Entrada</div>
                            <div class="info-value">{{ $ticket->ticketType->name }}</div>
                            
                            <div class="info-label">Precio</div>
                            <div class="info-value">${{ number_format($ticket->ticketType->price, 2, ',', '.') }}</div>
                            
                            <div class="info-label">Estado</div>
                            <div class="info-value">Válido</div>
                        </div>
                    </div>
                </div>
                
                <div class="qr-section">
                    <div class="qr-code">QR</div>
                    <div class="unique-code">{{ $ticket->unique_code }}</div>
                </div>
            </div>
        @endforeach
    @endforeach
</body>
</html>
