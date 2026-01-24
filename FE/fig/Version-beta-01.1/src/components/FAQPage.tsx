import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQPageProps {
  onNavigate: (page: 'landing') => void;
}

export function FAQPage({ onNavigate }: FAQPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I register a group?',
      answer:
        'To register a group, navigate to the #group-requests channel in your dashboard. Click on "Create New Group", fill in your team members\' information, select a topic, and submit. Your request will be reviewed by the admin within 24 hours.',
    },
    {
      question: 'Can I change my topic after approval?',
      answer:
        'Topic changes after approval require special permission. You need to submit a change request through the Topic Approvals section, providing a valid reason. The lecturer and admin must both approve before the change takes effect.',
    },
    {
      question: 'How does the AI suggestion work?',
      answer:
        'Our AI assistant is trained on your course syllabus and common Q&A patterns. When you ask a question, it analyzes the context and provides relevant answers based on course materials. You can insert AI suggestions directly into your replies or use them as a starting point.',
    },
    {
      question: 'What if I can\'t find teammates?',
      answer:
        'Use our Smart Group Matching feature! Go to the "Find Teammates" section, fill in your skills and preferences, and our algorithm will suggest compatible students. You can also post in the class channels to find interested members.',
    },
    {
      question: 'How do I escalate a question to a lecturer?',
      answer:
        'In the Q&A channels, each message has an "Escalate to Manager" button. Click it to forward the question to lecturers or mentors. They\'ll receive a notification and can provide expert guidance.',
    },
    {
      question: 'Can I access SWP Hub on mobile?',
      answer:
        'Yes! SWP Hub is fully responsive and works on mobile browsers. We\'re also developing dedicated iOS and Android apps that will be available soon. You\'ll receive notifications when they launch.',
    },
    {
      question: 'How are notifications sent?',
      answer:
        'You can configure notifications in Settings. We support email alerts and push notifications. You\'ll be notified about topic approvals, group requests, new Q&A responses, and important deadlines.',
    },
    {
      question: 'What happens if my project is rejected?',
      answer:
        'If a topic is rejected, you\'ll receive detailed feedback from the lecturer explaining why. You can revise your proposal based on the feedback and resubmit. Most rejections are due to scope issues or missing technical details.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F27125] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl">SWP Hub</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to commonly asked questions about SWP Hub
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="How can we help you?"
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0054a6] focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No matching questions found. Try different keywords.</p>
          </div>
        )}

        {/* Still Need Help */}
        <div className="mt-16 bg-gradient-to-br from-[#0054a6] to-[#1164B4] rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
          <p className="text-blue-100 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <button
            onClick={() => onNavigate('landing')}
            className="bg-[#F27125] hover:bg-[#d96420] text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg"
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">© 2026 FPT University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
