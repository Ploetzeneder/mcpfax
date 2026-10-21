<?php
// Send a fax with the mcpfax REST API (https://mcpfax.de).
// MCPFAX_API_KEY=mfx_... php send_fax.php document.pdf "+49 30 1234567"

function mcpfax(string $method, string $path, ?array $body = null): array
{
    $ch = curl_init('https://mcpfax.de/api/v1' . $path);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 120,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . getenv('MCPFAX_API_KEY'), 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => $body ? json_encode($body) : null,
    ]);
    $data = json_decode((string)curl_exec($ch), true) ?: [];
    if (curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 400) {
        throw new RuntimeException(($data['error'] ?? 'error') . ': ' . ($data['message'] ?? ''));
    }
    return $data;
}

[$file, $number] = [$argv[1], $argv[2]];
$doc = [
    'recipient_fax_number' => $number,
    'file_base64'          => base64_encode(file_get_contents($file)),
    'file_name'            => basename($file),
];

$quote = mcpfax('POST', '/fax/price', $doc);
printf("%s: %d page(s), %s %.2f\n", $quote['to'], $quote['pages'], $quote['currency'], $quote['cost']);

$fax = mcpfax('POST', '/fax/send', $doc + ['idempotency_key' => bin2hex(random_bytes(16)), 'max_cost' => $quote['cost']]);
printf("Fax #%d: %s\n", $fax['fax_id'], $fax['status']);
