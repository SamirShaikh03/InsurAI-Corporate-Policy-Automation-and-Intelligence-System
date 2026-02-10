import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import './Chatbot.css';

const Chatbot = ({ employeeData = { name: 'Employee', claims: [], policies: [] } }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your InsurAI assistant. Ask me anything about your claims or policies. 🤖", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Local small talk & greetings
  const getLocalResponse = (input) => {
    if (!input) return null;
    const text = input.toLowerCase().trim();

    if (["hi", "hello", "hey"].includes(text)) 
      return `Hello 👋 ${employeeData.name}! How can I assist you today — claims, policies, or support?`;

    if (text.includes("thank")) 
      return "You're welcome! 😊";

    if (text.includes("bye")) 
      return "Goodbye! Have a great day 👋";

    if (text.includes("how are you")) 
      return "I'm doing great, thank you! How about you?";

    return null; // forward other queries to backend AI
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    const localReply = getLocalResponse(inputValue);
    if (localReply) {
      setMessages(prev => [...prev, { text: localReply, sender: 'bot' }]);
      setLoading(false);
      return;
    }

    // Get JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      setMessages(prev => [...prev, { text: "⚠️ Please log in to use InsurAI.", sender: 'bot' }]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/employee/chatbot`,
        { message: userMessage.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const reply = response?.data?.response || "🤖 Sorry, I didn't catch that.";
      const formattedReply = reply.split("\n").map(line => line.trim()).join("\n");

      setMessages(prev => [...prev, { text: formattedReply, sender: 'bot' }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      let msg = "⚠️ Unable to reach InsurAI. Please try again later.";
      if (error.response?.status === 401) msg = "⚠️ Authentication failed. Please log in.";
      else if (error.response?.status === 403) msg = "⚠️ Access forbidden. Please check your permissions.";
      setMessages(prev => [...prev, { text: msg, sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage(e);
  };

  return (
    <>
      <button
        type="button"
        className={`chatbot-launcher ${isOpen ? 'is-active' : ''}`}
        aria-label={isOpen ? 'Close InsurAI assistant' : 'Open InsurAI assistant'}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots'}`} aria-hidden="true" />
      </button>

      <section className={`chatbot-panel ${isOpen ? 'is-open' : ''}`} aria-live="polite">
        <header className="chatbot-header">
          <div className="chatbot-brand">
            <span className="chatbot-kicker">InsurAI Assistant</span>
            <strong>Employee Support</strong>
          </div>
          <div className="chatbot-status">
            <span className="status-dot" aria-hidden="true" />
            <span>Online</span>
          </div>
        </header>

        <div className="chatbot-body" ref={chatBodyRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chatbot-message ${msg.sender === 'bot' ? 'is-bot' : 'is-user'}`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="chatbot-message is-bot is-loading">
              <span className="typing-indicator">
                <span />
                <span />
                <span />
              </span>
              InsurAI is preparing a response…
            </div>
          )}
        </div>

        <footer className="chatbot-footer">
          <form className="chatbot-form" onSubmit={handleSendMessage}>
            <div className="chatbot-input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about claims, policies, support…"
                aria-label="Chat message"
              />
            </div>
            <button type="submit" className="chatbot-send" disabled={loading}>
              {loading ? <i className="bi bi-hourglass-split" aria-hidden="true" /> : <i className="bi bi-cursor-fill" aria-hidden="true" />}
              <span className="visually-hidden">Send</span>
            </button>
          </form>
        </footer>
      </section>
    </>
  );
};

export default Chatbot;