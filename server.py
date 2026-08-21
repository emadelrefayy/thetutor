import http.server
import socketserver
import os

PORT = 3000
DIRECTORY = '/root/thetutor_fresh/frontend/build'

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # التحقق من وجود الملف، وفي حال عدم وجوده يتم التوجيه لـ index.html
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            if not self.path.startswith('/static'):
                self.path = '/index.html'
        return super().do_GET()

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableTCPServer(("127.0.0.1", PORT), SPAHandler) as httpd:
    print(f"SPA Server running on http://127.0.0.1:{PORT}")
    httpd.serve_forever()
