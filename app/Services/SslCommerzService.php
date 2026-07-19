<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SslCommerzService
{
    protected string $apiUrl;
    protected string $validationUrl;
    protected ?string $storeId;
    protected ?string $storePassword;
    protected bool $isSandbox;

    public function __construct()
    {
        $settings = \App\Models\Setting::payment();
        
        $this->storeId = $settings['store_id'] ?? null;
        $this->storePassword = $settings['store_password'] ?? null;
        $this->isSandbox = (bool) ($settings['is_sandbox'] ?? true);

        $this->apiUrl = $this->isSandbox
            ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
            : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

        $this->validationUrl = $this->isSandbox
            ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
            : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';
    }

    public function initiatePayment(Order $order, array $customerData): string
    {
        return $this->requestGatewayUrl([
            // The SSLCommerz account settles only in BDT, so always charge the
            // full BDT total. Sending the display-currency value (e.g. "10" for a
            // USD view) would make the gateway take ৳10 instead of ৳1250. The
            // customer still sees their currency on the site; their bank converts.
            'total_amount' => $order->total_amount,
            'currency' => $order->currency ?: 'BDT',
            'skip_conversion' => true,
            'tran_id' => $order->order_number,
            'cus_add1' => $order->shipping_address ?? 'Dhaka',
            'product_name' => 'E-Commerce Products',
            'product_category' => 'General',
        ], $customerData, 'SSLCommerz Init Failed');
    }

    public function initiateInvoicePayment(\App\Models\CustomInvoicePayment $payment, \App\Models\CustomInvoice $invoice, array $customerData): string
    {
        // The gateway settles only in BDT. A USD invoice stores its amount in USD
        // with the rate it was issued at (BDT = amount / exchange_rate), so convert
        // the payment back to BDT — otherwise a $10 invoice would take just ৳10.
        $rate = (float) ($invoice->exchange_rate ?: 1);
        $bdtAmount = $rate > 0 ? ((float) $payment->amount) / $rate : (float) $payment->amount;

        return $this->requestGatewayUrl([
            'total_amount' => round($bdtAmount, 2),
            'tran_id' => $payment->transaction_id,
            'cus_add1' => $customerData['address'] ?? 'Dhaka',
            'product_name' => 'Custom Invoice Payment',
            'product_category' => 'Custom',
            'skip_conversion' => true,
            'currency' => 'BDT',
        ], $customerData, 'SSLCommerz Init Failed (Invoice)');
    }

    /**
     * Validate a transaction directly against SSLCommerz (server-to-server).
     * Never trust the browser callback body — this is the source of truth.
     *
     * @return array|null The validation payload when the request succeeds.
     */
    public function validateTransaction(?string $valId): ?array
    {
        if (empty($valId)) {
            return null;
        }

        try {
            $response = $this->http()->get($this->validationUrl, [
                'val_id' => $valId,
                'store_id' => $this->storeId,
                'store_passwd' => $this->storePassword,
                'format' => 'json',
            ]);

            $result = $response->json();

            if (is_array($result) && in_array(($result['status'] ?? null), ['VALID', 'VALIDATED'], true)) {
                return $result;
            }

            Log::warning('SSLCommerz validation returned non-valid status', ['val_id' => $valId, 'result' => $result]);

            return null;
        } catch (\Throwable $e) {
            Log::error('SSLCommerz validation exception: ' . $e->getMessage());

            return null;
        }
    }

    /**
     * Verify the authenticity of an IPN/callback payload using the
     * verify_sign / verify_key hash provided by SSLCommerz.
     */
    public function verifyHash(array $payload): bool
    {
        if (empty($payload['verify_sign']) || empty($payload['verify_key']) || empty($this->storePassword)) {
            return false;
        }

        $keys = explode(',', $payload['verify_key']);
        $data = [];
        foreach ($keys as $key) {
            if (array_key_exists($key, $payload)) {
                $data[$key] = $payload[$key];
            }
        }
        $data['store_passwd'] = md5($this->storePassword);
        ksort($data);

        $hashString = '';
        foreach ($data as $key => $value) {
            $hashString .= $key . '=' . $value . '&';
        }
        $hashString = rtrim($hashString, '&');

        return hash_equals(md5($hashString), (string) $payload['verify_sign']);
    }

    /**
     * TLS verification stays on unless explicitly disabled for local
     * environments without a working CA bundle.
     */
    private function http(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withOptions(['verify' => (bool) config('sslcommerz.verify_ssl', true)]);
    }

    private function requestGatewayUrl(array $overrides, array $customerData, string $errorContext): string
    {
        if (empty($this->storeId) || empty($this->storePassword)) {
            Log::error('SSLCommerz credentials are not configured.');
            throw new \RuntimeException('Payment gateway is not configured.');
        }

        $currencies = \App\Models\Currency::where('is_active', true)->get();
        $selectedCurrency = session('currency', $currencies->where('is_default', true)->first()?->code ?? 'BDT');
        $activeCurrency = $currencies->where('code', $selectedCurrency)->first() ?? $currencies->first();
        $defaultCurrency = $currencies->where('is_default', true)->first();

        $defaultRate = $defaultCurrency ? (float) $defaultCurrency->exchange_rate : 1;
        $activeRate = $activeCurrency ? (float) $activeCurrency->exchange_rate : 1;

        $skipConversion = $overrides['skip_conversion'] ?? false;
        unset($overrides['skip_conversion']);

        $baseAmount = (float) ($overrides['total_amount'] ?? 0);
        $currencyCode = $overrides['currency'] ?? $selectedCurrency;
        
        if ($skipConversion) {
            $currency = $currencyCode;
            $gatewayAmount = $baseAmount;
        } else {
            $currency = $currencyCode;
            if ($currency !== 'BDT') {
                // Determine rate for the target currency
                $targetCurrency = $currencies->where('code', $currency)->first();
                $targetRate = $targetCurrency ? (float) $targetCurrency->exchange_rate : $activeRate;
                $gatewayAmount = $baseAmount * $targetRate;
            } else {
                $gatewayAmount = $baseAmount;
            }
        }
        
        unset($overrides['total_amount'], $overrides['currency']);

        $postData = array_merge([
            'store_id' => $this->storeId,
            'store_passwd' => $this->storePassword,
            'currency' => $currency,
            'total_amount' => round($gatewayAmount, 2),
            'success_url' => route('sslcommerz.success'),
            'fail_url' => route('sslcommerz.fail'),
            'cancel_url' => route('sslcommerz.cancel'),
            'ipn_url' => route('sslcommerz.ipn'),
            'cus_name' => $customerData['name'] ?? 'Customer',
            'cus_email' => $customerData['email'] ?? 'customer@example.com',
            'cus_city' => 'Dhaka',
            'cus_postcode' => '1000',
            'cus_country' => 'Bangladesh',
            'cus_phone' => $customerData['phone'] ?? '01711111111',
            'shipping_method' => 'NO',
            'product_profile' => 'general',
        ], $overrides);

        try {
            $response = $this->http()->asForm()->post($this->apiUrl, $postData);
            $result = $response->json();

            if (isset($result['status']) && $result['status'] === 'SUCCESS' && !empty($result['GatewayPageURL'])) {
                return $result['GatewayPageURL'];
            }

            Log::error($errorContext, ['response' => $result]);
            throw new \RuntimeException('Failed to initiate payment gateway.');
        } catch (\Throwable $e) {
            Log::error('SSLCommerz Exception: ' . $e->getMessage());
            throw $e;
        }
    }
}
