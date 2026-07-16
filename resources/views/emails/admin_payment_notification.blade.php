@extends('emails.layout')

@section('title', 'Payment Received')
@section('preheader', $currency . ' ' . number_format($amount, 2) . ' received from ' . $customerName)

@section('content')
    <h2>💰 New payment received — {{ $reference }}</h2>
    <p>A payment has just been completed on your store. Here are the details:</p>

    <div class="panel">
        <table class="data-table">
            <tr>
                <td class="label">Type</td>
                <td class="value">{{ $type }}</td>
            </tr>
            <tr>
                <td class="label">{{ $type === 'Order' ? 'Order No' : 'Invoice No' }}</td>
                <td class="value">{{ $reference }}</td>
            </tr>
            <tr>
                <td class="label">Customer</td>
                <td class="value">{{ $customerName }}</td>
            </tr>
            <tr>
                <td class="label">Amount paid</td>
                <td class="value" style="color: {{ $themeColor }};">{{ $currency }} {{ number_format($amount, 2) }}</td>
            </tr>
            @if(!empty($note))
            <tr>
                <td class="label">Note</td>
                <td class="value">{{ $note }}</td>
            </tr>
            @endif
            <tr>
                <td class="label">When</td>
                <td class="value">{{ now()->format('d M Y, h:i A') }}</td>
            </tr>
        </table>
    </div>

    <p class="muted">You're receiving this because your address is listed under Admin Notification Emails in the store settings.</p>
@endsection
