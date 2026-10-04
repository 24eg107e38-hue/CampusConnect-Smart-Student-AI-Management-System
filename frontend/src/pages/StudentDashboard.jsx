import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AiAssistantWidget from '../components/AiAssistantWidget';
import AiStudyPlanModal from '../components/AiStudyPlanModal';
import AiPerformanceExplanationModal from '../components/AiPerformanceExplanationModal';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Student Context & Metrics State
  const [student, setStudent] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [marks, setMarks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [studyPlanOpen, setStudyPlanOpen] = useState(false);
  const [perfExplOpen, setPerfExplOpen] = useState(false);

  // Leave Form
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'MEDICAL', startDate: '', endDate: '', reason: '' });
  const [leaveMsg, setLeaveMsg] = useState('');

  // Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('8.5');

  // Assignment Submission State
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);

  // Achievement Submission State
  const [showAddAchModal, setShowAddAchModal] = useState(false);
  const [achForm, setAchForm] = useState({ title: '', category: 'CERTIFICATION', description: '', proofUrl: '', achievementDate: new Date().toISOString().split('T')[0] });
  const [achSubmitting, setAchSubmitting] = useState(false);

  // Load student profile & records
  useEffect(() => {
    const uid = user?.id || user?.userId;
    if (uid) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const uid = user?.id || user?.userId;
      let s = student;
      if (!s) {
        if (user?.profileId) {
          const sRes = await Api.get(`/students/${user.profileId}`).catch(() => null);
          if (sRes?.data) s = sRes.data;
        }
        if (!s && uid) {
          const sRes = await Api.get(`/students/user/${uid}`).catch(() => null);
          if (sRes?.data) s = sRes.data;
        }
        if (s) setStudent(s);
      }

      const studentId = s?.id || user?.profileId || 1;

      const [dashRes, attRes, marksRes, assignRes, leavesRes, goalsRes, achRes, noticesRes] = await Promise.all([
        Api.get(`/dashboard/student/${studentId}`).catch(() => ({ data: null })),
        Api.get(`/attendance/student/${studentId}/overview`).catch(() => ({ data: null })),
        Api.get(`/marks/student/${studentId}`).catch(() => ({ data: [] })),
        Api.get(`/assignments/student/${studentId}`).catch(() => ({ data: [] })),
        Api.get(`/leaves/student/${studentId}`).catch(() => ({ data: [] })),
        Api.get(`/goals/student/${studentId}`).catch(() => ({ data: [] })),
        Api.get(`/achievements/student/${studentId}`).catch(() => ({ data: [] })),
        Api.get(`/notices/student/${studentId}`).catch(() => ({ data: [] }))
      ]);

      if (dashRes?.data) setDashboardStats(dashRes.data);
      if (attRes?.data) setAttendanceOverview(attRes.data);
      setMarks(marksRes?.data || []);
      setAssignments(assignRes?.data || []);
      setLeaves(leavesRes?.data || []);
      setGoals(goalsRes?.data || []);
      setAchievements(achRes?.data || []);
      setNotices(noticesRes?.data || []);
    } catch (err) {
      console.error('Failed to load student data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await Api.post('/leaves', { ...leaveForm, studentId: student.id });
      setLeaveMsg('Leave application submitted successfully!');
      setLeaveForm({ leaveType: 'MEDICAL', startDate: '', endDate: '', reason: '' });
      const res = await Api.get(`/leaves/student/${student.id}`);
      setLeaves(res.data || []);
      setTimeout(() => setLeaveMsg(''), 4000);
    } catch (err) {
      setLeaveMsg('Error: ' + err.message);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    try {
      const studentId = student?.id || user?.profileId || 1;
      await Api.post('/goals', {
        studentId: studentId,
        title: goalTitle,
        category: 'ACADEMIC',
        targetValue: parseFloat(goalTarget) || 8.5,
        currentValue: dashboardStats?.currentGpa || 7.0
      });
      setGoalTitle('');
      const res = await Api.get(`/goals/student/${studentId}`);
      setGoals(res.data || []);
    } catch (err) {
      alert('Failed to add goal');
    }
  };

  const handleOpenSubmitAssignment = (assignment) => {
    setSubmittingAssignment(assignment);
    setSubmissionText(assignment.studentSubmissionText || '');
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submittingAssignment || !submissionText.trim()) return;
    const studentId = student?.id || user?.profileId || 1;
    try {
      setAssignmentSubmitting(true);
      await Api.post('/assignments/submit', {
        assignmentId: submittingAssignment.id,
        studentId: studentId,
        submissionText: submissionText.trim()
      });
      setSubmittingAssignment(null);
      setSubmissionText('');
      const res = await Api.get(`/assignments/student/${studentId}`);
      setAssignments(res.data || []);
      alert('Coursework solution submitted successfully!');
    } catch (err) {
      alert('Failed to submit assignment: ' + err.message);
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const handleCreateAchievement = async (e) => {
    e.preventDefault();
    if (!achForm.title.trim()) return;
    const studentId = student?.id || user?.profileId || 1;
    try {
      setAchSubmitting(true);
      await Api.post('/achievements', {
        studentId: studentId,
        ...achForm
      });
      setShowAddAchModal(false);
      setAchForm({ title: '', category: 'CERTIFICATION', description: '', proofUrl: '', achievementDate: new Date().toISOString().split('T')[0] });
      const res = await Api.get(`/achievements/student/${studentId}`);
      setAchievements(res.data || []);
      alert('Achievement submitted for faculty verification!');
    } catch (err) {
      alert('Failed to submit achievement: ' + err.message);
    } finally {
      setAchSubmitting(false);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'attendance', label: 'Attendance & Alerts', icon: '📅' },
    { id: 'marks', label: 'Academic Marks', icon: '📝' },
    { id: 'assignments', label: 'Assignments', icon: '📑' },
    { id: 'leaves', label: 'Leave Center', icon: '✉️' },
    { id: 'goals', label: 'Goals & CGPA', icon: '🎯' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'notices', label: 'Campus Notices', icon: '📢' },
  ];

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
        <Navbar title="Student Academic Portal" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="content-body">
          {/* Top Hero Banner with AI Triggers */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '24px' }}>👋</span>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: 0 }}>
                  Welcome back, {student?.fullName || user?.fullName || 'Student'}!
                </h2>
              </div>
              <p style={{ fontSize: '13.5px', color: '#e0e7ff', margin: 0 }}>
                {student?.course || 'Engineering'} | Roll: <strong>{student?.studentId}</strong> | Year {student?.year}
              </p>
            </div>

            {/* AI Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn"
                style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: '700' }}
                onClick={() => setStudyPlanOpen(true)}
              >
                <span>📅</span> Generate AI Study Plan
              </button>
              <button
                className="btn"
                style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                onClick={() => setPerfExplOpen(true)}
              >
                <span>🧠</span> AI Performance Explanation
              </button>
            </div>
          </div>

          {/* Smart Attendance Alert Banner (<75% Warning) */}
          {attendanceOverview?.belowThreshold && (
            <div className="alert-banner danger">
              <span style={{ fontSize: '26px' }}>🚨</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '14.5px' }}>
                  Critical Attendance Warning: {attendanceOverview.overallPercentage}%
                </div>
                <div style={{ fontSize: '13px' }}>
                  {attendanceOverview.alertMessage || 'Your attendance is below the mandatory 75% requirement. Attend upcoming lectures to secure exam eligibility.'}
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setStudyPlanOpen(true)}>
                Build Recovery Plan
              </button>
            </div>
          )}

          {/* Quick Stat Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className={`stat-icon ${attendanceOverview?.belowThreshold ? 'rose' : 'green'}`}>
                {attendanceOverview?.belowThreshold ? '⚠️' : '📊'}
              </div>
              <div className="stat-details">
                <div className="stat-label">Overall Attendance</div>
                <div className="stat-value" style={{ color: attendanceOverview?.belowThreshold ? 'var(--danger)' : 'var(--success)' }}>
                  {attendanceOverview?.overallPercentage ?? 0}%
                </div>
                <div className="stat-subtext">
                  {attendanceOverview?.presentDays} of {attendanceOverview?.totalWorkingDays} sessions attended
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">⭐</div>
              <div className="stat-details">
                <div className="stat-label">Cumulative GPA</div>
                <div className="stat-value">{dashboardStats?.currentGpa ?? '7.5'}</div>
                <div className="stat-subtext">Scale of 10.0</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">📝</div>
              <div className="stat-details">
                <div className="stat-label">Average Marks</div>
                <div className="stat-value">{dashboardStats?.averageMarks ?? '0'}%</div>
                <div className="stat-subtext">Across midterms &amp; finals</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon amber">📑</div>
              <div className="stat-details">
                <div className="stat-label">Pending Assignments</div>
                <div className="stat-value">{dashboardStats?.pendingAssignmentsCount ?? assignments.length}</div>
                <div className="stat-subtext">Coursework deadlines</div>
              </div>
            </div>
          </div>

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* Performance Score Card */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Rule-Based Performance Index</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => setPerfExplOpen(true)}>
                    AI Breakdown →
                  </button>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '18px' }}>
                    <div
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: '800'
                      }}
                    >
                      {dashboardStats?.performance?.overallPerformanceScore ?? 75}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status Standing:</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                        {dashboardStats?.performance?.overallStatus || 'Good'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Weighted: 25% Att, 50% Marks, 25% Coursework
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px' }}>
                    <strong>Key Advice:</strong>{' '}
                    {dashboardStats?.performance?.recommendations?.[0] || 'Maintain balanced study habits and attend labs diligently.'}
                  </div>
                </div>
              </div>

              {/* Recent Targeted Notices */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Department Notices &amp; Broadcasts</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('notices')}>
                    View All
                  </button>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {notices.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 14px',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${n.priority === 'URGENT' ? 'var(--danger)' : 'var(--primary)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '13.5px' }}>{n.title}</span>
                        <span className={`badge ${n.priority === 'URGENT' ? 'badge-danger' : 'badge-primary'}`}>
                          {n.priority}
                        </span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-main)', marginTop: '4px', margin: '4px 0 0 0' }}>
                        {n.content}
                      </p>
                    </div>
                  ))}
                  {notices.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No current notices.</p>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Subject-Wise Attendance Breakdown</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Total Classes</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceOverview?.subjectAttendance?.map((sub) => (
                        <tr key={sub.subjectId}>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{sub.subjectCode}</td>
                          <td>{sub.subjectName}</td>
                          <td>{sub.totalClasses}</td>
                          <td>{sub.presentClasses}</td>
                          <td>{sub.absentClasses}</td>
                          <td style={{ fontWeight: '700', color: sub.belowThreshold ? 'var(--danger)' : 'var(--success)' }}>
                            {sub.percentage}%
                          </td>
                          <td>
                            <span className={`badge ${sub.belowThreshold ? 'badge-danger' : 'badge-success'}`}>
                              {sub.belowThreshold ? '🚨 Warning (<75%)' : '✓ Good'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MARKS */}
          {activeTab === 'marks' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Semester Examination Scores</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Title</th>
                        <th>Internal (25)</th>
                        <th>Midterm (25)</th>
                        <th>Final (50)</th>
                        <th>Total Score</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{m.subjectCode}</td>
                          <td>{m.subjectName}</td>
                          <td>{m.internalMarks}</td>
                          <td>{m.midTermMarks}</td>
                          <td>{m.finalExamMarks}</td>
                          <td style={{ fontWeight: '700' }}>{m.totalMarks} ({m.percentage}%)</td>
                          <td>
                            <span className="badge badge-primary">{m.grade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Course Assignments &amp; Submissions</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Track deadlines, submit coursework solutions, and view faculty marks &amp; feedback.
                  </p>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: '18px 20px',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{a.title}</h4>
                          <span className="badge badge-primary">{a.subjectCode} - {a.subjectName}</span>
                        </div>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-main)', margin: '8px 0 6px 0' }}>{a.description}</p>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          <span>📅 Due Date: <strong>{a.dueDate}</strong></span>
                          <span>🎯 Max Marks: <strong>{a.maxMarks}</strong></span>
                          {a.facultyName && <span>👨‍🏫 Faculty: <strong>{a.facultyName}</strong></span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        {a.submissionStatus === 'GRADED' ? (
                          <span className="badge badge-success">✓ Graded ({a.marksObtained} / {a.maxMarks})</span>
                        ) : a.submissionStatus === 'SUBMITTED' ? (
                          <span className="badge badge-primary">⏳ Submitted (Awaiting Grade)</span>
                        ) : (
                          <span className="badge badge-warning">⚠️ Pending Submission</span>
                        )}

                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenSubmitAssignment(a)}
                        >
                          {a.submissionStatus === 'SUBMITTED' || a.submissionStatus === 'GRADED' ? 'Edit Submission' : 'Submit Coursework'}
                        </button>
                      </div>
                    </div>

                    {/* Feedback or submission note if submitted */}
                    {a.studentSubmissionText && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                        <strong>Your Submission:</strong> {a.studentSubmissionText}
                        {a.feedback && (
                          <div style={{ marginTop: '6px', color: 'var(--primary)', fontWeight: '600' }}>
                            <strong>Faculty Feedback:</strong> {a.feedback}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {assignments.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                    No coursework assignments posted for your current semester.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LEAVES */}
          {activeTab === 'leaves' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Apply for Academic / Medical Leave</h3>
                </div>
                <div className="card-body">
                  {leaveMsg && <div style={{ marginBottom: '14px', color: 'var(--primary)', fontWeight: '600' }}>{leaveMsg}</div>}
                  <form onSubmit={handleApplyLeave}>
                    <div className="form-group">
                      <label className="form-label">Leave Category</label>
                      <select
                        className="form-control"
                        value={leaveForm.leaveType}
                        onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                      >
                        <option value="MEDICAL">Medical Leave</option>
                        <option value="ACADEMIC">Academic / Conference</option>
                        <option value="PERSONAL">Personal / Emergency</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={leaveForm.startDate}
                          onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={leaveForm.endDate}
                          onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Reason &amp; Documentation</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Detailed explanation of absence..."
                        value={leaveForm.reason}
                        onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      Submit Leave Request
                    </button>
                  </form>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Leave History</h3>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {leaves.map((l) => (
                    <div key={l.id} style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>{l.leaveType}</span>
                        <span className={`badge ${l.status === 'APPROVED' ? 'badge-success' : l.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                          {l.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {l.startDate} to {l.endDate}
                      </div>
                      <p style={{ fontSize: '12.5px', marginTop: '4px', margin: '4px 0 0 0' }}>{l.reason}</p>
                    </div>
                  ))}
                  {leaves.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No leave history.</p>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: GOALS */}
          {activeTab === 'goals' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Academic CGPA Objectives</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="New Goal: e.g. Achieve 9.0 CGPA in Database Systems"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    style={{ maxWidth: '120px' }}
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    + Set Goal
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {goals.map((g) => (
                    <div key={g.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
                        <span>{g.title}</span>
                        <span>{g.progressPercentage}%</span>
                      </div>
                      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${g.progressPercentage}%`, background: 'var(--primary)', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="card-title">Verified Student Achievements &amp; Awards</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Certificates, hackathon wins, research papers, and technical distinctions.
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddAchModal(true)}>
                  + Add Achievement
                </button>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {achievements.map((ach) => (
                  <div key={ach.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🏆</span>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{ach.title}</div>
                        <span className="badge badge-primary">{ach.category}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '4px' }}>{ach.description}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Achieved on: {ach.achievementDate} {ach.proofUrl && <>| <a href={ach.proofUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View Proof</a></>}
                      </div>
                    </div>
                    <span className={`badge ${ach.verified ? 'badge-success' : 'badge-warning'}`}>
                      {ach.verified ? '✓ Verified' : '⏳ Pending Verification'}
                    </span>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                    No achievements submitted yet. Click '+ Add Achievement' to record certifications and honors.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: NOTICES */}
          {activeTab === 'notices' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Campus &amp; Department Notice Board</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {notices.map((n) => (
                  <div key={n.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{n.title}</h4>
                      <span className={`badge ${n.priority === 'URGENT' ? 'badge-danger' : 'badge-primary'}`}>{n.priority}</span>
                    </div>
                    <p style={{ fontSize: '13px', marginTop: '6px' }}>{n.content}</p>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      Target: {n.targetDepartmentName || 'All Campus'}
                    </div>
                  </div>
                ))}
                {notices.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No active notices at this time.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Submit Assignment Modal */}
      {submittingAssignment && (
        <div className="modal-overlay" onClick={() => setSubmittingAssignment(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Submit Coursework Solution</h3>
              <button className="modal-close" onClick={() => setSubmittingAssignment(null)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitAssignment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Assignment</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled
                    value={`${submittingAssignment.title} (${submittingAssignment.subjectCode || ''})`}
                    style={{ background: '#f1f5f9' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Solution / Submission Notes *</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Enter your GitHub repository link, Google Drive solution URL, or write your solution text here..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSubmittingAssignment(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={assignmentSubmitting}>
                  {assignmentSubmitting ? 'Submitting...' : 'Submit Coursework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {showAddAchModal && (
        <div className="modal-overlay" onClick={() => setShowAddAchModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Submit Academic / Extracurricular Achievement</h3>
              <button className="modal-close" onClick={() => setShowAddAchModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateAchievement}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Achievement Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. AWS Certified Solutions Architect / 1st Place Hackathon"
                    value={achForm.title}
                    onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-control"
                      value={achForm.category}
                      onChange={(e) => setAchForm({ ...achForm, category: e.target.value })}
                    >
                      <option value="CERTIFICATION">Certification</option>
                      <option value="HACKATHON">Hackathon</option>
                      <option value="COMPETITION">Competition</option>
                      <option value="SPORTS">Sports</option>
                      <option value="PAPER_PRESENTATION">Paper Presentation</option>
                      <option value="WORKSHOP">Workshop</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Achieved *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={achForm.achievementDate}
                      onChange={(e) => setAchForm({ ...achForm, achievementDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description / Summary</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Details about the accomplishment or issuing body..."
                    value={achForm.description}
                    onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Proof / Verification URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/certificate/123"
                    value={achForm.proofUrl}
                    onChange={(e) => setAchForm({ ...achForm, proofUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddAchModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={achSubmitting}>
                  {achSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive AI Power Tools */}
      <AiAssistantWidget studentId={student?.id || 1} />
      <AiStudyPlanModal isOpen={studyPlanOpen} onClose={() => setStudyPlanOpen(false)} studentId={student?.id || 1} />
      <AiPerformanceExplanationModal isOpen={perfExplOpen} onClose={() => setPerfExplOpen(false)} studentId={student?.id || 1} />
    </div>
  );
}
