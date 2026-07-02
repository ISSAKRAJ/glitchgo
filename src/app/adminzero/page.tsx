"use client";

import React, { useState } from 'react';
import DashboardRenderer from '../../components/DashboardRenderer';
import { Callout } from '@tremor/react';

interface Message {
  id: string;
  role: 'user' | 'system' | 'error' | 'assistant';
  content: string;
  sql?: string;
  data?: any[];
}

export default function AdminZeroPage() {
  const [dbUrl, setDbUrl] = useState('');
  const [dbId, setDbId] = useState('');
  const [dialect, setDialect] = useState<'postgres' | 'mysql'>('postgres');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardLoading, setOnboardLoading] = useState(false);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUrl) return;

    setOnboardLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dialect, connectionString: dbUrl })
      });
      const result = await res.json();

      if (result.status === 'success') {
        setDbId(result.dbId);
        setMessages([
          {
            id: window.crypto.randomUUID(),
            role: 'system',
            content: `Connection successful. Database onboarded. Token ID: ${result.dbId}`
          }
        ]);
      } else {
        setMessages([
          {
            id: window.crypto.randomUUID(),
            role: 'error',
            content: result.message || 'Failed to onboard database.'
          }
        ]);
      }
    } catch (err: any) {
      setMessages([
        {
          id: window.crypto.randomUUID(),
          role: 'error',
          content: err.message || 'Network error connecting to the Semantic Gateway.'
        }
      ]);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !dbId) return;

    const userMsgId = window.crypto.randomUUID();
    const currentQuestion = question;
    setQuestion('');

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: currentQuestion }
    ]);

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbId, question: currentQuestion })
      });
      const result = await res.json();

      if (result.status === 'success') {
        setMessages(prev => [
          ...prev,
          {
            id: window.crypto.randomUUID(),
            role: 'assistant',
            content: 'Query executed successfully.',
            sql: result.sql,
            data: result.data
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: window.crypto.randomUUID(),
            role: 'error',
            content: result.message || 'An error occurred during query execution.'
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: window.crypto.randomUUID(),
          role: 'error',
          content: err.message || 'Network error communicating with the query gateway.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative">
      {/* 1. STICKY TOP HEADER FOR DATABASE CONNECTION */}
      <header className="sticky top-0 z-20 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-200">
              AdminZero P2SQL Security Gateway
            </h1>
            <p className="text-[10px] text-zinc-500">Zero-Trust Prompt Injection Firewall</p>
          </div>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleOnboard} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-3xl justify-end">
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as 'postgres' | 'mysql')}
            disabled={onboardLoading || !!dbId}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 shrink-0 font-medium cursor-pointer"
          >
            <option value="postgres">PostgreSQL</option>
            <option value="mysql">MySQL</option>
          </select>
          <input
            type="password"
            value={dbUrl}
            onChange={(e) => setDbUrl(e.target.value)}
            placeholder={dialect === 'postgres' ? "postgresql://user:password@host:5432/database" : "mysql://user:password@host:3306/database"}
            disabled={onboardLoading || !!dbId}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={onboardLoading || !dbUrl || !!dbId}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 text-zinc-100 disabled:text-zinc-500 font-semibold px-4 py-2 rounded-lg text-xs border border-indigo-500/30 disabled:border-zinc-800 transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            {onboardLoading ? (
              <>
                <div className="h-3 w-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : dbId ? (
              <span>✓ Connected</span>
            ) : (
              <span>Onboard & Connect</span>
            )}
          </button>
        </form>
      </header>

      {/* 2. MAIN SCROLLING CHAT INTERFACE */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-28 flex flex-col space-y-6 max-w-5xl mx-auto w-full">
        {!dbId ? (
          /* Connection Required Overlay */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950 my-12">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 text-lg mb-4 shadow-inner">
              🔒
            </div>
            <h3 className="text-base font-semibold text-zinc-200 mb-1">
              Awaiting Gateway Auth
            </h3>
            <p className="text-xs text-zinc-500 max-w-md">
              Please enter your PostgreSQL connection credentials in the header above. Zero-Trust firewall rules and transient client routing will initialize automatically.
            </p>
          </div>
        ) : (
          /* Active Query Log */
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col space-y-2 ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Bubble / Callout */}
                {msg.role === 'error' && (msg.content.includes('[AdminZero SecOps]') || msg.content.includes('AST Firewall Blocked Query')) ? (
                  <div className="w-full max-w-4xl">
                    <Callout
                      title="Critical Threat Prevented (OWASP LLM01)"
                      color="red"
                      className="rounded-2xl border border-red-900/40 bg-red-950/20 text-red-200 py-3.5 px-4 text-xs"
                    >
                      The AI agent was manipulated into generating a destructive SQL command. The AST Firewall deterministic layer intercepted and killed the connection before execution. Production data secured.
                    </Callout>
                  </div>
                ) : (
                  <div
                    className={`max-w-4xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-zinc-100 rounded-tr-none'
                        : msg.role === 'error'
                        ? 'bg-red-950/30 border border-red-900/40 text-red-400 rounded-tl-none font-mono'
                        : 'bg-zinc-900 border border-zinc-800/80 text-zinc-300 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                )}

                {/* Generated SQL block */}
                {msg.sql && (
                  <div className="w-full max-w-4xl bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2 shadow-sm">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
                      Executed SQL (AST Approved)
                    </span>
                    <pre className="text-xs font-mono bg-zinc-950 p-3 rounded-lg border border-zinc-800 overflow-x-auto text-zinc-300">
                      <code>{msg.sql}</code>
                    </pre>
                  </div>
                )}

                {/* Tremor Chart/Table Visualizer */}
                {msg.data && (
                  <div className="w-full max-w-4xl mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 shadow-md">
                    <DashboardRenderer data={msg.data} />
                  </div>
                )}
              </div>
            ))}

            {/* AI compilation indicator */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-zinc-500 text-xs font-medium pl-2 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                <span>DeepSeek LLM compiling query & checking AST firewall...</span>
              </div>
            )}
          </>
        )}
      </main>

      {/* 3. FIXED BOTTOM FOOTER FOR QUERY INPUT */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4 z-10">
        <form onSubmit={handleQuery} className="flex space-x-3 max-w-5xl mx-auto">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              dbId
                ? "Ask a question about your database (e.g. 'List total users grouped by status')"
                : "Database connection required before querying."
            }
            disabled={isLoading || !dbId}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !question || !dbId}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 text-zinc-100 disabled:text-zinc-600 font-semibold px-5 rounded-xl text-xs border border-indigo-500/30 disabled:border-zinc-800 transition-all flex items-center justify-center shrink-0"
          >
            <span>Execute</span>
          </button>
        </form>
      </footer>
    </div>
  );
}
