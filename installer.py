import os
import sys
import shutil
import zipfile
import threading
import subprocess
from pathlib import Path
import tkinter as tk
from tkinter import ttk, messagebox

# Determine resource path (bundled with PyInstaller or local)
def get_resource_path(relative_path):
    if getattr(sys, 'frozen', False):
        base_path = Path(sys._MEIPASS)
    else:
        base_path = Path(__file__).resolve().parent
    return base_path / relative_path

DEFAULT_INSTALL_DIR = Path(os.environ.get('LOCALAPPDATA', str(Path.home()))) / "Programs" / "WP-Profile-Manager"

class InstallerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Cài Đặt WP Profile Manager - Desktop Setup")
        self.root.geometry("520x360")
        self.root.resizable(False, False)
        self.root.configure(bg="#f8fafc")

        # Set Window Icon
        ico_path = get_resource_path("app.ico")
        if ico_path.exists():
            try:
                self.root.iconbitmap(str(ico_path))
            except Exception:
                pass

        # Center on screen
        self.center_window()

        self.install_dir = tk.StringVar(value=str(DEFAULT_INSTALL_DIR))
        self.launch_after = tk.BooleanVar(value=True)

        self.build_ui()

    def center_window(self):
        self.root.update_idletasks()
        w = 520
        h = 360
        x = (self.root.winfo_screenwidth() // 2) - (w // 2)
        y = (self.root.winfo_screenheight() // 2) - (h // 2)
        self.root.geometry(f"{w}x{h}+{x}+{y}")

    def build_ui(self):
        # Header banner
        header = tk.Frame(self.root, bg="#0f1b2d", height=75)
        header.pack(fill="x", side="top")

        title_lbl = tk.Label(
            header,
            text="WP Profile Manager",
            font=("Segoe UI", 16, "bold"),
            fg="#ffffff",
            bg="#0f1b2d"
        )
        title_lbl.pack(anchor="w", padx=25, pady=(15, 2))

        sub_lbl = tk.Label(
            header,
            text="Trình quản lý profile & cookies cứng 3 website WordPress",
            font=("Segoe UI", 9),
            fg="#94a3b8",
            bg="#0f1b2d"
        )
        sub_lbl.pack(anchor="w", padx=25)

        # Body
        body = tk.Frame(self.root, bg="#f8fafc", padx=25, pady=20)
        body.pack(fill="both", expand=True)

        desc_lbl = tk.Label(
            body,
            text="Ứng dụng sẽ được cài đặt trực tiếp vào máy tính của bạn.\nBạn có thể tự điền và lưu 3 đường link admin riêng biệt cho từng profile.",
            font=("Segoe UI", 9),
            fg="#334155",
            bg="#f8fafc",
            justify="left"
        )
        desc_lbl.pack(anchor="w", pady=(0, 15))

        # Path input
        path_frame = tk.LabelFrame(
            body,
            text=" Thư mục cài đặt: ",
            font=("Segoe UI", 9, "bold"),
            bg="#f8fafc",
            fg="#475569"
        )
        path_frame.pack(fill="x", pady=(0, 15))

        path_entry = tk.Entry(
            path_frame,
            textvariable=self.install_dir,
            font=("Segoe UI", 9),
            bg="#ffffff",
            relief="solid",
            bd=1
        )
        path_entry.pack(fill="x", padx=10, pady=8)

        # Checkbox
        chk = tk.Checkbutton(
            body,
            text="Khởi động WP Profile Manager ngay sau khi cài xong",
            variable=self.launch_after,
            font=("Segoe UI", 9),
            bg="#f8fafc",
            activebackground="#f8fafc"
        )
        chk.pack(anchor="w", pady=(0, 10))

        # Progress bar (hidden initially)
        self.progress = ttk.Progressbar(body, orient="horizontal", mode="determinate")
        self.status_lbl = tk.Label(body, text="", font=("Segoe UI", 8), fg="#64748b", bg="#f8fafc")

        # Footer Buttons
        footer = tk.Frame(self.root, bg="#f1f5f9", height=50)
        footer.pack(fill="x", side="bottom")

        self.btn_exit = tk.Button(
            footer,
            text="Hủy bỏ",
            font=("Segoe UI", 9),
            bg="#e2e8f0",
            fg="#334155",
            relief="flat",
            padx=15,
            pady=4,
            command=self.root.destroy
        )
        self.btn_exit.pack(side="right", padx=(5, 20), pady=10)

        self.btn_install = tk.Button(
            footer,
            text="CÀI ĐẶT NGAY",
            font=("Segoe UI", 9, "bold"),
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            activeforeground="#ffffff",
            relief="flat",
            padx=20,
            pady=4,
            command=self.start_install
        )
        self.btn_install.pack(side="right", padx=5, pady=10)

    def start_install(self):
        self.btn_install.config(state="disabled")
        self.btn_exit.config(state="disabled")
        self.progress.pack(fill="x", pady=(5, 5))
        self.status_lbl.pack(anchor="w")

        threading.Thread(target=self.do_installation, daemon=True).start()

    def do_installation(self):
        try:
            target_dir = Path(self.install_dir.get().strip())
            zip_file = get_resource_path("app_bundle.zip")

            self.update_status("Đang chuẩn bị thư mục cài đặt...", 10)
            target_dir.mkdir(parents=True, exist_ok=True)

            self.update_status("Đang giải nén các tệp ứng dụng...", 30)
            with zipfile.ZipFile(zip_file, 'r') as zf:
                total_files = len(zf.infolist())
                for i, item in enumerate(zf.infolist()):
                    zf.extract(item, target_dir)
                    if i % 10 == 0:
                        pct = 30 + int((i / total_files) * 45)
                        self.update_status(f"Đang giải nén: {item.filename}", pct)

            self.update_status("Đang tạo biểu tượng Shortcut trên Desktop...", 85)
            exe_path = target_dir / "WP-Profile-Manager.exe"
            self.create_desktop_shortcut(exe_path)

            self.update_status("Cài đặt hoàn tất 100%!", 100)

            if self.launch_after.get():
                subprocess.Popen([str(exe_path)], creationflags=subprocess.DETACHED_PROCESS)

            self.root.after(500, self.finish_success)

        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Lỗi Cài Đặt", f"Không thể hoàn tất cài đặt:\n{e}"))
            self.btn_install.config(state="normal")
            self.btn_exit.config(state="normal")

    def update_status(self, text, pct):
        self.root.after(0, lambda: [
            self.status_lbl.config(text=text),
            self.progress.configure(value=pct)
        ])

    def create_desktop_shortcut(self, exe_path):
        desktop = Path(os.environ.get('USERPROFILE', 'C:/')) / "Desktop"
        shortcut_path = desktop / "WP Profile Manager.lnk"
        ps_cmd = f"""
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut('{str(shortcut_path)}')
        $Shortcut.TargetPath = '{str(exe_path)}'
        $Shortcut.WorkingDirectory = '{str(exe_path.parent)}'
        $Shortcut.IconLocation = '{str(exe_path)},0'
        $Shortcut.Description = 'WP Profile Manager - Desktop Workspace'
        $Shortcut.Save()
        """
        subprocess.run(["powershell", "-Command", ps_cmd], capture_output=True)

    def finish_success(self):
        messagebox.showinfo(
            "Cài Đặt Thành Công",
            "WP Profile Manager đã được cài đặt thành công vào máy tính!\nBiểu tượng đã được tạo trên màn hình Desktop."
        )
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = InstallerApp(root)
    root.mainloop()
