<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Impresión de Entradas - A4 (2x5)</title>
    <style>
        /* --- Configuración de Impresión --- */
        @media print {
            @page {
                size: A4;
                margin: 0;
            }

            body {
                margin: 0;
                -webkit-print-color-adjust: exact;
            }
        }

        /* --- Estilos Generales del Papel --- */
        body {
            font-family: 'Roboto Condensed', 'Arial Narrow', sans-serif;
            font-size: 11px;
            background-color: #fff;
            color: #000;
            margin: 0;
            padding: 0;
        }

        /* --- Contenedor de la Hoja A4 --- */
        .a4-page {
            width: 210mm;
            height: 297mm;
            display: grid;
            grid-template-columns: 1fr 1fr;
            /* 2 Columnas */
            grid-template-rows: repeat(5, 1fr);
            /* 5 Filas */
            padding: 0;
            box-sizing: border-box;
            page-break-after: always;
        }

        /* --- El Contenedor Individual del Ticket --- */
        .ticket-wrapper {
            /* Ocupamos casi toda la celda */
            width: 99%;
            height: 98%;
            margin: auto;

            display: flex;
            border: 1px solid #000;
            overflow: hidden;
            position: relative;
        }

        /* ====== PARTE IZQUIERDA: CUERPO PRINCIPAL ====== */
        .ticket-body {
            flex: 1;
            padding: 4mm 4mm 2mm 5mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        /* ====== PARTE DERECHA: TALÓN DE CONTROL ====== */
        .ticket-stub {
            width: 34mm;
            /* Un poco más ancho */
            border-left: 1px dashed #000;
            padding: 3mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #f9f9f9;
            text-align: center;
        }

        /* --- Elementos de Diseño Texto --- */
        .event-title {
            font-size: 14px;
            /* +1px */
            font-weight: 900;
            text-transform: uppercase;
            line-height: 1;
            margin-bottom: 2px;
        }

        .event-venue {
            font-size: 11px;
            /* +1px */
            font-weight: bold;
            color: #444;
        }

        /* Filas de datos (Fecha, Sector, Precio) */
        .data-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2px;
            line-height: 1.2;
        }

        .data-label {
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
        }

        .data-value {
            font-size: 11px;
        }

        .data-value.big {
            font-size: 14px;
            /* +1px */
            font-weight: 900;
        }

        /* --- EL ÁREA DEL QR --- */
        .qr-wrapper {
            display: flex;
            align-items: center;
            margin-top: 3px;
        }

        .qr-code {
            width: 55px;
            /* +3px */
            height: 55px;
            margin-right: 8px;
            display: flex;
            /* Para centrar el SVG */
            align-items: center;
            justify-content: center;
        }

        .qr-code svg {
            width: 100%;
            height: 100%;
        }

        .qr-info {
            font-size: 9px;
            color: #333;
            line-height: 1.1;
            flex: 1;
        }

        /* --- Estilos del Talón Derecho --- */
        .stub-title {
            font-size: 11px;
            /* +1px */
            font-weight: 900;
            text-transform: uppercase;
            margin-bottom: 3px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 2px;
        }

        .stub-data {
            font-size: 10px;
            /* +1px */
            margin-bottom: 2px;
            line-height: 1.2;
            text-align: left;
        }

        .stub-data span {
            display: block;
            font-weight: bold;
            font-size: 11px;
            /* +1px */
        }

        .stub-id {
            font-size: 8px;
            margin-top: auto;
            text-align: right;
            word-break: break-all;
        }
    </style>
</head>

<body>

    @php
    // Agrupar tickets en chunks de 10 para páginas A4
    $chunks = $tickets->chunk(10);
    @endphp

    @foreach ($chunks as $chunk)
    <div class="a4-page">
        @foreach ($chunk as $ticket)
        @php
        $event = $ticket->ticketType->eventFunction->event;
        $function = $ticket->ticketType->eventFunction;
        $venue = $event->venue;
        $sectorName = $ticket->ticketType->sector ? $ticket->ticketType->sector->name : $ticket->ticketType->name;
        // Format Date: e.g., "13/12"
        $dateShort = \Carbon\Carbon::parse($function->start_time)->format('d/m');
        // Format Date Long: e.g., "13/12/2025"
        $dateLong = \Carbon\Carbon::parse($function->start_time)->format('d/m/Y');
        // Format Time: e.g., "09:00"
        $time = \Carbon\Carbon::parse($function->start_time)->format('H:i');

        // Price formatting
        $price = number_format($ticket->ticketType->price, 2, ',', '.');
        @endphp

        <div class="ticket-wrapper">

            <div class="ticket-body">
                <div class="header-section">
                    <div class="event-title">{{ $event->name }}</div>
                    <div class="event-venue">{{ $venue->name }} @if($venue->ciudad) - {{ $venue->ciudad->name }} @endif</div>
                </div>

                <div class="info-section">
                    <div class="data-row">
                        <span><span class="data-label">FECHA:</span> {{ $dateLong }}</span>
                        <span><span class="data-label">HORA:</span> {{ $time }}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">SECTOR:</span>
                        <span class="data-value big">{{ Str::upper($sectorName) }}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">VALOR:</span>
                        <span class="data-value big">${{ $price }}</span>
                    </div>
                </div>

                <div class="qr-wrapper">
                    <div class="qr-code">
                        {!! SimpleSoftwareIO\QrCode\Facades\QrCode::size(55)->generate($ticket->unique_code) !!}
                    </div>

                    <div class="qr-info">
                        <strong>Nº:</strong> {{ $ticket->unique_code }}<br>
                        Prod: {{ Str::limit($event->organizer->business_name, 20) }}<br>
                        Válido x 1 ingreso.
                    </div>
                </div>
            </div>

            <div class="ticket-stub">
                <div class="stub-title">CONTROL</div>

                <div class="stub-data">F: <span>{{ $dateShort }}</span></div>
                <div class="stub-data">H: <span>{{ $time }}</span></div>
                <div class="stub-data">Sec: <span>{{ Str::limit(Str::upper($sectorName), 10) }}</span></div>
                <div class="stub-data">$: <span>{{ number_format($ticket->ticketType->price, 0, ',', '.') }}</span></div>

                <div class="stub-id">
                    {{ $ticket->unique_code }}
                </div>
            </div>

        </div>
        @endforeach
    </div>
    @endforeach

</body>

</html>