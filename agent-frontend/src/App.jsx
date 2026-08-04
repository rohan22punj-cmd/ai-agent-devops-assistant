import { useEffect, useState } from 'react';

const HISTORY_KEY = 'devops-ai-chat-history';
const ACTIVE_CHAT_KEY = 'devops-ai-active-chat';

function readHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
}

function createChat() {
  return { id: crypto.randomUUID(), title: 'New chat', updatedAt: new Date().toISOString(), messages: [] };
}

export default function App() {
  const [history, setHistory] = useState(readHistory);
  const [activeChatId, setActiveChatId] = useState(() => localStorage.getItem(ACTIVE_CHAT_KEY) || readHistory()[0]?.id || null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const suggestedQuestions = ['Is the user service okay?', 'Show me the payment service logs', 'Check if the payment service is healthy', 'Show me the user service logs'];
  const activeChat = history.find((chat) => chat.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }, [history]);
  useEffect(() => {
    if (activeChatId) localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
    else localStorage.removeItem(ACTIVE_CHAT_KEY);
  }, [activeChatId]);

  const updateChat = (id, updater) => setHistory((chats) => chats.map((chat) => chat.id === id ? updater(chat) : chat));
  const startNewChat = () => {
    const chat = createChat();
    setHistory((chats) => [chat, ...chats]);
    setActiveChatId(chat.id);
    setInput('');
  };
  const deleteChat = (id) => {
    const chat = history.find((item) => item.id === id);
    if (!chat || !window.confirm(`Delete the chat "${chat.title}"?`)) return;
    const remaining = history.filter((item) => item.id !== id);
    setHistory(remaining);
    if (id === activeChatId) setActiveChatId(remaining[0]?.id || null);
  };
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    let chatId = activeChatId;
    if (!chatId) {
      const chat = createChat(); chatId = chat.id;
      setHistory((chats) => [chat, ...chats]); setActiveChatId(chatId);
    }
    updateChat(chatId, (chat) => ({ ...chat, title: chat.messages.length ? chat.title : text.slice(0, 44), updatedAt: new Date().toISOString(), messages: [...chat.messages, { role: 'user', text }] }));
    setInput(''); setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history: messages }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      updateChat(chatId, (chat) => ({ ...chat, updatedAt: new Date().toISOString(), messages: [...chat.messages, { role: 'agent', text: data.reply }] }));
    } catch (error) {
      updateChat(chatId, (chat) => ({ ...chat, updatedAt: new Date().toISOString(), messages: [...chat.messages, { role: 'agent', text: error.message || 'Error connecting to the assistant.' }] }));
    } finally { setLoading(false); }
  };

  return <div className="app">
    <nav className="navbar">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle chat history">☰</button>
      <button className="navbar-title" onClick={() => window.location.reload()} title="Refresh DevOps AI Assistant">⚙️ DevOps AI Assistant</button>
      <span className="navbar-subtitle">Chat assistant</span>
    </nav>
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <div className="sidebar-heading"><h3>Chat history</h3><button className="new-chat-button" onClick={startNewChat}>+ New chat</button></div>
        <div className="history-list">
          {history.length === 0 && <p className="empty-text">Your previous chats will appear here.</p>}
          {history.map((chat) => <div key={chat.id} className={`history-item ${chat.id === activeChatId ? 'history-item-active' : ''}`}>
            <button className="history-chat-button" onClick={() => setActiveChatId(chat.id)}><span className="history-question">{chat.title}</span><span className="history-time">{new Date(chat.updatedAt).toLocaleString()}</span></button>
            <button className="delete-chat-button" onClick={() => deleteChat(chat.id)} aria-label={`Delete chat: ${chat.title}`} title="Delete chat">×</button>
          </div>)}
        </div>
      </aside>
      <main className="chat-main">
        <div className="suggestions"><p className="suggestions-label">Try asking:</p><div className="suggestion-chips">{suggestedQuestions.map((question) => <button key={question} className="chip" onClick={() => setInput(question)}>{question}</button>)}</div></div>
        <div className="chat-log">
          {messages.length === 0 && <p className="empty-text">Start a conversation with your DevOps assistant.</p>}
          {messages.map((message, index) => <div key={index} className={`message ${message.role}`}><strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong> {message.text}</div>)}
          {loading && <div className="message agent"><em>Assistant is thinking...</em></div>}
        </div>
        <div className="input-area"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); sendMessage(); } }} placeholder="Message DevOps AI Assistant..." /><button onClick={sendMessage} disabled={loading}>Send</button></div>
      </main>
    </div>
  </div>;
}
