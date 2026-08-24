import http.server
import socketserver
import os

DIRECTORY = "build"

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def translate_path(self, path):
        clean_path = path.split('?')[0].lstrip('/')
        file_path = os.path.join(os.getcwd(), DIRECTORY, clean_path)

        if os.path.isfile(file_path):
            return file_path

        return os.path.join(os.getcwd(), DIRECTORY, "index.html")

def run_server():
    ports = [3000, 3001, 3002]

    for port in ports:
        try:
            server = socketserver.TCPServer(("", port), SPAHandler, bind_and_activate=False)
            server.allow_reuse_address = True
            server.server_bind()
            server.server_activate()

            print("=" * 50)
            print(f"SPA Server is running on port {port}")
            print(f"http://127.0.0.1:{port}")
            print(f"http://127.0.0.1:{port}/catalog")
            print("=" * 50)

            server.serve_forever()
            break
        except OSError:
            continue

if __name__ == "__main__":
    run_server()
