import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Terminal, AlertCircle } from 'lucide-react';

const SYSTEM_PROMPT = `You are the official support AI for 'GlitchGo'. 
GlitchGo is a premium tech service brand that specializes in fast Bug Fixing, AI Automation, and Deployment Help (Servers/API). 
Your ONLY goal is to assist users with inquiries directly related to GlitchGo services, and politely encourage them to fill out the 'Request Immediate Help' form on the website to get a human expert.
If a user asks a question completely unrelated to coding, software, or GlitchGo's services (e.g., cooking recipes, history, general chit-chat), you MUST politely decline to answer, state that you are a GlitchGo support bot, and bring the topic back to tech help. Be concise, professional, and friendly.`;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hey there! I'm the GlitchGo AI assistant. Facing a code glitch or need automation help?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorConfig, setErrorConfig] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputValue('');
    setIsTyping(true);
    setErrorConfig(false);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      setIsTyping(false);
      setErrorConfig(true);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'System Error: Gemini API key is missing. Please add it to your .env.local file to activate my AI capabilities.' 
      }]);
      return;
    }

    // Format chat history for Gemini API
    const geminiHistory = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role, // ensure mapped to 'model' or 'user'
      parts: [{ text: msg.text }]
    }));
    
    // Add the new user message
    geminiHistory.push({ role: 'user', parts: [{ text: userText }] });

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: geminiHistory,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 150
          }
        })
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`API Error ${response.status}: ${errData}`);
      }

      const data = await response.json();
      const botResponse = data.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `Error connecting to AI: ${error.message}. Please check your API key.` 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[250px] md:bottom-[200px] right-6 h-14 px-6 bg-gradient-to-r from-brand-blue to-blue-600 rounded-full flex items-center justify-center gap-3 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] z-50 transition-all border border-blue-400/30"
          >
            <span className="text-xl">🤖</span>
            <span className="font-bold text-sm tracking-wide hidden sm:block">Ask AI Assistant</span>
            <span className="font-bold text-sm tracking-wide sm:hidden">AI Help</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-[250px] md:bottom-[200px] right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[60vh] bg-dark-card rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-blue/10 border-b border-white/5 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="bg-gradient-to-r from-brand-blue to-brand-orange p-[1.5px] rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <div className="bg-dark-bg px-2 py-0.5 rounded-[7px] flex items-center gap-0.5">
                    <span className="font-extrabold text-sm text-white tracking-tighter">Glitch</span>
                    <span className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500 tracking-tighter">Go</span>
                  </div>
                </div>
                <span className="font-bold text-gray-300 ml-1">AI Support</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close Chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-brand-blue text-white rounded-tr-none' 
                        : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3 max-w-[80%] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Banner */}
            {errorConfig && (
              <div className="bg-red-500/10 border-t border-red-500 p-2 flex items-center justify-center gap-2 text-red-500 text-xs text-center">
                <AlertCircle size={14} /> View console or update .env.local
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-dark-bg">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a tech support question..."
                  className="flex-1 bg-dark-surface border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-blue transition-colors"
                  disabled={isTyping}
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 rounded-full bg-brand-blue flex flex-shrink-0 items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-blue-dark transition-colors"
                >
                  <Send size={16} className="-ml-1 mt-1 transform -rotate-12" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
