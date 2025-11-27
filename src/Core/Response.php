<?php

namespace Ramingo\Core;

class Response
{
    public function __construct(
        private mixed $data,
        private int $status = 200,
        private array $headers = []
    ) {}

    public function send(): void
    {
        http_response_code($this->status);

        foreach ($this->headers as $key => $value) {
            header("{$key}: {$value}");
        }

        if (is_array($this->data) || is_object($this->data)) {
            if (!isset($this->headers['Content-Type'])) {
                header('Content-Type: application/json');
            }
            echo json_encode($this->data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } else {
            echo $this->data;
        }
    }

    public static function json(mixed $data, int $status = 200, array $headers = []): self
    {
        $headers['Content-Type'] = 'application/json';
        return new self($data, $status, $headers);
    }

    public static function html(string $html, int $status = 200, array $headers = []): self
    {
        $headers['Content-Type'] = 'text/html; charset=utf-8';
        return new self($html, $status, $headers);
    }

    public static function redirect(string $url, int $status = 302): self
    {
        return new self('', $status, ['Location' => $url]);
    }
}
