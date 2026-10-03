/**
 * CampusConnect - Administrator Dashboard Controller
 */

let allDepartments = [];
let allFaculty = [];
let allUsers = [];
let deptAttendanceChartInstance = null;
let studentDistChartInstance = null;

function switchAdminTab(tabId) {
  // Update sidebar active link
  document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar-link[onclick="switchAdminTab('${tabId}')"]`);
  if (activeLink) activeLink.classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  const targetContent = document.getElementById(`admin-tab-${tabId}`);
  if (targetContent) targetContent.classList.add('active');

  // Update headline title
  const titles = {
    'dashboard': 'Administrator Command Center',
    'students': 'Student Enrolment & Directory Management',
    'faculty': 'Faculty Staff & Department Allocations',
    'departments': 'Academic Departments & Faculties',
    'notices': 'Campus-Wide Announcements & Broadcasts',
    'users': 'User Accounts, Roles & Access Security',
    'analytics': 'Institutional Academic Analytics'
  };
  const titleEl = document.getElementById('admin-page-title');
  if (titleEl && titles[tabId]) titleEl.textContent = titles[tabId];

  // Mobile sidebar close
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && window.innerWidth <= 992) sidebar.classList.remove('open');

  // Trigger tab data loads
  if (tabId === 'dashboard') loadAdminDashboardOverview();
  else if (tabId === 'students') loadAdminStudents();
  else if (tabId === 'faculty') loadAdminFaculty();
  else if (tabId === 'departments') loadAdminDepartments();
  else if (tabId === 'notices') loadAdminNotices();
  else if (tabId === 'users') loadAdminUsers();
  else if (tabId === 'analytics') loadAdminAnalytics();
}

// Initial Boot
document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth(['ROLE_ADMIN'])) return;

  // Setup mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('open');
    });
  }

  // Set user profile snippet in sidebar
  const user = Auth.getUser();
  if (user) {
    const nameEl = document.getElementById('sidebar-user-name');
    if (nameEl) nameEl.textContent = user.fullName || user.username;
    const greetingEl = document.getElementById('admin-greeting');
    if (greetingEl) greetingEl.textContent = `Welcome, ${user.fullName || 'Administrator'}`;
  }

  await loadDepartmentsReference();
  loadAdminDashboardOverview();
});

// Load reference departments for all selects
async function loadDepartmentsReference() {
  try {
    const res = await Api.get('/departments');
    allDepartments = res.data || [];

    const selects = ['admin-student-dept', 'afac-dept', 'anotice-dept'];
    selects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (!select) return;

      const firstOpt = select.options[0];
      select.innerHTML = '';
      select.appendChild(firstOpt);

      allDepartments.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.name} (${d.code})`;
        select.appendChild(opt);
      });
    });
  } catch (err) {
    console.error('Failed to load departments', err);
  }
}

// ==================== 1. TAB: DASHBOARD OVERVIEW ====================
async function loadAdminDashboardOverview() {
  try {
    const res = await Api.get('/dashboard/admin');
    const stats = res.data;

    document.getElementById('acard-students').textContent = stats.totalStudents ?? 0;
    document.getElementById('acard-faculty').textContent = stats.totalFaculty ?? 0;
    document.getElementById('acard-depts').textContent = stats.totalDepartments ?? 0;
    document.getElementById('acard-users').textContent = stats.totalActiveUsers ?? 0;
    document.getElementById('acard-attendance').textContent = `${stats.averageAttendance ?? 0}%`;
    document.getElementById('acard-performance').textContent = `${stats.averageStudentPerformance ?? 0}/100`;

    document.getElementById('acard-pending-leaves').textContent = `${stats.pendingLeaveRequests ?? 0} Pending`;
    document.getElementById('acard-pending-achievements').textContent = `${stats.pendingAchievements ?? 0} Pending`;

    renderDeptAttendanceChart(stats.departmentAttendance || {});
    renderStudentDistChart(stats.studentDistribution || {});

  } catch (err) {
    showToast('Failed to load dashboard metrics', 'error');
  }
}

function renderDeptAttendanceChart(deptAttMap) {
  const ctx = document.getElementById('adminDeptAttendanceChart');
  if (!ctx) return;

  if (deptAttendanceChartInstance) {
    deptAttendanceChartInstance.destroy();
  }

  const labels = Object.keys(deptAttMap);
  const data = Object.values(deptAttMap);
  const backgroundColors = data.map(v => v >= 75 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)');
  const borderColors = data.map(v => v >= 75 ? '#059669' : '#dc2626');

  deptAttendanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['No Data'],
      datasets: [{
        label: 'Average Attendance %',
        data: data.length ? data : [0],
        backgroundColor: backgroundColors.length ? backgroundColors : ['#3b82f6'],
        borderColor: borderColors.length ? borderColors : ['#2563eb'],
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: v => v + '%' },
          grid: { color: '#f1f5f9' }
        },
        x: {
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderStudentDistChart(studentDistMap) {
  const ctx = document.getElementById('adminStudentDistChart');
  if (!ctx) return;

  if (studentDistChartInstance) {
    studentDistChartInstance.destroy();
  }

  const labels = Object.keys(studentDistMap);
  const data = Object.values(studentDistMap);

  const colors = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
    '#ec4899', '#06b6d4', '#64748b', '#14b8a6'
  ];

  studentDistChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['None'],
      datasets: [{
        data: data.length ? data : [0],
        backgroundColor: colors.slice(0, Math.max(labels.length, 1)),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, font: { size: 12 } }
        }
      },
      cutout: '65%'
    }
  });
}

// ==================== 2. TAB: MANAGE STUDENTS ====================
async function loadAdminStudents() {
  const search = document.getElementById('admin-student-search')?.value.trim() || '';
  const deptId = document.getElementById('admin-student-dept')?.value || '';
  const year = document.getElementById('admin-student-year')?.value || '';

  const tbody = document.getElementById('admin-students-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Searching enrolled students...</td></tr>';

  try {
    let query = `/students?`;
    if (search) query += `search=${encodeURIComponent(search)}&`;
    if (deptId) query += `deptId=${deptId}&`;
    if (year) query += `year=${year}&`;

    const res = await Api.get(query);
    const students = res.data || [];

    const subText = document.getElementById('admin-student-count-sub');
    if (subText) subText.textContent = `Showing ${students.length} student${students.length === 1 ? '' : 's'}`;

    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No students matching your filter criteria.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    students.forEach(s => {
      const attRate = s.attendancePercentage != null ? s.attendancePercentage : 0;
      const isLow = attRate < 75;
      const attBadge = isLow
        ? `<span class="badge badge-danger">⚠️ ${attRate}%</span>`
        : `<span class="badge badge-success">✓ ${attRate}%</span>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600; color:var(--primary);">${s.studentId}</td>
        <td>
          <div style="font-weight:600;">${s.fullName}</div>
          <div style="font-size:12px; color:var(--text-muted);">${s.gender || 'Not specified'}</div>
        </td>
        <td>
          <div>${s.email}</div>
          <div style="font-size:12px; color:var(--text-muted);">${s.phoneNumber || '--'}</div>
        </td>
        <td><span class="badge badge-primary">${s.departmentName || 'General'}</span></td>
        <td>${s.course || 'B.Tech'} - Year ${s.year} (Sem ${s.semester})</td>
        <td>${attBadge}</td>
        <td style="text-align:center;">
          <div style="display:inline-flex; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="viewStudentFullProfile(${s.id})" title="View Complete Dossier">
              👁️ Profile
            </button>
            <button class="btn btn-danger btn-sm" onclick="handleDeleteStudent(${s.id}, '${s.fullName}')" title="Remove Student">
              🗑️
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--danger);">Error loading students list.</td></tr>';
  }
}

function resetAdminStudentFilter() {
  document.getElementById('admin-student-search').value = '';
  document.getElementById('admin-student-dept').value = '';
  document.getElementById('admin-student-year').value = '';
  loadAdminStudents();
}

async function viewStudentFullProfile(studentId) {
  openModal('admin-student-profile-modal');
  const body = document.getElementById('astudent-modal-body');
  body.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Fetching student dossier & performance analytics...</div>';

  try {
    const [studRes, perfRes, attRes] = await Promise.all([
      Api.get(`/students/${studentId}`),
      Api.get(`/performance/student/${studentId}`),
      Api.get(`/attendance/student/${studentId}/overview`)
    ]);

    const s = studRes.data;
    const perf = perfRes.data;
    const att = attRes.data;

    document.getElementById('astudent-modal-title').textContent = `${s.fullName} (${s.studentId})`;

    body.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
        <div style="background:#f8fafc; padding:14px; border-radius:var(--radius-md);">
          <div style="font-size:12px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Student Information</div>
          <div style="margin-top:6px; font-weight:600; font-size:15px;">${s.fullName}</div>
          <div style="font-size:13px; color:var(--text-muted);">${s.email} | ${s.phoneNumber || 'No phone'}</div>
          <div style="font-size:13px; margin-top:4px;"><b>Dept:</b> ${s.departmentName} (${s.departmentCode})</div>
          <div style="font-size:13px;"><b>Class:</b> ${s.course} - Year ${s.year}, Semester ${s.semester}</div>
        </div>

        <div style="background:#f8fafc; padding:14px; border-radius:var(--radius-md);">
          <div style="font-size:12px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Attendance Standing</div>
          <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
            <span style="font-size:24px; font-weight:700; color:${att.belowThreshold ? 'var(--danger)' : 'var(--success)'};">${att.overallPercentage}%</span>
            <span class="badge ${att.belowThreshold ? 'badge-danger' : 'badge-success'}">${att.belowThreshold ? '🚨 Warning (<75%)' : '✓ Good Standing'}</span>
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${att.presentSessions} attended out of ${att.totalSessions} total scheduled sessions</div>
          <div style="font-size:12px; color:${att.belowThreshold ? 'var(--danger)' : 'var(--text-muted)'}; margin-top:4px;">${att.alertMessage}</div>
        </div>
      </div>

      <!-- Performance Intelligence Card -->
      <div style="background:#f1f5f9; padding:16px; border-radius:var(--radius-md); margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <div style="font-weight:700; font-size:15px;">Smart Performance Index</div>
            <div style="font-size:12px; color:var(--text-muted);">Weighted: Attendance 25%, Academic Marks 50%, Coursework 25%</div>
          </div>
          <span class="badge badge-primary" style="font-size:14px;">${perf.performanceStatus} (${perf.overallPerformanceScore}/100)</span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:12px; text-align:center;">
          <div style="background:#fff; padding:10px; border-radius:var(--radius-sm);">
            <div style="font-size:11px; color:var(--text-muted);">Current GPA</div>
            <div style="font-weight:700; font-size:16px;">${perf.gpa} / 10.0</div>
          </div>
          <div style="background:#fff; padding:10px; border-radius:var(--radius-sm);">
            <div style="font-size:11px; color:var(--text-muted);">Average Marks</div>
            <div style="font-weight:700; font-size:16px;">${perf.averageMarksPercentage}%</div>
          </div>
          <div style="background:#fff; padding:10px; border-radius:var(--radius-sm);">
            <div style="font-size:11px; color:var(--text-muted);">Assignment Completion</div>
            <div style="font-weight:700; font-size:16px;">${perf.assignmentCompletionPercentage}%</div>
          </div>
        </div>

        ${perf.strengths && perf.strengths.length ? `
          <div style="margin-bottom:8px;">
            <div style="font-size:12px; font-weight:600; color:var(--success);">✅ Observed Academic Strengths:</div>
            <ul style="margin:4px 0 0 18px; font-size:12px; color:var(--text-main);">
              ${perf.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${perf.improvementAreas && perf.improvementAreas.length ? `
          <div style="margin-bottom:8px;">
            <div style="font-size:12px; font-weight:600; color:var(--warning);">⚠️ Areas for Improvement:</div>
            <ul style="margin:4px 0 0 18px; font-size:12px; color:var(--text-main);">
              ${perf.improvementAreas.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${perf.actionableRecommendations && perf.actionableRecommendations.length ? `
          <div>
            <div style="font-size:12px; font-weight:600; color:var(--primary);">💡 Rule-Based Recommendations:</div>
            <ul style="margin:4px 0 0 18px; font-size:12px; color:var(--text-main);">
              ${perf.actionableRecommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;

  } catch (err) {
    body.innerHTML = '<div style="color:var(--danger); text-align:center; padding:20px;">Failed to load student details.</div>';
  }
}

async function handleDeleteStudent(studentId, name) {
  if (!confirm(`Are you sure you want to remove student "${name}"? This action permanently removes their academic and attendance records.`)) {
    return;
  }
  try {
    await Api.delete(`/students/${studentId}`);
    showToast(`Student ${name} removed successfully`, 'success');
    loadAdminStudents();
    loadAdminDashboardOverview();
  } catch (err) {
    showToast(err.message || 'Failed to delete student', 'error');
  }
}

// ==================== 3. TAB: MANAGE FACULTY ====================
async function loadAdminFaculty() {
  const tbody = document.getElementById('admin-faculty-tbody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">Loading faculty directory...</td></tr>';

  try {
    const res = await Api.get('/faculty');
    allFaculty = res.data || [];

    if (allFaculty.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">No faculty members registered.</td></tr>';
      return;
    }

    renderFacultyRows(allFaculty);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--danger);">Error loading faculty members.</td></tr>';
  }
}

function renderFacultyRows(list) {
  const tbody = document.getElementById('admin-faculty-tbody');
  tbody.innerHTML = '';

  list.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--primary);">${f.facultyId}</td>
      <td style="font-weight:600;">${f.fullName}</td>
      <td>
        <div>${f.email}</div>
        <div style="font-size:12px; color:var(--text-muted);">${f.phoneNumber || '--'}</div>
      </td>
      <td><span class="badge badge-primary">${f.departmentName || 'All Depts'}</span></td>
      <td><span class="badge badge-info">${f.designation || 'Faculty'}</span></td>
      <td style="font-size:13px;">${f.qualification || '--'}</td>
      <td style="font-size:13px;">${f.specialization || '--'}</td>
      <td style="text-align:center;">
        <button class="btn btn-danger btn-sm" onclick="handleDeleteFaculty(${f.id}, '${f.fullName}')" title="Delete Faculty Member">
          🗑️ Remove
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterFacultyTable() {
  const q = document.getElementById('admin-faculty-search')?.value.toLowerCase() || '';
  if (!q) {
    renderFacultyRows(allFaculty);
    return;
  }
  const filtered = allFaculty.filter(f =>
    (f.fullName && f.fullName.toLowerCase().includes(q)) ||
    (f.facultyId && f.facultyId.toLowerCase().includes(q)) ||
    (f.specialization && f.specialization.toLowerCase().includes(q)) ||
    (f.email && f.email.toLowerCase().includes(q))
  );
  renderFacultyRows(filtered);
}

function openAddFacultyModal() {
  document.getElementById('admin-add-faculty-form').reset();
  openModal('admin-add-faculty-modal');
}

async function handleCreateFaculty(e) {
  e.preventDefault();
  const payload = {
    facultyId: document.getElementById('afac-id').value.trim(),
    fullName: document.getElementById('afac-name').value.trim(),
    email: document.getElementById('afac-email').value.trim(),
    phoneNumber: document.getElementById('afac-phone').value.trim(),
    departmentId: parseInt(document.getElementById('afac-dept').value),
    designation: document.getElementById('afac-designation').value,
    qualification: document.getElementById('afac-qualification').value.trim(),
    specialization: document.getElementById('afac-specialization').value.trim(),
    password: document.getElementById('afac-password').value
  };

  try {
    await Api.post('/faculty', payload);
    showToast('Faculty member registered successfully', 'success');
    closeModal('admin-add-faculty-modal');
    loadAdminFaculty();
    loadAdminDashboardOverview();
  } catch (err) {
    showToast(err.message || 'Failed to create faculty member', 'error');
  }
}

async function handleDeleteFaculty(facultyId, name) {
  if (!confirm(`Are you sure you want to remove faculty member "${name}"?`)) return;

  try {
    await Api.delete(`/faculty/${facultyId}`);
    showToast(`Faculty member "${name}" removed successfully`, 'success');
    loadAdminFaculty();
    loadAdminDashboardOverview();
  } catch (err) {
    showToast(err.message || 'Failed to delete faculty member', 'error');
  }
}

// ==================== 4. TAB: DEPARTMENTS ====================
async function loadAdminDepartments() {
  const tbody = document.getElementById('admin-depts-tbody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">Loading departments...</td></tr>';

  try {
    const res = await Api.get('/departments');
    allDepartments = res.data || [];

    if (allDepartments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No departments found.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    allDepartments.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600; color:var(--text-muted);">#${d.id}</td>
        <td><span class="badge badge-primary" style="font-size:13px;">${d.code}</span></td>
        <td style="font-weight:600;">${d.name}</td>
        <td style="font-size:13px; color:var(--text-muted);">${d.description || 'No description provided.'}</td>
        <td style="text-align:center;">
          <div style="display:inline-flex; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="openEditDeptModal(${d.id})">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="handleDeleteDepartment(${d.id}, '${d.name}')">🗑️</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--danger);">Error loading departments.</td></tr>';
  }
}

function openAddDeptModal() {
  document.getElementById('admin-add-dept-form').reset();
  openModal('admin-add-dept-modal');
}

async function handleCreateDepartment(e) {
  e.preventDefault();
  const payload = {
    code: document.getElementById('adept-code').value.trim().toUpperCase(),
    name: document.getElementById('adept-name').value.trim(),
    description: document.getElementById('adept-desc').value.trim()
  };

  try {
    await Api.post('/departments', payload);
    showToast('Department created successfully', 'success');
    closeModal('admin-add-dept-modal');
    await loadDepartmentsReference();
    loadAdminDepartments();
    loadAdminDashboardOverview();
  } catch (err) {
    showToast(err.message || 'Failed to create department', 'error');
  }
}

function openEditDeptModal(id) {
  const d = allDepartments.find(item => item.id === id);
  if (!d) return;

  document.getElementById('aedit-dept-id').value = d.id;
  document.getElementById('aedit-dept-code').value = d.code;
  document.getElementById('aedit-dept-name').value = d.name;
  document.getElementById('aedit-dept-desc').value = d.description || '';

  openModal('admin-edit-dept-modal');
}

async function handleUpdateDepartment(e) {
  e.preventDefault();
  const id = document.getElementById('aedit-dept-id').value;
  const payload = {
    code: document.getElementById('aedit-dept-code').value.trim().toUpperCase(),
    name: document.getElementById('aedit-dept-name').value.trim(),
    description: document.getElementById('aedit-dept-desc').value.trim()
  };

  try {
    await Api.put(`/departments/${id}`, payload);
    showToast('Department details updated', 'success');
    closeModal('admin-edit-dept-modal');
    await loadDepartmentsReference();
    loadAdminDepartments();
  } catch (err) {
    showToast(err.message || 'Failed to update department', 'error');
  }
}

async function handleDeleteDepartment(deptId, name) {
  if (!confirm(`Are you sure you want to remove department "${name}"? This could impact student courses associated with it.`)) return;

  try {
    await Api.delete(`/departments/${deptId}`);
    showToast(`Department "${name}" removed successfully`, 'success');
    await loadDepartmentsReference();
    loadAdminDepartments();
    loadAdminDashboardOverview();
  } catch (err) {
    showToast(err.message || 'Failed to delete department', 'error');
  }
}

// ==================== 5. TAB: CAMPUS NOTICES ====================
async function loadAdminNotices() {
  const container = document.getElementById('admin-notices-container');
  container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Loading active notices...</div>';

  try {
    const res = await Api.get('/notices');
    const notices = res.data || [];

    if (notices.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No notices currently published.</div>';
      return;
    }

    container.innerHTML = '';
    notices.forEach(n => {
      let badgeClass = 'badge-primary';
      if (n.priority === 'URGENT') badgeClass = 'badge-danger';
      else if (n.priority === 'HIGH') badgeClass = 'badge-warning';

      const card = document.createElement('div');
      card.className = 'card';
      card.style.borderLeft = n.priority === 'URGENT' ? '4px solid var(--danger)' : n.priority === 'HIGH' ? '4px solid var(--warning)' : '4px solid var(--primary)';
      card.innerHTML = `
        <div class="card-body" style="padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:8px;">
            <div>
              <span class="badge ${badgeClass}" style="margin-bottom:6px; display:inline-block;">${n.priority}</span>
              <h4 style="margin:0; font-size:15px; font-weight:700;">${n.title}</h4>
            </div>
            <button class="btn btn-outline btn-sm" onclick="handleDeleteNotice(${n.id})" title="Delete Notice" style="color:var(--danger); border-color:#fecaca;">
              🗑️
            </button>
          </div>
          <p style="font-size:13px; color:var(--text-main); margin-bottom:12px; line-height:1.5;">${n.content}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--text-muted);">
            <div>Target: <b>${n.targetDepartmentName || 'All Departments'}</b> ${n.targetYear ? `(Year ${n.targetYear})` : '(All Years)'}</div>
            <div>${formatDate(n.createdAt)}</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--danger);">Error loading notices.</div>';
  }
}

async function handlePublishNotice(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('anotice-title').value.trim(),
    content: document.getElementById('anotice-content').value.trim(),
    priority: document.getElementById('anotice-priority').value,
    targetDepartmentId: document.getElementById('anotice-dept').value ? parseInt(document.getElementById('anotice-dept').value) : null,
    targetYear: document.getElementById('anotice-year').value ? parseInt(document.getElementById('anotice-year').value) : null
  };

  try {
    await Api.post('/notices', payload);
    showToast('Notice published successfully to campus!', 'success');
    document.getElementById('admin-notice-form').reset();
    loadAdminNotices();
  } catch (err) {
    showToast(err.message || 'Failed to publish notice', 'error');
  }
}

async function handleDeleteNotice(noticeId) {
  if (!confirm('Are you sure you want to delete this notice?')) return;

  try {
    await Api.delete(`/notices/${noticeId}`);
    showToast('Notice removed successfully', 'success');
    loadAdminNotices();
  } catch (err) {
    showToast(err.message || 'Failed to delete notice', 'error');
  }
}

// ==================== 6. TAB: USER ACCOUNTS ====================
async function loadAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Loading user security accounts...</td></tr>';

  try {
    const res = await Api.get('/admin/users');
    allUsers = res.data || [];

    const badge = document.getElementById('admin-user-count-badge');
    if (badge) badge.textContent = `${allUsers.length} Users`;

    renderUsersTable(allUsers);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--danger);">Error loading user accounts.</td></tr>';
  }
}

function renderUsersTable(list) {
  const tbody = document.getElementById('admin-users-tbody');
  tbody.innerHTML = '';

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No user accounts found matching filter.</td></tr>';
    return;
  }

  list.forEach(u => {
    let roleClass = 'badge-primary';
    let roleLabel = 'Student';
    if (u.role === 'ROLE_FACULTY') {
      roleClass = 'badge-info';
      roleLabel = 'Faculty';
    } else if (u.role === 'ROLE_ADMIN') {
      roleClass = 'badge-danger';
      roleLabel = 'Administrator';
    }

    const statusBadge = u.active
      ? '<span class="badge badge-success">Active</span>'
      : '<span class="badge badge-danger">Disabled</span>';

    const toggleBtn = u.active
      ? `<button class="btn btn-outline btn-sm" onclick="handleToggleUserStatus(${u.id})" style="color:var(--danger); border-color:#fca5a5;">Disable</button>`
      : `<button class="btn btn-success btn-sm" onclick="handleToggleUserStatus(${u.id})">Enable</button>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--text-muted);">#${u.id}</td>
      <td style="font-weight:600;">${u.email || u.username}</td>
      <td>${u.fullName || '--'}</td>
      <td><span class="badge ${roleClass}">${roleLabel}</span></td>
      <td>${statusBadge}</td>
      <td style="font-size:12px; color:var(--text-muted);">${formatDate(u.createdAt)}</td>
      <td style="text-align:center;">${toggleBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterUsersTable() {
  const q = document.getElementById('admin-user-search')?.value.toLowerCase() || '';
  const roleFilter = document.getElementById('admin-user-role-filter')?.value || '';
  const statusFilter = document.getElementById('admin-user-status-filter')?.value || '';

  const filtered = allUsers.filter(u => {
    const matchQ = !q || (u.email && u.email.toLowerCase().includes(q)) || (u.fullName && u.fullName.toLowerCase().includes(q));
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || (statusFilter === 'active' ? u.active : !u.active);
    return matchQ && matchRole && matchStatus;
  });

  renderUsersTable(filtered);
}

async function handleToggleUserStatus(userId) {
  try {
    const res = await Api.put(`/admin/users/${userId}/toggle-status`, {});
    showToast(res.message || 'User status updated', 'success');
    loadAdminUsers();
    loadAdminDashboardOverview();
  } catch (err) {
    showToast(err.message || 'Failed to update user status', 'error');
  }
}

// ==================== 7. TAB: INSTITUTIONAL ANALYTICS ====================
async function loadAdminAnalytics() {
  const deptsTbody = document.getElementById('admin-analytics-depts-tbody');
  const atRiskTbody = document.getElementById('admin-at-risk-tbody');

  deptsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">Aggregating departmental metrics...</td></tr>';
  atRiskTbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Scanning students for attendance alerts...</td></tr>';

  try {
    const [dashRes, studRes] = await Promise.all([
      Api.get('/dashboard/admin'),
      Api.get('/students')
    ]);

    const stats = dashRes.data;
    const students = studRes.data || [];

    // Render Department Matrix
    deptsTbody.innerHTML = '';
    const deptAtt = stats.departmentAttendance || {};
    const deptDist = stats.studentDistribution || {};

    const deptCodes = Object.keys(deptAtt);
    if (deptCodes.length === 0) {
      deptsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No departmental data recorded.</td></tr>';
    } else {
      deptCodes.forEach(code => {
        const att = deptAtt[code] || 0;
        const count = deptDist[code] || 0;
        const isHealthy = att >= 75;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:600;">Department of ${code}</td>
          <td><span class="badge badge-primary">${code}</span></td>
          <td>${count} Students</td>
          <td style="font-weight:700; color:${isHealthy ? 'var(--success)' : 'var(--danger)'};">${att}%</td>
          <td>
            <span class="badge ${isHealthy ? 'badge-success' : 'badge-danger'}">
              ${isHealthy ? '✓ Optimal Health (>75%)' : '🚨 Low Attendance Alert'}
            </span>
          </td>
        `;
        deptsTbody.appendChild(tr);
      });
    }

    // Render Critical Attendance Warning Report (<75%)
    atRiskTbody.innerHTML = '';
    const atRiskStudents = students.filter(s => (s.attendancePercentage != null ? s.attendancePercentage : 0) < 75);
    
    document.getElementById('admin-at-risk-count').textContent = `${atRiskStudents.length} Students Flagged`;

    if (atRiskStudents.length === 0) {
      atRiskTbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--success); font-weight:600;">🎉 All campus students are maintaining above 75% attendance!</td></tr>';
    } else {
      atRiskStudents.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:600; color:var(--danger);">${s.studentId}</td>
          <td style="font-weight:600;">${s.fullName}</td>
          <td>${s.departmentName || 'General'}</td>
          <td>Year ${s.year}</td>
          <td style="font-weight:700; color:var(--danger);">${s.attendancePercentage}%</td>
          <td>
            <span class="badge badge-danger">Attendance is below 75% mandatory requirement</span>
          </td>
          <td style="text-align:center;">
            <button class="btn btn-outline btn-sm" onclick="viewStudentFullProfile(${s.id})">
              👁️ View Dossier
            </button>
          </td>
        `;
        atRiskTbody.appendChild(tr);
      });
    }

  } catch (err) {
    deptsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--danger);">Error compiling analytics.</td></tr>';
  }
}
