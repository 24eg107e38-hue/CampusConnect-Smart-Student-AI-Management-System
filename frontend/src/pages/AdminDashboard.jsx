import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [notices, setNotices] = useState([]);

  // Modals state
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);

  // Forms
  const [facForm, setFacForm] = useState({ facultyId: '', fullName: '', email: '', departmentId: '', designation: 'Assistant Professor', qualification: 'Ph.D.', specialization: '', password: 'Faculty@123' });
  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '' });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [dashRes, studRes, facRes, deptRes, userRes, noticeRes] = await Promise.all([
        Api.get('/dashboard/admin'),
        Api.get('/students'),
        Api.get('/faculty'),
        Api.get('/departments'),
        Api.get('/admin/users'),
        Api.get('/notices')
      ]);

      setStats(dashRes.data);
      setStudents(studRes.data || []);
      setFaculty(facRes.data || []);
      setDepartments(deptRes.data || []);
      setUsers(userRes.data || []);
      setNotices(noticeRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await Api.put(`/admin/users/${userId}/toggle-status`, {});
      const res = await Api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      await Api.post('/faculty', {
        ...facForm,
        departmentId: parseInt(facForm.departmentId) || departments[0]?.id || 1
      });
      setShowAddFaculty(false);
      setFacForm({ facultyId: '', fullName: '', email: '', departmentId: '', designation: 'Assistant Professor', qualification: 'Ph.D.', specialization: '', password: 'Faculty@123' });
      const res = await Api.get('/faculty');
      setFaculty(res.data || []);
      alert('Faculty member created successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      await Api.post('/departments', deptForm);
      setShowAddDept(false);
      setDeptForm({ code: '', name: '', description: '' });
      const res = await Api.get('/departments');
      setDepartments(res.data || []);
      alert('Department created successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Students Roster', icon: '🎓' },
    { id: 'faculty', label: 'Faculty Staff', icon: '👨‍🏫' },
    { id: 'departments', label: 'Departments', icon: '🏛️' },
    { id: 'users', label: 'User Security', icon: '🔐' },
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
        <Navbar title="Administrator Command Center" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="content-body">
          {/* Header */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: 'white',
              padding: '24px 28px',
              border: 'none',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: 0 }}>
                  Institutional Operations &amp; Administration
                </h2>
                <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0 }}>
                  Real-time campus-wide operational metrics, security accounts, and departmental allocations.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" onClick={() => setShowAddFaculty(true)}>
                  + Add Faculty
                </button>
                <button className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => setShowAddDept(true)}>
                  + Add Department
                </button>
              </div>
            </div>
          </div>

          {/* Institutional Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">👥</div>
              <div className="stat-details">
                <div className="stat-label">Total Students</div>
                <div className="stat-value">{stats?.totalStudents ?? students.length}</div>
                <div className="stat-subtext">Active campus enrollments</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">👨‍🏫</div>
              <div className="stat-details">
                <div className="stat-label">Faculty Staff</div>
                <div className="stat-value">{stats?.totalFaculty ?? faculty.length}</div>
                <div className="stat-subtext">Teaching &amp; research staff</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon emerald">🏛️</div>
              <div className="stat-details">
                <div className="stat-label">Academic Departments</div>
                <div className="stat-value">{stats?.totalDepartments ?? departments.length}</div>
                <div className="stat-subtext">Active faculties</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">🔐</div>
              <div className="stat-details">
                <div className="stat-label">Active User Accounts</div>
                <div className="stat-value">{stats?.totalActiveUsers ?? users.length}</div>
                <div className="stat-subtext">Portal credentials</div>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Department Attendance Health</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {departments.map((d) => (
                      <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontWeight: '600', fontSize: '13.5px' }}>{d.name} ({d.code})</span>
                        <span className="badge badge-success">✓ &gt;75% Normal</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Active Security Logins</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('users')}>
                    Manage All
                  </button>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{u.fullName || u.email}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                      <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS */}
          {activeTab === 'students' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Enrolled Students Roster</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{s.studentId}</td>
                          <td style={{ fontWeight: '600' }}>{s.fullName}</td>
                          <td>{s.email}</td>
                          <td>{s.departmentName}</td>
                          <td>Year {s.year}</td>
                          <td style={{ fontWeight: '700', color: (s.attendancePercentage || 0) < 75 ? 'var(--danger)' : 'var(--success)' }}>
                            {s.attendancePercentage ?? 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FACULTY */}
          {activeTab === 'faculty' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Faculty Staff Members</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddFaculty(true)}>
                  + Add Faculty
                </button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Faculty ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Specialization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faculty.map((f) => (
                        <tr key={f.id}>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{f.facultyId}</td>
                          <td style={{ fontWeight: '600' }}>{f.fullName}</td>
                          <td>{f.email}</td>
                          <td>{f.departmentName}</td>
                          <td><span className="badge badge-info">{f.designation}</span></td>
                          <td>{f.specialization || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Academic Departments</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddDept(true)}>
                  + Add Department
                </button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Department Name</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((d) => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: '700' }}><span className="badge badge-primary">{d.code}</span></td>
                          <td style={{ fontWeight: '600' }}>{d.name}</td>
                          <td>{d.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: USERS */}
          {activeTab === 'users' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">User Accounts &amp; Access Control</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username / Email</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td style={{ fontWeight: '600' }}>{u.email || u.username}</td>
                          <td>{u.fullName || '--'}</td>
                          <td><span className="badge badge-primary">{u.role}</span></td>
                          <td>
                            <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                              {u.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${u.active ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => handleToggleUserStatus(u.id)}
                            >
                              {u.active ? 'Disable Access' : 'Enable Access'}
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
        </main>
      </div>

      {/* Modal: Add Faculty */}
      {showAddFaculty && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Add New Faculty Member</h3>
              <button onClick={() => setShowAddFaculty(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleAddFaculty}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Faculty ID *</label>
                    <input type="text" className="form-control" placeholder="FAC-105" value={facForm.facultyId} onChange={(e) => setFacForm({ ...facForm, facultyId: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-control" placeholder="Dr. Jane Doe" value={facForm.fullName} onChange={(e) => setFacForm({ ...facForm, fullName: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email *</label>
                  <input type="email" className="form-control" placeholder="jane.doe@campusconnect.edu" value={facForm.email} onChange={(e) => setFacForm({ ...facForm, email: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select className="form-control" value={facForm.departmentId} onChange={(e) => setFacForm({ ...facForm, departmentId: e.target.value })} required>
                      <option value="">Select Department...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input type="text" className="form-control" value={facForm.designation} onChange={(e) => setFacForm({ ...facForm, designation: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddFaculty(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Faculty Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Department */}
      {showAddDept && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Create Academic Department</h3>
              <button onClick={() => setShowAddDept(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleAddDept}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Department Code *</label>
                  <input type="text" className="form-control" placeholder="e.g. CHEM, EE" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Name *</label>
                  <input type="text" className="form-control" placeholder="e.g. Department of Chemical Engineering" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddDept(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
