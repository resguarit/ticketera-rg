<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Esto evita que Laravel busque el manifest.json de Vite
        $this->withoutVite(); 
    }
}