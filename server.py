import http.server
import socketserver

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        path = self.path.split('?')[0].lower()
        if path.endswith(('.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.woff2', '.woff', '.ttf')):
            self.send_header('Cache-Control', 'public, max-age=86400, immutable')
        else:
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    PORT = 8080
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('', PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"Serving HTTP on port {PORT} with HTTP/1.1 Keep-Alive and asset caching...")
        httpd.serve_forever()
