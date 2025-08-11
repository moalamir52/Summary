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

  // This function has been updated to call the Gemini Pro API
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
    
    // The prompt structure is the same, just talking to a new model
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

    // The API Key is read securely from the .env file
    // Make sure you have a .env file with VITE_GEMINI_API_KEY="YOUR_API_KEY"
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
        alert("ERROR: Gemini API Key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
        setLoading(false);
        return;
    }
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // The request body format is different for Gemini API
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!res.ok) {
            // Handle API errors (e.g., bad API key)
            const errorData = await res.json();
            throw new Error(errorData.error.message || "An error occurred with the API.");
        }

        const data = await res.json();
        // The response structure is different for Gemini API
        const reply = data.candidates[0]?.content?.parts[0]?.text?.trim() || "No response from Gemini Pro.";
        setMessages(prev => [...prev, { role: "assistant", content: reply }]);

    } catch (e) {
        alert("Error from Gemini API: " + e.message);
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
