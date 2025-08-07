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
            ],
            [
                'name' => 'Teatro',
                'icon' => 'theater',
            ],
            [
                'name' => 'Deportes',
                'icon' => 'trophy',
            ],
            [
                'name' => 'Conferencias',
                'icon' => 'presentation',
            ],
            [
                'name' => 'Gastronómico',
                'icon' => 'utensils',
            ],
            [
                'name' => 'Cultural',
                'icon' => 'palette',
            ],
            [
                'name' => 'Comedia',
                'icon' => 'laugh',
            ],
            [
                'name' => 'Familiar',
                'icon' => 'users',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}