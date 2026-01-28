<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud de Arrepentimiento</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .email-wrapper {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 15px 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
        }
        .alert-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 20px;
            margin: 30px 40px;
            border-radius: 4px;
        }
        .alert-text {
            color: #696969;
            font-size: 12px;
            line-height: 1.6;
        }
        .content {
            padding: 40px;
        }
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
        }
        .info-item {
            margin-bottom: 15px;
            line-height: 1.8;
        }
        .info-label {
            font-weight: bold;
            color: #1a1a1a;
        }
        .info-value {
            color: #333;
        }
        .declaration-box {
            background-color: #e8f4f8;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #17a2b8;
            margin-top: 25px;
        }
        .declaration-text {
            color: #333;
            font-size: 14px;
            font-style: italic;
        }
        .legal-notice {
            background-color: #f0f0f0;
            padding: 20px;
            margin-top: 30px;
            border-radius: 6px;
            border-left: 4px solid #666;
        }
        .legal-text {
            color: #555;
            font-size: 13px;
            line-height: 1.8;
        }
        .footer {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 25px 40px;
            text-align: center;
            font-size: 13px;
        }
        .footer p {
            margin: 5px 0;
            color: #b0b0b0;
        }
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 25px 0;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
            <h1>Solicitud de Arrepentimiento</h1>
        </div>

        <!-- Alert Box -->
        <div class="alert-box">
            <div class="alert-text" style="font-size: 12px; color: #696969;">
                <strong>Acción Requerida - Ley 24.240:</strong> Un cliente ha ejercido su derecho de arrepentimiento conforme al artículo 34 de la 
                Ley N° 24.240 de Defensa del Consumidor. Esta solicitud requiere atención prioritaria 
                dentro de los plazos legales establecidos.
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="section-title" style="font-size: 20px; margin-bottom: 20px; margin-top: 20px;"><strong>Datos del Titular de la Compra</strong></div>
            
            <div class="info-item">
                <span class="info-label" ><strong>Nombre y Apellido:</strong></span>
                <span class="info-value">{{ $data['name'] }}</span>
            </div>
            
            <div class="info-item" style="margin-top: 8px;">
                <span class="info-label" ><strong>Correo Electrónico:</strong></span>
                <span class="info-value">{{ $data['email'] }}</span>
            </div>
            
            <div class="info-item" style="margin-top: 8px;">
                <span class="info-label" ><strong>DNI del Titular:</strong></span>
                <span class="info-value">{{ $data['dni'] }}</span>
            </div>
            
            <div class="info-item" style="margin-top: 8px;">
                <span class="info-label" ><strong>Número de Orden:</strong></span>
                <span class="info-value">
                    @if(!empty($data['orderNumber']))
                        <strong>{{ $data['orderNumber'] }}</strong>
                    @else
                        No proporcionado
                    @endif
                </span>
            </div>
            
            <div class="info-item" style="margin-top: 8px;">
                <span class="info-label" ><strong>Evento:</strong></span>
                <span class="info-value">
                    @if(!empty($data['event']))
                        {{ $data['event'] }}
                    @else
                        No proporcionado
                    @endif
                </span>
            </div>
            
            <div class="info-item" style="margin-top: 8px;">
                <span class="info-label" ><strong>Cantidad de Entradas:</strong></span>
                <span class="info-value">
                    @if(!empty($data['ticketQuantity']))
                        {{ $data['ticketQuantity'] }} entrada(s)
                    @else
                        No proporcionado
                    @endif
                </span>
            </div>
            
            <div class="info-item" style="margin-top: 8px;">
                <span class="info-label" ><strong>Medio de Pago:</strong></span>
                <span class="info-value">
                    @if(!empty($data['paymentMethod']))
                        {{ $data['paymentMethod'] }}
                    @else
                        No proporcionado
                    @endif
                </span>
            </div>

            @if(!empty($data['reason']))
            <div class="info-item" style="margin-top: 8px;">
                <span class="info-label"><strong>Motivo de la Devolución:</strong></span>
                <span class="info-value">{{ $data['reason'] }}</span>
            </div>
            @endif

            <div class="divider"></div>

            <div class="declaration-box" style="margin-top: 8px;">
                <div class="info-item">
                    <span class="info-label"><strong>Manifestación Expresa del Consumidor:</strong></span>
                </div>
                <div class="declaration-text">
                    @if(!empty($data['declaration']))
                        "{{ $data['declaration'] }}"
                    @else
                        "Solicito la revocación de la compra en los términos del artículo 34 de la Ley 24.240 de Defensa del Consumidor."
                    @endif
                </div>
            </div>

        </div>

        <!-- Footer -->
        <div class="footer" style="margin-top: 40px; font-size: 12px; color: #504f4f">
            <p>RG Entradas - Sistema de Gestión de Tickets</p>
            <p>Este es un mensaje automático generado por una solicitud de arrepentimiento.</p>
            <p>Por favor, procesar esta solicitud dentro de los plazos legales establecidos.</p>
        </div>
    </div>
</body>
</html>