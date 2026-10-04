import React, { useState, useEffect, useRef } from 'react';
import { Api } from '../services/api';

export default function AiAssistantWidget({ studentId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I am your **CampusConnect AI Academic Assistant**.\n\nI have real-time visibility into your curriculum, attendance standing, examination marks, and upcoming coursework deadlines. Ask me anything or choose one of the prompt suggestions below!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'What is my current attendance status?',
    'How is my overall academic performance?',
    'What assignments are due soon?',
    'How can I improve my CGPA?'
  ]);
  const [contextSummary, setContextSummary] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await Api.chatAi(text, studentId, history);
      const data = res.data;

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
      if (data.studentContextSummary) {
        setContextSummary(data.studentContextSummary);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Sorry, I encountered an issue retrieving your academic records. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="ai-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Open CampusConnect AI Academic Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window Popup */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '28px',
            width: '420px',
            maxWidth: 'calc(100vw - 40px)',
            height: '600px',
            maxHeight: 'calc(100vh - 120px)',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'modalScale 0.25s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>🤖</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>AI Academic Assistant</div>
                <div style={{ fontSize: '11px', color: '#c7d2fe' }}>
                  {contextSummary || 'Live CampusConnect AI Engine'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
            >
              &times;
            </button>
          </div>

          {/* Messages Body */}
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                <span>Thinking & querying records... ⏳</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          {suggestions.length > 0 && (
            <div style={{ padding: '8px 14px', background: '#f8fafc', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Suggested Prompts:
              </div>
              <div className="prompt-suggestions">
                {suggestions.map((s, idx) => (
                  <button key={idx} className="prompt-pill" onClick={() => handleSend(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="chat-input-area"
          >
            <input
              type="text"
              className="form-control"
              placeholder="Ask about attendance, grades, assignments..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ fontSize: '13.5px' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
