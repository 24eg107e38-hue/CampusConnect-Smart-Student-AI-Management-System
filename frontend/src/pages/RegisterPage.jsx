import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    studentId: '',
    departmentId: '',
    year: 1,
    course: 'B.Tech Computer Science'
  });

  useEffect(() => {
    Api.get('/auth/departments')
      .then((res) => setDepartments(res.data || []))
      .catch((err) => console.error('Failed to load departments', err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        ...form,
        departmentId: parseInt(form.departmentId) || (departments[0]?.id || 1),
        year: parseInt(form.year) || 1
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', padding: '36px', border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📝</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Student Enrollment Registration
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Join CampusConnect to track academic standing and access AI study assistants
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 14px', background: 'var(--danger-light)', color: '#b91c1c', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '18px', border: '1px solid #fecaca' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" name="fullName" className="form-control" placeholder="e.g. John Doe" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input type="text" name="studentId" className="form-control" placeholder="e.g. STU2024099" value={form.studentId} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Campus Email *</label>
              <input type="email" name="email" className="form-control" placeholder="john.doe@campusconnect.edu" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" name="phoneNumber" className="form-control" placeholder="9876543210" value={form.phoneNumber} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Academic Department *</label>
              <select name="departmentId" className="form-control" value={form.departmentId} onChange={handleChange} required>
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Academic Year *</label>
              <select name="year" className="form-control" value={form.year} onChange={handleChange}>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Degree Course Program</label>
            <input type="text" name="course" className="form-control" placeholder="e.g. B.Tech Computer Science" value={form.course} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Choose Password *</label>
            <input type="password" name="password" className="form-control" placeholder="Minimum 6 characters" minLength="6" value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px' }} disabled={loading}>
            {loading ? 'Registering Account...' : 'Complete Student Registration'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
