@php
    $settings = \App\Models\Setting::general();
    $storeName = $settings['store_name'] ?? config('app.name');
    $themeColor = $settings['theme_color'] ?? '#00704A';
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Order Confirmed</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
            -ms-text-size-adjust: none;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
        }
        .header {
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #e5e5e5;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333333;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            font-size: 20px;
            color: #333333;
            margin-top: 0;
            font-weight: 300;
        }
        .content p {
            font-size: 16px;
            color: #555555;
            line-height: 1.5;
        }
        .btn {
            display: inline-block;
            background-color: {{ $themeColor }};
            color: #ffffff !important;
            text-decoration: none;
            padding: 15px 25px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 30px;
        }
        .order-summary {
            border-top: 1px solid #e5e5e5;
            padding-top: 20px;
            margin-top: 20px;
        }
        .order-summary h3 {
            font-size: 18px;
            color: #333333;
            margin-top: 0;
        }
        .item-table {
            width: 100%;
            border-collapse: collapse;
        }
        .item-table th, .item-table td {
            text-align: left;
            padding: 10px 0;
            border-bottom: 1px solid #e5e5e5;
            color: #555555;
        }
        .item-table th {
            font-size: 14px;
            color: #777777;
            font-weight: normal;
        }
        .item-table td.price {
            text-align: right;
            font-weight: bold;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .totals-table td {
            padding: 5px 0;
            color: #555555;
        }
        .totals-table td.label {
            text-align: right;
            padding-right: 15px;
        }
        .totals-table td.value {
            text-align: right;
            font-weight: bold;
        }
        .totals-table tr.total td {
            font-size: 18px;
            font-weight: bold;
            color: #333333;
            padding-top: 15px;
            border-top: 1px solid #e5e5e5;
        }
        .customer-info {
            border-top: 1px solid #e5e5e5;
            padding-top: 20px;
            margin-top: 20px;
        }
        .customer-info h3 {
            font-size: 16px;
            color: #333333;
            margin-top: 0;
        }
        .info-block {
            margin-bottom: 15px;
        }
        .info-block p {
            margin: 5px 0 0 0;
            font-size: 14px;
            color: #555555;
        }
        .footer {
            text-align: center;
            padding: 30px;
            color: #999999;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <br>
    <div class="container">
        <div class="header">
            <h1>{{ $storeName }}</h1>
        </div>
        <div class="content">
            <h2>Order confirmed</h2>
            <p>Hi {{ $order->customer->name ?? 'Customer' }},</p>
            <p>Thank you for your purchase! We're getting your order ready to be shipped. We will notify you when it has been sent.</p>
            
            <a href="{{ route('checkout.success', $order->order_number) }}" class="btn">View your order</a>
            
            <div class="order-summary">
                <h3>Order summary</h3>
                <table class="item-table">
                    @foreach($order->items as $item)
                    <tr>
                        <td style="width: 70%;">
                            <strong>{{ $item->product_name ?? 'Product' }}</strong>
                            <br>
                            <span style="font-size: 13px; color: #777;">Qty: {{ $item->quantity }}</span>
                        </td>
                        <td class="price">
                            {{ $order->currency ?? 'BDT' }} {{ number_format($item->price * $item->quantity, 2) }}
                        </td>
                    </tr>
                    @endforeach
                </table>
                
                <table class="totals-table">
                    @if(isset($order->subtotal) && $order->subtotal > 0)
                    <tr>
                        <td class="label">Subtotal</td>
                        <td class="value">{{ $order->currency ?? 'BDT' }} {{ number_format($order->subtotal, 2) }}</td>
                    </tr>
                    @endif
                    @if(isset($order->shipping_cost) && $order->shipping_cost > 0)
                    <tr>
                        <td class="label">Shipping</td>
                        <td class="value">{{ $order->currency ?? 'BDT' }} {{ number_format($order->shipping_cost, 2) }}</td>
                    </tr>
                    @endif
                    @if(isset($order->tax) && $order->tax > 0)
                    <tr>
                        <td class="label">Tax</td>
                        <td class="value">{{ $order->currency ?? 'BDT' }} {{ number_format($order->tax, 2) }}</td>
                    </tr>
                    @endif
                    <tr class="total">
                        <td class="label">Total</td>
                        <td class="value">{{ $order->currency ?? 'BDT' }} {{ number_format($order->total_amount, 2) }}</td>
                    </tr>
                </table>
            </div>
            
            <div class="customer-info">
                <h3>Customer information</h3>
                <table style="width: 100%;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <div class="info-block">
                                <strong>Shipping address</strong>
                                <p>{{ $order->customer->name ?? 'Customer' }}</p>
                                <p>{{ $order->shipping_address ?? 'Address not provided' }}</p>
                            </div>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                            <div class="info-block">
                                <strong>Billing address</strong>
                                <p>{{ $order->customer->name ?? 'Customer' }}</p>
                                <p>{{ $order->billing_address ?? $order->shipping_address ?? 'Address not provided' }}</p>
                            </div>
                        </td>
                    </tr>
                </table>
                <table style="width: 100%;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <div class="info-block">
                                <strong>Shipping method</strong>
                                <p>Standard Shipping</p>
                            </div>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                            <div class="info-block">
                                <strong>Payment method</strong>
                                <p>{{ ucfirst($order->payment_method ?? 'SSLCommerz') }} - {{ ucfirst($order->payment_status ?? 'paid') }}</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="footer">
            <p>If you have any questions, reply to this email or contact us at <a href="mailto:{{ $settings['store_email'] ?? 'support@leanexa.store' }}" style="color: {{ $themeColor }};">{{ $settings['store_email'] ?? 'support@leanexa.store' }}</a>.</p>
            <p>Please find the official PDF invoice attached to this email.</p>
        </div>
    </div>
    <br>
</body>
</html>
