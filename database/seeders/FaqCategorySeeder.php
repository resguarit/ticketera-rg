<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FaqCategory;

class FaqCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'title' => 'Compra de Tickets',
                'icon' => 'Ticket',
                'color' => '#3b82f6', // primary/blue-600
                'order' => 1,
            ],
            [
                'title' => 'Pagos y Facturación',
                'icon' => 'CreditCard',
                'color' => '#ef4444', // red-500
                'order' => 2,
            ],
            [
                'title' => 'Eventos',
                'icon' => 'Users',
                'color' => '#f97316', // orange-500
                'order' => 3,
            ],
            [
                'title' => 'Cuenta y Perfil',
                'icon' => 'Shield',
                'color' => '#22c55e', // green-500
                'order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            FaqCategory::create($category);
        }
    }
}