// WP Profile Manager - High End Client Logic
let allProfiles = [];
let currentGroup = 'ALL';
let currentStatusFilter = 'ALL';
let currentSearch = '';
let globalConfig = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  fetchProfiles();
  // Auto refresh every 4 seconds to sync running state
  setInterval(fetchProfilesSilently, 4000);

  // Keyboard shortcut Ctrl+K to focus search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const input = document.getElementById('searchInput');
      if (input) input.focus();
    }
  });
});

// Toast notification
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  toastMsg.textContent = msg;
  if (isError) {
    toastIcon.className = 'fa-solid fa-circle-exclamation text-rose-400 text-base';
  } else {
    toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-base';
  }

  toast.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
  }, 3500);
}

// Fetch Global Config
async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.success) {
      globalConfig = data.data;
      updateGroupDatalist();
    }
  } catch (err) {
    console.error('Error loading config:', err);
  }
}

// Fetch Profiles from server
async function fetchProfiles() {
  try {
    const res = await fetch('/api/profiles');
    const json = await res.json();
    if (json.success) {
      allProfiles = json.data;
      renderAll();
    }
  } catch (err) {
    console.error('Error fetching profiles:', err);
    showToast('Lỗi nạp dữ liệu profile', true);
  }
}

// Silent fetch for background status polling
async function fetchProfilesSilently() {
  try {
    const res = await fetch('/api/profiles');
    const json = await res.json();
    if (json.success) {
      allProfiles = json.data;
      renderAll(true);
    }
  } catch (e) {}
}

// Main render coordinator
function renderAll(isSilent = false) {
  renderSidebar();
  renderStats();
  renderTable();
}

// Render Stats Cards & Active Pills
function renderStats() {
  const total = allProfiles.length;
  const running = allProfiles.filter(p => p.isRunning).length;
  const ready = total - running;
  const groups = new Set(allProfiles.map(p => p.group).filter(Boolean)).size;

  document.getElementById('statTotalProfiles').textContent = total;
  document.getElementById('statRunningProfiles').textContent = running;
  document.getElementById('statTotalGroups').textContent = groups;
  
  document.getElementById('sidebarTotalBadge').textContent = total;
  document.getElementById('allCountBadge').textContent = total;
  document.getElementById('runningCountBadge').textContent = running;
  document.getElementById('readyCountBadge').textContent = ready;

  const activePill = document.getElementById('activeCountText');
  if (running > 0) {
    activePill.textContent = `${running} profile đang mở phiên Chrome`;
  } else {
    activePill.textContent = `Hệ thống sẵn sàng (${total} profile)`;
  }
}

// Render Sidebar Groups & Filter Select
function renderSidebar() {
  const groupCounts = {};
  allProfiles.forEach(p => {
    const g = p.group || 'Chung';
    groupCounts[g] = (groupCounts[g] || 0) + 1;
  });

  const container = document.getElementById('groupListContainer');
  const select = document.getElementById('groupFilterSelect');

  const groupKeys = Object.keys(groupCounts).sort();

  // Sidebar list
  container.innerHTML = groupKeys.map(groupName => {
    const isActive = currentGroup === groupName;
    return `
      <li>
        <button onclick="selectGroup('${escapeHtml(groupName)}')" class="nav-item-btn ${isActive ? 'active' : ''} w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-slate-300 hover:text-white">
          <span class="flex items-center gap-2.5 truncate">
            <i class="fa-regular fa-folder text-blue-400"></i>
            <span class="truncate">${escapeHtml(groupName)}</span>
          </span>
          <span class="text-[11px] bg-slate-800 px-2 py-0.5 rounded-md font-mono text-slate-400">${groupCounts[groupName]}</span>
        </button>
      </li>
    `;
  }).join('');

  // Dropdown list
  select.innerHTML = '<option value="ALL">📁 Tất cả các nhóm</option>' + groupKeys.map(g => {
    return `<option value="${escapeHtml(g)}" ${currentGroup === g ? 'selected' : ''}>📁 Nhóm: ${escapeHtml(g)} (${groupCounts[g]})</option>`;
  }).join('');
}

function selectGroup(group) {
  currentGroup = group;
  currentStatusFilter = 'ALL';
  updateFilterButtons();
  document.getElementById('breadcrumbGroup').textContent = group === 'ALL' ? 'Tất cả tài khoản' : group;
  document.getElementById('currentViewTitle').textContent = group === 'ALL' ? 'Tất cả tài khoản WordPress' : `Nhóm: ${group}`;
  renderSidebar();
  renderTable();
}

function selectStatusFilter(status) {
  currentStatusFilter = status;
  currentGroup = 'ALL';
  updateFilterButtons();
  
  if (status === 'RUNNING') {
    document.getElementById('breadcrumbGroup').textContent = 'Đang hoạt động';
    document.getElementById('currentViewTitle').textContent = 'Các profile đang mở phiên Chrome';
  } else if (status === 'READY') {
    document.getElementById('breadcrumbGroup').textContent = 'Sẵn sàng mở';
    document.getElementById('currentViewTitle').textContent = 'Các profile sẵn sàng khởi chạy';
  } else {
    document.getElementById('breadcrumbGroup').textContent = 'Tất cả tài khoản';
    document.getElementById('currentViewTitle').textContent = 'Tất cả tài khoản WordPress';
  }

  renderSidebar();
  renderTable();
}

function updateFilterButtons() {
  document.getElementById('filterAllBtn').className = `nav-item-btn ${currentStatusFilter === 'ALL' && currentGroup === 'ALL' ? 'active' : ''} w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300`;
  document.getElementById('filterRunningBtn').className = `nav-item-btn ${currentStatusFilter === 'RUNNING' ? 'active' : ''} w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300`;
  document.getElementById('filterReadyBtn').className = `nav-item-btn ${currentStatusFilter === 'READY' ? 'active' : ''} w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300`;
}

function handleGroupFilterChange() {
  const val = document.getElementById('groupFilterSelect').value;
  selectGroup(val);
}

function handleSearch() {
  currentSearch = document.getElementById('searchInput').value.trim().toLowerCase();
  renderTable();
}

// Render Table
function renderTable() {
  const tbody = document.getElementById('profileTableBody');
  const emptyState = document.getElementById('emptyState');

  let filtered = allProfiles.filter(p => {
    // Group filter
    const matchGroup = currentGroup === 'ALL' || (p.group || 'Chung') === currentGroup;
    
    // Status filter
    let matchStatus = true;
    if (currentStatusFilter === 'RUNNING') matchStatus = p.isRunning === true;
    if (currentStatusFilter === 'READY') matchStatus = p.isRunning !== true;

    // Search filter
    const matchSearch = !currentSearch || 
      (p.name && p.name.toLowerCase().includes(currentSearch)) ||
      (p.note && p.note.toLowerCase().includes(currentSearch)) ||
      (p.id && p.id.toLowerCase().includes(currentSearch)) ||
      (Array.isArray(p.urls) && p.urls.some(u => u.toLowerCase().includes(currentSearch)));

    return matchGroup && matchStatus && matchSearch;
  });

  document.getElementById('filteredCountText').textContent = `Đang hiển thị ${filtered.length} / ${allProfiles.length} profile`;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  tbody.innerHTML = filtered.map((profile, idx) => {
    const isRunning = profile.isRunning;
    const urls = Array.isArray(profile.urls) ? profile.urls : [];

    // Distinct styles for 3 URLs
    const colorThemes = [
      { border: 'border-blue-200', bg: 'bg-blue-50/80', text: 'text-blue-700', badge: 'bg-blue-600', num: '1' },
      { border: 'border-indigo-200', bg: 'bg-indigo-50/80', text: 'text-indigo-700', badge: 'bg-indigo-600', num: '2' },
      { border: 'border-purple-200', bg: 'bg-purple-50/80', text: 'text-purple-700', badge: 'bg-purple-600', num: '3' }
    ];

    const urlCards = urls.map((u, i) => {
      const theme = colorThemes[i % 3];
      let domain = 'Website ' + (i + 1);
      let pathPart = '';
      try {
        const parsed = new URL(u);
        domain = parsed.hostname.replace('www.', '');
        pathPart = parsed.pathname;
        if (pathPart === '/' || !pathPart) pathPart = '/wp-admin';
      } catch (e) {
        domain = u.substring(0, 18);
      }

      return `
        <a href="${escapeHtml(u)}" target="_blank" title="${escapeHtml(u)}&#10;(Click để mở tab kiểm tra)" class="site-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${theme.bg} ${theme.border} border text-[11px] font-medium ${theme.text} hover:shadow-xs transition-all whitespace-nowrap">
          <span class="w-3.5 h-3.5 rounded-full ${theme.badge} text-white flex items-center justify-center text-[9px] font-bold font-mono flex-shrink-0">${theme.num}</span>
          <span class="font-bold whitespace-nowrap">${escapeHtml(domain)}</span>
          <span class="text-[10px] opacity-75 font-mono whitespace-nowrap">${escapeHtml(pathPart)}</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[8px] opacity-50 ml-0.5 flex-shrink-0"></i>
        </a>
      `;
    }).join('');

    return `
      <tr class="profile-row border-b border-slate-100/90 transition-colors group">
        <!-- STT -->
        <td class="py-3.5 px-4 text-center font-mono text-[11px] font-bold text-slate-400 whitespace-nowrap">
          ${idx + 1}
        </td>

        <!-- Tên Profile & ID -->
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
              <i class="fa-brands fa-wordpress"></i>
            </div>
            <div class="truncate">
              <div class="flex items-center gap-1.5">
                <span id="name-span-${profile.id}" ondblclick="startInlineRename('${profile.id}')" title="Nhấp đúp để đổi tên nhanh" class="font-bold text-slate-900 text-xs hover:text-blue-600 cursor-pointer transition-colors">
                  ${escapeHtml(profile.name)}
                </span>
                <button onclick="startInlineRename('${profile.id}')" title="Đổi tên profile" class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 text-[10px] transition-opacity">
                  <i class="fa-solid fa-pencil"></i>
                </button>
              </div>
              <div class="flex items-center gap-1 mt-0.5">
                <span class="text-[10px] text-slate-400 font-mono">ID: ${profile.id}</span>
                <button onclick="copyToClipboard('${profile.id}', 'Đã sao chép ID profile')" title="Sao chép ID" class="text-[10px] text-slate-400 hover:text-slate-600">
                  <i class="fa-regular fa-copy"></i>
                </button>
              </div>
            </div>
          </div>
        </td>

        <!-- Nhóm (Không bao giờ nhảy dòng) -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          <span class="whitespace-nowrap inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
            <i class="fa-regular fa-folder text-[10px] text-blue-500 flex-shrink-0"></i>
            <span class="whitespace-nowrap">${escapeHtml(profile.group || 'Chung')}</span>
          </span>
        </td>

        <!-- 3 Đường Dẫn Admin Tự Điền (Cột xếp dọc gọn gàng, rõ ràng từng trang) -->
        <td class="py-3.5 px-4">
          <div class="flex flex-col gap-1.5 min-w-[280px]">
            ${urlCards || '<span class="text-[11px] text-rose-500 font-medium">Chưa nhập 3 link admin</span>'}
          </div>
        </td>

        <!-- Ghi chú / Email (Hiển thị đầy đủ chữ, không bị cắt dấu ...) -->
        <td class="py-3.5 px-4 text-[11px] text-slate-600">
          <div class="text-[11px] font-medium text-slate-700 leading-relaxed min-w-[200px] max-w-[280px] break-words" title="${escapeHtml(profile.note || '')}">
            ${escapeHtml(profile.note || '—')}
          </div>
        </td>

        <!-- Trạng thái (Không bao giờ nhảy dòng) -->
        <td class="py-3.5 px-4 text-center whitespace-nowrap">
          ${isRunning ? `
            <span class="whitespace-nowrap inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-emerald-500 radar-pulse flex-shrink-0"></span>
              <span class="whitespace-nowrap">Đang mở</span>
            </span>
          ` : `
            <span class="whitespace-nowrap inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0"></span>
              <span class="whitespace-nowrap">Sẵn sàng</span>
            </span>
          `}
        </td>

        <!-- Thao tác -->
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${isRunning ? `
              <button onclick="closeProfile('${profile.id}')" title="Dừng phiên Chrome của profile này" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1.5">
                <i class="fa-solid fa-stop text-[9px]"></i>
                <span>Đóng</span>
              </button>
            ` : `
              <button onclick="launchProfile('${profile.id}')" title="Mở 3 website WordPress bằng Chrome độc lập" class="btn-primary-shine px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-sm shadow-blue-500/25 transition-all flex items-center gap-1.5">
                <i class="fa-solid fa-play text-[9px]"></i>
                <span>Mở Profile</span>
              </button>
            `}

            <!-- Sửa thông tin & 3 link admin -->
            <button onclick="openEditProfileModal('${profile.id}')" title="Chỉnh sửa thông tin profile & 3 URL" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 text-xs transition-all">
              <i class="fa-solid fa-gear"></i>
            </button>

            <!-- Mở thư mục cookies -->
            <button onclick="openProfileFolder('${profile.id}')" title="Mở thư mục lưu cookies & cache" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 text-xs transition-all">
              <i class="fa-solid fa-folder-open"></i>
            </button>

            <!-- Xóa -->
            <button onclick="confirmDeleteProfile('${profile.id}', '${escapeHtml(profile.name)}')" title="Xóa profile này" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-all">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Inline Rename Feature
function startInlineRename(id) {
  const span = document.getElementById(`name-span-${id}`);
  if (!span) return;
  const currentName = span.textContent.trim();

  span.innerHTML = `
    <input 
      type="text" 
      id="input-inline-${id}" 
      value="${escapeHtml(currentName)}" 
      class="inline-edit-input"
      onkeydown="if(event.key === 'Enter') saveInlineRename('${id}'); if(event.key === 'Escape') cancelInlineRename('${id}', '${escapeHtml(currentName)}');"
      onblur="saveInlineRename('${id}')"
    >
  `;

  const input = document.getElementById(`input-inline-${id}`);
  input.focus();
  input.select();
}

async function saveInlineRename(id) {
  const input = document.getElementById(`input-inline-${id}`);
  if (!input) return;
  const newName = input.value.trim();
  if (!newName) {
    fetchProfiles();
    return;
  }

  try {
    const res = await fetch(`/api/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Đã đổi tên thành: ${newName}`);
      fetchProfiles();
    } else {
      showToast(json.error || 'Lỗi khi cập nhật tên', true);
      fetchProfiles();
    }
  } catch (e) {
    showToast('Lỗi kết nối máy chủ', true);
    fetchProfiles();
  }
}

function cancelInlineRename(id, oldName) {
  const span = document.getElementById(`name-span-${id}`);
  if (span) span.textContent = oldName;
}

// Launch Profile
async function launchProfile(id) {
  showToast('Đang khởi chạy Chrome độc lập với 3 link admin...');
  try {
    const res = await fetch(`/api/profiles/${id}/launch`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('Đã mở 3 tab WordPress trong Chrome!');
      fetchProfiles();
    } else {
      showToast(json.error || 'Không thể mở profile', true);
    }
  } catch (e) {
    showToast('Lỗi kết nối: ' + e.message, true);
  }
}

// Close Profile
async function closeProfile(id) {
  try {
    const res = await fetch(`/api/profiles/${id}/close`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('Đã đóng phiên làm việc của profile');
      fetchProfiles();
    }
  } catch (e) {
    showToast('Lỗi đóng profile', true);
  }
}

// Batch Actions: Launch All & Close All
async function launchAllProfiles() {
  const readyProfiles = allProfiles.filter(p => !p.isRunning);
  if (readyProfiles.length === 0) {
    showToast('Tất cả profile đã đang chạy');
    return;
  }
  showToast(`Đang mở đồng thời ${readyProfiles.length} profile...`);
  for (const p of readyProfiles) {
    await fetch(`/api/profiles/${p.id}/launch`, { method: 'POST' });
  }
  fetchProfiles();
}

async function closeAllProfiles() {
  const runningProfiles = allProfiles.filter(p => p.isRunning);
  if (runningProfiles.length === 0) {
    showToast('Không có profile nào đang chạy');
    return;
  }
  for (const p of runningProfiles) {
    await fetch(`/api/profiles/${p.id}/close`, { method: 'POST' });
  }
  showToast(`Đã đóng ${runningProfiles.length} profile`);
  fetchProfiles();
}

// Open Folder in Explorer
async function openProfileFolder(id) {
  try {
    const res = await fetch(`/api/profiles/${id}/open-folder`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('Đã mở thư mục lưu trữ cookies');
    }
  } catch (e) {
    showToast('Lỗi mở thư mục', true);
  }
}

// Delete Profile
function confirmDeleteProfile(id, name) {
  if (confirm(`Bạn có chắc chắn muốn xóa profile "${name}" không?`)) {
    const deleteFolder = confirm('Bạn có muốn xóa luôn thư mục dữ liệu cookies của profile này trên ổ cứng không?');
    deleteProfile(id, deleteFolder);
  }
}

async function deleteProfile(id, deleteData = false) {
  try {
    const res = await fetch(`/api/profiles/${id}?deleteData=${deleteData}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      showToast('Đã xóa profile');
      fetchProfiles();
    } else {
      showToast(json.error || 'Lỗi khi xóa', true);
    }
  } catch (e) {
    showToast('Lỗi xóa profile: ' + e.message, true);
  }
}

// Full Add / Edit Modal Controls
function openAddProfileModal() {
  document.getElementById('modalTitle').textContent = 'Thêm Profile Mới';
  document.getElementById('formProfileId').value = '';
  document.getElementById('formProfileName').value = '';
  document.getElementById('formProfileGroup').value = globalConfig ? globalConfig.defaultGroup : 'Khải Hoàn Web';
  document.getElementById('formProfileNote').value = '';

  if (globalConfig && Array.isArray(globalConfig.defaultUrls)) {
    document.getElementById('formUrl1').value = globalConfig.defaultUrls[0] || '';
    document.getElementById('formUrl2').value = globalConfig.defaultUrls[1] || '';
    document.getElementById('formUrl3').value = globalConfig.defaultUrls[2] || '';
  } else {
    clearFormUrls();
  }

  document.getElementById('profileModal').classList.remove('hidden');
}

function openEditProfileModal(id) {
  const profile = allProfiles.find(p => p.id === id);
  if (!profile) return;

  document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Profile & 3 Link Admin';
  document.getElementById('formProfileId').value = profile.id;
  document.getElementById('formProfileName').value = profile.name || '';
  document.getElementById('formProfileGroup').value = profile.group || '';
  document.getElementById('formProfileNote').value = profile.note || '';

  const urls = profile.urls || [];
  document.getElementById('formUrl1').value = urls[0] || '';
  document.getElementById('formUrl2').value = urls[1] || '';
  document.getElementById('formUrl3').value = urls[2] || '';

  document.getElementById('profileModal').classList.remove('hidden');
}

function closeProfileModal() {
  document.getElementById('profileModal').classList.add('hidden');
}

function clearFormUrls() {
  document.getElementById('formUrl1').value = '';
  document.getElementById('formUrl2').value = '';
  document.getElementById('formUrl3').value = '';
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const id = document.getElementById('formProfileId').value;
  const name = document.getElementById('formProfileName').value.trim();
  const group = document.getElementById('formProfileGroup').value.trim();
  const note = document.getElementById('formProfileNote').value.trim();

  const url1 = document.getElementById('formUrl1').value.trim();
  const url2 = document.getElementById('formUrl2').value.trim();
  const url3 = document.getElementById('formUrl3').value.trim();

  if (!url1 || !url2 || !url3) {
    if (!confirm('Bạn chưa điền đủ cả 3 link admin. Bạn có muốn tiếp tục lưu không?')) {
      return;
    }
  }

  const urls = [url1, url2, url3].filter(Boolean);
  const payload = { name, group, note, urls };

  try {
    let res;
    if (id) {
      res = await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const json = await res.json();
    if (json.success) {
      showToast(id ? 'Đã lưu cập nhật profile & 3 link admin!' : 'Đã tạo profile & lưu 3 link admin thành công!');
      closeProfileModal();
      fetchProfiles();
    } else {
      showToast(json.error || 'Lỗi lưu profile', true);
    }
  } catch (err) {
    showToast('Lỗi: ' + err.message, true);
  }
}

// Quick 3 URLs Modal
function openQuickUrlModal(id) {
  const profile = allProfiles.find(p => p.id === id);
  if (!profile) return;

  document.getElementById('quickUrlProfileId').value = profile.id;
  document.getElementById('quickUrlProfileName').textContent = `Profile: ${profile.name}`;

  const urls = profile.urls || [];
  document.getElementById('quickUrl1').value = urls[0] || '';
  document.getElementById('quickUrl2').value = urls[1] || '';
  document.getElementById('quickUrl3').value = urls[2] || '';

  document.getElementById('quickUrlModal').classList.remove('hidden');
}

function closeQuickUrlModal() {
  document.getElementById('quickUrlModal').classList.add('hidden');
}

async function handleSaveQuickUrls(e) {
  e.preventDefault();
  const id = document.getElementById('quickUrlProfileId').value;
  const urls = [
    document.getElementById('quickUrl1').value.trim(),
    document.getElementById('quickUrl2').value.trim(),
    document.getElementById('quickUrl3').value.trim()
  ].filter(Boolean);

  try {
    const res = await fetch(`/api/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls })
    });
    const json = await res.json();
    if (json.success) {
      showToast('Đã lưu 3 link admin thành công!');
      closeQuickUrlModal();
      fetchProfiles();
    }
  } catch (e) {
    showToast('Lỗi lưu link: ' + e.message, true);
  }
}

// Config Modal Controls
function openConfigModal() {
  if (!globalConfig) return;
  document.getElementById('cfgBrowserPath').value = globalConfig.browserPath || '';
  const defUrls = globalConfig.defaultUrls || [];
  document.getElementById('cfgUrl1').value = defUrls[0] || '';
  document.getElementById('cfgUrl2').value = defUrls[1] || '';
  document.getElementById('cfgUrl3').value = defUrls[2] || '';
  document.getElementById('configModal').classList.remove('hidden');
}

function closeConfigModal() {
  document.getElementById('configModal').classList.add('hidden');
}

async function handleSaveConfig(e) {
  e.preventDefault();
  const browserPath = document.getElementById('cfgBrowserPath').value.trim();
  const defaultUrls = [
    document.getElementById('cfgUrl1').value.trim(),
    document.getElementById('cfgUrl2').value.trim(),
    document.getElementById('cfgUrl3').value.trim()
  ].filter(Boolean);

  try {
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ browserPath, defaultUrls })
    });
    const json = await res.json();
    if (json.success) {
      globalConfig = json.data;
      showToast('Đã lưu cài đặt hệ thống thành công');
      closeConfigModal();
    }
  } catch (err) {
    showToast('Lỗi lưu cài đặt', true);
  }
}

function updateGroupDatalist() {
  const dl = document.getElementById('groupDataList');
  if (!dl || !globalConfig) return;
  const groups = globalConfig.groups || ['Khải Hoàn Web', 'Đối tác', 'Thử nghiệm'];
  dl.innerHTML = groups.map(g => `<option value="${escapeHtml(g)}"></option>`).join('');
}

function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg || 'Đã sao chép vào bộ nhớ tạm');
  }).catch(() => {
    showToast('Không thể sao chép', true);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
