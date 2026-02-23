import { useState, useEffect, useRef } from 'react';
import { X, Bot, Send, Sparkles, RotateCcw } from 'lucide-react';
import { useAIChat } from '../../hooks/useAIChat';

/* ── Mini Quick Prompts ── */
const QUICK_PROMPTS = [
    { label: '🗺️ Learning roadmap', text: 'How to learn new skills effectively?' },
    { label: '🔍 Review my code', text: 'Can you review my code and give feedback?' },
    { label: '💡 Explain a concept', text: 'Explain React hooks for students' },
];

/* ── Simple inline code renderer ── */
function MiniMessageContent({ content }) {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return (
        <div className="text-[13px] leading-relaxed text-gray-800 space-y-2">
            {parts.map((part, i) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const inner = part.slice(3, -3);
                    const newlineIdx = inner.indexOf('\n');
                    const code = newlineIdx > 0 ? inner.slice(newlineIdx + 1) : inner;
                    return (
                        <pre key={i} className="bg-[#151823] text-gray-100 text-[12px] font-mono p-3 rounded-lg overflow-x-auto leading-relaxed">
                            <code>{code.trimEnd()}</code>
                        </pre>
                    );
                }
                return (
                    <span key={i} className="whitespace-pre-wrap">
                        {part.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
                            if (chunk.startsWith('**') && chunk.endsWith('**')) {
                                return <strong key={j} className="font-semibold text-gray-900">{chunk.slice(2, -2)}</strong>;
                            }
                            return chunk.split(/(`[^`]+`)/g).map((c, k) => {
                                if (c.startsWith('`') && c.endsWith('`') && c.length > 2) {
                                    return (
                                        <code key={k} className="px-1 py-0.5 rounded text-[12px] font-mono text-orange-600 bg-orange-50 border border-orange-100">
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

/* ── Mini Typing Dots ── */
function MiniTyping() {
    return (
        <div className="flex items-end gap-2 py-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#F27125] to-[#d96420] flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="px-3 py-2 rounded-xl rounded-bl-sm bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                </div>
            </div>
            <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }`}</style>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════ */
export function AIAssistantPanel({ isOpen, onClose }) {
    const { messages, isLoading, isTyping, sendMessage, clearMessages } = useAIChat();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    /* Auto-scroll */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    /* Auto-focus textarea when panel opens */
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => textareaRef.current?.focus(), 300); // wait for animation
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const text = input;
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        await sendMessage(text);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickPrompt = (text) => {
        setInput(text);
        textareaRef.current?.focus();
    };

    return (
        <>
            {/* Backdrop — click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Panel */}
            <div
                className="fixed top-0 right-0 h-screen w-[340px] bg-gray-50 shadow-2xl z-50 flex flex-col border-l border-gray-200 transition-transform duration-300 ease-in-out"
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F27125] to-[#d96420] flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 text-sm">AI Assistant</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-[#F27125]" />GPT-4o
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {messages.length > 0 && (
                            <button onClick={clearMessages}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600" title="Clear">
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                    {messages.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center h-full text-center py-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F27125] to-[#d96420] flex items-center justify-center shadow-lg mb-4">
                                <Bot className="w-7 h-7 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-800 mb-1">Quick AI Help</p>
                            <p className="text-xs text-gray-500 mb-5 max-w-[220px]">Ask me anything about your project or code</p>
                            <div className="space-y-2 w-full">
                                {QUICK_PROMPTS.map((q) => (
                                    <button key={q.label}
                                        onClick={() => handleQuickPrompt(q.text)}
                                        className="w-full text-left px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#F27125] hover:shadow-sm transition text-xs font-medium text-gray-700 hover:text-[#F27125]">
                                        {q.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id}
                                className={`flex items-end gap-2 py-0.5 group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className="flex-shrink-0 mb-0.5">
                                    {msg.role === 'assistant' ? (
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#F27125] to-[#d96420] flex items-center justify-center">
                                            <Bot className="w-3 h-3 text-white" />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-lg bg-gray-300 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-gray-600">U</span>
                                        </div>
                                    )}
                                </div>

                                {/* Bubble */}
                                <div className="max-w-[85%]">
                                    {msg.role === 'user' ? (
                                        <div className="px-3 py-2.5 rounded-2xl rounded-br-sm text-white text-[13px] leading-relaxed"
                                            style={{ background: 'linear-gradient(135deg,#F27125,#d96420)' }}>
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-white border border-gray-200 shadow-sm">
                                            <MiniMessageContent content={msg.content} />
                                        </div>
                                    )}
                                    <div className={`text-[11px] text-gray-400 mt-0.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isTyping && <MiniTyping />}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex-shrink-0 p-3 bg-white border-t border-gray-200">
                    <div className="flex items-end gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-[#F27125] focus-within:bg-white transition">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask AI... (Enter to send)"
                            className="flex-1 resize-none focus:outline-none text-[13px] text-gray-800 placeholder-gray-400 bg-transparent leading-relaxed"
                            style={{ minHeight: '20px', maxHeight: '100px' }}
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
                            style={{ background: input.trim() && !isLoading ? 'linear-gradient(135deg,#F27125,#d96420)' : '#d1d5db' }}
                        >
                            <Send className="w-3.5 h-3.5 text-white" />
                        </button>
                    </div>
                    <p className="text-[11px] text-gray-400 text-center mt-1.5">Shift+Enter for new line</p>
                </div>
            </div>
        </>
    );
}
