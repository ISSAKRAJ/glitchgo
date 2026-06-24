import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Terminal, AlertCircle } from 'lucide-react';

import { supabase } from '../../lib/supabase';

const SYSTEM_PROMPT = `You are the official, expert support AI for "GlitchGo" (The Smart Enterprise Hub). 
GlitchGo is a scalable AI SaaS company specializing in secure enterprise data layers and ChatOps, with "AdminZero" as our flagship product. We also build bespoke Custom Enterprise AI Implementations.

CRITICAL RULES YOU MUST FOLLOW EXACTLY:
1. WARM GREETINGS: If a user greets you, reply warmly! Mention you are the GlitchGo ChatOps assistant. Pitch AdminZero instantly as the secure data layer to query databases directly from Slack in plain English.
2. ADMINZERO FIRST (SALES PUSH): Promote AdminZero as the ultimate solution to stop interrupting developers for database queries. Urge users to use the "/portal" config dashboard to add AdminZero to Slack, or visit "/adminzero-product" for a detailed product overview.
3. CUSTOM ENTERPRISE SERVICES: If a client needs legacy refactoring, custom LLM integrations, multi-agent pipelines, or enterprise scaling, pitch our "Custom Enterprise AI Implementations". Urge them to fill out the "Request an Enterprise Demo" form on the homepage.
4. NO RETAIL BUG-FIXING: We no longer operate a cheap hourly or 24-hour emergency debugging helpdesk. All manual services are now high-ticket bespoke consulting engagements for enterprise clients. If asked about cheap bug fixes, explain our focus on enterprise SaaS & scalable custom AI integrations.
5. NO FREE CODE: Do not write functioning code snippets for them to solve bugs themselves. Tell them: "I'd love to write this code for you, but my purpose is to assist you in connecting AdminZero to Slack or logging a request for a custom enterprise integration. Please request a demo above!"
6. LOG LEADS / COMPLAINTS: If someone wants to schedule a custom integration demo or register a complaint directly in chat, ask for their email.
7. MAGIC TICKET PAYLOAD. If they provide their email/contact info for a demo request or system issue in chat, you MUST include this exact JSON string hidden in your final response:
[LOG_COMPLAINT: {"contact": "THE_EMAIL_OR_PHONE_THEY_JUST_TYPED", "problem": "A 1-sentence summary of their enterprise request/problem"}]
8. STRUCTURED RESPONSES: Always structure your responses using markdown headers (### for sections), lists (- or *), and bold highlights. Make the styling look premium and readable.`;

// Lightweight inline markdown & paragraph parser to format AI responses beautifully in the chat widget
function parseInlineMarkdown(text) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function formatMessageText(text) {
  if (!text) return "";
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const cleanLine = line.trim();
    if (!cleanLine) {
      return <div key={idx} className="h-2" />;
    }

    if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
      const content = cleanLine.substring(2);
      return (
        <ul key={idx} className="list-disc pl-5 my-1.5 text-gray-300">
          <li className="leading-relaxed">{parseInlineMarkdown(content)}</li>
        </ul>
      );
    }

    if (cleanLine.startsWith('### ')) {
      return <h4 key={idx} className="text-xs font-extrabold text-brand-orange uppercase tracking-wider mt-4 mb-1.5">{parseInlineMarkdown(cleanLine.substring(4))}</h4>;
    }
    if (cleanLine.startsWith('## ')) {
      return <h3 key={idx} className="text-sm font-extrabold text-white mt-4 mb-2">{parseInlineMarkdown(cleanLine.substring(3))}</h3>;
    }
    if (cleanLine.startsWith('# ')) {
      return <h2 key={idx} className="text-base font-black text-white mt-4 mb-2.5">{parseInlineMarkdown(cleanLine.substring(2))}</h2>;
    }

    return (
      <p key={idx} className="mb-2 leading-relaxed text-gray-300">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hey there! I'm the GlitchGo AI assistant. Ready to scale your operations with AdminZero Slack ChatOps or discuss custom enterprise AI integrations?" }
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
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputValue('');
    setIsTyping(true);
    setErrorConfig(false);

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      setIsTyping(false);
      setErrorConfig(true);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'System Error: Gemini API key is missing. Please add it to your .env.local file to activate my AI capabilities.' 
      }]);
      return;
    }

    // Gemini API natively expects conversation history to start with a 'user' role.
    // We must filter out our hardcoded initial 'model' greeting if it's the first message.
    const apiMessages = messages.filter((msg, idx) => !(idx === 0 && msg.role === 'model'));

    const geminiHistory = apiMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.text }]
    }));
    
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
            temperature: 0.4,
            maxOutputTokens: 800
          }
        })
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`API Error ${response.status}: ${errData}`);
      }

      const data = await response.json();
      let botResponse = data.candidates[0].content.parts[0].text;

      // Extract automated complaint payload if the bot generated one
      const complaintMatch = botResponse.match(/\[LOG_COMPLAINT:\s*(\{.*?\})\s*\]/);
      if (complaintMatch) {
        try {
          const logData = JSON.parse(complaintMatch[1]);
          botResponse = botResponse.replace(complaintMatch[0], ''); // Hide the payload from user
          
          // Secretly push the complaint to Supabase using 'complaint' as deadline
          await supabase.from('client_requests').insert([{
            name: 'AI Auto-Generated Ticket',
            contact: logData.contact || 'No Contact Provided',
            problem: logData.problem || 'General Complaint',
            deadline: 'complaint'
          }]);
        } catch (e) {
          console.error("Failed to log internal complaint payload:", e);
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: botResponse.trim() }]);
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
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-brand-blue text-white rounded-tr-none' 
                        : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none shadow-md'
                    }`}
                  >
                    {msg.role === 'user' ? msg.text : formatMessageText(msg.text)}
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
