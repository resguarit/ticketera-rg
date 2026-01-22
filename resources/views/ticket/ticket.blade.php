<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Impresión de Entradas Horizontal v2</title>
    <style>
        /* --- Configuración de Impresión --- */
        @media print {
            @page {
                /* Tamaño FIJO horizontal: 140mm ancho x 70mm alto */
                size: 140mm 70mm;
                margin: 0;
            }

            body {
                margin: 0;
                -webkit-print-color-adjust: exact;
            }
        }

        /* --- Estilos Generales del Papel --- */
        body {
            /* Usamos Arial Narrow o Roboto Condensed para que entre más texto */
            font-family: 'Roboto Condensed', 'Arial Narrow', sans-serif;
            font-size: 12px;
            background-color: #fff;
            color: #000;
        }

        /* --- El Contenedor Principal del Ticket --- */
        .ticket-wrapper {
            width: 138mm;
            /* Un poquito menos que la hoja para márgenes seguros */
            height: 68mm;
            display: flex;
            /* Esto pone el cuerpo y el talón uno al lado del otro */
            border: 1px solid #000;
            /* Borde exterior para definir el área útil */
            margin: 1mm auto;
            /* Centrado */
            page-break-after: always;
            /* Fuerza a la impresora a cortar después de cada uno */
            overflow: hidden;
        }

        /* ====== PARTE IZQUIERDA: CUERPO PRINCIPAL ====== */
        .ticket-body {
            flex: 1;
            /* Ocupa todo el espacio que sobre */
            padding: 5mm 5mm 2mm 5mm;
            /* Menos padding abajo para dar lugar al QR */
            display: flex;
            flex-direction: column;
            /* Esto es clave: distribuye el espacio verticalmente */
            justify-content: space-between;
        }

        /* ====== PARTE DERECHA: TALÓN DE CONTROL ====== */
        .ticket-stub {
            width: 45mm;
            /* Ancho fijo para el control */
            border-left: 2px dashed #000;
            /* La línea punteada de corte */
            padding: 5mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            /* Un fondo gris muy suavecito para diferenciarlo (la impresora térmica lo hará tramado) */
            background: #f9f9f9;
        }

        /* --- Elementos de Diseño Texto --- */
        .logo-img {
            height: 20px;
            /* Filtro para asegurar contraste máximo en impresoras blanco y negro */
            filter: grayscale(100%) contrast(120%);
        }

        .event-title {
            font-size: 16px;
            font-weight: 900;
            text-transform: uppercase;
            line-height: 1.1;
            margin: 5px 0;
        }

        .event-venue {
            font-size: 12px;
            font-weight: bold;
        }

        /* Filas de datos (Fecha, Sector, Precio) */
        .data-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            align-items: baseline;
        }

        .data-label {
            font-weight: bold;
            font-size: 11px;
        }

        .data-value {
            font-size: 13px;
        }

        .data-value.big {
            font-size: 15px;
            font-weight: 900;
        }

        /* --- EL ÁREA DEL QR (Modificado para más espacio) --- */
        .qr-wrapper {
            display: flex;
            align-items: center;
            /* AUMENTADO: Más espacio arriba para separarlo del precio */
            margin-top: 12px;
            /* Espacio abajo para que no toque el borde inferior */
            padding-bottom: 3px;
        }

        .qr-code {
            width: 75px;
            /* Un poquito más chico para ganar aire */
            height: 75px;
            margin-right: 12px;
            /* Espacio a la derecha entre el QR y el texto */
        }

        .qr-info {
            font-size: 10px;
            color: #333;
            line-height: 1.3;
        }

        /* --- Estilos del Talón Derecho --- */
        .stub-title {
            font-size: 12px;
            font-weight: 900;
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .stub-data {
            font-size: 11px;
            margin-bottom: 3px;
        }

        .stub-data span {
            display: block;
            font-weight: bold;
            font-size: 13px;
        }
    </style>
</head>

<body>

    {{-- Bucle de ejemplo para 5 entradas --}}
    @for ($i = 1; $i <= 5; $i++)
        <div class="ticket-wrapper">

        <div class="ticket-body">
            <div class="header-section">
                <div class="event-title">Patricio Rey y sus Redonditos de Ricota</div>
                <div class="event-venue">ESTADIO UNICO - La Plata</div>
            </div>

            <div class="info-section" style="margin-top: 5px;">
                <div class="data-row">
                    <span><span class="data-label">FECHA:</span> Sáb 13 Dic 2025</span>
                    <span><span class="data-label">HORA:</span> 09:00 HS</span>
                </div>
                <div class="data-row">
                    <span class="data-label">SECTOR:</span>
                    <span class="data-value big">CAMPO GENERAL</span>
                </div>
                <div class="data-row">
                    <span class="data-label">VALOR:</span>
                    <span class="data-value big">$1.000,00</span>
                </div>
            </div>

            <div class="qr-wrapper">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=INV-2-5f13fd7e-{{$i}}" class="qr-code">

                <div class="qr-info">
                    <strong>Orden Nº:</strong> INV-2-5f13fd7e-b3a-0{{$i}}<br>
                    Org: Producciones Río de la Plata<br>
                    Válido para un solo ingreso.
                </div>
            </div>
        </div>

        <div class="ticket-stub">
            <div>
                <div class="stub-title">CONTROL</div>
                <div class="stub-data">Fecha: <span>13/12/2025</span></div>
                <div class="stub-data">Hora: <span>09:00 HS</span></div>
            </div>

            <div>
                <div class="stub-data">Sector: <span>CAMPO GRAL</span></div>
                <div class="stub-data">Valor: <span>$1.000,00</span></div>
                <div class="stub-data" style="font-size: 9px; margin-top: 5px; text-align:right;">
                    ID: ...3a-0{{$i}}
                </div>
            </div>
        </div>

        </div>
        @endfor

</body>

</html>