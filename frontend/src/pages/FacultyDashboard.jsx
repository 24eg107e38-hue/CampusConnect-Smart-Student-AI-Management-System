import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core Data State
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Active Action States
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showCreateNotice, setShowCreateNotice] = useState(false);
  const [activeAssignmentForGrading, setActiveAssignmentForGrading] = useState(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [gradingLoading, setGradingLoading] = useState(false);

  // Forms State
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subjectId: '',
    departmentId: '',
    year: 3,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxMarks: 10
  });

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    targetDepartmentId: '',
    targetYear: 0
  });

  // Attendance Marking State
  const [attSubjectId, setAttSubjectId] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' }
  const [attSuccessMsg, setAttSuccessMsg] = useState('');

  // Marks Entry State
  const [marksForm, setMarksForm] = useState({
    studentId: '',
    subjectId: '',
    semester: 5,
    internalMarks: 18,
    assignmentMarks: 8,
    midExamMarks: 24,
    finalExamMarks: 34
  });
  const [marksMsg, setMarksMsg] = useState('');

  // Load Initial Faculty Data
  useEffect(() => {
    loadFacultyData();
  }, []);

  const loadFacultyData = async () => {
    try {
      setLoading(true);
      const [dashRes, studRes, leavesRes, assignRes, subjRes, notRes] = await Promise.all([
        Api.get('/dashboard/faculty').catch(() => ({ data: null })),
        Api.get('/students').catch(() => ({ data: [] })),
        Api.get('/leaves').catch(() => ({ data: [] })),
        Api.get('/assignments').catch(() => ({ data: [] })),
        Api.get('/subjects').catch(() => ({ data: [] })),
        Api.get('/notices').catch(() => ({ data: [] }))
      ]);

      if (dashRes?.data) setStats(dashRes.data);
      const studList = studRes?.data || [];
      setStudents(studList);
      setLeaves(leavesRes?.data || []);
      setAssignments(assignRes?.data || []);
      const subjList = subjRes?.data || [];
      setSubjects(subjList);
      setNotices(notRes?.data || []);

      if (subjList.length > 0) {
        setAttSubjectId(subjList[0].id.toString());
        setNewAssignment((prev) => ({ ...prev, subjectId: subjList[0].id.toString() }));
        setMarksForm((prev) => ({
          ...prev,
          subjectId: subjList[0].id.toString(),
          studentId: studList[0]?.id?.toString() || ''
        }));
      }

      // Initialize default attendance as all PRESENT
      const initialAtt = {};
      studList.forEach((s) => {
        initialAtt[s.id] = 'PRESENT';
      });
      setAttendanceMap(initialAtt);

    } catch (err) {
      console.error('Failed to load faculty portal data', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Leave Approval / Rejection
  const handleReviewLeave = async (leaveId, status) => {
    const comments = prompt(`Enter comments for ${status.toLowerCase()} leave request:`, `Leave request ${status.toLowerCase()} by faculty advisor.`);
    if (comments !== null) {
      try {
        await Api.put(`/leaves/${leaveId}/status`, { status, comments });
        const res = await Api.get('/leaves');
        setLeaves(res.data || []);
        alert(`Leave request marked as ${status}`);
      } catch (err) {
        alert('Failed to update leave status: ' + err.message);
      }
    }
  };

  // 2. Attendance Submission
  const handleToggleStudentAttendance = (studentId) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'ABSENT' ? 'PRESENT' : 'ABSENT'
    }));
  };

  const handleMarkAllAttendance = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!attSubjectId) {
      alert('Please select a subject.');
      return;
    }

    try {
      const payload = {
        subjectId: parseInt(attSubjectId),
        attendanceDate: attDate,
        students: students.map((s) => ({
          studentId: s.id,
          status: attendanceMap[s.id] || 'PRESENT',
          remarks: attendanceMap[s.id] === 'ABSENT' ? 'Recorded absent by instructor' : 'Present'
        }))
      };

      await Api.post('/attendance/mark', payload);
      setAttSuccessMsg('Attendance marked successfully for ' + attDate + '!');
      setTimeout(() => setAttSuccessMsg(''), 5000);
      // Reload stats
      const [dashRes, studRes] = await Promise.all([
        Api.get('/dashboard/faculty'),
        Api.get('/students')
      ]);
      if (dashRes?.data) setStats(dashRes.data);
      if (studRes?.data) setStudents(studRes.data);
    } catch (err) {
      alert('Failed to save attendance: ' + err.message);
    }
  };

  // 3. Marks Entry Submission
  const handleSubmitMarks = async (e) => {
    e.preventDefault();
    if (!marksForm.studentId || !marksForm.subjectId) {
      alert('Please select both a student and subject.');
      return;
    }

    try {
      await Api.post('/marks', {
        studentId: parseInt(marksForm.studentId),
        subjectId: parseInt(marksForm.subjectId),
        semester: parseInt(marksForm.semester),
        internalMarks: parseFloat(marksForm.internalMarks) || 0,
        assignmentMarks: parseFloat(marksForm.assignmentMarks) || 0,
        midExamMarks: parseFloat(marksForm.midExamMarks) || 0,
        finalExamMarks: parseFloat(marksForm.finalExamMarks) || 0
      });

      setMarksMsg('Marks successfully saved and student GPA recalculated!');
      setTimeout(() => setMarksMsg(''), 5000);
      const studRes = await Api.get('/students');
      if (studRes?.data) setStudents(studRes.data);
    } catch (err) {
      alert('Failed to save marks: ' + err.message);
    }
  };

  // 4. Create Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title.trim() || !newAssignment.subjectId) {
      alert('Please enter a title and select a subject.');
      return;
    }

    try {
      const selectedSubj = subjects.find((s) => s.id === parseInt(newAssignment.subjectId));
      const deptId = selectedSubj?.department?.id || user?.departmentId || 1;

      await Api.post('/assignments', {
        ...newAssignment,
        subjectId: parseInt(newAssignment.subjectId),
        departmentId: deptId,
        year: parseInt(newAssignment.year),
        maxMarks: parseInt(newAssignment.maxMarks)
      });

      setShowCreateAssignment(false);
      setNewAssignment({
        title: '',
        description: '',
        subjectId: subjects[0]?.id?.toString() || '',
        departmentId: '',
        year: 3,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        maxMarks: 10
      });
      const res = await Api.get('/assignments');
      setAssignments(res.data || []);
      alert('Assignment created successfully!');
    } catch (err) {
      alert('Failed to create assignment: ' + err.message);
    }
  };

  // 5. Open Submissions & Grading Modal
  const handleOpenSubmissions = async (assignment) => {
    setActiveAssignmentForGrading(assignment);
    try {
      setGradingLoading(true);
      const res = await Api.get(`/assignments/${assignment.id}/submissions`);
      setAssignmentSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to load submissions', err);
      setAssignmentSubmissions([]);
    } finally {
      setGradingLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId, marks, feedback) => {
    try {
      await Api.put(`/assignments/submissions/${submissionId}/grade`, {
        marksObtained: parseFloat(marks),
        feedback: feedback || 'Satisfactory coursework.'
      });
      // Refresh submissions
      if (activeAssignmentForGrading) {
        const res = await Api.get(`/assignments/${activeAssignmentForGrading.id}/submissions`);
        setAssignmentSubmissions(res.data || []);
      }
      alert('Submission graded successfully!');
    } catch (err) {
      alert('Failed to grade submission: ' + err.message);
    }
  };

  // 6. Create Notice
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) return;
    try {
      await Api.post('/notices', {
        title: newNotice.title,
        content: newNotice.content,
        priority: newNotice.priority,
        targetDepartmentId: newNotice.targetDepartmentId ? parseInt(newNotice.targetDepartmentId) : null,
        targetYear: parseInt(newNotice.targetYear) || 0,
        postedBy: user?.fullName || 'Faculty'
      });
      setShowCreateNotice(false);
      setNewNotice({ title: '', content: '', priority: 'NORMAL', targetDepartmentId: '', targetYear: 0 });
      const res = await Api.get('/notices');
      setNotices(res.data || []);
      alert('Notice broadcasted successfully!');
    } catch (err) {
      alert('Failed to post notice: ' + err.message);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Faculty Overview', icon: '📊' },
    { id: 'students', label: 'Student Directory', icon: '👥' },
    { id: 'attendance', label: 'Take Attendance', icon: '📅' },
    { id: 'marks', label: 'Marks Entry', icon: '📝' },
    { id: 'assignments', label: 'Assignments & Grading', icon: '📑' },
    { id: 'leaves', label: 'Leave Requests', icon: '✉️' },
    { id: 'notices', label: 'Notices Board', icon: '📢' },
    { id: 'analytics', label: 'Academic Analytics', icon: '📈' },
  ];

  const filteredStudents = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const atRiskStudents = students.filter((s) => (s.attendancePercentage || 0) < 75);

  return (
    <div className="app-layout">
      <Sidebar
        items={sidebarItems}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-wrapper">
        <Navbar title="Faculty Instructor Portal" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="content-body">
          {/* Header Banner */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              color: 'white',
              padding: '24px 28px',
              border: 'none',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: 0 }}>
                  Welcome back, {stats?.facultyName || user?.fullName || 'Faculty Member'}!
                </h2>
                <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  {stats?.departmentName || 'Academic Department'} | Faculty ID: {stats?.facultyId || 'FAC001'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setActiveTab('attendance')}>
                  📅 Take Attendance
                </button>
                <button
                  className="btn"
                  style={{ background: '#3b82f6', color: '#fff', fontWeight: '600' }}
                  onClick={() => setShowCreateAssignment(true)}
                >
                  + New Assignment
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">👥</div>
              <div className="stat-details">
                <div className="stat-label">Enrolled Students</div>
                <div className="stat-value">{stats?.totalStudents ?? students.length}</div>
                <div className="stat-subtext">Department batch roster</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">📊</div>
              <div className="stat-details">
                <div className="stat-label">Average Attendance</div>
                <div className="stat-value">{stats?.averageAttendance ?? 85}%</div>
                <div className="stat-subtext">Classroom lecture aggregate</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon rose">🚨</div>
              <div className="stat-details">
                <div className="stat-label">Below 75% Attendance</div>
                <div className="stat-value" style={{ color: 'var(--danger)' }}>
                  {stats?.studentsBelow75Count ?? atRiskStudents.length}
                </div>
                <div className="stat-subtext">Requires immediate intervention</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon amber">✉️</div>
              <div className="stat-details">
                <div className="stat-label">Pending Leave Requests</div>
                <div className="stat-value">{leaves.filter((l) => l.status === 'PENDING').length}</div>
                <div className="stat-subtext">Awaiting faculty sign-off</div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="card-title">Pending Leave Requests</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('leaves')}>View All</button>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {leaves.filter((l) => l.status === 'PENDING').slice(0, 4).map((l) => (
                    <div key={l.id} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{l.studentName} ({l.studentRollNo})</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.leaveType}: {l.reason} ({l.startDate} to {l.endDate})</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleReviewLeave(l.id, 'APPROVED')}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReviewLeave(l.id, 'REJECTED')}>Reject</button>
                      </div>
                    </div>
                  ))}
                  {leaves.filter((l) => l.status === 'PENDING').length === 0 && (
                    <p style={{ color: 'var(--text-muted)' }}>No pending leave applications.</p>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="card-title">Coursework Assignments</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowCreateAssignment(true)}>+ New</button>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {assignments.slice(0, 4).map((a) => (
                    <div key={a.id} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{a.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Course: {a.subjectName} ({a.subjectCode})</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-warning">Due: {a.dueDate}</span>
                        <button className="btn btn-outline btn-sm" onClick={() => handleOpenSubmissions(a)}>
                          Grade
                        </button>
                      </div>
                    </div>
                  ))}
                  {assignments.length === 0 && (
                    <p style={{ color: 'var(--text-muted)' }}>No active assignments posted.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: STUDENTS ROSTER */}
          {/* ============================================================== */}
          {activeTab === 'students' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 className="card-title">Enrolled Students Roster</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                    Monitor individual attendance records and alert status.
                  </p>
                </div>
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: '280px', padding: '6px 12px', fontSize: '13px' }}
                  placeholder="🔍 Filter by name or roll..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Attendance</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{s.studentId}</td>
                          <td style={{ fontWeight: '600' }}>{s.fullName}</td>
                          <td>{s.departmentName}</td>
                          <td>Year {s.year}</td>
                          <td style={{ fontWeight: '700', color: (s.attendancePercentage || 0) < 75 ? 'var(--danger)' : 'var(--success)' }}>
                            {s.attendancePercentage ?? 0}%
                          </td>
                          <td>
                            <span className={`badge ${(s.attendancePercentage || 0) < 75 ? 'badge-danger' : 'badge-success'}`}>
                              {(s.attendancePercentage || 0) < 75 ? '🚨 At-Risk (<75%)' : '✓ Good Standing'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setMarksForm((prev) => ({ ...prev, studentId: s.id.toString() }));
                                setActiveTab('marks');
                              }}
                            >
                              Enter Marks
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: ATTENDANCE MARKER */}
          {/* ============================================================== */}
          {activeTab === 'attendance' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Daily Classroom Attendance Marker</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Record session attendance for lecture credits and alert generation.
                  </p>
                </div>
              </div>
              <div className="card-body">
                {attSuccessMsg && (
                  <div className="alert-banner" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46', marginBottom: '18px' }}>
                    <span>✅</span> {attSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleSubmitAttendance}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Course Subject *</label>
                      <select
                        className="form-control"
                        value={attSubjectId}
                        onChange={(e) => setAttSubjectId(e.target.value)}
                        required
                      >
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.code} - {sub.name} (Sem {sub.semester})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Attendance Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={attDate}
                        onChange={(e) => setAttDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => handleMarkAllAttendance('PRESENT')}>
                        Mark All Present
                      </button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => handleMarkAllAttendance('ABSENT')}>
                        Mark All Absent
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Roll Number</th>
                          <th>Student Name</th>
                          <th>Current Attendance %</th>
                          <th>Session Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => {
                          const isPresent = (attendanceMap[s.id] || 'PRESENT') === 'PRESENT';
                          return (
                            <tr key={s.id}>
                              <td style={{ fontWeight: '700' }}>{s.studentId}</td>
                              <td>{s.fullName}</td>
                              <td>{s.attendancePercentage ?? 75}%</td>
                              <td>
                                <button
                                  type="button"
                                  className={`btn btn-sm ${isPresent ? 'btn-success' : 'btn-danger'}`}
                                  onClick={() => handleToggleStudentAttendance(s.id)}
                                >
                                  {isPresent ? '✓ PRESENT' : '✗ ABSENT'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }}>
                    💾 Save Session Attendance
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: MARKS ENTRY */}
          {/* ============================================================== */}
          {activeTab === 'marks' && (
            <div className="card" style={{ maxWidth: '780px' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Continuous &amp; End-Semester Marks Entry</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Enter Internal (20), Assignment (10), Mid Exam (30), and Final Exam (40) scores.
                  </p>
                </div>
              </div>
              <div className="card-body">
                {marksMsg && (
                  <div className="alert-banner" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46', marginBottom: '18px' }}>
                    <span>✅</span> {marksMsg}
                  </div>
                )}

                <form onSubmit={handleSubmitMarks}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Student *</label>
                      <select
                        className="form-control"
                        value={marksForm.studentId}
                        onChange={(e) => setMarksForm({ ...marksForm, studentId: e.target.value })}
                        required
                      >
                        <option value="">-- Choose Student --</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.studentId} - {s.fullName} ({s.departmentName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subject Course *</label>
                      <select
                        className="form-control"
                        value={marksForm.subjectId}
                        onChange={(e) => setMarksForm({ ...marksForm, subjectId: e.target.value })}
                        required
                      >
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.code} - {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Internal (Max 20)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        className="form-control"
                        value={marksForm.internalMarks}
                        onChange={(e) => setMarksForm({ ...marksForm, internalMarks: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Assignment (Max 10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        className="form-control"
                        value={marksForm.assignmentMarks}
                        onChange={(e) => setMarksForm({ ...marksForm, assignmentMarks: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Mid Exam (Max 30)</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="0.5"
                        className="form-control"
                        value={marksForm.midExamMarks}
                        onChange={(e) => setMarksForm({ ...marksForm, midExamMarks: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Final Exam (Max 40)</label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        className="form-control"
                        value={marksForm.finalExamMarks}
                        onChange={(e) => setMarksForm({ ...marksForm, finalExamMarks: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '20px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700' }}>
                      Calculated Total Marks: {(parseFloat(marksForm.internalMarks) || 0) + (parseFloat(marksForm.assignmentMarks) || 0) + (parseFloat(marksForm.midExamMarks) || 0) + (parseFloat(marksForm.finalExamMarks) || 0)} / 100
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                    💾 Save Student Marks
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: ASSIGNMENTS & GRADING */}
          {/* ============================================================== */}
          {activeTab === 'assignments' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="card-title">Department Assignments &amp; Coursework</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Create coursework, review student submissions, and assign grades &amp; feedback.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateAssignment(true)}>
                  + Create Assignment
                </button>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: '18px 20px',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{a.title}</h4>
                        <span className="badge badge-primary">{a.subjectCode} - {a.subjectName}</span>
                      </div>
                      <p style={{ fontSize: '13.5px', margin: '6px 0', color: 'var(--text-main)' }}>{a.description}</p>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', gap: '14px' }}>
                        <span>📅 Due: <strong>{a.dueDate}</strong></span>
                        <span>🎯 Max Marks: <strong>{a.maxMarks}</strong></span>
                        <span>📥 Total Submissions: <strong>{a.totalSubmissions || 0}</strong></span>
                      </div>
                    </div>

                    <button className="btn btn-outline" onClick={() => handleOpenSubmissions(a)}>
                      👁️ View Submissions ({a.totalSubmissions || 0})
                    </button>
                  </div>
                ))}

                {assignments.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                    No coursework assignments posted yet. Click '+ Create Assignment' to start.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: LEAVE REQUESTS */}
          {/* ============================================================== */}
          {activeTab === 'leaves' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Student Leave Review Portal</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Roll No</th>
                        <th>Category</th>
                        <th>Dates</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Review Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((l) => (
                        <tr key={l.id}>
                          <td style={{ fontWeight: '600' }}>{l.studentName}</td>
                          <td>{l.studentRollNo}</td>
                          <td><span className="badge badge-primary">{l.leaveType}</span></td>
                          <td>{l.startDate} to {l.endDate}</td>
                          <td>{l.reason}</td>
                          <td>
                            <span className={`badge ${l.status === 'APPROVED' ? 'badge-success' : l.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                              {l.status}
                            </span>
                          </td>
                          <td>
                            {l.status === 'PENDING' ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="btn btn-success btn-sm" onClick={() => handleReviewLeave(l.id, 'APPROVED')}>Approve</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleReviewLeave(l.id, 'REJECTED')}>Reject</button>
                              </div>
                            ) : (
                              <small style={{ color: 'var(--text-muted)' }}>{l.reviewComments || 'Reviewed'}</small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: NOTICES */}
          {/* ============================================================== */}
          {activeTab === 'notices' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="card-title">Campus &amp; Department Notice Board</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Publish class announcements, assignment updates, or event reminders.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateNotice(true)}>
                  + Broadcast Notice
                </button>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {notices.map((n) => (
                  <div key={n.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{n.title}</h4>
                      <span className={`badge ${n.priority === 'URGENT' ? 'badge-danger' : 'badge-primary'}`}>{n.priority}</span>
                    </div>
                    <p style={{ fontSize: '13px', margin: '8px 0' }}>{n.content}</p>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Target: {n.targetDepartmentName || 'All Departments'} | Posted By: {n.postedBy || 'Faculty'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 8: ACADEMIC ANALYTICS */}
          {/* ============================================================== */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">🚨 At-Risk Student Intervention Watchlist</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Students with attendance below 75% who are currently in jeopardy of exam debarment.
                  </p>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Student Name</th>
                          <th>Current Attendance</th>
                          <th>Shortfall</th>
                          <th>Status Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atRiskStudents.map((s) => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: '700', color: 'var(--danger)' }}>{s.studentId}</td>
                            <td style={{ fontWeight: '600' }}>{s.fullName}</td>
                            <td style={{ fontWeight: '700', color: 'var(--danger)' }}>{s.attendancePercentage}%</td>
                            <td style={{ color: 'var(--danger)' }}>
                              {(75 - (s.attendancePercentage || 0)).toFixed(1)}% below minimum
                            </td>
                            <td>
                              <span className="badge badge-danger">Immediate Academic Counseling Required</span>
                            </td>
                          </tr>
                        ))}
                        {atRiskStudents.length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '24px 0', color: 'var(--success)' }}>
                              ✓ All department students currently satisfy the 75% attendance threshold!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================== CREATE ASSIGNMENT MODAL ==================== */}
      {showCreateAssignment && (
        <div className="modal-overlay" onClick={() => setShowCreateAssignment(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Coursework Assignment</h3>
              <button className="modal-close" onClick={() => setShowCreateAssignment(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateAssignment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Assignment Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Distributed Consensus Implementation"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Course *</label>
                  <select
                    className="form-control"
                    value={newAssignment.subjectId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, subjectId: e.target.value })}
                    required
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.name} (Year {sub.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Marks</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      className="form-control"
                      value={newAssignment.maxMarks}
                      onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assignment Instructions &amp; Specifications</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Provide details, deliverables, repository requirements..."
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateAssignment(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== VIEW SUBMISSIONS & GRADE MODAL ==================== */}
      {activeAssignmentForGrading && (
        <div className="modal-overlay" onClick={() => setActiveAssignmentForGrading(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Submissions: {activeAssignmentForGrading.title}</h3>
              <button className="modal-close" onClick={() => setActiveAssignmentForGrading(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {gradingLoading ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>Loading student submissions...</div>
              ) : assignmentSubmissions.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
                  No students have submitted coursework for this assignment yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {assignmentSubmissions.map((sub) => (
                    <div key={sub.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>
                          {sub.studentName} ({sub.studentRollNo})
                        </div>
                        <span className={`badge ${sub.status === 'GRADED' ? 'badge-success' : 'badge-warning'}`}>
                          {sub.status === 'GRADED' ? `Graded: ${sub.marksObtained} / ${activeAssignmentForGrading.maxMarks}` : 'Pending Grading'}
                        </span>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '13px', background: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <strong>Submission Notes / Link:</strong> {sub.submissionText}
                      </div>

                      {/* Grading Controls */}
                      <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={activeAssignmentForGrading.maxMarks}
                          placeholder={`Marks (/${activeAssignmentForGrading.maxMarks})`}
                          defaultValue={sub.marksObtained || ''}
                          id={`marks-input-${sub.id}`}
                          className="form-control"
                          style={{ maxWidth: '140px' }}
                        />
                        <input
                          type="text"
                          placeholder="Feedback comments..."
                          defaultValue={sub.feedback || ''}
                          id={`feedback-input-${sub.id}`}
                          className="form-control"
                          style={{ flex: 1 }}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            const marks = document.getElementById(`marks-input-${sub.id}`)?.value;
                            const feedback = document.getElementById(`feedback-input-${sub.id}`)?.value;
                            if (marks !== undefined && marks !== '') {
                              handleGradeSubmission(sub.id, marks, feedback);
                            } else {
                              alert('Please enter a marks value.');
                            }
                          }}
                        >
                          Save Grade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setActiveAssignmentForGrading(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== BROADCAST NOTICE MODAL ==================== */}
      {showCreateNotice && (
        <div className="modal-overlay" onClick={() => setShowCreateNotice(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Broadcast Notice to Students</h3>
              <button className="modal-close" onClick={() => setShowCreateNotice(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateNotice}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Notice Headline *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Mid-term Exam Schedule Announced"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control"
                      value={newNotice.priority}
                      onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="IMPORTANT">Important</option>
                      <option value="URGENT">Urgent Alert</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Year (0 = All)</label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      className="form-control"
                      value={newNotice.targetYear}
                      onChange={(e) => setNewNotice({ ...newNotice, targetYear: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notice Message Details *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Write announcement body..."
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateNotice(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Broadcast Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
