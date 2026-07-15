<!DOCTYPE html>
<html>
<head>
    <title>Your Custom Invoice</title>
</head>
<body>
    <p>Dear {{ $invoice->customer_name }},</p>
    <p>Thank you for your payment of {{ number_format($invoice->amount, 2) }} BDT for "{{ $invoice->description }}".</p>
    <p>Please find your invoice attached as a PDF document.</p>
    <br>
    <p>Best Regards,</p>
    <p>{{ config('app.name') }}</p>
</body>
</html>
