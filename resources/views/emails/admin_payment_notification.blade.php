<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Received</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
    <h2 style="margin-bottom: 4px;">💰 Payment Received</h2>
    <p style="color: #475569; margin-top: 0;">A new payment has just been completed on {{ config('app.name') }}.</p>

    <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-top: 12px;">
        <tr>
            <td style="color: #64748b;">Type</td>
            <td style="font-weight: bold;">{{ $type }}</td>
        </tr>
        <tr>
            <td style="color: #64748b;">Reference</td>
            <td style="font-weight: bold;">{{ $reference }}</td>
        </tr>
        <tr>
            <td style="color: #64748b;">Customer</td>
            <td style="font-weight: bold;">{{ $customerName }}</td>
        </tr>
        <tr>
            <td style="color: #64748b;">Amount Paid</td>
            <td style="font-weight: bold; color: #059669;">{{ $currency }} {{ number_format($amount, 2) }}</td>
        </tr>
        @if(!empty($note))
        <tr>
            <td style="color: #64748b;">Note</td>
            <td style="font-weight: bold;">{{ $note }}</td>
        </tr>
        @endif
        <tr>
            <td style="color: #64748b;">When</td>
            <td>{{ now()->format('d M Y, h:i A') }}</td>
        </tr>
    </table>

    <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
        You are receiving this because your address is listed under Admin Notification Emails in the store settings.
    </p>
</body>
</html>
