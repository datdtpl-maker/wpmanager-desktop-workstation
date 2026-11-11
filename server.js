const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3890;

const DATA_DIR = path.join(__dirname, 'data');
const PROFILES_DIR = path.join(__dirname, 'profiles');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PROFILES_DIR)) fs.mkdirSync(PROFILES_DIR, { recursive: true });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory process tracker: profileId -> { pid, process, launchedAt }
const runningProfiles = new Map();

// Helper functions for storage
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading config:', err);
  }
  return {
    browserPath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    defaultUrls: [
      "https://khaihoanskincare.com/wp-admin/",
      "https://khaihoanderma.com/wp-admin/",
      "https://khaihoanpharma.com/wp-admin/"
    ],
    defaultGroup: "Khai Hoàn",
    groups: ["Khai Hoàn", "Đối tác", "Thử nghiệm"],
    port: 3890
  };
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

function readProfiles() {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading profiles:', err);
  }
  return [];
}

function saveProfiles(profiles) {
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
}

function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

// Clean up dead PIDs
function cleanRunningProfiles() {
  for (const [id, info] of runningProfiles.entries()) {
    if (!isPidAlive(info.pid)) {
      runningProfiles.delete(id);
    }
  }
}

// ----------------- ROUTES ----------------- //

// 1. Get all profiles with active status
app.get('/api/profiles', (req, res) => {
  cleanRunningProfiles();
  const profiles = readProfiles();
  const enhanced = profiles.map(p => ({
    ...p,
    isRunning: runningProfiles.has(p.id)
  }));
  res.json({ success: true, data: enhanced });
});

// 2. Create profile
app.post('/api/profiles', (req, res) => {
  const { name, group, note, urls, proxy } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Tên profile không được để trống' });
  }

  const config = readConfig();
  const profiles = readProfiles();
  const newId = 'prof_' + Date.now();

  const newProfile = {
    id: newId,
    name: name.trim(),
    group: group && group.trim() ? group.trim() : config.defaultGroup || 'Chung',
    note: note ? note.trim() : '',
    urls: Array.isArray(urls) && urls.length > 0 ? urls.filter(u => u && u.trim()) : config.defaultUrls,
    proxy: proxy ? proxy.trim() : '',
    createdAt: new Date().toISOString(),
    lastOpenedAt: null
  };

  profiles.unshift(newProfile);
  saveProfiles(profiles);

  // Ensure profile dir exists
  const profileDir = path.join(PROFILES_DIR, newId);
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  res.json({ success: true, data: newProfile });
});

// 3. Update profile
app.put('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const { name, group, note, urls, proxy } = req.body;

  const profiles = readProfiles();
  const index = profiles.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy profile' });
  }

  if (name && name.trim()) profiles[index].name = name.trim();
  if (group !== undefined) profiles[index].group = group.trim();
  if (note !== undefined) profiles[index].note = note.trim();
  if (Array.isArray(urls)) profiles[index].urls = urls.filter(u => u && u.trim());
  if (proxy !== undefined) profiles[index].proxy = proxy.trim();

  saveProfiles(profiles);
  res.json({ success: true, data: profiles[index] });
});

// 4. Delete profile
app.delete('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const deleteData = req.query.deleteData === 'true';

  // Stop if running
  if (runningProfiles.has(id)) {
    const info = runningProfiles.get(id);
    try {
      spawn('taskkill', ['/PID', info.pid.toString(), '/T', '/F']);
    } catch (e) {}
    runningProfiles.delete(id);
  }

  const profiles = readProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  saveProfiles(filtered);

  if (deleteData) {
    const profileDir = path.join(PROFILES_DIR, id);
    if (fs.existsSync(profileDir)) {
      try {
        fs.rmSync(profileDir, { recursive: true, force: true });
      } catch (e) {
        console.warn('Could not delete folder:', profileDir, e.message);
      }
    }
  }

  res.json({ success: true, message: 'Đã xóa profile thành công' });
});

// 5. Launch profile
app.post('/api/profiles/:id/launch', (req, res) => {
  const { id } = req.params;
  cleanRunningProfiles();

  if (runningProfiles.has(id)) {
    return res.json({ success: true, message: 'Profile đã đang chạy!', alreadyRunning: true });
  }

  const profiles = readProfiles();
  const profile = profiles.find(p => p.id === id);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy profile' });
  }

  const config = readConfig();
  const browserPath = config.browserPath || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  if (!fs.existsSync(browserPath)) {
    return res.status(500).json({ success: false, error: `Không tìm thấy trình duyệt tại: ${browserPath}` });
  }

  const profileDir = path.join(PROFILES_DIR, profile.id);
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  const args = [
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-blink-features=AutomationControlled',
    '--start-maximized'
  ];

  if (profile.proxy && profile.proxy.trim()) {
    args.push(`--proxy-server=${profile.proxy.trim()}`);
  }

  const urlsToOpen = Array.isArray(profile.urls) && profile.urls.length > 0 ? profile.urls : config.defaultUrls;
  args.push(...urlsToOpen);

  try {
    const child = spawn(browserPath, args, {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    runningProfiles.set(id, {
      pid: child.pid,
      process: child,
      launchedAt: new Date()
    });

    // Update lastOpenedAt
    profile.lastOpenedAt = new Date().toISOString();
    saveProfiles(profiles);

    child.on('exit', () => {
      runningProfiles.delete(id);
    });

    res.json({ success: true, message: 'Đã mở profile', pid: child.pid });
  } catch (err) {
    console.error('Launch error:', err);
    res.status(500).json({ success: false, error: 'Không thể khởi động trình duyệt: ' + err.message });
  }
});

// 6. Close profile
app.post('/api/profiles/:id/close', (req, res) => {
  const { id } = req.params;
  cleanRunningProfiles();

  if (!runningProfiles.has(id)) {
    return res.json({ success: true, message: 'Profile không chạy' });
  }

  const info = runningProfiles.get(id);
  try {
    spawn('taskkill', ['/PID', info.pid.toString(), '/T', '/F']);
  } catch (e) {}
  runningProfiles.delete(id);

  res.json({ success: true, message: 'Đã đóng profile' });
});

// 7. Open Profile Folder in Explorer
app.post('/api/profiles/:id/open-folder', (req, res) => {
  const { id } = req.params;
  const profileDir = path.join(PROFILES_DIR, id);
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  spawn('explorer.exe', [profileDir], { detached: true, stdio: 'ignore' }).unref();
  res.json({ success: true, message: 'Đã mở thư mục profile' });
});

// 8. Config API
app.get('/api/config', (req, res) => {
  res.json({ success: true, data: readConfig() });
});

app.put('/api/config', (req, res) => {
  const newConfig = { ...readConfig(), ...req.body };
  saveConfig(newConfig);
  res.json({ success: true, data: newConfig });
});

// 9. Dashboard Stats
app.get('/api/stats', (req, res) => {
  cleanRunningProfiles();
  const profiles = readProfiles();
  const groups = new Set(profiles.map(p => p.group).filter(Boolean));
  const withNotes = profiles.filter(p => p.note && p.note.trim().length > 0).length;

  res.json({
    success: true,
    data: {
      totalProfiles: profiles.length,
      runningProfiles: runningProfiles.size,
      totalGroups: groups.size,
      profilesWithNotes: withNotes
    }
  });
});

app.listen(PORT, () => {
  console.log(`WP Profile Manager is running at http://localhost:${PORT}`);
});
