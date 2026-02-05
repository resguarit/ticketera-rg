<?php

namespace App\Exports;

use App\Models\Settlement;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SettlementsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $functionId;

    public function __construct($functionId)
    {
        $this->functionId = $functionId;
    }

    public function collection()
    {
        return Settlement::where('event_function_id', $this->functionId)
            ->orderBy('transfer_date', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Fecha de Transferencia',
            'Cantidad',
            'Entrada Unitario (Bruto)',
            'Subtotal Importes Brutos',
            'Importe Entrada Neto',
            'Subtotal Importe Netos',
            'Descuentos',
            'Observaciones del Descuento',
            'Importe Total de la Transferencia',
        ];
    }

    public function map($settlement): array
    {
        return [
            $settlement->transfer_date->format('d/m/Y H:i'),
            $settlement->quantity,
            (float) $settlement->amount_unit_gross,
            (float) $settlement->amount_total_gross,
            (float) $settlement->amount_unit_net,
            (float) $settlement->amount_total_net,
            (float) $settlement->discounts,
            $settlement->discount_observation ?? '',
            (float) $settlement->total_transfer,
        ];
    }
}
