import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import FleetReportFinalFull from './components/FleetReportFinalFull';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fleetData, setFleetData] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!fleetData || !Array.isArray(fleetData) || fleetData.length === 0) {
      alert("⚠️ Fleet data is not yet available. Please upload the Excel file and wait a moment before asking.");
      return;
    }

    const userMessage = { role: "user", content: input };
    const modelList = [...new Set(fleetData.map(d => d.Model))].filter(Boolean).slice(0, 5).join(", ");
    const firstRows = fleetData.slice(0, 5).map(row =>
      Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(", ")
    ).join("\n");

    const lang = /[ء-ي]/.test(input) ? "Arabic (Egyptian dialect)" : "English";
    const prompt = `You are an assistant who replies in ${lang}. Answer clearly and helpfully based on the fleet data.

Fleet context:
The user uploaded a fleet Excel file with ${fleetData.length} cars.
Sample models: ${modelList}
Sample rows:
${firstRows}

User: ${input}
AI:`;

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          prompt,
          stream: false
        })
      });

      const data = await res.json();
      const reply = data?.response?.trim() || "No response from local AI model.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      alert("Error from local AI: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '50vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <FleetReportFinalFull onDataLoaded={setFleetData} />

      <a
        href="https://moalamir52.github.io/Yelo/#dashboard"
        style={{
          position: 'fixed',
          top: '100px',
          left: '200px',
          zIndex: 1000,
          padding: '14px 20px',
          borderRadius: '10px',
          background: '#fdd835',
          color: '#000',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '15px',
          boxShadow: '0 2px 6px rgb(45, 12, 192)'
        }}
      >
        🔙 Back to YELO
      </a>

      <button
        onClick={() => setShowChat(!showChat)}
        style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '12px', background: '#6200ea', color: '#fff', border: 'none', fontSize: '16px', cursor: 'pointer' }}
      >
        🤖 Start AI Chat
      </button>

      {showChat && (
        <div style={{ width: '100%', maxWidth: '600px', marginTop: '30px', border: '1px solid #ccc', padding: '16px', background: '#f9f9f9', borderRadius: '12px' }}>
          <h2 style={{ textAlign: 'center', color: '#6200ea', marginBottom: '10px' }}>🤖 AI Assistant</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ background: msg.role === 'user' ? '#e0f7fa' : '#ede7f6', padding: '6px 8px', borderRadius: '6px', marginBottom: '6px' }}>
                <strong>{msg.role === 'user' ? "You" : "AI"}:</strong> {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <button onClick={sendMessage} disabled={loading} style={{ padding: '10px 14px', borderRadius: '6px', background: '#6200ea', color: 'white', border: 'none' }}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
