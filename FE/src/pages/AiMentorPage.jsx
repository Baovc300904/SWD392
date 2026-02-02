import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, Code, Database, GitBranch, Bug, MessageSquare, Loader2 } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';

const SUGGESTED_PROMPTS = [
    {
        icon: Code,
        title: "Code Review",
        prompt: "Can you review my React component and suggest improvements?"
    },
    {
        icon: Database,
        title: "Database Design",
        prompt: "Help me design a database schema for an e-commerce application"
    },
    {
        icon: GitBranch,
        title: "Git Workflow",
        prompt: "What's the best Git branching strategy for a team of 5 developers?"
    },
    {
        icon: Bug,
        title: "Debug Issue",
        prompt: "I'm getting a CORS error in my React app. How do I fix it?"
    }
];

export function AiMentorPage() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (content) => {
        if (!content.trim()) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: getAIResponse(content),
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 2000);
    };

    const getAIResponse = (userInput) => {
        // Simulated AI responses based on keywords
        if (userInput.toLowerCase().includes('react')) {
            return "I'd be happy to help with your React question! React is a powerful library for building user interfaces. Could you provide more specific details about what you're working on? For example:\n\n• Are you facing an error?\n• Do you need help with state management?\n• Are you looking for best practices?\n\nThe more context you provide, the better I can assist you.";
        } else if (userInput.toLowerCase().includes('database') || userInput.toLowerCase().includes('sql')) {
            return "Great question about database design! Here are some key principles to consider:\n\n1. **Normalization**: Organize data to reduce redundancy\n2. **Relationships**: Define clear relationships between tables (1-to-1, 1-to-many, many-to-many)\n3. **Indexing**: Add indexes on frequently queried columns\n4. **Constraints**: Use foreign keys and constraints to maintain data integrity\n\nWould you like me to help you design a specific schema? Share your requirements and I'll create an ER diagram structure for you.";
        } else if (userInput.toLowerCase().includes('git')) {
            return "For a team of 5 developers, I recommend the **Git Flow** or **GitHub Flow** strategy:\n\n**GitHub Flow (Simpler):**\n• `main` branch is always deployable\n• Create feature branches from `main`\n• Use pull requests for code review\n• Merge to `main` after approval\n\n**Git Flow (More structured):**\n• `main` - production code\n• `develop` - integration branch\n• `feature/*` - new features\n• `release/*` - release preparation\n• `hotfix/*` - urgent fixes\n\nFor a team of 5, GitHub Flow is usually sufficient unless you have complex release cycles.";
        } else if (userInput.toLowerCase().includes('cors')) {
            return "CORS (Cross-Origin Resource Sharing) errors are common! Here's how to fix it:\n\n**Backend Solution (Recommended):**\n```javascript\n// Express.js example\nconst cors = require('cors');\napp.use(cors({\n  origin: 'http://localhost:3000',\n  credentials: true\n}));\n```\n\n**Development Proxy (React):**\nAdd to `package.json`:\n```json\n\"proxy\": \"http://localhost:5000\"\n```\n\n**Quick Fix:**\nUse a CORS proxy for development only (not for production):\n```javascript\nfetch('https://cors-anywhere.herokuapp.com/' + apiUrl)\n```\n\nWhich backend framework are you using?";
        }
        
        return "Thank you for your question! I'm here to help with:\n\n• **Code Review & Best Practices**\n• **Architecture & Design Patterns**\n• **Debugging & Problem Solving**\n• **Database Design**\n• **Git & Version Control**\n• **Testing Strategies**\n\nCould you provide more details about what you need help with? The more specific you are, the better I can assist you!";
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputValue);
        }
    };

    const handlePromptClick = (prompt) => {
        setInputValue(prompt);
        textareaRef.current?.focus();
    };

    return (
        <div className="min-h-screen bg-[#1a1d21] text-white font-sans flex flex-col">
            {/* Background Mesh Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            {/* Navigation */}
            <Navbar />

            {/* Main Chat Container */}
            <div className="relative flex-1 flex flex-col pt-20">
                <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                        {messages.length === 0 ? (
                            // Welcome Screen
                            <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                                    <Brain className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    AI Mentor
                                </h1>
                                <p className="text-lg text-gray-400 mb-12 max-w-2xl">
                                    Your intelligent assistant for software project success. Get instant answers, code reviews, and architectural guidance 24/7.
                                </p>

                                {/* Suggested Prompts */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                                    {SUGGESTED_PROMPTS.map((suggestion, index) => {
                                        const Icon = suggestion.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handlePromptClick(suggestion.prompt)}
                                                className="group p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 text-left"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                                                        <Icon className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-white mb-1">{suggestion.title}</h3>
                                                        <p className="text-sm text-gray-400">{suggestion.prompt}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            // Messages
                            <>
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Brain className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                                            <div
                                                className={`rounded-2xl px-5 py-3 ${
                                                    message.role === 'user'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white/10 backdrop-blur-sm border border-white/10 text-gray-100'
                                                }`}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</p>
                                        </div>
                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Typing Indicator */}
                                {isTyping && (
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Brain className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-white/10 bg-[#1a1d21]/80 backdrop-blur-sm p-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="relative flex items-end gap-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-2 focus-within:border-blue-500/50 transition-colors">
                                <textarea
                                    ref={textareaRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything about your project..."
                                    className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none px-3 py-2 max-h-32 min-h-[44px]"
                                    rows="1"
                                    disabled={isTyping}
                                />
                                <button
                                    onClick={() => handleSendMessage(inputValue)}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                                >
                                    {isTyping ? (
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5 text-white" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                AI Mentor can make mistakes. Consider checking important information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
