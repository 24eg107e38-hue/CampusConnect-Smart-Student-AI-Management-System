/**
 * Student Dashboard Controller
 */

let currentStudentId = null;
let cachedAssignments = [];
let overviewChartInstance = null;
let marksChartInstance = null;

// Tab Switching
function switchTab(tabId) {
  // Update sidebar active state
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.querySelector(`.sidebar-link[onclick="switchTab('${tabId}')"]`);
  if (activeLink) activeLink.classList.add('active');

  // Switch content panels
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  const targetContent = document.getElementById(`tab-${tabId}`);
  if (targetContent) targetContent.classList.add('active');

  // Update Page Title
  const titles = {
    'dashboard': 'Student Dashboard',
    'profile': 'My Profile',
    'attendance': 'Class Attendance',
    'marks': 'Academic Marks & Grades',
    'assignments': 'Assignments & Coursework',
    'leave': 'Leave Management',
    'goals': 'Academic Goals Tracker',
    'achievements': 'Achievements & Honors',
    'notices': 'Campus Notices',
    'performance': 'Smart Performance Analyzer'
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl && titles[tabId]) titleEl.textContent = titles[tabId];

  // Close sidebar on mobile after clicking
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && window.innerWidth <= 992) {
    sidebar.classList.remove('open');
  }

  // Load specific tab data if needed
  if (tabId === 'profile') loadProfileData();
  else if (tabId === 'attendance') loadAttendanceData();
  else if (tabId === 'marks') loadMarksData();
  else if (tabId === 'assignments') loadAssignmentsData();
  else if (tabId === 'leave') loadLeaveData();
  else if (tabId === 'goals') loadGoalsData();
  else if (tabId === 'achievements') loadAchievementsData();
  else if (tabId === 'notices') loadNoticesData();
  else if (tabId === 'performance') loadPerformanceData();
}

// Initial Page Load
document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth(['ROLE_STUDENT', 'ROLE_ADMIN'])) return;

  const user = Auth.getUser();
  currentStudentId = user.profileId;

  // Fallback: if student profileId isn't on session yet, fetch it
  if (!currentStudentId) {
    try {
      const studentRes = await Api.get(`/students/user/${user.userId}`);
      if (studentRes.data) {
        currentStudentId = studentRes.data.id;
        user.profileId = currentStudentId;
        Auth.setSession(user);
      }
    } catch (e) {
      console.warn('Could not load student profile ID by user ID', e);
    }
  }

  loadDashboardOverview();
});

// Load Dashboard Overview Data
async function loadDashboardOverview() {
  if (!currentStudentId) return;

  try {
    const res = await Api.get(`/dashboard/student/${currentStudentId}`);
    const stats = res.data;

    // Greeting & Meta
    document.getElementById('dash-greeting').textContent = `Welcome, ${stats.studentName || 'Student'}`;
    document.getElementById('dash-student-meta').textContent = 
      `Roll No: ${stats.studentRollNo || 'N/A'} | ${stats.course || 'Degree'} | Year ${stats.year || 1}`;

    // Summary Cards
    const attCard = document.getElementById('card-attendance');
    attCard.textContent = `${stats.attendancePercentage}%`;
    if (stats.attendancePercentage < 75) {
      attCard.style.color = 'var(--danger)';
    } else {
      attCard.style.color = 'var(--success)';
    }

    document.getElementById('card-marks').textContent = `${stats.averageMarks}%`;
    document.getElementById('card-gpa').textContent = stats.currentGpa.toFixed(2);
    document.getElementById('card-assignments').textContent = stats.pendingAssignmentsCount;
    document.getElementById('card-leave').textContent = stats.latestLeaveStatus || 'None';

    // Smart Attendance Alert Banner
    const alertBanner = document.getElementById('smart-attendance-alert');
    if (stats.attendanceAlert) {
      alertBanner.style.display = 'flex';
    } else {
      alertBanner.style.display = 'none';
    }

    // Performance Preview in Card
    if (stats.performance) {
      const perfBadge = document.getElementById('dash-perf-badge');
      perfBadge.textContent = stats.performance.overallStatus;
      perfBadge.className = `badge ${stats.performance.statusBadgeClass}`;

      document.getElementById('dash-perf-score').textContent = `${stats.performance.overallPerformanceScore} / 100`;
      document.getElementById('dash-perf-bar').style.width = `${Math.min(100, stats.performance.overallPerformanceScore)}%`;

      const topRec = stats.performance.recommendations && stats.performance.recommendations.length > 0
        ? stats.performance.recommendations[0]
        : 'Maintain consistent study schedule and preparation.';
      document.getElementById('dash-top-rec').textContent = topRec;

      // Render Overview Chart
      renderOverviewChart(stats.performance.subjectScores || []);
    }

    // Recent Notices
    renderDashboardNotices(stats.recentNotices || []);

  } catch (err) {
    showToast('Failed to load student dashboard: ' + err.message, 'error');
  }
}

// Render Overview Chart using Chart.js
function renderOverviewChart(scores) {
  const ctx = document.getElementById('student-overview-chart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (overviewChartInstance) {
    overviewChartInstance.destroy();
  }

  const labels = scores.map(s => s.subjectCode || s.subjectName);
  const marksData = scores.map(s => s.marksPercentage);
  const attData = scores.map(s => s.attendancePercentage);

  overviewChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length > 0 ? labels : ['No Subjects'],
      datasets: [
        {
          label: 'Marks (%)',
          data: marksData.length > 0 ? marksData : [0],
          backgroundColor: 'rgba(59, 130, 246, 0.85)',
          borderRadius: 6
        },
        {
          label: 'Attendance (%)',
          data: attData.length > 0 ? attData : [0],
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

// Render Dashboard Notices
function renderDashboardNotices(notices) {
  const container = document.getElementById('dash-notices-container');
  if (!container) return;

  if (notices.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📢</div><p>No recent notices found</p></div>';
    return;
  }

  let html = `<table class="custom-table">
    <thead>
      <tr>
        <th>Priority</th>
        <th>Notice Title</th>
        <th>Target Dept / Year</th>
        <th>Posted Date</th>
      </tr>
    </thead>
    <tbody>`;

  notices.slice(0, 4).forEach(n => {
    let badgeClass = 'badge-secondary';
    if (n.priority === 'URGENT') badgeClass = 'badge-danger';
    else if (n.priority === 'IMPORTANT') badgeClass = 'badge-warning';

    html += `<tr>
      <td><span class="badge ${badgeClass}">${n.priority}</span></td>
      <td><strong>${escapeHtml(n.title)}</strong><br><small style="color:var(--text-muted);">${escapeHtml(n.content.substring(0, 75))}...</small></td>
      <td>${escapeHtml(n.targetDepartmentName)} ${n.targetYear ? `(Yr ${n.targetYear})` : ''}</td>
      <td>${formatDate(n.createdAt)}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// ==================== 2. PROFILE ====================
async function loadProfileData() {
  if (!currentStudentId) return;
  try {
    const res = await Api.get(`/students/${currentStudentId}`);
    const s = res.data;

    document.getElementById('prof-display-name').textContent = s.fullName;
    document.getElementById('prof-display-id').textContent = s.studentId;
    document.getElementById('prof-name').value = s.fullName || '';
    document.getElementById('prof-id').value = s.studentId || '';
    document.getElementById('prof-email').value = s.email || '';
    document.getElementById('prof-phone').value = s.phoneNumber || '';
    document.getElementById('prof-dept').value = s.departmentName || '';
    document.getElementById('prof-course').value = s.course || '';
    document.getElementById('prof-year').value = `Year ${s.year} (Semester ${s.semester})`;
    document.getElementById('prof-doj').value = formatDate(s.dateOfJoining);
    document.getElementById('prof-address').value = s.address || '';
  } catch (err) {
    showToast('Failed to load profile details', 'error');
  }
}

document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const phone = document.getElementById('prof-phone').value.trim();
  const address = document.getElementById('prof-address').value.trim();
  const course = document.getElementById('prof-course').value.trim();
  const fullName = document.getElementById('prof-name').value.trim();

  try {
    await Api.put(`/students/${currentStudentId}`, {
      fullName,
      phoneNumber: phone,
      address,
      course
    });
    showToast('Profile updated successfully!', 'success');
    loadProfileData();
  } catch (err) {
    showToast(err.message || 'Failed to update profile', 'error');
  }
});

// ==================== 3. ATTENDANCE ====================
async function loadAttendanceData() {
  if (!currentStudentId) return;
  try {
    const res = await Api.get(`/attendance/student/${currentStudentId}`);
    const summary = res.data;

    document.getElementById('att-overall-pct').textContent = `${summary.overallPercentage}%`;
    document.getElementById('att-present-days').textContent = summary.presentDays;
    document.getElementById('att-absent-days').textContent = summary.absentDays;
    document.getElementById('att-total-days').textContent = summary.totalWorkingDays;

    const tbody = document.getElementById('student-attendance-table-body');
    if (!summary.subjectAttendance || summary.subjectAttendance.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No subject attendance records found</td></tr>';
      return;
    }

    tbody.innerHTML = summary.subjectAttendance.map(sub => {
      const isLow = sub.belowThreshold;
      const statusBadge = isLow 
        ? `<span class="badge badge-danger">Low (&lt; 75%)</span>` 
        : `<span class="badge badge-success">Sufficient</span>`;

      return `<tr>
        <td><strong>${escapeHtml(sub.subjectCode)}</strong></td>
        <td>${escapeHtml(sub.subjectName)}</td>
        <td>${sub.totalClasses}</td>
        <td><span style="color:var(--success); font-weight:600;">${sub.presentClasses}</span></td>
        <td><span style="color:var(--danger); font-weight:600;">${sub.absentClasses}</span></td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="progress-bar-bg" style="width:70px;">
              <div class="progress-bar-fill ${isLow ? 'danger' : 'success'}" style="width:${sub.percentage}%;"></div>
            </div>
            <strong>${sub.percentage}%</strong>
          </div>
        </td>
        <td>${statusBadge}</td>
      </tr>`;
    }).join('');

  } catch (err) {
    showToast('Failed to load attendance breakdown', 'error');
  }
}

// ==================== 4. MARKS ====================
async function loadMarksData() {
  if (!currentStudentId) return;
  try {
    const res = await Api.get(`/marks/student/${currentStudentId}`);
    const marksList = res.data || [];

    const tbody = document.getElementById('student-marks-table-body');
    if (marksList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No marks published yet for this semester</td></tr>';
      return;
    }

    tbody.innerHTML = marksList.map(m => {
      let gradeColor = '#059669';
      if (m.grade === 'F') gradeColor = '#dc2626';
      else if (m.grade === 'D' || m.grade === 'E') gradeColor = '#d97706';

      return `<tr>
        <td><strong>${escapeHtml(m.subjectCode)}</strong></td>
        <td>${escapeHtml(m.subjectName)}</td>
        <td>${m.internalMarks}</td>
        <td>${m.assignmentMarks}</td>
        <td>${m.midExamMarks}</td>
        <td>${m.finalExamMarks}</td>
        <td><strong>${m.totalMarks}</strong></td>
        <td>${m.percentage}%</td>
        <td><span class="badge" style="background:${gradeColor}; color:white;">${m.grade}</span></td>
      </tr>`;
    }).join('');

    renderMarksChart(marksList);
  } catch (err) {
    showToast('Failed to load marks', 'error');
  }
}

function renderMarksChart(marksList) {
  const ctx = document.getElementById('student-marks-bar-chart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (marksChartInstance) marksChartInstance.destroy();

  const labels = marksList.map(m => m.subjectCode);
  const data = marksList.map(m => m.totalMarks);

  marksChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Marks (/100)',
        data,
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

// ==================== 5. ASSIGNMENTS ====================
async function loadAssignmentsData() {
  if (!currentStudentId) return;
  try {
    const res = await Api.get(`/assignments/student/${currentStudentId}`);
    cachedAssignments = res.data || [];
    renderAssignmentsList();
  } catch (err) {
    showToast('Failed to load assignments', 'error');
  }
}

function renderAssignmentsList() {
  const filter = document.getElementById('assignment-filter').value;
  const container = document.getElementById('assignments-container');
  if (!container) return;

  let list = cachedAssignments;
  if (filter !== 'ALL') {
    list = list.filter(a => a.submissionStatus === filter);
  }

  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📑</div><p>No assignments found matching filter</p></div>';
    return;
  }

  container.innerHTML = list.map(a => {
    let statusBadge = '<span class="badge badge-warning">Pending</span>';
    if (a.submissionStatus === 'SUBMITTED') statusBadge = '<span class="badge badge-primary">Submitted</span>';
    else if (a.submissionStatus === 'GRADED') statusBadge = '<span class="badge badge-success">Graded</span>';
    else if (a.submissionStatus === 'OVERDUE') statusBadge = '<span class="badge badge-danger">Overdue</span>';

    return `<div class="card" style="margin-bottom:16px;">
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="badge badge-secondary">${escapeHtml(a.subjectCode)}</span>
              <h3 style="font-size:16px; margin:0;">${escapeHtml(a.title)}</h3>
              ${statusBadge}
            </div>
            <p style="font-size:14px; color:var(--text-muted); margin-bottom:12px;">${escapeHtml(a.description || 'No description provided.')}</p>
            <div style="display:flex; gap:18px; font-size:13px; color:var(--text-muted); flex-wrap:wrap;">
              <span>📅 <strong>Due:</strong> ${formatDate(a.dueDate)} (${a.deadlineNotice})</span>
              <span>⭐ <strong>Max Marks:</strong> ${a.maxMarks}</span>
              <span>👨‍🏫 <strong>Faculty:</strong> ${escapeHtml(a.facultyName)}</span>
              ${a.marksObtained != null ? `<span style="color:var(--success); font-weight:700;">🎯 Scored: ${a.marksObtained} / ${a.maxMarks}</span>` : ''}
            </div>
          </div>
          <div>
            ${a.submissionStatus === 'PENDING' || a.submissionStatus === 'OVERDUE'
              ? `<button class="btn btn-primary btn-sm" onclick="openSubmitModal(${a.id}, '${escapeHtml(a.title)}')">Submit Solution</button>`
              : `<span class="badge badge-success">Completed</span>`
            }
          </div>
        </div>
        ${a.feedback ? `<div style="margin-top:12px; font-size:13px; background:#f8fafc; padding:8px 12px; border-radius:var(--radius-sm); border-left:3px solid var(--secondary);"><strong>Faculty Feedback:</strong> ${escapeHtml(a.feedback)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function openSubmitModal(id, title) {
  document.getElementById('sub-assignment-id').value = id;
  document.getElementById('sub-assignment-title').value = title;
  document.getElementById('sub-assignment-text').value = '';
  openModal('submit-assignment-modal');
}

document.getElementById('submit-assignment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const assignmentId = parseInt(document.getElementById('sub-assignment-id').value);
  const submissionText = document.getElementById('sub-assignment-text').value.trim();

  try {
    await Api.post('/assignments/submit', {
      assignmentId,
      studentId: currentStudentId,
      submissionText
    });
    showToast('Assignment submitted successfully!', 'success');
    closeModal('submit-assignment-modal');
    loadAssignmentsData();
    loadDashboardOverview();
  } catch (err) {
    showToast(err.message || 'Submission failed', 'error');
  }
});

// ==================== 6. LEAVE MANAGEMENT ====================
async function loadLeaveData() {
  if (!currentStudentId) return;
  try {
    const res = await Api.get(`/leaves/student/${currentStudentId}`);
    const leaves = res.data || [];

    const tbody = document.getElementById('student-leave-table-body');
    if (leaves.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No leave applications found</td></tr>';
      return;
    }

    tbody.innerHTML = leaves.map(l => {
      let badgeClass = 'badge-warning';
      if (l.status === 'APPROVED') badgeClass = 'badge-success';
      else if (l.status === 'REJECTED') badgeClass = 'badge-danger';

      return `<tr>
        <td><strong>${escapeHtml(l.leaveType)}</strong></td>
        <td>${formatDate(l.startDate)}</td>
        <td>${formatDate(l.endDate)}</td>
        <td>${escapeHtml(l.reason)}</td>
        <td>${formatDate(l.appliedAt)}</td>
        <td><span class="badge ${badgeClass}">${l.status}</span></td>
        <td>${l.reviewComments ? `${escapeHtml(l.reviewComments)} (${escapeHtml(l.reviewedByName || 'Faculty')})` : 'Awaiting review'}</td>
      </tr>`;
    }).join('');
  } catch (err) {
    showToast('Failed to load leave history', 'error');
  }
}

document.getElementById('apply-leave-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const leaveType = document.getElementById('leave-type').value;
  const startDate = document.getElementById('leave-start-date').value;
  const endDate = document.getElementById('leave-end-date').value;
  const reason = document.getElementById('leave-reason').value.trim();

  try {
    await Api.post('/leaves', {
      studentId: currentStudentId,
      leaveType,
      startDate,
      endDate,
      reason
    });
    showToast('Leave request submitted successfully!', 'success');
    closeModal('apply-leave-modal');
    document.getElementById('apply-leave-form').reset();
    loadLeaveData();
    loadDashboardOverview();
  } catch (err) {
    showToast(err.message || 'Failed to submit leave application', 'error');
  }
});

// ==================== 7. GOALS TRACKER ====================
async function loadGoalsData() {
  if (!currentStudentId) return;
  try {
    const res = await Api.get(`/goals/student/${currentStudentId}`);
    const goals = res.data || [];
    const container = document.getElementById('goals-container');

    if (goals.length === 0) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🎯</div><p>No academic goals set yet. Click "Set New Academic Goal" to start tracking!</p></div>';
      return;
    }

    container.innerHTML = goals.map(g => {
      const isDone = g.status === 'ACHIEVED';
      return `<div class="card" style="margin-bottom:0;">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <h4 style="font-size:15px;">${escapeHtml(g.title)}</h4>
            <span class="badge ${isDone ? 'badge-success' : 'badge-primary'}">${g.status}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text-muted); margin-bottom:4px;">
            <span>Current: <strong>${g.currentValue} ${g.unit || ''}</strong></span>
            <span>Target: <strong>${g.targetValue} ${g.unit || ''}</strong></span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${isDone ? 'success' : 'primary'}" style="width:${g.progressPercentage}%;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; font-size:12px; color:var(--text-light);">
            <span>${g.targetDate ? `Deadline: ${formatDate(g.targetDate)}` : 'Self-paced'}</span>
            <button class="btn btn-outline btn-sm" onclick="promptUpdateGoal(${g.id}, ${g.currentValue})">Update Progress</button>
          </div>
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    showToast('Failed to load academic goals', 'error');
  }
}

async function promptUpdateGoal(goalId, currentVal) {
  const newVal = prompt('Enter your updated progress value:', currentVal);
  if (newVal !== null && newVal.trim() !== '') {
    const num = parseFloat(newVal);
    if (!isNaN(num)) {
      try {
        await Api.put(`/goals/${goalId}/progress`, { currentValue: num });
        showToast('Goal progress updated!', 'success');
        loadGoalsData();
      } catch (e) {
        showToast('Failed to update goal', 'error');
      }
    }
  }
}

document.getElementById('add-goal-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('goal-title').value.trim();
  const goalType = document.getElementById('goal-type').value;
  const targetValue = parseFloat(document.getElementById('goal-target').value);
  const currentValue = parseFloat(document.getElementById('goal-current').value || '0');
  const targetDate = document.getElementById('goal-date').value || null;

  try {
    await Api.post('/goals', {
      studentId: currentStudentId,
      title,
      goalType,
      targetValue,
      currentValue,
      targetDate
    });
    showToast('Goal created successfully!', 'success');
    closeModal('add-goal-modal');
    document.getElementById('add-goal-form').reset();
    loadGoalsData();
  } catch (err) {
    showToast(err.message || 'Failed to create goal', 'error');
  }
});

// ==================== 8. ACHIEVEMENTS ====================
async function loadAchievementsData() {
  if (!currentStudentId) return;
  try {
    const res = await Api.get(`/achievements/student/${currentStudentId}`);
    const achievements = res.data || [];
    const tbody = document.getElementById('student-achievements-table-body');

    if (achievements.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No achievements logged yet.</td></tr>';
      return;
    }

    tbody.innerHTML = achievements.map(a => {
      const verifyBadge = a.verified 
        ? `<span class="badge badge-success">✓ Verified by ${escapeHtml(a.verifiedBy || 'Faculty')}</span>`
        : `<span class="badge badge-warning">⏳ Pending Verification</span>`;

      return `<tr>
        <td><span class="badge badge-secondary">${escapeHtml(a.category)}</span></td>
        <td><strong>${escapeHtml(a.title)}</strong></td>
        <td>${escapeHtml(a.description || '-')}</td>
        <td>${formatDate(a.achievementDate)}</td>
        <td>${verifyBadge}</td>
        <td>${a.proofUrl ? `<a href="${escapeHtml(a.proofUrl)}" target="_blank" class="btn btn-outline btn-sm">View Proof ↗</a>` : 'None'}</td>
      </tr>`;
    }).join('');
  } catch (err) {
    showToast('Failed to load achievements', 'error');
  }
}

document.getElementById('add-achievement-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const category = document.getElementById('ach-category').value;
  const title = document.getElementById('ach-title').value.trim();
  const achievementDate = document.getElementById('ach-date').value;
  const description = document.getElementById('ach-desc').value.trim();
  const proofUrl = document.getElementById('ach-proof').value.trim();

  try {
    await Api.post('/achievements', {
      studentId: currentStudentId,
      category,
      title,
      achievementDate,
      description,
      proofUrl
    });
    showToast('Achievement recorded! Awaiting faculty verification.', 'success');
    closeModal('add-achievement-modal');
    document.getElementById('add-achievement-form').reset();
    loadAchievementsData();
  } catch (err) {
    showToast(err.message || 'Failed to submit achievement', 'error');
  }
});

// ==================== 9. NOTICES ====================
async function loadNoticesData() {
  if (!currentStudentId) return;
  try {
    const res = await Api.get(`/notices/student/${currentStudentId}`);
    const notices = res.data || [];
    const container = document.getElementById('notices-list-container');

    if (notices.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📢</div><p>No notices available for your department / year</p></div>';
      return;
    }

    container.innerHTML = notices.map(n => {
      let priorityClass = 'badge-secondary';
      if (n.priority === 'URGENT') priorityClass = 'badge-danger';
      else if (n.priority === 'IMPORTANT') priorityClass = 'badge-warning';

      return `<div class="card" style="margin-bottom:16px;">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge ${priorityClass}">${n.priority}</span>
              <h3 style="font-size:16px; margin:0;">${escapeHtml(n.title)}</h3>
            </div>
            <span style="font-size:12px; color:var(--text-light);">${formatDateTime(n.createdAt)}</span>
          </div>
          <p style="font-size:14px; line-height:1.6; color:var(--text-main); margin-bottom:12px;">${escapeHtml(n.content)}</p>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); border-top:1px solid #f1f5f9; padding-top:8px;">
            <span>Target: <strong>${escapeHtml(n.targetDepartmentName)}</strong> ${n.targetYear ? `(Year ${n.targetYear})` : ''}</span>
            <span>Posted by: <strong>${escapeHtml(n.postedBy || 'Administration')}</strong></span>
          </div>
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    showToast('Failed to load notices', 'error');
  }
}

// ==================== 10. PERFORMANCE ANALYZER ====================
async function loadPerformanceData() {
  if (!currentStudentId) return;
  try {
    const res = await Api.get(`/performance/student/${currentStudentId}`);
    const p = res.data;

    document.getElementById('analyzer-att').textContent = `${p.attendancePercentage}%`;
    document.getElementById('analyzer-marks').textContent = `${p.averageMarksPercentage}%`;
    document.getElementById('analyzer-assign').textContent = `${p.assignmentCompletionPercentage}%`;
    document.getElementById('analyzer-composite').textContent = `${p.overallPerformanceScore} / 100`;

    const badge = document.getElementById('analyzer-overall-badge');
    badge.textContent = `Status: ${p.overallStatus}`;
    badge.className = `badge ${p.statusBadgeClass}`;

    // Recommendations list
    const recContainer = document.getElementById('analyzer-recommendations-list');
    if (p.recommendations && p.recommendations.length > 0) {
      recContainer.innerHTML = p.recommendations.map(r => `
        <div style="background:#f8fafc; border-left:4px solid var(--secondary); padding:12px 16px; border-radius:var(--radius-sm); font-size:14px; color:var(--text-main);">
          💡 ${escapeHtml(r)}
        </div>
      `).join('');
    } else {
      recContainer.innerHTML = '<p style="color:var(--text-muted);">Academic performance is optimal across all indicators.</p>';
    }

    // Strengths
    const strContainer = document.getElementById('analyzer-strengths-list');
    if (p.strengths && p.strengths.length > 0) {
      strContainer.innerHTML = p.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('');
    } else {
      strContainer.innerHTML = '<li>Continuous improvement underway.</li>';
    }

    // Areas for improvement
    const impContainer = document.getElementById('analyzer-improvements-list');
    if (p.areasForImprovement && p.areasForImprovement.length > 0) {
      impContainer.innerHTML = p.areasForImprovement.map(i => `<li>${escapeHtml(i)}</li>`).join('');
    } else {
      impContainer.innerHTML = '<li>No critical academic risks detected at this time.</li>';
    }

  } catch (err) {
    showToast('Failed to analyze student performance', 'error');
  }
}

// Security Helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
