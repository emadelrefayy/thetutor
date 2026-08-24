import http.server
import socketserver
import os

PORT = 3000
DIRECTORY = "build"

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        file_path = os.path.join(DIRECTORY, self.path.lstrip("/"))
        if not os.path.exists(file_path) and not self.path.startswith("/static"):
            self.path = "/index.html"
        return super().do_GET()

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableTCPServer(("", PORT), SPAHandler) as httpd:
    print(f"🚀 SPA Server running securely on http://127.0.0.1:{PORT}")
    httpd.serve_forever()
