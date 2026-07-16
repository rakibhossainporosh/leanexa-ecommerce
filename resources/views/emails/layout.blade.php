{{-- Branding ($brandStoreName, $themeColor, $brandLogoUrl, ...) is shared with
     every emails.* view by the AppServiceProvider view composer. --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>@yield('title', $brandStoreName)</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; -webkit-text-size-adjust: 100%; }
        body, table, td, p, a { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        a { color: {{ $themeColor }}; }
        .wrapper { width: 100%; background-color: #f1f5f9; padding: 32px 12px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .accent-bar { height: 4px; background-color: {{ $themeColor }}; }
        .header { padding: 28px 32px 20px; text-align: center; border-bottom: 1px solid #eef2f7; }
        .header .store-name { margin: 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; }
        .header img { max-height: 44px; max-width: 200px; }
        .content { padding: 32px; }
        .content h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #0f172a; }
        .content p { margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #475569; }
        .btn { display: inline-block; background-color: {{ $themeColor }}; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; }
        .btn-wrap { text-align: center; margin: 28px 0 8px; }
        .panel { background-color: #f8fafc; border: 1px solid #eef2f7; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table td { padding: 9px 0; font-size: 14px; color: #475569; border-bottom: 1px solid #eef2f7; }
        .data-table td.label { color: #64748b; }
        .data-table td.value { text-align: right; font-weight: 600; color: #0f172a; }
        .data-table tr:last-child td { border-bottom: none; }
        .footer { padding: 24px 32px 32px; text-align: center; border-top: 1px solid #eef2f7; }
        .footer p { margin: 0 0 4px; font-size: 12px; line-height: 1.6; color: #94a3b8; }
        .muted { color: #94a3b8; font-size: 13px; }
    </style>
</head>
<body>
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">@yield('preheader')</div>
    <div class="wrapper">
        <div class="container">
            <div class="accent-bar"></div>
            <div class="header">
                @if($brandLogoUrl)
                    <img src="{{ $brandLogoUrl }}" alt="{{ $brandStoreName }}">
                @else
                    <p class="store-name">{{ $brandStoreName }}</p>
                @endif
            </div>
            <div class="content">
                @yield('content')
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} {{ $brandStoreName }}. All rights reserved.</p>
                @if($brandStoreAddress)<p>{{ $brandStoreAddress }}</p>@endif
                @if($brandStoreEmail)<p>Questions? Contact us at <a href="mailto:{{ $brandStoreEmail }}">{{ $brandStoreEmail }}</a></p>@endif
            </div>
        </div>
    </div>
</body>
</html>
