import os
import sys
import json
import socket
import threading
import subprocess
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse
import webview

# Determine paths & portability
if getattr(sys, 'frozen', False):
    APP_DIR = Path(sys.executable).resolve().parent
    BUNDLE_DIR = Path(sys._MEIPASS)
else:
    APP_DIR = Path(__file__).resolve().parent
    BUNDLE_DIR = APP_DIR

# Auto-detect data directory:
# If user is in D:\Project Anti\WP-Profile-Manager, keep data there;
# If cloned on another computer/folder, store locally inside project/app folder!
DEFAULT_LOCAL_DIR = Path(r"D:\Project Anti\WP-Profile-Manager")
if DEFAULT_LOCAL_DIR.exists() and DEFAULT_LOCAL_DIR.is_dir():
    BASE_DATA_DIR = DEFAULT_LOCAL_DIR
else:
    BASE_DATA_DIR = APP_DIR

DATA_DIR = BASE_DATA_DIR / "data"
PROFILES_DIR = BASE_DATA_DIR / "profiles"
CONFIG_FILE = DATA_DIR / "config.json"
PROFILES_FILE = DATA_DIR / "profiles.json"
PUBLIC_DIR = BUNDLE_DIR / "public"

DATA_DIR.mkdir(parents=True, exist_ok=True)
PROFILES_DIR.mkdir(parents=True, exist_ok=True)

def find_browser_executable():
    possible_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
    ]
    for p in possible_paths:
        if os.path.exists(p):
            return p
    return r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# Lock for thread safety
file_lock = threading.Lock()
running_processes = {}  # profile_id -> pid

def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

def read_config():
    with file_lock:
        if CONFIG_FILE.exists():
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print("Error reading config:", e)
        default_cfg = {
            "browserPath": find_browser_executable(),
            "defaultUrls": [
                "https://your-site1.com/wp-admin/",
                "https://your-site2.com/wp-admin/",
                "https://your-site3.com/wp-admin/"
            ],
            "defaultGroup": "Chung",
            "groups": ["Chung", "Chi nhánh 1", "Chi nhánh 2", "Thử nghiệm"]
        }
        save_config(default_cfg)
        return default_cfg

def save_config(cfg):
    with file_lock:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)

def read_profiles():
    with file_lock:
        if PROFILES_FILE.exists():
            try:
                with open(PROFILES_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print("Error reading profiles:", e)
        return []

def save_profiles(profiles):
    with file_lock:
        with open(PROFILES_FILE, 'w', encoding='utf-8') as f:
            json.dump(profiles, f, ensure_ascii=False, indent=2)

def is_pid_alive(pid):
    try:
        # On Windows, check process status using tasklist
        cmd = f'tasklist /FI "PID eq {pid}"'
        output = subprocess.check_output(cmd, shell=True, text=True)
        return str(pid) in output
    except Exception:
        return False

def clean_dead_processes():
    dead = []
    for pid_id, pid in list(running_processes.items()):
        if not is_pid_alive(pid):
            dead.append(pid_id)
    for d in dead:
        running_processes.pop(d, None)

class ApiRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC_DIR), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/profiles':
            clean_dead_processes()
            profiles = read_profiles()
            enhanced = []
            for p in profiles:
                p_copy = dict(p)
                p_copy['isRunning'] = p.get('id') in running_processes
                enhanced.append(p_copy)
            self.send_json({"success": True, "data": enhanced})
            return

        elif path == '/api/config':
            cfg = read_config()
            self.send_json({"success": True, "data": cfg})
            return

        elif path == '/api/stats':
            clean_dead_processes()
            profiles = read_profiles()
            groups = set(p.get('group') for p in profiles if p.get('group'))
            with_notes = sum(1 for p in profiles if p.get('note'))
            self.send_json({
                "success": True,
                "data": {
                    "totalProfiles": len(profiles),
                    "runningProfiles": len(running_processes),
                    "totalGroups": len(groups),
                    "profilesWithNotes": with_notes
                }
            })
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        if path == '/api/profiles':
            name = (body.get('name') or '').strip()
            if not name:
                self.send_json({"success": False, "error": "Tên profile không được để trống"}, 400)
                return

            import time
            new_id = f"prof_{int(time.time() * 1000)}"
            cfg = read_config()
            profiles = read_profiles()

            raw_urls = body.get('urls')
            if isinstance(raw_urls, list) and len(raw_urls) > 0:
                urls = [u.strip() for u in raw_urls if u and str(u).strip()]
            else:
                urls = cfg.get('defaultUrls', [])

            new_profile = {
                "id": new_id,
                "name": name,
                "group": (body.get('group') or cfg.get('defaultGroup', 'Chung')).strip(),
                "note": (body.get('note') or '').strip(),
                "urls": urls,
                "proxy": (body.get('proxy') or '').strip(),
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "lastOpenedAt": None
            }

            profiles.insert(0, new_profile)
            save_profiles(profiles)

            # Ensure profile directory exists
            prof_dir = PROFILES_DIR / new_id
            prof_dir.mkdir(parents=True, exist_ok=True)

            self.send_json({"success": True, "data": new_profile})
            return

        # /api/profiles/:id/launch
        if path.startswith('/api/profiles/') and path.endswith('/launch'):
            parts = path.split('/')
            profile_id = parts[3]
            clean_dead_processes()

            if profile_id in running_processes:
                self.send_json({"success": True, "message": "Profile đã đang chạy", "alreadyRunning": True})
                return

            profiles = read_profiles()
            profile = next((p for p in profiles if p.get('id') == profile_id), None)
            if not profile:
                self.send_json({"success": False, "error": "Không tìm thấy profile"}, 404)
                return

            cfg = read_config()
            browser_path = cfg.get('browserPath', r"C:\Program Files\Google\Chrome\Application\chrome.exe")
            if not os.path.exists(browser_path):
                self.send_json({"success": False, "error": f"Không tìm thấy Chrome tại: {browser_path}"}, 500)
                return

            prof_dir = PROFILES_DIR / profile_id
            prof_dir.mkdir(parents=True, exist_ok=True)

            args = [
                browser_path,
                f"--user-data-dir={str(prof_dir)}",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-blink-features=AutomationControlled",
                "--start-maximized"
            ]

            if profile.get('proxy'):
                args.append(f"--proxy-server={profile['proxy'].strip()}")

            urls = profile.get('urls') or cfg.get('defaultUrls', [])
            args.extend(urls)

            try:
                proc = subprocess.Popen(args, creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP)
                running_processes[profile_id] = proc.pid

                import time
                profile['lastOpenedAt'] = time.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                save_profiles(profiles)

                self.send_json({"success": True, "message": "Đã mở profile", "pid": proc.pid})
            except Exception as e:
                self.send_json({"success": False, "error": str(e)}, 500)
            return

        # /api/profiles/:id/close
        if path.startswith('/api/profiles/') and path.endswith('/close'):
            parts = path.split('/')
            profile_id = parts[3]
            clean_dead_processes()

            if profile_id in running_processes:
                pid = running_processes.pop(profile_id)
                try:
                    subprocess.call(f"taskkill /PID {pid} /T /F", shell=True)
                except Exception:
                    pass
            self.send_json({"success": True, "message": "Đã đóng profile"})
            return

        # /api/profiles/:id/open-folder
        if path.startswith('/api/profiles/') and path.endswith('/open-folder'):
            parts = path.split('/')
            profile_id = parts[3]
            prof_dir = PROFILES_DIR / profile_id
            prof_dir.mkdir(parents=True, exist_ok=True)
            os.startfile(str(prof_dir))
            self.send_json({"success": True, "message": "Đã mở thư mục profile"})
            return

        self.send_json({"success": False, "error": "Not Found"}, 404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        if path.startswith('/api/profiles/'):
            profile_id = path.split('/')[-1]
            profiles = read_profiles()
            idx = next((i for i, p in enumerate(profiles) if p.get('id') == profile_id), -1)
            if idx == -1:
                self.send_json({"success": False, "error": "Không tìm thấy profile"}, 404)
                return

            if 'name' in body and body['name'].strip():
                profiles[idx]['name'] = body['name'].strip()
            if 'group' in body:
                profiles[idx]['group'] = body['group'].strip()
            if 'note' in body:
                profiles[idx]['note'] = body['note'].strip()
            if 'proxy' in body:
                profiles[idx]['proxy'] = body['proxy'].strip()
            if 'urls' in body and isinstance(body['urls'], list):
                profiles[idx]['urls'] = [u.strip() for u in body['urls'] if u and str(u).strip()]

            save_profiles(profiles)
            self.send_json({"success": True, "data": profiles[idx]})
            return

        if path == '/api/config':
            cfg = read_config()
            cfg.update(body)
            save_config(cfg)
            self.send_json({"success": True, "data": cfg})
            return

        self.send_json({"success": False, "error": "Not Found"}, 404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)
        delete_data = query.get('deleteData', ['false'])[0] == 'true'

        if path.startswith('/api/profiles/'):
            profile_id = path.split('/')[-1]
            clean_dead_processes()

            if profile_id in running_processes:
                pid = running_processes.pop(profile_id)
                try:
                    subprocess.call(f"taskkill /PID {pid} /T /F", shell=True)
                except Exception:
                    pass

            profiles = read_profiles()
            profiles = [p for p in profiles if p.get('id') != profile_id]
            save_profiles(profiles)

            if delete_data:
                import shutil
                prof_dir = PROFILES_DIR / profile_id
                if prof_dir.exists():
                    try:
                        shutil.rmtree(prof_dir, ignore_errors=True)
                    except Exception as e:
                        print("Error deleting dir:", e)

            self.send_json({"success": True, "message": "Đã xóa profile"})
            return

        self.send_json({"success": False, "error": "Not Found"}, 404)

    def read_json_body(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            if length > 0:
                raw = self.rfile.read(length)
                return json.loads(raw.decode('utf-8'))
        except Exception:
            pass
        return {}

    def send_json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        # Silence HTTP access logs
        return

def run_server(port):
    server = HTTPServer(('127.0.0.1', port), ApiRequestHandler)
    server.serve_forever()

if __name__ == '__main__':
    port = get_free_port()
    t = threading.Thread(target=run_server, args=(port,), daemon=True)
    t.start()

    window = webview.create_window(
        title="WP Profile Manager - Desktop Workspace",
        url=f"http://127.0.0.1:{port}",
        width=1320,
        height=860,
        min_size=(980, 650),
        background_color='#0f1b2d'
    )
    webview.start()
