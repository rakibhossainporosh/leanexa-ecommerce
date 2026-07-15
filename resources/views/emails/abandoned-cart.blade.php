<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Complete Your Purchase</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { max-width: 150px; }
        .product-list { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .product-list th, .product-list td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #2b59ff; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
        .discount-box { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2b59ff; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            @if(!empty($settings['logo_url']))
                <img src="{{ url($settings['logo_url']) }}" alt="{{ $settings['store_name'] ?? 'Store' }}" class="logo">
            @else
                <h2>{{ $settings['store_name'] ?? 'Store' }}</h2>
            @endif
        </div>

        <p>Hi {{ $cart->customer ? $cart->customer->name : ($cart->guest_name ?? 'there') }},</p>
        
        <p>We noticed you left some items in your cart. They are still waiting for you! Don't miss out on these great products.</p>

        @if($discountMessage)
        <div class="discount-box">
            <strong>Special Offer:</strong> {{ $discountMessage }}
        </div>
        @endif

        <table class="product-list">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                @foreach($cart->items as $item)
                <tr>
                    <td>
                        {{ $item->product->name }}
                        @if($item->colorVariant || $item->sizeVariant)
                            <br><small>
                            @if($item->colorVariant) Color: {{ $item->colorVariant->name }} @endif
                            @if($item->sizeVariant) Size: {{ $item->sizeVariant->name }} @endif
                            </small>
                        @endif
                    </td>
                    <td>{{ $item->quantity }}</td>
                    <td>৳{{ number_format($item->price * $item->quantity, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ route('cart.index') }}" class="btn">Return to Cart</a>
        </div>

        <div class="footer">
            <p>If you have any questions, reply to this email or contact us at {{ $settings['store_email'] ?? 'support@store.com' }}.</p>
            <p>&copy; {{ date('Y') }} {{ $settings['store_name'] ?? 'Store' }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
