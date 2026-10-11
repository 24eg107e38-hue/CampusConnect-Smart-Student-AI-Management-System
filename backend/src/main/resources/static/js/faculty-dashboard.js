/**
 * Faculty Dashboard Controller
 */

let allDepartments = [];
let allSubjects = [];
let cachedStudents = [];
let facDeptChartInstance = null;
let gradeDistChartInstance = null;

function switchFacultyTab(tabId) {
  document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar-link[onclick="switchFacultyTab('${tabId}')"]`);
  if (activeLink) activeLink.classList.add('active');

  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  const targetContent = document.getElementById(`fac-tab-${tabId}`);
  if (targetContent) targetContent.classList.add('active');

  const titles = {
    'dashboard': 'Faculty Dashboard',
    'students': 'Student Directory & Advanced Search',
    'attendance': 'Classroom Attendance Tracker',
    'marks': 'Academic Marks Management',
    'assignments': 'Assignments & Submission Grading',
    'leaves': 'Student Leave Approval Requests',
    'notices': 'Department Notices Board',
    'analytics': 'Academic Performance Analytics'
  };
  const titleEl = document.getElementById('faculty-page-title');
  if (titleEl && titles[tabId]) titleEl.textContent = titles[tabId];

  const sidebar = document.querySelector('.sidebar');
  if (sidebar && window.innerWidth <= 992) sidebar.classList.remove('open');

  if (tabId === 'students') searchStudentsDirectory();
  else if (tabId === 'attendance') prepareAttendanceTab();
  else if (tabId === 'marks') prepareMarksTab();
  else if (tabId === 'assignments') loadFacultyAssignments();
  else if (tabId === 'leaves') loadFacultyLeaves();
  else if (tabId === 'notices') loadFacultyNotices();
  else if (tabId === 'analytics') loadFacultyAnalytics();
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth(['ROLE_FACULTY', 'ROLE_ADMIN'])) return;

  await loadReferenceData();
  loadFacultyDashboardOverview();
});

// Load Reference Data (Departments and Subjects)
async function loadReferenceData() {
  try {
    const deptRes = await Api.get('/departments');
    allDepartments = deptRes.data || [];

    const subRes = await Api.get('/subjects');
    allSubjects = subRes.data || [];

    // Populate department dropdowns across tabs
    const deptDropdowns = ['fac-search-dept', 'cas-dept', 'fnotice-dept'];
    deptDropdowns.forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      // Preserve first option
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

  } catch (e) {
    console.error('Error loading reference data', e);
  }
}

// 1. Dashboard Overview
async function loadFacultyDashboardOverview() {
  try {
    const res = await Api.get('/dashboard/faculty');
    const stats = res.data;

    document.getElementById('fac-greeting').textContent = `Welcome, ${stats.facultyName || 'Faculty'}`;
    document.getElementById('fac-meta').textContent = `${stats.departmentName || 'Academic Department'} | Faculty ID: ${stats.facultyId || 'FAC001'}`;

    document.getElementById('fcard-students').textContent = stats.totalStudents;
    document.getElementById('fcard-attendance').textContent = `${stats.averageAttendance}%`;
    document.getElementById('fcard-below75').textContent = stats.studentsBelow75Count;
    document.getElementById('fcard-marks').textContent = `${stats.averageMarks}%`;
    document.getElementById('fcard-leaves').textContent = stats.pendingLeaveRequests;

    // Render Department Distribution Chart
    renderDeptDistributionChart(stats.studentsByDepartment || {});

    // Recent Leave Requests
    renderRecentLeaves(stats.recentLeaveRequests || []);

  } catch (err) {
    showToast('Failed to load faculty dashboard: ' + err.message, 'error');
  }
}

function renderDeptDistributionChart(distMap) {
  const ctx = document.getElementById('fac-dept-distribution-chart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (facDeptChartInstance) facDeptChartInstance.destroy();

  const labels = Object.keys(distMap);
  const data = Object.values(distMap);

  facDeptChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [{
        data: data.length > 0 ? data : [1],
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderRecentLeaves(leaves) {
  const container = document.getElementById('fac-recent-leaves-container');
  if (!container) return;

  if (leaves.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">✉️</div><p>No pending leave requests</p></div>';
    return;
  }

  container.innerHTML = leaves.map(l => `
    <div style="background:#f8fafc; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <strong>${escapeHtml(l.studentName)} (${escapeHtml(l.studentRollNo)})</strong>
        <span class="badge badge-warning">${l.leaveType}</span>
      </div>
      <p style="font-size:13px; color:var(--text-muted); margin-bottom:10px;">${escapeHtml(l.reason)}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
        <span>📅 ${formatDate(l.startDate)} &rarr; ${formatDate(l.endDate)}</span>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-success btn-sm" onclick="reviewLeave(${l.id}, 'APPROVED')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="reviewLeave(${l.id}, 'REJECTED')">Reject</button>
        </div>
      </div>
    </div>
  `).join('');
}

// 2. Student Directory & Search
async function searchStudentsDirectory() {
  const search = document.getElementById('fac-search-input').value.trim();
  const deptId = document.getElementById('fac-search-dept').value;
  const year = document.getElementById('fac-search-year').value;
  const perf = document.getElementById('fac-search-perf').value;

  let query = `/students?`;
  if (search) query += `search=${encodeURIComponent(search)}&`;
  if (deptId) query += `deptId=${deptId}&`;
  if (year) query += `year=${year}&`;
  if (perf) query += `performanceStatus=${encodeURIComponent(perf)}&`;

  try {
    const res = await Api.get(query);
    cachedStudents = res.data || [];

    document.getElementById('fac-student-count-badge').textContent = `${cachedStudents.length} Students`;
    const tbody = document.getElementById('fac-students-table-body');

    if (cachedStudents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students matching criteria</td></tr>';
      return;
    }

    // For each student, load summary attendance and performance badge
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Analyzing student records...</td></tr>';

    const rows = await Promise.all(cachedStudents.map(async s => {
      let attPct = 'N/A';
      let perfStatus = 'Average';
      let badgeClass = 'badge-primary';
      let gpa = 'N/A';

      try {
        const perfRes = await Api.get(`/performance/student/${s.id}`);
        attPct = `${perfRes.data.attendancePercentage}%`;
        perfStatus = perfRes.data.overallStatus;
        badgeClass = perfRes.data.statusBadgeClass;
        gpa = perfRes.data.gpa.toFixed(2);
      } catch (e) {}

      return `<tr>
        <td><strong>${escapeHtml(s.studentId)}</strong></td>
        <td>${escapeHtml(s.fullName)}</td>
        <td>
          <div style="font-size:13px;">${escapeHtml(s.email)}</div>
          <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(s.phoneNumber || '')}</div>
        </td>
        <td>${escapeHtml(s.departmentCode || s.departmentName)} (Yr ${s.year})</td>
        <td>
          <span style="font-weight:700; ${parseFloat(attPct) < 75 ? 'color:var(--danger);' : 'color:var(--success);'}">
            ${attPct}
          </span>
        </td>
        <td>
          <span class="badge ${badgeClass}">${perfStatus}</span>
          <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">GPA: ${gpa}</div>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="inspectStudentPerformance(${s.id}, '${escapeHtml(s.fullName)}')">
            Inspect &rarr;
          </button>
        </td>
      </tr>`;
    }));

    tbody.innerHTML = rows.join('');

  } catch (err) {
    showToast('Search failed: ' + err.message, 'error');
  }
}

function resetStudentSearch() {
  document.getElementById('fac-search-input').value = '';
  document.getElementById('fac-search-dept').value = '';
  document.getElementById('fac-search-year').value = '';
  document.getElementById('fac-search-perf').value = '';
  searchStudentsDirectory();
}

async function inspectStudentPerformance(studentId, studentName) {
  document.getElementById('inspector-title').textContent = `Performance Analysis: ${studentName}`;
  const body = document.getElementById('inspector-body');
  body.innerHTML = '<p>Evaluating student metrics...</p>';
  openModal('student-inspector-modal');

  try {
    const res = await Api.get(`/performance/student/${studentId}`);
    const p = res.data;

    body.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div>
          <h4 style="margin:0;">Roll No: ${escapeHtml(p.studentRollNo)} | ${escapeHtml(p.departmentName)}</h4>
        </div>
        <span class="badge ${p.statusBadgeClass}" style="font-size:14px; padding:6px 14px;">Status: ${p.overallStatus}</span>
      </div>

      <div class="stats-grid" style="margin-bottom:16px;">
        <div class="stat-card" style="padding:14px;">
          <div class="stat-details">
            <div class="stat-label">Attendance</div>
            <div class="stat-value" style="font-size:20px; ${p.attendancePercentage < 75 ? 'color:var(--danger);' : ''}">${p.attendancePercentage}%</div>
          </div>
        </div>
        <div class="stat-card" style="padding:14px;">
          <div class="stat-details">
            <div class="stat-label">Average Marks</div>
            <div class="stat-value" style="font-size:20px;">${p.averageMarksPercentage}%</div>
          </div>
        </div>
        <div class="stat-card" style="padding:14px;">
          <div class="stat-details">
            <div class="stat-label">Assignments Done</div>
            <div class="stat-value" style="font-size:20px;">${p.assignmentCompletionPercentage}%</div>
          </div>
        </div>
        <div class="stat-card" style="padding:14px;">
          <div class="stat-details">
            <div class="stat-label">Calculated GPA</div>
            <div class="stat-value" style="font-size:20px;">${p.gpa.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <h4 style="font-size:14px; margin-bottom:8px;">💡 Rule-Based Automated Recommendations:</h4>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
        ${p.recommendations.map(r => `
          <div style="background:#f8fafc; border-left:3px solid var(--secondary); padding:8px 12px; font-size:13px;">
            ${escapeHtml(r)}
          </div>
        `).join('')}
      </div>

      <h4 style="font-size:14px; margin-bottom:8px;">📚 Subject Breakdown:</h4>
      <table class="custom-table" style="font-size:13px;">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks %</th>
            <th>Attendance %</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          ${(p.subjectScores || []).map(sub => `
            <tr>
              <td><strong>${escapeHtml(sub.subjectCode)}</strong> - ${escapeHtml(sub.subjectName)}</td>
              <td>${sub.marksPercentage}%</td>
              <td>${sub.attendancePercentage}%</td>
              <td><span class="badge badge-secondary">${sub.grade}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    body.innerHTML = `<p style="color:var(--danger);">Failed to load performance analysis: ${err.message}</p>`;
  }
}

// 3. Mark Attendance
async function prepareAttendanceTab() {
  const selectSubject = document.getElementById('att-select-subject');
  const dateInput = document.getElementById('att-select-date');
  dateInput.value = new Date().toISOString().split('T')[0];

  selectSubject.innerHTML = '<option value="">Select Course Subject...</option>';
  allSubjects.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.code} - ${s.name} (Year ${s.year})`;
    selectSubject.appendChild(opt);
  });

  if (allSubjects.length > 0) {
    selectSubject.selectedIndex = 1;
    loadStudentsForAttendance();
  }
}

async function loadStudentsForAttendance() {
  const subjectId = document.getElementById('att-select-subject').value;
  const date = document.getElementById('att-select-date').value;
  const tbody = document.getElementById('attendance-marking-table-body');

  if (!subjectId || !date) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Please select both subject and date</td></tr>';
    return;
  }

  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading class roster...</td></tr>';

  try {
    const selectedSub = allSubjects.find(s => s.id == subjectId);
    // Fetch students in department & year
    const studentsRes = await Api.get(`/students?deptId=${selectedSub.department.id}&year=${selectedSub.year}`);
    const students = studentsRes.data || [];

    // Check existing attendance records for subject & date
    let existingRecords = [];
    try {
      const recRes = await Api.get(`/attendance/subject/${subjectId}?date=${date}`);
      existingRecords = recRes.data || [];
    } catch (e) {}

    const recordMap = new Map();
    existingRecords.forEach(r => recordMap.set(r.studentId, r));

    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No students enrolled in this department / year</td></tr>';
      return;
    }

    tbody.innerHTML = students.map(s => {
      const rec = recordMap.get(s.id);
      const isPresent = rec ? rec.status === 'PRESENT' : true; // default present
      const remarks = rec ? (rec.remarks || '') : '';

      return `<tr data-student-id="${s.id}">
        <td>
          <input type="checkbox" class="att-checkbox" ${isPresent ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
        </td>
        <td><strong>${escapeHtml(s.studentId)}</strong></td>
        <td>${escapeHtml(s.fullName)}</td>
        <td>${escapeHtml(s.departmentCode || s.departmentName)} (Yr ${s.year})</td>
        <td>
          <input type="text" class="form-control att-remark" placeholder="Remarks (optional)" value="${escapeHtml(remarks)}" style="padding:4px 8px; font-size:12px;">
        </td>
      </tr>`;
    }).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--danger);">${err.message}</td></tr>`;
  }
}

function toggleAllAttendance(status) {
  document.querySelectorAll('.att-checkbox').forEach(cb => {
    cb.checked = status;
  });
}

async function saveClassAttendance() {
  const subjectId = parseInt(document.getElementById('att-select-subject').value);
  const attendanceDate = document.getElementById('att-select-date').value;

  if (!subjectId || !attendanceDate) {
    showToast('Please select subject and date', 'warning');
    return;
  }

  const rows = document.querySelectorAll('#attendance-marking-table-body tr[data-student-id]');
  if (rows.length === 0) {
    showToast('No students loaded to mark attendance', 'warning');
    return;
  }

  const students = [];
  rows.forEach(row => {
    const studentId = parseInt(row.getAttribute('data-student-id'));
    const isPresent = row.querySelector('.att-checkbox').checked;
    const remarks = row.querySelector('.att-remark').value.trim();

    students.push({
      studentId,
      status: isPresent ? 'PRESENT' : 'ABSENT',
      remarks
    });
  });

  try {
    await Api.post('/attendance', {
      subjectId,
      attendanceDate,
      students
    });
    showToast(`Attendance recorded for ${students.length} students!`, 'success');
  } catch (err) {
    showToast('Failed to record attendance: ' + err.message, 'error');
  }
}

// 4. Marks Management
async function prepareMarksTab() {
  const studentSelect = document.getElementById('marks-select-student');
  const subjectSelect = document.getElementById('marks-select-subject');

  // Load students
  try {
    const sRes = await Api.get('/students');
    const students = sRes.data || [];
    studentSelect.innerHTML = '<option value="">Choose Student...</option>';
    students.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.studentId} - ${s.fullName} (${s.departmentCode || ''})`;
      studentSelect.appendChild(opt);
    });

    // Load subjects
    subjectSelect.innerHTML = '<option value="">Choose Subject...</option>';
    allSubjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = `${sub.code} - ${sub.name}`;
      subjectSelect.appendChild(opt);
    });

    calculateLiveMarks();
  } catch (e) {
    showToast('Failed to prepare marks form', 'error');
  }
}

function calculateLiveMarks() {
  const internal = parseFloat(document.getElementById('input-internal-marks').value) || 0;
  const assign = parseFloat(document.getElementById('input-assignment-marks').value) || 0;
  const mid = parseFloat(document.getElementById('input-mid-marks').value) || 0;
  const final = parseFloat(document.getElementById('input-final-marks').value) || 0;

  const total = Math.round((internal + assign + mid + final) * 10) / 10;
  const pct = total; // out of 100

  let grade = 'F';
  if (total >= 90) grade = 'A+';
  else if (total >= 80) grade = 'A';
  else if (total >= 70) grade = 'B';
  else if (total >= 60) grade = 'C';
  else if (total >= 50) grade = 'D';
  else if (total >= 40) grade = 'E';

  document.getElementById('live-total-marks').textContent = `${total} / 100`;
  document.getElementById('live-percentage').textContent = `${pct}%`;
  document.getElementById('live-grade').textContent = grade;
}

document.getElementById('faculty-marks-entry-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const studentId = parseInt(document.getElementById('marks-select-student').value);
  const subjectId = parseInt(document.getElementById('marks-select-subject').value);
  const semester = parseInt(document.getElementById('marks-semester').value);

  const internalMarks = parseFloat(document.getElementById('input-internal-marks').value) || 0;
  const assignmentMarks = parseFloat(document.getElementById('input-assignment-marks').value) || 0;
  const midExamMarks = parseFloat(document.getElementById('input-mid-marks').value) || 0;
  const finalExamMarks = parseFloat(document.getElementById('input-final-marks').value) || 0;

  try {
    await Api.post('/marks', {
      studentId,
      subjectId,
      semester,
      internalMarks,
      assignmentMarks,
      midExamMarks,
      finalExamMarks
    });

    showToast('Marks and grade saved successfully!', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to save marks', 'error');
  }
});

// 5. Assignments & Grading
async function loadFacultyAssignments() {
  try {
    const res = await Api.get('/assignments');
    const assignments = res.data || [];
    const container = document.getElementById('fac-assignments-container');

    if (assignments.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📑</div><p>No assignments created yet</p></div>';
      return;
    }

    container.innerHTML = assignments.map(a => `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span class="badge badge-secondary">${escapeHtml(a.subjectCode)}</span>
                <h3 style="font-size:16px; margin:0;">${escapeHtml(a.title)}</h3>
                <span class="badge badge-primary">${a.departmentName} - Yr ${a.year}</span>
              </div>
              <p style="font-size:13px; color:var(--text-muted); margin-bottom:8px;">${escapeHtml(a.description || 'No description.')}</p>
              <div style="display:flex; gap:16px; font-size:12px; color:var(--text-light);">
                <span>📅 Due: <strong>${formatDate(a.dueDate)}</strong></span>
                <span>⭐ Max Marks: <strong>${a.maxMarks}</strong></span>
                <span>📥 Submissions: <strong>${a.totalSubmissions}</strong></span>
              </div>
            </div>
            <div>
              <button class="btn btn-outline btn-sm" onclick="toggleSubmissionsView(${a.id})">
                View Submissions (${a.totalSubmissions})
              </button>
            </div>
          </div>

          <div id="sub-list-${a.id}" style="display:none; margin-top:16px; border-top:1px solid var(--border); padding-top:14px;">
            <p style="font-size:13px; color:var(--text-muted);">Loading student submissions...</p>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    showToast('Failed to load assignments', 'error');
  }
}

async function toggleSubmissionsView(assignmentId) {
  const container = document.getElementById(`sub-list-${assignmentId}`);
  if (!container) return;

  if (container.style.display === 'block') {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = '<p style="font-size:13px;">Loading student submissions...</p>';

  try {
    const res = await Api.get(`/assignments/${assignmentId}/submissions`);
    const subs = res.data || [];

    if (subs.length === 0) {
      container.innerHTML = '<p style="font-size:13px; color:var(--text-muted);">No student submissions recorded yet.</p>';
      return;
    }

    container.innerHTML = `
      <table class="custom-table" style="font-size:13px;">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Submitted Solution</th>
            <th>Status</th>
            <th>Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${subs.map(s => `
            <tr>
              <td><strong>${escapeHtml(s.studentRollNo)}</strong></td>
              <td>${escapeHtml(s.studentName)}</td>
              <td style="max-width:280px; word-break:break-all;">${escapeHtml(s.submissionText)}</td>
              <td><span class="badge ${s.status === 'GRADED' ? 'badge-success' : 'badge-primary'}">${s.status}</span></td>
              <td>${s.marksObtained != null ? `<strong>${s.marksObtained}</strong>` : '-'}</td>
              <td>
                <button class="btn btn-primary btn-sm" onclick="openGradeModal(${s.id}, '${escapeHtml(s.studentName)}', '${escapeHtml(s.submissionText).replace(/'/g, "\\'")}', ${s.marksObtained || 0}, '${escapeHtml(s.feedback || '').replace(/'/g, "\\'")}')">
                  ${s.status === 'GRADED' ? 'Edit Grade' : 'Grade Solution'}
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger); font-size:13px;">Failed to load submissions: ${err.message}</p>`;
  }
}

function openGradeModal(id, studentName, content, currentMarks, currentFeedback) {
  document.getElementById('grade-sub-id').value = id;
  document.getElementById('grade-sub-student').value = studentName;
  document.getElementById('grade-sub-content').textContent = content;
  document.getElementById('grade-marks-input').value = currentMarks || '';
  document.getElementById('grade-feedback-input').value = currentFeedback || '';
  openModal('grade-submission-modal');
}

document.getElementById('grade-submission-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const subId = document.getElementById('grade-sub-id').value;
  const marksObtained = parseFloat(document.getElementById('grade-marks-input').value);
  const feedback = document.getElementById('grade-feedback-input').value.trim();

  try {
    await Api.put(`/assignments/submissions/${subId}/grade`, {
      marksObtained,
      feedback
    });
    showToast('Graded submission successfully!', 'success');
    closeModal('grade-submission-modal');
    loadFacultyAssignments();
  } catch (err) {
    showToast('Failed to grade submission: ' + err.message, 'error');
  }
});

// Dynamic Subject loading when department is selected in Assignment modal
function loadSubjectsForDept(deptId) {
  const subSelect = document.getElementById('cas-subject');
  subSelect.innerHTML = '<option value="">Select Subject...</option>';
  if (!deptId) return;

  const filtered = allSubjects.filter(s => s.department.id == deptId);
  filtered.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.code} - ${s.name}`;
    subSelect.appendChild(opt);
  });
}

document.getElementById('create-assignment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('cas-title').value.trim();
  const departmentId = parseInt(document.getElementById('cas-dept').value);
  const subjectId = parseInt(document.getElementById('cas-subject').value);
  const year = parseInt(document.getElementById('cas-year').value);
  const dueDate = document.getElementById('cas-due-date').value;
  const maxMarks = parseInt(document.getElementById('cas-max-marks').value) || 10;
  const description = document.getElementById('cas-desc').value.trim();

  try {
    await Api.post('/assignments', {
      title,
      departmentId,
      subjectId,
      year,
      dueDate,
      maxMarks,
      description
    });
    showToast('Assignment created and published!', 'success');
    closeModal('create-assignment-modal');
    document.getElementById('create-assignment-form').reset();
    loadFacultyAssignments();
  } catch (err) {
    showToast(err.message || 'Failed to create assignment', 'error');
  }
});

// 6. Leave Requests
async function loadFacultyLeaves() {
  try {
    const res = await Api.get('/leaves');
    const leaves = res.data || [];
    const tbody = document.getElementById('fac-leaves-table-body');

    if (leaves.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No leave applications found</td></tr>';
      return;
    }

    tbody.innerHTML = leaves.map(l => {
      let badge = '<span class="badge badge-warning">Pending</span>';
      if (l.status === 'APPROVED') badge = '<span class="badge badge-success">Approved</span>';
      else if (l.status === 'REJECTED') badge = '<span class="badge badge-danger">Rejected</span>';

      return `<tr>
        <td><strong>${escapeHtml(l.studentRollNo)}</strong></td>
        <td>${escapeHtml(l.studentName)}</td>
        <td>${escapeHtml(l.leaveType)}</td>
        <td>${formatDate(l.startDate)}</td>
        <td>${formatDate(l.endDate)}</td>
        <td>${escapeHtml(l.reason)}</td>
        <td>${badge}</td>
        <td>
          ${l.status === 'PENDING' ? `
            <div style="display:flex; gap:6px;">
              <button class="btn btn-success btn-sm" onclick="reviewLeave(${l.id}, 'APPROVED')">Approve</button>
              <button class="btn btn-danger btn-sm" onclick="reviewLeave(${l.id}, 'REJECTED')">Reject</button>
            </div>
          ` : `<small style="color:var(--text-muted);">${escapeHtml(l.reviewComments || 'Reviewed')}</small>`}
        </td>
      </tr>`;
    }).join('');

  } catch (err) {
    showToast('Failed to load leave requests', 'error');
  }
}

async function reviewLeave(leaveId, status) {
  const comments = prompt(`Enter comments for ${status.toLowerCase()} leave request:`, `Leave request ${status.toLowerCase()} by faculty.`);
  if (comments !== null) {
    try {
      await Api.put(`/leaves/${leaveId}/status`, {
        status,
        comments
      });
      showToast(`Leave request ${status.toLowerCase()}!`, 'success');
      loadFacultyLeaves();
      loadFacultyDashboardOverview();
    } catch (e) {
      showToast('Failed to update leave request status', 'error');
    }
  }
}

// 7. Notices
async function loadFacultyNotices() {
  try {
    const res = await Api.get('/notices');
    const notices = res.data || [];
    const container = document.getElementById('fac-notices-container');

    if (notices.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📢</div><p>No notices published</p></div>';
      return;
    }

    container.innerHTML = notices.map(n => `
      <div class="card" style="margin-bottom:14px;">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge ${n.priority === 'URGENT' ? 'badge-danger' : (n.priority === 'IMPORTANT' ? 'badge-warning' : 'badge-secondary')}">${n.priority}</span>
              <h3 style="font-size:16px; margin:0;">${escapeHtml(n.title)}</h3>
            </div>
            <button class="btn btn-outline btn-sm" style="color:var(--danger);" onclick="deleteNotice(${n.id})">Delete</button>
          </div>
          <p style="font-size:13px; line-height:1.5; color:var(--text-main); margin-bottom:10px;">${escapeHtml(n.content)}</p>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-light);">
            <span>Target: <strong>${escapeHtml(n.targetDepartmentName)}</strong> ${n.targetYear ? `(Year ${n.targetYear})` : ''}</span>
            <span>Date: ${formatDate(n.createdAt)} | By: ${escapeHtml(n.postedBy)}</span>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    showToast('Failed to load notices', 'error');
  }
}

document.getElementById('fac-publish-notice-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('fnotice-title').value.trim();
  const targetDepartmentId = document.getElementById('fnotice-dept').value ? parseInt(document.getElementById('fnotice-dept').value) : null;
  const targetYear = parseInt(document.getElementById('fnotice-year').value) || null;
  const priority = document.getElementById('fnotice-priority').value;
  const content = document.getElementById('fnotice-content').value.trim();
  const user = Auth.getUser();

  try {
    await Api.post('/notices', {
      title,
      targetDepartmentId,
      targetYear,
      priority,
      content,
      postedBy: user.fullName || 'Faculty Member'
    });
    showToast('Notice published successfully!', 'success');
    closeModal('fac-publish-notice-modal');
    document.getElementById('fac-publish-notice-form').reset();
    loadFacultyNotices();
  } catch (err) {
    showToast('Failed to publish notice: ' + err.message, 'error');
  }
});

async function deleteNotice(id) {
  if (confirm('Are you sure you want to delete this notice?')) {
    try {
      await Api.delete(`/notices/${id}`);
      showToast('Notice removed', 'info');
      loadFacultyNotices();
    } catch (e) {
      showToast('Failed to delete notice', 'error');
    }
  }
}

// 8. Academic Analytics
async function loadFacultyAnalytics() {
  try {
    const sRes = await Api.get('/students');
    const students = sRes.data || [];

    const gradesCount = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    const atRiskStudents = [];

    await Promise.all(students.map(async s => {
      try {
        const perf = (await Api.get(`/performance/student/${s.id}`)).data;
        if (perf.attendancePercentage < 75) {
          atRiskStudents.push({
            name: s.fullName,
            id: s.studentId,
            att: perf.attendancePercentage,
            dept: s.departmentCode || s.departmentName,
            status: perf.overallStatus
          });
        }
        (perf.subjectScores || []).forEach(sub => {
          if (gradesCount[sub.grade] !== undefined) gradesCount[sub.grade]++;
        });
      } catch (e) {}
    }));

    renderGradeSpectrumChart(gradesCount);

    const atRiskContainer = document.getElementById('fac-at-risk-container');
    if (atRiskStudents.length === 0) {
      atRiskContainer.innerHTML = '<p style="color:var(--success); font-weight:600;">✓ Excellent! All students are meeting or exceeding the 75% attendance criterion.</p>';
      return;
    }

    atRiskContainer.innerHTML = atRiskStudents.map(st => `
      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${escapeHtml(st.name)}</strong> (${escapeHtml(st.id)})
          <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(st.dept)} | Performance: ${st.status}</div>
        </div>
        <div style="text-align:right;">
          <span class="badge badge-danger" style="font-size:13px;">${st.att}% Attendance</span>
        </div>
      </div>
    `).join('');

  } catch (err) {
    showToast('Failed to load academic analytics', 'error');
  }
}

function renderGradeSpectrumChart(grades) {
  const ctx = document.getElementById('analytics-grade-chart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (gradeDistChartInstance) gradeDistChartInstance.destroy();

  gradeDistChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(grades),
      datasets: [{
        label: 'Coursework Grades Awarded',
        data: Object.values(grades),
        backgroundColor: [
          '#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#f97316', '#ef4444'
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
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
