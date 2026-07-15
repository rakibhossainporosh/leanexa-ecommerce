<?php

return [
    'store_id' => env('SSLCOMMERZ_STORE_ID'),
    'store_password' => env('SSLCOMMERZ_STORE_PASSWORD'),
    'sandbox' => env('SSLCOMMERZ_SANDBOX', true),

    // TLS certificate verification for gateway API calls. Keep this enabled in
    // production; only disable locally when PHP's CA bundle is unavailable.
    'verify_ssl' => env('SSLCOMMERZ_VERIFY_SSL', true),
];
