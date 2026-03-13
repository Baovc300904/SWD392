import { useState, useCallback } from 'react';
import aiService from '../services/ai.service';
import userSettingsService from '../services/user-settings.service';

/* ─────────────────────────────── Mock Responses ─────────────────────────── */
const MOCK_RESPONSES = [
    {
        patterns: ['learn', 'skill', 'roadmap', 'how to study', 'improve', 'grow'],
        response: `Great question! Here's a practical roadmap to accelerate your skill development:

**1. Identify the Core Concepts First**
Don't try to learn everything at once. Focus on the 20% of knowledge that gives 80% results.

**2. Build a Learning Roadmap**
\`\`\`
Week 1–2  → Fundamentals & theory
Week 3–4  → Small hands-on projects
Week 5–6  → Real-world challenges
Week 7+   → Teach others & review
\`\`\`

**3. Use Active Recall**
After reading/watching, close the material and explain it in your own words. This dramatically boosts retention.

**4. Deliberate Practice**
Work on problems slightly above your comfort zone — that's the "growth zone".

**5. Build in Public**
Share your progress on GitHub or a blog. Accountability + portfolio = double win 🚀

Would you like me to build a specific roadmap for a technology or subject?`,
    },
    {
        patterns: ['review my code', 'check my code', 'code review', 'review code'],
        response: `Sure! I'd love to help review your code. Here are some things I typically look for:

**✅ Code Quality Checklist**

**Readability**
\`\`\`js
// ❌ Hard to read
const x = d.filter(i => i.s === 1).map(i => i.n);

// ✅ Clear intent
const activeUserNames = users
  .filter(user => user.status === 'active')
  .map(user => user.name);
\`\`\`

**Error Handling**
\`\`\`js
// ❌ No error handling
const data = await fetchData();

// ✅ Always handle errors
try {
  const data = await fetchData();
} catch (error) {
  console.error('Failed to fetch:', error);
  // notify user gracefully
}
\`\`\`

**Performance**
- Avoid unnecessary re-renders in React (use \`useMemo\`, \`useCallback\`)
- Don't declare functions/objects inside render if they don't change

Paste your code below and I'll give you specific feedback! 👇`,
    },
    {
        patterns: ['explain', 'what is', 'how does', 'tell me about', 'describe', 'define'],
        response: `Let me break that down for you in a simple way 📚

Think of it like this — most CS concepts follow a pattern:

1. **The Problem it solves** — Why does this exist?
2. **The Core Idea** — What's the mental model?
3. **A Simple Example** — See it in action
4. **When to use it** — Real-world context

For example, if you asked me about **React Hooks**:

\`\`\`jsx
// The problem: Class components were verbose
// The solution: Hooks let you use state in functions

function Counter() {
  const [count, setCount] = useState(0); // useState hook

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
\`\`\`

Could you tell me **specifically which concept** you'd like me to explain? I'll tailor the explanation to your level! 🎯`,
    },
    {
        patterns: ['debug', 'error', 'bug', 'fix', 'issue', 'not working', 'broken'],
        response: `Let's debug this together! 🔍 Here's my systematic approach:

**Step 1 — Reproduce the problem**
\`\`\`
❓ When does it happen?
❓ What input triggers it?
❓ Is it consistent or intermittent?
\`\`\`

**Step 2 — Read the error message carefully**
Most errors tell you exactly where the problem is:
\`\`\`
TypeError: Cannot read property 'map' of undefined
→ This means 'data' is undefined when you call data.map()
→ Solution: add a guard: if (!data) return null;
\`\`\`

**Step 3 — Isolate the problem**
\`\`\`js
// Comment out code until the error disappears
// Then you've found the culprit
\`\`\`

**Step 4 — Common React gotchas**
- State updates are async — use the functional form: \`setState(prev => ...)\`
- Missing dependency array in \`useEffect\`
- Forgetting \`await\` on async calls

Share your error message or code and I'll help pinpoint the exact issue! 💪`,
    },
    {
        patterns: ['sprint', 'agile', 'scrum', 'project management', 'meeting'],
        response: `Great topic! Agile & Scrum are essential for SWP projects 🏃

**The Scrum Framework in brief:**

| Event | Duration | Purpose |
|---|---|---|
| Sprint Planning | 2–4h | Decide what to build |
| Daily Standup | 15 min | Sync & blockers |
| Sprint Review | 1h | Demo to stakeholders |
| Retrospective | 1h | Improve the process |

**Pro tips for student projects:**
1. Keep sprints short (1 week) so you can adapt fast
2. Use a Kanban board (Trello, Jira, or GitHub Projects)
3. Define "Done" clearly before starting a task
4. Don't skip retrospectives — they prevent burnout

Would you like a template for your Sprint Planning meeting? 📋`,
    },
];

const DEFAULT_RESPONSE = `Thanks for your question! I'm here to help you with your SWP project 🤖

I can assist with:
- 📚 **Learning strategies** and study roadmaps
- 🔍 **Code reviews** and debugging help
- 💡 **Concept explanations** tailored to your level
- 🏃 **Agile/Scrum** best practices

Could you give me a bit more context or rephrase your question? The more specific you are, the better I can help! 😊`;

function getMockResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    for (const { patterns, response } of MOCK_RESPONSES) {
        if (patterns.some(p => lower.includes(p))) {
            return response;
        }
    }
    return DEFAULT_RESPONSE;
}

/* ───────────────────────────────── Hook ─────────────────────────────────── */
/**
 * useAIChat — shared hook for AI chat logic.
 * Each consumer gets its OWN independent history (no shared Context).
 * If you want shared history, wrap with Context and share a single instance.
 */
export function useAIChat() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = useCallback(async (text, options = {}) => {
        if (!text.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setIsTyping(true);

        const settings = userSettingsService.getSettings();

        let replyContent = '';
        const shouldUseRealAI = settings.enableAIAssistant && aiService.isConfigured();

        if (shouldUseRealAI) {
            try {
                replyContent = await aiService.generateReply({
                    prompt: text,
                    context: options.context || '',
                    model: settings.aiModel,
                });
            } catch (error) {
                replyContent = `${getMockResponse(text)}\n\n(Using fallback response because AI API failed: ${error.message})`;
            }
        } else {
            const delay = 900 + Math.random() * 600;
            await new Promise(r => setTimeout(r, delay));
            replyContent = getMockResponse(text);
        }

        const aiMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: replyContent,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        setIsLoading(false);
    }, [isLoading]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setIsLoading(false);
        setIsTyping(false);
    }, []);

    return { messages, isLoading, isTyping, sendMessage, clearMessages };
}
