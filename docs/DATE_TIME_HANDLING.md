# Manejo de Fechas y Horas en Ticketera RG

## Configuración General

### Backend (Laravel)
- **Timezone configurado**: `America/Argentina/Buenos_Aires` en `config/app.php`
- **Base de datos**: Todas las fechas se almacenan en timezone de Argentina
- **Carbon**: Se usa automáticamente con la zona horaria configurada

### Frontend (React/TypeScript)
- **Utilidades centralizadas**: `/resources/js/lib/dateHelpers.ts`
- **Principio**: El backend formatea las fechas, el frontend las muestra

## Mejores Prácticas

### 1. En Controladores (Backend)
```php
// ✅ CORRECTO: Formatear fechas en el backend
$functions = $event->functions->map(function($function) {
    return [
        'id' => $function->id,
        'name' => $function->name,
        'start_time' => $function->start_time, // Raw para compatibilidad
        'end_time' => $function->end_time,     // Raw para compatibilidad
        'date' => $function->start_time?->format('d M Y'),        // "23 ago 2025"
        'time' => $function->start_time?->format('H:i'),          // "20:00"
        'formatted_date' => $function->start_time?->format('Y-m-d'), // "2025-08-23"
        'day_name' => $function->start_time?->format('l'),        // "Saturday"
        'is_active' => $function->is_active,
    ];
});

// ❌ INCORRECTO: Enviar fechas raw y formatear en frontend
return $event->functions; // Esto causa problemas de timezone
```

### 2. En Componentes (Frontend)
// ✅ CORRECTO: Usar fechas ya formateadas del backend
<span>{selectedFunction.date} • {selectedFunction.time}</span>

// ✅ CORRECTO: Usar utilidades centralizadas para casos especiales
import { formatDateForCard } from '@/lib/dateHelpers';
const { day, month } = formatDateForCard(function.date);

// ❌ INCORRECTO: Parsear fechas raw en el frontend
const date = new Date(function.start_time); // Puede causar problemas de timezone
```

### 3. Utilidades Disponibles

#### En `/resources/js/lib/dateHelpers.ts`:
- `formatDate(dateString)`: dd/mm/yyyy
- `formatDateReadable(dateString)`: "15 de marzo de 2024"
- `formatDateTime(dateString, timeString)`: Combina fecha + hora
- `formatRelativeTime(dateString)`: "Hace 3 días"
- `formatDateForCard(formattedDate)`: Extrae día y mes para tarjetas
- `formatEventDateTime(datetime, time?)`: Para eventos
- `compareDates(dateA, dateB)`: Para ordenamiento

## Problemas Comunes y Soluciones

### Problema: "La fecha se muestra 3 horas antes"
- **Causa**: Diferencia entre UTC y timezone de Argentina (-3 horas)
- **Solución**: Usar fechas formateadas del backend, no parsear en frontend

### Problema: "Inconsistencia en formatos de fecha"
- **Causa**: Diferentes componentes formateando fechas de manera distinta
- **Solución**: Centralizar formateo en el backend y usar utilidades del frontend

### Problema: "Fechas incorrectas en comparaciones"
- **Causa**: Comparar strings de fecha formateados en lugar de timestamps
- **Solución**: Usar `formatted_date` + `time` para comparaciones o `compareDates()`
