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
                margin: 0px;
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

    <div class="a4-page">
        {{-- Bucle de ejemplo para 10 entradas (llenar la hoja) --}}
        @for ($i = 1; $i <= 10; $i++)
            <div class="ticket-wrapper">

            <div class="ticket-body">
                <div class="header-section">
                    <div class="event-title">Patricio Rey y sus Redonditos de Ricota</div>
                    <div class="event-venue">ESTADIO UNICO - La Plata</div>
                </div>

                <div class="info-section">
                    <div class="data-row">
                        <span><span class="data-label">FECHA:</span> 13/12/2025</span>
                        <span><span class="data-label">HORA:</span> 09:00</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">SECTOR:</span>
                        <span class="data-value big">CAMPO GRAL</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">VALOR:</span>
                        <span class="data-value big">$1.000,00</span>
                    </div>
                </div>

                <div class="qr-wrapper">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=INV-2-{{$i}}" class="qr-code">

                    <div class="qr-info">
                        <strong>Nº:</strong> INV-2-00{{$i}}<br>
                        Prod: Río de la Plata<br>
                        Valido x 1 ingreso.
                    </div>
                </div>
            </div>

            <div class="ticket-stub">
                <div class="stub-title">CONTROL</div>

                <div class="stub-data">F: <span>13/12</span></div>
                <div class="stub-data">H: <span>09:00</span></div>
                <div class="stub-data">Sec: <span>CAMPO</span></div>
                <div class="stub-data">$: <span>1.000</span></div>

                <div class="stub-id">
                    INV-2-00{{$i}}
                </div>
            </div>

    </div>
    @endfor
    </div>

</body>

</html>