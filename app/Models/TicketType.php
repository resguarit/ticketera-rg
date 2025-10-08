<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Services\RevenueService;
use Carbon\Carbon;

class TicketType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ticket_types';

    protected $fillable = [
        'event_function_id',
        'sector_id',
        'name',
        'description',
        'price',
        'sales_start_date',
        'sales_end_date',
        'quantity',
        'quantity_sold',
        'max_purchase_quantity',
        'is_hidden',
        'is_bundle',        // ← NUEVO
        'bundle_quantity',  // ← NUEVO
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'quantity_sold' => 'integer',
        'max_purchase_quantity' => 'integer',
        'is_hidden' => 'boolean',
        'is_bundle' => 'boolean',        // ← NUEVO
        'bundle_quantity' => 'integer',  // ← NUEVO
        'sales_start_date' => 'datetime',
        'sales_end_date' => 'datetime',
    ];

    protected $appends = ['stage_group', 'stage_number'];

    public function eventFunction()
    {
        return $this->belongsTo(EventFunction::class);
    }

    public function sector()
    {
        return $this->belongsTo(Sector::class);
    }

    public function issuedTickets(): HasMany
    {
        return $this->hasMany(IssuedTicket::class);
    }

    // ← NUEVO: Método para verificar si es un bundle
    public function isBundle(): bool
    {
        return $this->is_bundle === true;
    }

    // ← NUEVO: Método para obtener la cantidad real de tickets (considerando bundles)
    public function getRealQuantityAttribute(): int
    {
        return $this->isBundle() ? $this->quantity * $this->bundle_quantity : $this->quantity;
    }

    // Modificar el método getRealQuantitySoldAttribute
    public function getRealQuantitySoldAttribute(): int
    {
        // Para bundles: devolver cantidad de lotes vendidos (no multiplicar)
        // Para individuales: devolver cantidad normal
        return $this->quantity_sold;
    }

    // Nuevo método para obtener entradas emitidas reales
    public function getTicketsIssuedAttribute(): int
    {
        // Para bundles: multiplicar lotes vendidos por cantidad del bundle
        // Para individuales: es igual a quantity_sold
        return $this->isBundle() ? $this->quantity_sold * $this->bundle_quantity : $this->quantity_sold;
    }

    public function getRevenue(?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        return app(RevenueService::class)->forTicketType($this, $startDate, $endDate);
    }

    public function getStageGroupAttribute(): ?string
    {
        // Extraer el grupo base del nombre (ej: "General 1" -> "General")
        if (preg_match('/^(.+)\s+(\d+)$/', $this->name, $matches)) {
            return trim($matches[1]);
        }
        return null;
    }

    public function getStageNumberAttribute(): ?int
    {
        // Extraer el número de tanda del nombre
        if (preg_match('/^(.+)\s+(\d+)$/', $this->name, $matches)) {
            return (int) $matches[2];
        }
        return null;
    }

    // Método para obtener tandas del mismo grupo
    public function getStageSiblings()
    {
        if (!$this->stage_group) {
            return collect([]);
        }
        
        return TicketType::where('event_function_id', $this->event_function_id)
            ->where('name', 'LIKE', $this->stage_group . ' %')
            ->orderBy('name')
            ->get();
    }
}
