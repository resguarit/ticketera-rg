{{-- filepath: resources/views/pdfs/ticket.blade.php --}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket - {{ $event->name }}</title>
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
            color: #333;
        }
        
        .ticket-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            border: 2px solid #000;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .ticket-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .ticket-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .ticket-subtitle {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .ticket-body {
            padding: 20px;
            background: white;
        }
        
        .event-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .event-details, .ticket-details {
            width: 48%;
        }
        
        .info-label {
            font-weight: bold;
            color: #666;
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        
        .info-value {
            font-size: 14px;
            margin-bottom: 10px;
            color: #000;
        }
        
        .qr-section {
            text-align: center;
            padding: 20px;
            border-top: 1px dashed #ccc;
            margin-top: 20px;
        }
        
        .qr-code {
            width: 120px;
            height: 120px;
            margin: 0 auto 10px;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9f9f9;
        }
        
        .unique-code {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            color: #666;
            margin-top: 5px;
        }
        
        .ticket-footer {
            background: #f8f9fa;
            padding: 15px 20px;
            font-size: 10px;
            color: #666;
            text-align: center;
            border-top: 1px solid #eee;
        }
        
        .important-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            margin: 15px 0;
            border-radius: 5px;
        }
        
        .important-info strong {
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <!-- Header -->
        <div class="ticket-header">
            <div class="ticket-title">{{ $event->name }}</div>
            <div class="ticket-subtitle">Entrada Válida</div>
        </div>
        
        <!-- Body -->
        <div class="ticket-body">
            <div class="event-info">
                <!-- Detalles del Evento -->
                <div class="event-details">
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
                    
                    <div class="info-label">Organizador</div>
                    <div class="info-value">{{ $event->organizer->business_name }}</div>
                </div>
                
                <!-- Detalles del Ticket -->
                <div class="ticket-details">
                    <div class="info-label">Titular</div>
                    <div class="info-value">{{ $person->name }} {{ $person->last_name }}</div>
                    
                    <div class="info-label">Tipo de Entrada</div>
                    <div class="info-value">{{ $ticket->ticketType->name }}</div>
                    
                    <div class="info-label">Precio</div>
                    <div class="info-value">${{ number_format($ticket->ticketType->price, 2, ',', '.') }}</div>
                    
                    <div class="info-label">Estado</div>
                    <div class="info-value">
                        @switch($ticket->status->value)
                            @case('AVAILABLE')
                                Válido
                                @break
                            @case('USED')
                                Usado
                                @break
                            @case('CANCELLED')
                                Cancelado
                                @break
                            @default
                                {{ $ticket->status->value }}
                        @endswitch
                    </div>
                </div>
            </div>
            
            <!-- Información Importante -->
            <div class="important-info">
                <strong>Importante:</strong> Presentar este ticket junto con documento de identidad en el acceso al evento.
            </div>
        </div>
        
        <!-- QR Section -->
        <div class="qr-section">
            <div class="info-label">Código QR para Acceso</div>
            <div class="qr-code">
                <!-- Aquí puedes integrar una librería de QR codes -->
                QR CODE
            </div>
            <div class="unique-code">{{ $ticket->unique_code }}</div>
        </div>
        
        <!-- Footer -->
        <div class="ticket-footer">
            <p>Ticket generado el {{ now()->format('d/m/Y H:i') }} | TicketMax - Sistema de Gestión de Eventos</p>
            <p>Este ticket es válido solo para la fecha y evento indicados. No se admiten devoluciones.</p>
        </div>
    </div>
</body>
</html>