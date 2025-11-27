<?php

namespace Ramingo\Utils;

/**
 * JWT (JSON Web Token) Helper
 *
 * Simple JWT implementation for authentication
 */
class JWT
{
    private string $secret;
    private int $expiration;

    public function __construct(string $secret, int $expiration = 86400)
    {
        $this->secret = $secret;
        $this->expiration = $expiration;
    }

    /**
     * Encode a payload into a JWT token
     */
    public function encode(array $payload): string
    {
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $header = $this->base64UrlEncode(json_encode($header));

        // Add issued at and expiration time
        $payload['iat'] = time();
        $payload['exp'] = time() + $this->expiration;

        $payload = $this->base64UrlEncode(json_encode($payload));

        $signature = $this->sign("{$header}.{$payload}");

        return "{$header}.{$payload}.{$signature}";
    }

    /**
     * Decode a JWT token
     */
    public function decode(string $token): ?array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        // Verify signature
        $expectedSignature = $this->sign("{$header}.{$payload}");

        if (!hash_equals($signature, $expectedSignature)) {
            return null;
        }

        $payload = json_decode($this->base64UrlDecode($payload), true);

        if (!is_array($payload)) {
            return null;
        }

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    /**
     * Verify a token is valid
     */
    public function verify(string $token): bool
    {
        return $this->decode($token) !== null;
    }

    /**
     * Create signature
     */
    private function sign(string $data): string
    {
        $signature = hash_hmac('sha256', $data, $this->secret, true);
        return $this->base64UrlEncode($signature);
    }

    /**
     * Base64 URL encode
     */
    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     */
    private function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
