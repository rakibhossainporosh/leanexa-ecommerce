@extends('emails.layout')

@section('title', 'Payment Received')
@section('preheader', 'We received your payment — your receipt is attached.')

@section('content')
    @php
        $symbol = $invoice->currency_code ?: 'BDT';
        $paid = isset($paidNow) ? $paidNow : (float) $invoice->amount;
        $fullyPaid = isset($isFullyPaid) ? $isFullyPaid : true;
        $due = max(0, (float) $invoice->amount - (float) $invoice->amount_paid);
    @endphp

    <h2>{{ $fullyPaid ? 'Payment received — thank you!' : 'Partial payment received' }}</h2>
    <p>Dear {{ $invoice->customer_name }},</p>
    <p>We've received your payment for <strong>"{{ $invoice->description }}"</strong>. A copy of your invoice is attached as a PDF.</p>

    <div class="panel">
        <table class="data-table">
            <tr>
                <td class="label">Amount paid</td>
                <td class="value" style="color: {{ $themeColor }};">{{ $symbol }} {{ number_format($paid, 2) }}</td>
            </tr>
            <tr>
                <td class="label">Invoice total</td>
                <td class="value">{{ $symbol }} {{ number_format($invoice->amount, 2) }}</td>
            </tr>
            @unless($fullyPaid)
            <tr>
                <td class="label">Remaining balance</td>
                <td class="value">{{ $symbol }} {{ number_format($due, 2) }}</td>
            </tr>
            @endunless
        </table>
    </div>

    @if($fullyPaid)
        <p>Your invoice is now <strong>paid in full</strong>. We appreciate your business.</p>
    @else
        <p>You can pay the remaining balance any time from your invoice link.</p>
        <div class="btn-wrap">
            <a href="{{ route('invoice.show', $invoice->uuid) }}" class="btn">View &amp; Pay Invoice</a>
        </div>
    @endif
@endsection
