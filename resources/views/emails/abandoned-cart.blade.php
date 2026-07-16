@extends('emails.layout')

@section('title', 'You left something behind')
@section('preheader', 'Your cart is still waiting — complete your purchase now.')

@section('content')
    @php $symbol = 'BDT'; @endphp
    <h2>You left something in your cart 🛒</h2>
    <p>Hi {{ $cart->customer ? $cart->customer->name : ($cart->guest_name ?? 'there') }},</p>
    <p>We noticed you left some items behind. They're still waiting for you — don't miss out!</p>

    @if($discountMessage)
    <div class="panel" style="border-left: 4px solid {{ $themeColor }};">
        <strong style="color: {{ $themeColor }};">Special offer:</strong> {{ $discountMessage }}
    </div>
    @endif

    <div class="panel">
        <table class="data-table">
            @foreach($cart->items as $item)
            <tr>
                <td class="label">
                    {{ $item->product->name }}
                    @if($item->colorVariant || $item->sizeVariant)
                        <br><span class="muted">
                        @if($item->colorVariant) Color: {{ $item->colorVariant->name }} @endif
                        @if($item->sizeVariant) Size: {{ $item->sizeVariant->name }} @endif
                        </span>
                    @endif
                    <br><span class="muted">Qty: {{ $item->quantity }}</span>
                </td>
                <td class="value">{{ $symbol }} {{ number_format($item->price * $item->quantity, 2) }}</td>
            </tr>
            @endforeach
        </table>
    </div>

    <div class="btn-wrap">
        <a href="{{ route('cart.index') }}" class="btn">Return to Your Cart</a>
    </div>
@endsection
