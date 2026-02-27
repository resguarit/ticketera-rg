<x-mail::message>
# ¡Aqui estan tus tickets, {{ $order->client ? $order->client->name() : ($order->contact_email ?? 'Cliente') }}!

Adjuntamos tus entradas para el evento **{{ $order->items->first()?->ticketType?->eventFunction?->event?->name ?? 'Evento' }}**.

Por favor, ten los códigos QR listos para ser escaneados al ingresar.

@if($order->client)
<x-mail::button :url="route('my-tickets')">
    Ver mi compra
</x-mail::button>
@endif

¡Disfruta el show!<br>
El equipo de {{ config('app.name') }}
</x-mail::message>