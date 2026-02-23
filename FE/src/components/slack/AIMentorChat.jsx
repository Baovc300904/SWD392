import { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, Trash2, User, RotateCcw, Copy, Check } from 'lucide-react';
import { useAIChat } from '../../hooks/useAIChat';

/* ── Suggested Prompts ── */
const SUGGESTED_PROMPTS = [
    { emoji: '🗺️', title: 'Learning Roadmap', prompt: 'How to learn new skills effectively as a software engineering student?' },
    { emoji: '🔍', title: 'Code Review', prompt: 'Can you review my code and give me feedback on best practices?' },
    { emoji: '💡', title: 'Explain a Concept', prompt: 'Explain React Hooks for students with simple examples' },
    { emoji: '🐛', title: 'Debug Help', prompt: 'Help me debug an issue — my code is not working as expected' },
];

/* ── Parse & render AI message content (handles ```code``` blocks) ── */
function AIMessageContent({ content }) {
    // Split on fenced code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    return (
        <div className="text-[14.5px] leading-relaxed text-gray-800 space-y-3">
            {parts.map((part, i) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const inner = part.slice(3, -3);
                    const firstNewline = inner.indexOf('\n');
                    const lang = firstNewline > 0 ? inner.slice(0, firstNewline).trim() : '';
                    const code = firstNewline > 0 ? inner.slice(firstNewline + 1) : inner;
                    return (
                        <div key={i} className="rounded-xl overflow-hidden border border-gray-700/30">
                            {lang && (
                                <div className="px-4 py-1.5 text-xs font-mono font-semibold text-gray-400 bg-[#1e2130] flex items-center justify-between">
                                    <span>{lang}</span>
                                </div>
                            )}
                            <pre className="bg-[#151823] px-4 py-3 overflow-x-auto text-[13px] font-mono text-gray-100 leading-relaxed m-0">
                                <code>{code.trimEnd()}</code>
                            </pre>
                        </div>
                    );
                }
                // Render bold (**text**) and plain text
                return (
                    <span key={i} className="whitespace-pre-wrap">
                        {part.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
                            if (chunk.startsWith('**') && chunk.endsWith('**')) {
                                return <strong key={j} className="font-semibold text-gray-900">{chunk.slice(2, -2)}</strong>;
                            }
                            // Handle inline code `text`
                            return chunk.split(/(`[^`]+`)/g).map((c, k) => {
                                if (c.startsWith('`') && c.endsWith('`') && c.length > 2) {
                                    return (
                                        <code key={k} className="px-1.5 py-0.5 rounded text-[13px] font-mono text-orange-600 bg-orange-50 border border-orange-100">
                                            {c.slice(1, -1)}
                                        </code>
                                    );
                                }
                                return <span key={k}>{c}</span>;
                            });
                        })}
                    </span>
                );
            })}
        </div>
    );
}

/* ── Copy button ── */
function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button onClick={copy} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600" title="Copy">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

/* ── Typing indicator ── */
function TypingIndicator() {
    return (
        <div className="flex items-end gap-3 px-6 py-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F27125] to-[#d96420] flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1.5 h-5">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-gray-400"
                            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════ */
export function AIMentorChat() {
    const { messages, isLoading, isTyping, sendMessage, clearMessages } = useAIChat();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    /* Auto-scroll on messages change or typing */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const text = input;
        setInput('');
        // Reset textarea height
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        await sendMessage(text);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handlePromptClick = (prompt) => {
        setInput(prompt);
        textareaRef.current?.focus();
    };

    const isEmpty = messages.length === 0;

    return (
        <div className="flex-1 flex flex-col h-screen bg-gray-50">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F27125] to-[#d96420] flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">AI Mentor Bot</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-xs text-gray-500">Always available</span>
                        </div>
                    </div>
                    <div className="ml-2 px-2.5 py-1 rounded-full text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        GPT-4o
                    </div>
                </div>
                {!isEmpty && (
                    <button
                        onClick={clearMessages}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear chat
                    </button>
                )}
            </div>

            {/* ── Messages / Welcome ── */}
            <div className="flex-1 overflow-y-auto">
                {isEmpty ? (
                    /* Welcome Screen */
                    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F27125] to-[#d96420] flex items-center justify-center shadow-xl mb-6">
                            <Bot className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hi, I'm your AI Mentor 👋</h2>
                        <p className="text-gray-500 text-base max-w-md mb-8 leading-relaxed">
                            Ask me anything about your SWP project — code reviews, concepts, debugging, or how to learn faster.
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                            {SUGGESTED_PROMPTS.map((item) => (
                                <button
                                    key={item.prompt}
                                    onClick={() => handlePromptClick(item.prompt)}
                                    className="group flex flex-col items-start gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#F27125] hover:shadow-md transition text-left"
                                >
                                    <span className="text-2xl">{item.emoji}</span>
                                    <span className="text-sm font-semibold text-gray-800 group-hover:text-[#F27125] transition">{item.title}</span>
                                    <span className="text-xs text-gray-500 leading-snug">{item.prompt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Chat Messages */
                    <div className="px-6 py-6 space-y-1 max-w-4xl mx-auto w-full">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex items-end gap-3 py-1 group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0 mb-1">
                                    {msg.role === 'assistant' ? (
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F27125] to-[#d96420] flex items-center justify-center shadow-sm">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    {msg.role === 'user' ? (
                                        <div className="px-4 py-3 rounded-2xl rounded-br-sm text-white text-[14.5px] leading-relaxed"
                                            style={{ background: 'linear-gradient(135deg,#F27125,#d96420)' }}>
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="px-5 py-4 rounded-2xl rounded-bl-sm bg-white border border-gray-200 shadow-sm">
                                            <AIMessageContent content={msg.content} />
                                        </div>
                                    )}

                                    {/* Actions row */}
                                    <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <span className="text-xs text-gray-400">
                                            {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {msg.role === 'assistant' && <CopyButton text={msg.content} />}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* ── Input Bar ── */}
            <div className="flex-shrink-0 px-6 pb-6 pt-3 bg-white border-t border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-end gap-3 p-3 bg-white border-2 border-gray-200 rounded-2xl focus-within:border-[#F27125] focus-within:shadow-md transition">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything... (Shift+Enter for new line)"
                            className="flex-1 resize-none focus:outline-none text-[14.5px] text-gray-800 placeholder-gray-400 leading-relaxed bg-transparent"
                            style={{ minHeight: '24px', maxHeight: '160px' }}
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: input.trim() && !isLoading ? 'linear-gradient(135deg,#F27125,#d96420)' : '#e5e7eb' }}
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        AI Mentor can make mistakes. Always verify important information.
                    </p>
                </div>
            </div>

            {/* Bounce animation */}
            <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
