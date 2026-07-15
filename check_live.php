<?php
$html = file_get_contents('https://www.leanexa.store');
if (strpos($html, 'hack_official_smtp_card') !== false) {
    echo "SCRIPT FOUND\n";
} else {
    echo "SCRIPT NOT FOUND\n";
}
