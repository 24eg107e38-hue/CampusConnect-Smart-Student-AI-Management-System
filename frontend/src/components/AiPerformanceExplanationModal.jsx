import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';

export default function AiPerformanceExplanationModal({ isOpen, onClose, studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true);
      Api.getPerformanceExplanation(studentId)
        .then((res) => setData(res.data))
        .catch((err) => console.error('Failed to load performance explanation', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🧠</span> AI Performance Explanation &amp; Diagnostic
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Deep generative intelligence explaining exact weighting drivers, risk points, and upside trajectory.
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
              <p>Decomposing attendance records, examination weightings, and coursework scores...</p>
            </div>
          ) : data ? (
            <div>
              {/* Top Banner: Score & Executive Summary */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  color: 'white',
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '600' }}>
                      Overall Composite Score
                    </span>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>
                      {data.overallPerformanceScore} <span style={{ fontSize: '18px', fontWeight: '400', color: '#94a3b8' }}>/ 100</span>
                    </div>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '14px', padding: '6px 14px' }}>
                    Standing Tier: {data.performanceTier}
                  </span>
                </div>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                  <strong>Diagnostic Synthesis:</strong> {data.executiveSummary}
                </p>
              </div>

              {/* 3-Factor Mathematical Breakdown Cards */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '12px' }}>
                  Factor Weighting &amp; Point Contribution Breakdown
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {/* Factor 1: Attendance */}
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {data.attendanceFactor?.factorName} ({data.attendanceFactor?.weightPercentage}% Weight)
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)', margin: '4px 0' }}>
                      {data.attendanceFactor?.contributionPoints} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 25.0 pts</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '6px', lineHeight: '1.4' }}>
                      {data.attendanceFactor?.diagnostic}
                    </p>
                  </div>

                  {/* Factor 2: Marks */}
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {data.marksFactor?.factorName} ({data.marksFactor?.weightPercentage}% Weight)
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--success)', margin: '4px 0' }}>
                      {data.marksFactor?.contributionPoints} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 50.0 pts</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '6px', lineHeight: '1.4' }}>
                      {data.marksFactor?.diagnostic}
                    </p>
                  </div>

                  {/* Factor 3: Coursework */}
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {data.courseworkFactor?.factorName} ({data.courseworkFactor?.weightPercentage}% Weight)
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--purple)', margin: '4px 0' }}>
                      {data.courseworkFactor?.contributionPoints} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 25.0 pts</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '6px', lineHeight: '1.4' }}>
                      {data.courseworkFactor?.diagnostic}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drivers & Hidden Risks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '22px' }}>
                <div style={{ padding: '16px', background: 'var(--success-light)', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#065f46', marginBottom: '8px' }}>
                    ✅ Positive Performance Drivers:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#047857', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {data.primaryDrivers?.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '16px', background: 'var(--danger-light)', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#991b1b', marginBottom: '8px' }}>
                    ⚠️ Critical Vulnerabilities &amp; Risks:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#b91c1c', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {data.hiddenRisks?.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 4-Step Action Plan */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '10px' }}>
                  🎯 30-Day Strategic Recovery Roadmap
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.strategicActionPlan?.map((step) => (
                    <div
                      key={step.stepNumber}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}
                        >
                          {step.stepNumber}
                        </span>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {step.timeframe}
                          </span>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{step.action}</div>
                        </div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '11.5px' }}>
                        {step.expectedGain}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trajectory Upside Box */}
              {data.trajectory && (
                <div
                  style={{
                    padding: '16px 20px',
                    background: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#6d28d9', textTransform: 'uppercase' }}>
                      Predicted Growth Trajectory
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#4c1d95', marginTop: '2px' }}>
                      {data.trajectory.optimizedProjection}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-purple" style={{ fontSize: '14px', padding: '6px 14px' }}>
                      🚀 Potential Upside: +{data.trajectory.potentialScoreUpside} pts
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close Diagnostic
          </button>
        </div>
      </div>
    </div>
  );
}
