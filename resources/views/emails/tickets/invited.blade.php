<x-mail::message>
# ¡Has sido invitado {{ $tickets->first()->assistant->person->name }} {{ $tickets->first()->assistant->person->last_name }}!

Adjuntamos tus entradas para el evento **{{ $tickets->first()->ticketType?->eventFunction?->event?->name ?? 'Evento' }}**.

Por favor, ten los códigos QR listos para ser escaneados al ingresar.

¡Disfruta el show!<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
