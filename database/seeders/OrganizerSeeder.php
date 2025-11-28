<?php

// filepath: database/seeders/OrganizerSeeder.php

namespace Database\Seeders;

use App\Models\Organizer;
use Illuminate\Database\Seeder;

class OrganizerSeeder extends Seeder
{
    public function run(): void
    {
        $organizers = [
            [
                'name' => 'MusicPro Events',
                'referring' => 'Productora líder en eventos musicales de Argentina',
                'email' => 'contact@musicpro.com',
                'phone' => '+54 11 1234-5678',
                'logo_url' => 'logos/musicpro.jpg',
                'facebook_url' => 'https://facebook.com/musicproevents',
                'instagram_url' => 'https://instagram.com/musicproevents',
                'twitter_url' => 'https://twitter.com/musicproevents',
                'tax' => 15,
                'decidir_public_key_prod' => null,
                'decidir_secret_key_prod' => null,
                'decidir_public_key_test' => 'test_pk_123',
                'decidir_secret_key_test' => 'test_sk_123',
            ],
            [
                'name' => 'Rock Producciones',
                'referring' => 'Especialistas en conciertos de rock y música alternativa',
                'email' => 'info@rockprod.com',
                'phone' => '+54 11 2345-6789',
                'logo_url' => 'logos/rockprod.jpg',
                'facebook_url' => 'https://facebook.com/rockproducciones',
                'instagram_url' => 'https://instagram.com/rockproducciones',
                'twitter_url' => null,
                'tax' => 15,
                'decidir_public_key_prod' => null,
                'decidir_secret_key_prod' => null,
                'decidir_public_key_test' => 'test_pk_456',
                'decidir_secret_key_test' => 'test_sk_456',
            ],
            [
                'name' => 'Teatro Municipal',
                'referring' => 'Organización teatral municipal de Córdoba',
                'email' => 'teatro@municipal.gov',
                'phone' => '+54 11 3456-7890',
                'logo_url' => 'logos/teatro-municipal.jpg',
                'facebook_url' => 'https://facebook.com/teatromunicipal',
                'instagram_url' => 'https://instagram.com/teatromunicipal',
                'twitter_url' => 'https://twitter.com/teatromunicipal',
                'tax' => 15,
                'decidir_public_key_prod' => null,
                'decidir_secret_key_prod' => null,
                'decidir_public_key_test' => 'test_pk_789',
                'decidir_secret_key_test' => 'test_sk_789',
            ],
            [
                'name' => 'TechEvents',
                'referring' => 'Organizadora de conferencias y eventos tecnológicos',
                'email' => 'events@tech.com',
                'phone' => '+54 11 4567-8901',
                'logo_url' => 'logos/techevents.jpg',
                'facebook_url' => 'https://facebook.com/techevents',
                'instagram_url' => 'https://instagram.com/techevents',
                'twitter_url' => 'https://twitter.com/techevents',
                'tax' => 15,
                'decidir_public_key_prod' => null,
                'decidir_secret_key_prod' => null,
                'decidir_public_key_test' => 'test_pk_012',
                'decidir_secret_key_test' => 'test_sk_012',
            ],
            [
                'name' => 'Liga Amateur',
                'referring' => 'Organizadora de eventos deportivos amateur',
                'email' => 'liga@amateur.com',
                'phone' => '+54 11 5678-9012',
                'logo_url' => 'logos/liga-amateur.jpg',
                'facebook_url' => 'https://facebook.com/ligaamateur',
                'instagram_url' => 'https://instagram.com/ligaamateur',
                'twitter_url' => null,
                'tax' => 15,
                'decidir_public_key_prod' => null,
                'decidir_secret_key_prod' => null,
                'decidir_public_key_test' => 'test_pk_345',
                'decidir_secret_key_test' => 'test_sk_345',
            ],
            [
                'name' => 'Cultura Viva',
                'referring' => 'Promotora de eventos culturales y artísticos',
                'email' => 'info@culturaviva.com',
                'phone' => '+54 11 6789-0123',
                'logo_url' => 'logos/cultura-viva.jpg',
                'facebook_url' => 'https://facebook.com/culturaviva',
                'instagram_url' => 'https://instagram.com/culturaviva',
                'twitter_url' => 'https://twitter.com/culturaviva',
                'tax' => 15,
                'decidir_public_key_prod' => null,
                'decidir_secret_key_prod' => null,
                'decidir_public_key_test' => 'test_pk_678',
                'decidir_secret_key_test' => 'test_sk_678',
            ],
        ];

        foreach ($organizers as $organizer) {
            Organizer::create($organizer);
        }
    }
}
