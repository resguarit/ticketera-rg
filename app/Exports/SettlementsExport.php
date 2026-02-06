<?php

namespace App\Exports;

use App\Models\Settlement;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class SettlementsExport implements FromCollection, WithHeadings, WithMapping, WithEvents
{
    protected $functionId;
    protected $settlements;

    public function __construct($functionId)
    {
        $this->functionId = $functionId;
    }

    public function collection()
    {
        $this->settlements = Settlement::where('event_function_id', $this->functionId)
            ->orderBy('transfer_date', 'desc')
            ->get();

        return $this->settlements;
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

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                // Calculate totals
                $totalQuantity = $this->settlements->sum('quantity');
                $totalAmountGross = $this->settlements->sum('amount_total_gross');
                $totalAmountNet = $this->settlements->sum('amount_total_net');
                $totalDiscounts = $this->settlements->sum('discounts');
                $totalTransfer = $this->settlements->sum('total_transfer');

                // Get the last row number (header + data rows + 1 for totals)
                $lastRow = $this->settlements->count() + 2;

                // Add totals row
                $event->sheet->appendRows([
                    [
                        'TOTALES',
                        $totalQuantity,
                        '-',
                        (float) $totalAmountGross,
                        '-',
                        (float) $totalAmountNet,
                        (float) $totalDiscounts,
                        '-',
                        (float) $totalTransfer,
                    ]
                ], $event);

                // Style the totals row
                $event->sheet->getStyle("A{$lastRow}:I{$lastRow}")->applyFromArray([
                    'font' => [
                        'bold' => true,
                    ],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F3F4F6'], // bg-gray-100
                    ],
                ]);
            },
        ];
    }
}
