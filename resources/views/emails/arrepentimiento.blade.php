<!DOCTYPE html>
<html>
<head>
    <title>Solicitud de Arrepentimiento</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #dc3545;
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .field {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        .field strong {
            color: #555;
            display: block;
            margin-bottom: 5px;
        }
        .description {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
            margin-top: 20px;
        }
        .alert {
            background-color: #d1ecf1;
            color: #0c5460;
            padding: 12px;
            border-radius: 5px;
            border-left: 4px solid #17a2b8;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">Solicitud de Arrepentimiento</h2>
        </div>
        
        <div class="alert">
            <strong>Acción requerida:</strong> Un cliente ha ejercido su derecho de arrepentimiento según la Ley 24.240.
        </div>

        <h3>Datos del Solicitante:</h3>
        
        <div class="field">
            <strong>Nombre y Apellido:</strong>
            {{ $data['name'] }}
        </div>
        
        <div class="field">
            <strong>Email:</strong>
            {{ $data['email'] }}
        </div>
        
        <div class="field">
            <strong>DNI:</strong>
            {{ $data['dni'] }}
        </div>
        
        @if(!empty($data['cardHolderDni']))
        <div class="field">
            <strong>DNI Titular de la Tarjeta:</strong>
            {{ $data['cardHolderDni'] }}
        </div>
        @endif
        
        @if(!empty($data['orderNumber']))
        <div class="field">
            <strong>Número de Compra:</strong>
            {{ $data['orderNumber'] }}
        </div>
        @else
        <div class="field">
            <strong>Número de Compra:</strong>
            <em>No proporcionado</em>
        </div>
        @endif
        
        <div class="description">
            <strong>Descripción del motivo:</strong>
            <p style="margin-top: 10px; white-space: pre-line;">{{ $data['description'] }}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
                <strong>Nota:</strong> Recordá que según tus términos y condiciones, el cargo por servicio no es reembolsable.
            </p>
        </div>
    </div>
</body>
</html>