// ✅ App.jsx — includes Chat UI + FleetReport with AI summary

import './App.css'
// ✅ App.jsx — Chat AI trigger via button (not always visible, UI centered)

import React, { useState } from 'react';
import FleetReportFinalFull from './components/FleetReportFinalFull';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fleetData, setFleetData] = useState([]);
  const [showChat, setShowChat] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!fleetData || !Array.isArray(fleetData) || fleetData.length === 0) {
      alert("⚠️ Fleet data is not yet available. Please upload the Excel file and wait a moment before asking.");
      console.warn("fleetData is:", fleetData);
      return;
    }

    console.log("fleetData sample:", fleetData[0]);

    const userMessage = { role: "user", content: input };
    const modelList = [...new Set(fleetData.map(d => d.Model))].filter(Boolean).slice(0, 5).join(", ");

    const firstRows = fleetData.slice(0, 5).map(row => {
      return Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(", ");
    }).join("\n");

    const context = `The user uploaded a fleet Excel file with ${fleetData.length} cars.\nSample models: ${modelList}\nSample rows:\n${firstRows}`;

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        
        },
        body: JSON.stringify({
          inputs: `${context}\n\nUser: ${input}\nAI:`
        })
      });

      const data = await res.json();
      const reply = data?.[0]?.generated_text?.split("AI:")[1]?.trim();
      if (!reply) throw new Error("No valid response from HuggingFace API");

      setMessages(prev => [...prev, userMessage, { role: "assistant", content: reply }]);
    } catch (e) {
      alert("Error from AI: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '50vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <FleetReportFinalFull onDataLoaded={setFleetData} />

      {/* 🟡 Back to YELO Button */}
      <a
        href="https://moalamir52.github.io/Yelo/#dashboard"
        style={{
          marginTop: '20px',
          padding: '20px 20px',
          borderRadius: '12px',
          background: '#fdd835',
          color: '#000',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 2px 6px rgb(105, 32, 241)'
        }}
      >
        🔙 Back to YELO
      </a>

      {/* 🔘 Toggle Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '12px', background: '#6200ea', color: '#fff', border: 'none', fontSize: '16px', cursor: 'pointer' }}
      >
        🤖 Start AI Chat
      </button>

      {/* 🤖 Chat Window */}
      {showChat && (
        <div style={{ width: '100%', maxWidth: '600px', marginTop: '30px', border: '1px solid #ccc', padding: '16px', background: '#f9f9f9', borderRadius: '12px' }}>
          <h2 style={{ textAlign: 'center', color: '#6200ea', marginBottom: '10px' }}>🤖 AI Assistant</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ background: msg.role === 'user' ? '#e0f7fa' : '#ede7f6', padding: '6px 8px', borderRadius: '6px', marginBottom: '6px' }}>
                <strong>{msg.role === 'user' ? "You" : "AI"}:</strong> {msg.content}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
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



