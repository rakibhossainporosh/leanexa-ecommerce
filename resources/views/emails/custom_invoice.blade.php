<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Custom Invoice</title>
</head>
<body>
    @php
        $symbol = $invoice->currency_code ?: 'BDT';
        $paid = isset($paidNow) ? $paidNow : (float) $invoice->amount;
        $fullyPaid = isset($isFullyPaid) ? $isFullyPaid : true;
        $due = max(0, (float) $invoice->amount - (float) $invoice->amount_paid);
    @endphp

    <p>Dear {{ $invoice->customer_name }},</p>

    <p>Thank you for your payment of <strong>{{ $symbol }} {{ number_format($paid, 2) }}</strong>
        for "{{ $invoice->description }}".</p>

    @if($fullyPaid)
        <p>Your invoice is now <strong>paid in full</strong>.</p>
    @else
        <p>This was a partial payment. Remaining balance due:
            <strong>{{ $symbol }} {{ number_format($due, 2) }}</strong>.</p>
    @endif

    <p>Please find your invoice attached as a PDF document.</p>
    <br>
    <p>Best Regards,</p>
    <p>{{ config('app.name') }}</p>
</body>
</html>
