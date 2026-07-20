@php
    $invoiceNumber = (\App\Models\Setting::general()['invoice_prefix'] ?? 'INV') . '-' . (explode('-', $invoice->uuid)[0] ?? $invoice->uuid);
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $invoiceNumber }}</title>
    <style>
        /* DomPDF compatible CSS */
        @page { margin: 0; }
        body {
            font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
            font-size: 13px;
            color: #334155;
            margin: 0;
            padding: 0;
        }
        
        .header {
            background-color: #ffffff;
            color: #0f172a;
            padding: 25px 40px;
            border-bottom: 2px solid #f1f5f9;
        }

        .header table { width: 100%; border-collapse: collapse; }
        .header td { vertical-align: middle; }
        
        .logo-img { max-height: 30px; }
        .logo-text { font-size: 22px; font-weight: bold; color: #0f172a; margin: 0; }
        
        .header-title { font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #00704A; text-align: right; text-transform: uppercase; }
        
        .company-info { color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 8px; }
        
        .content-wrapper { padding: 25px 40px; }

        table { width: 100%; border-collapse: collapse; }
        td { vertical-align: top; }
        
        .info-table { margin-bottom: 25px; width: 100%; }
        .info-table td { width: 50%; }

        .billed-to { padding-right: 30px; }
        .section-title { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .customer-name { font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 5px; }
        .customer-info { color: #64748b; font-size: 13px; line-height: 1.6; }
        
        .meta-table { width: 100%; float: right; max-width: 250px; }
        .meta-table td { padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
        .meta-table tr:last-child td { border-bottom: none; }
        .meta-label { color: #64748b; font-size: 12px; }
        .meta-value { color: #0f172a; font-weight: bold; font-size: 12px; text-align: right; }
        
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-paid { background-color: #dcfce7; color: #166534; }
        .status-unpaid, .status-pending { background-color: #fef9c3; color: #854d0e; }
        .status-failed { background-color: #fee2e2; color: #991b1b; }

        /* Items Table */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th {
            background-color: #f8fafc;
            color: #475569;
            font-size: 11px;
            font-weight: bold;
            padding: 12px 15px;
            border-top: 1px solid #e2e8f0;
            border-bottom: 2px solid #cbd5e1;
            text-transform: uppercase;
        }
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 13px;
        }
        .item-name { font-weight: 600; color: #0f172a; margin-bottom: 4px; display: block; }
        
        /* Alignments */
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        /* Totals Area */
        .totals-table { width: 300px; float: right; border-collapse: collapse; }
        .totals-table td { padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #475569; }
        .totals-table tr:last-child td { border-bottom: none; }
        .total-label { color: #64748b; }
        .total-value { font-weight: bold; text-align: right; color: #0f172a; }
        
        .amount-due-row { background-color: #f8fafc; }
        .amount-due-row td { padding: 15px; border-top: 2px solid #cbd5e1 !important; border-bottom: 2px solid #cbd5e1 !important; }
        .amount-due-label { font-size: 14px; font-weight: bold; color: #0f172a; }
        .amount-due-value { font-size: 18px; font-weight: bold; color: #00704A; text-align: right; }

        /* Notes Card */
        .notes-card {
            background-color: #f8fafc;
            border-left: 4px solid #00704A;
            padding: 15px;
            margin-bottom: 20px;
        }
        .notes-title { font-size: 11px; font-weight: bold; color: #00704A; text-transform: uppercase; margin-bottom: 5px; }
        .notes-text { font-size: 12px; color: #475569; line-height: 1.5; }

        .footer {
            margin-top: 50px;
            text-align: center;
            color: #94a3b8;
            font-size: 11px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
        .clearfix::after { content: ""; clear: both; display: table; }
    </style>
</head>
<body>
    <?php
        $settings = \App\Models\Setting::general();
        
        $currencyObj = \App\Models\Currency::where('code', $invoice->currency_code)->first();
        $currencySymbol = $currencyObj ? $currencyObj->symbol : 'Tk';
        // DomPDF's built-in fonts can't render the Bengali Taka sign (৳) and show
        // "?" instead, so fall back to the ASCII "Tk" the order invoice PDF uses.
        $currencySymbol = str_replace('৳', 'Tk', $currencySymbol);

        // Guarded so rendering this template twice in one request (e.g. emailing
        // then previewing) doesn't fatally redeclare the function.
        if (! function_exists('formatPricePDF')) {
            function formatPricePDF($amount, $symbol) {
                return $symbol . ' ' . number_format($amount, 2);
            }
        }
    ?>
    
    <div class="header">
        <table>
            <tr>
                <td style="width: 50%;">
                    <?php
                        $hasLogo = false;
                        $logoBase64 = null;
                        if (!empty($settings['logo_url'])) {
                            $url = $settings['logo_url'];
                            if (\Illuminate\Support\Str::startsWith($url, '/storage/')) {
                                $path = public_path($url);
                                if (file_exists($path)) {
                                    $logoBase64 = 'data:image/' . pathinfo($path, PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents($path));
                                    $hasLogo = true;
                                }
                            } else {
                                $logoBase64 = $url;
                                $hasLogo = true;
                            }
                        }
                    ?>
                    
                    @if(isset($hasLogo) && $hasLogo)
                        <img src="{{ $logoBase64 }}" alt="Logo" class="logo-img">
                    @else
                        <div class="logo-text">{{ $settings['store_name'] ?? config('app.name', 'E-Commerce') }}</div>
                    @endif
                    
                    <div class="company-info">
                        {{ $settings['store_address'] ?? 'Dhaka, Bangladesh' }}<br>
                        {{ $settings['store_phone'] ?? '+880 1700000000' }} &nbsp;|&nbsp; {{ $settings['store_email'] ?? 'support@example.com' }}
                    </div>
                </td>
                <td style="width: 50%;">
                    <div class="header-title">INVOICE</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="content-wrapper">
        <table class="info-table">
            <tr>
                <td class="billed-to">
                    <div class="section-title">Billed To</div>
                    <div class="customer-name">{{ $invoice->customer_name }}</div>
                    <div class="customer-info">
                        {{ $invoice->customer_email }}<br>
                        @if($invoice->customer_phone) {{ $invoice->customer_phone }}<br> @endif
                        @if($invoice->customer_address) {{ $invoice->customer_address }} @endif
                    </div>
                </td>
                <td>
                    <table class="meta-table">
                        <tr>
                            <td class="meta-label">Invoice No:</td>
                            <td class="meta-value">#{{ $invoiceNumber }}</td>
                        </tr>
                        <tr>
                            <td class="meta-label">Date Issued:</td>
                            <td class="meta-value">{{ $invoice->created_at->format('F j, Y') }}</td>
                        </tr>
                        <tr>
                            <td class="meta-label">Status:</td>
                            <td class="meta-value">
                                <span class="status-badge status-{{ strtolower($invoice->status) }}">
                                    {{ strtoupper($invoice->status) }}
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th class="text-left">Item Description</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $item)
                <tr>
                    <td class="text-left">
                        <span class="item-name">{{ $item->name }}</span>
                    </td>
                    <td class="text-center">{{ $item->quantity }}</td>
                    <td class="text-right">{{ formatPricePDF($item->price, $currencySymbol) }}</td>
                    <td class="text-right" style="font-weight: 600;">{{ formatPricePDF($item->total, $currencySymbol) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Footer / Totals -->
        <table style="width: 100%; margin-top: 10px;" cellpadding="0" cellspacing="0">
            <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 30px;">
                    <!-- Notes -->
                    @if($invoice->note)
                    <div class="notes-card">
                        <div class="notes-title">Notes</div>
                        <div class="notes-text">{{ $invoice->note }}</div>
                    </div>
                    @endif
                </td>
                <td style="width: 50%; vertical-align: top;">
                    <table class="totals-table">
                        <tr>
                            <td class="total-label">Subtotal</td>
                            <td class="total-value">{{ formatPricePDF($invoice->subtotal, $currencySymbol) }}</td>
                        </tr>
                        
                        @if($invoice->discount > 0)
                        <tr>
                            <td class="total-label">Discount</td>
                            <td class="total-value" style="color: #dc2626;">- {{ formatPricePDF($invoice->discount, $currencySymbol) }}</td>
                        </tr>
                        @endif
                        
                        <tr class="amount-due-row">
                            <td class="amount-due-label">Total</td>
                            <td class="amount-due-value">{{ formatPricePDF($invoice->amount, $currencySymbol) }}</td>
                        </tr>

                        {{-- Show how much has been paid and what remains once any
                             payment has landed (partially or fully paid). --}}
                        @if($invoice->amount_paid > 0)
                        <tr>
                            <td class="total-label" style="color: #059669; padding-top: 12px;">Amount Paid</td>
                            <td class="total-value" style="color: #059669; padding-top: 12px;">- {{ formatPricePDF($invoice->amount_paid, $currencySymbol) }}</td>
                        </tr>
                        <tr>
                            <td class="total-label" style="font-weight: bold; color: #0f172a;">Amount Due</td>
                            <td class="total-value" style="font-weight: bold; color: #0f172a;">{{ formatPricePDF($invoice->due_amount, $currencySymbol) }}</td>
                        </tr>
                        @endif
                    </table>
                </td>
            </tr>
        </table>
        
        <div class="footer">
            Thank you for your business!<br>
            If you have any questions about this invoice, please contact us at {{ $settings['store_email'] ?? 'support@example.com' }}
        </div>
    </div>
</body>
</html>
