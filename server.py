#!/usr/bin/env python3
"""Servidor estático simple para Crema Pastelería en Render.
Sirve los archivos de la carpeta del proyecto. Sin dependencias externas.
"""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("PORT", 10000))
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # cache de assets estaticos
        if self.path.endswith((".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".woff2", ".json")):
            self.send_header("Cache-Control", "public, max-age=86400")
        else:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # silenciar logs


if __name__ == "__main__":
    os.chdir(ROOT)
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Crema Pastelería sirviendo en puerto {PORT}")
    httpd.serve_forever()
