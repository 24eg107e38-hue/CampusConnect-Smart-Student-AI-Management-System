import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';

export default function AiStudyPlanModal({ isOpen, onClose, studentId }) {
  const [dailyHours, setDailyHours] = useState(3.5);
  const [focusGoal, setFocusGoal] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState('Monday');

  const fetchStudyPlan = async () => {
    setLoading(true);
    try {
      const res = await Api.getStudyPlan(studentId, dailyHours, focusGoal);
      setPlan(res.data);
    } catch (err) {
      console.error('Failed to generate study plan', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStudyPlan();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📅</span> AI Personalized Study Plan &amp; Schedule
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Cognitive scheduling engine allocating hours based on subject difficulty, marks, and attendance gaps.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Daily Available Study Time: <strong>{dailyHours} Hours / Day</strong>
              </label>
              <input
                type="range"
                min="1.5"
                max="7.0"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: 1.5, minWidth: '240px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Special Focus or Target Goal (Optional):
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Prepare for Database Midterm Exam"
                value={focusGoal}
                onChange={(e) => setFocusGoal(e.target.value)}
                style={{ fontSize: '13px', padding: '7px 12px' }}
              />
            </div>

            <button className="btn btn-primary" onClick={fetchStudyPlan} disabled={loading} style={{ alignSelf: 'flex-end' }}>
              {loading ? 'Re-Generating...' : '⚡ Generate Plan'}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🤖</div>
              <p>Analyzing curriculum credits, historical exam scores, and weekly capacity...</p>
            </div>
          ) : plan ? (
            <div>
              {/* Strategic Summary */}
              <div
                style={{
                  padding: '14px 18px',
                  background: 'var(--primary-light)',
                  border: '1px solid #c7d2fe',
                  borderRadius: 'var(--radius-md)',
                  color: '#312e81',
                  fontSize: '13.5px',
                  marginBottom: '20px'
                }}
              >
                <strong>AI Strategy Overview:</strong> {plan.strategicSummary}
              </div>

              {/* Priority Subjects Section */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                  Targeted Subject Allocation &amp; Priority Weight
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {plan.prioritySubjects?.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        background: '#fff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${p.urgency === 'HIGH' ? 'var(--danger)' : p.urgency === 'MEDIUM' ? 'var(--warning)' : 'var(--success)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13.5px' }}>{p.subjectCode}</span>
                        <span className={`badge ${p.urgency === 'HIGH' ? 'badge-danger' : p.urgency === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}>
                          {p.urgency}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{p.subjectName}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                        <span>Target: {p.recommendedWeeklyHours} hrs/wk</span>
                        <span style={{ color: p.currentScore < 65 ? 'var(--danger)' : 'var(--text-main)' }}>Score: {p.currentScore}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Day Tabs & Timetable */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                  7-Day Structured Schedule
                </h4>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: '1px solid var(--border)',
                        background: activeDay === day ? 'var(--primary)' : '#fff',
                        color: activeDay === day ? '#fff' : 'var(--text-main)',
                        fontWeight: '600',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.weeklySchedule?.[activeDay]?.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '13px' }}>
                          ⏰ {s.timeSlot}
                        </span>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>
                            {s.subject} <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>— {s.topic}</span>
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-purple" style={{ fontSize: '12px' }}>
                        🧠 {s.technique}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
