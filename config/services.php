<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'payway' => [
        'public_key' => env('PAYWAY_PUBLIC_KEY'),
        'private_key' => env('PAYWAY_PRIVATE_KEY'),
        'ambient' => env('PAYWAY_ENV', 'test'),
        'keys' => [
            'test' => [
                'public_key' => env('PAYWAY_PUBLIC_KEY'),
                'private_key' => env('PAYWAY_PRIVATE_KEY'),
            ],
            'prod' => [
                'public_key' => env('PAYWAY_PUBLIC_KEY_PROD'),
                'private_key' => env('PAYWAY_PRIVATE_KEY_PROD'),
            ]
        ],
        'env' => env('PAYWAY_ENV', 'test'),
        'url' => env('PAYWAY_ENV', 'test') === 'production' 
            ? 'https://live.decidir.com/api/v2'
            : 'https://developers-ventasonline.payway.com.ar/api/v2',
    ],

];
