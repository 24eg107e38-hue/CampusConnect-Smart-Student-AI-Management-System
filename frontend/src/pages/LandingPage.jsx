import React from 'react';

export default function LandingPage({ onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', color: '#fff' }}>
      {/* Navigation */}
      <header style={{ padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '28px', background: 'rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🎓
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em' }}>CampusConnect</div>
            <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Smart Student AI Management System
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => onNavigate('login')}>
            Sign In
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('register')}>
            Student Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '9999px', fontSize: '13px', color: '#a5b4fc', marginBottom: '24px' }}>
          <span>✨</span> Powered by Spring AI &amp; React 18 Architecture
        </div>

        <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '20px', color: '#fff' }}>
          Next-Generation Academic Management &amp; <br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI-Driven Student Performance Intelligence
          </span>
        </h1>

        <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '780px', margin: '0 auto 36px', lineHeight: '1.6' }}>
          Beyond basic university records: CampusConnect continuously analyzes attendance thresholds, automates makeup hours, models semester exam grades, and synthesizes personalized AI study plans and recovery roadmaps.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }} onClick={() => onNavigate('login')}>
            🚀 Launch Portal Demo
          </button>
          <button className="btn btn-outline" style={{ padding: '14px 28px', fontSize: '16px', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => onNavigate('register')}>
            Create Account
          </button>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontSize: '32px', marginBottom: '14px' }}>🤖</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>AI Student Assistant</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
              Interactive chatbot connected in real-time to the student's marks, attendance, and assignment deadlines with contextual prompts.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontSize: '32px', marginBottom: '14px' }}>📅</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>AI Study Plan Generator</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
              Automatically calculates urgency weights from historical scores and generates a 7-day Pomodoro study routine.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontSize: '32px', marginBottom: '14px' }}>🧠</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>AI Performance Explanation</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
              Deep generative breakdown detailing exact mathematical factor contributions, vulnerabilities, and an actionable 30-day upside plan.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontSize: '32px', marginBottom: '14px' }}>🚨</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Smart Attendance Alerts</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
              Automatic statutory warning banner when attendance falls below 75%, calculating the exact number of makeup classes required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
