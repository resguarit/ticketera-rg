<x-mail::message>
# ¡Reenviamos tus tickets, {{ $order->client->name() }}!

Adjuntamos tus entradas para el evento **{{ $order->items->first()?->ticketType?->eventFunction?->event?->name ?? 'Evento' }}**.

Por favor, ten los códigos QR listos para ser escaneados al ingresar.

<x-mail::button :url="route('my-tickets')">
Ver mi compra
</x-mail::button>

¡Disfruta el show!<br>
El equipo de {{ config('app.name') }}
</x-mail::message>