<!DOCTYPE html>
<html>
<head>
    <title>Nuevo Mensaje de Contacto</title>
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
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .field {
            margin-bottom: 10px;
        }
        .field strong {
            color: #555;
        }
        .message-content {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #007bff;
            white-space: pre-line;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0; color: #007bff;">Nuevo mensaje recibido desde la web</h2>
        </div>
        
        <div class="field">
            <strong>Nombre:</strong> {{ $data['name'] }}
        </div>
        <div class="field">
            <strong>Email:</strong> {{ $data['email'] }}
        </div>
        <div class="field">
            <strong>Asunto:</strong> {{ $data['subject'] }}
        </div>
        
        <div style="margin-top: 20px;">
            <strong>Mensaje:</strong>
        </div>
        <div class="message-content">
            {{ $data['message'] }}
        </div>
    </div>
</body>
</html>