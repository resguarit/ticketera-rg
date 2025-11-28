<?php

// filepath: database/seeders/CategorySeeder.php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Música',
                'icon' => 'music',
                'color' => '#ef4444', // Rojo
            ],
            [
                'name' => 'Teatro',
                'icon' => 'theater',
                'color' => '#8b5cf6', // Púrpura
            ],
            [
                'name' => 'Deportes',
                'icon' => 'trophy',
                'color' => '#f59e0b', // Naranja
            ],
            [
                'name' => 'Conferencias',
                'icon' => 'presentation',
                'color' => '#10b981', // Verde
            ],
            [
                'name' => 'Gastronómico',
                'icon' => 'utensils',
                'color' => '#f97316', // Naranja oscuro
            ],
            [
                'name' => 'Cultural',
                'icon' => 'palette',
                'color' => '#06b6d4', // Cian
            ],
            [
                'name' => 'Comedia',
                'icon' => 'laugh',
                'color' => '#84cc16', // Lima
            ],
            [
                'name' => 'Familiar',
                'icon' => 'users',
                'color' => '#ec4899', // Rosa
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
