'use client';

import React, { useState } from 'react';
import { Language, translations } from '@/lib/i18n';
import { X, Send, Bot, User, Sparkles, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

interface ChatbotWidgetProps {
  activeTab: string;
  activeLanguage: Language;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ activeTab, activeLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: activeLanguage === 'hi' 
        ? "नमस्कार! मैं मौसममेश कृषि-मौसम सहायक हूँ। आप डाउनस्केलिंग, MinT या विश्वसनीयता मेट्रिक्स के बारे में पूछ सकते हैं।"
        : activeLanguage === 'mr'
        ? "नमस्कार! मी मौसममेश हवामान सहाय्यक आहे. तुम्ही डाउनस्केलिंग, MinT किंवा अचूकतेबद्दल विचारू शकता."
        : "Hello! I am your MausamMesh Agricultural Weather Assistant. Ask me about downscaled forecasts, MinT coherence, or skill metrics!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  const t = translations[activeLanguage] || translations.en;

  // Contextual quick reply suggestions per tab (Part 3.2 Requirement)
  const getTabSuggestions = () => {
    switch (activeTab) {
      case 'dashboard':
        return [
          { q: "How is Panchayat rain downscaled?", a: "Panchayat rainfall is downscaled from Block forecasts using spatial XGBoost with elevation, aspect angle, and neighbor residuals." },
          { q: "What is 90% Conformal Range?", a: "Split-Conformal prediction guarantees that true rainfall will lie within lower/upper bounds 90% of the time, providing statistical credibility." },
          { q: "What is MinT Coherence?", a: "MinT hierarchical reconciliation guarantees that the mathematical average of all Panchayat forecasts equals the parent Block forecast." }
        ];
      case 'map':
        return [
          { q: "What does Residual Delta mean?", a: "Residual Delta is the difference (in mm) between Panchayat downscaled rain and Block baseline rain driven by local micro-topography." },
          { q: "How do layer toggles work?", a: "Toggle between Panchayat Downscaled Rain, Block Baseline, and Residual Delta layers to visualize spatial variations." },
          { q: "Why is elevation important?", a: "Higher elevation differences capture significantly higher localized rainfall." }
        ];
      case 'analysis':
        return [
          { q: "What is MAE Reduction?", a: "MAE Reduction measures how much lower our model's error is compared to assuming flat block rainfall across all panchayats." },
          { q: "What is Hilly Hero Panchayat?", a: "Khed Shivapur is a benchmark hilly panchayat (+64.5m elevation delta) where downscaling achieves >90% MAE reduction." },
          { q: "How to trigger model retrain?", a: "Click 'Trigger Retrain' to recalculate spatial features and update XGBoost weights on recent telemetry observations." }
        ];
      case 'advisory':
        return [
          { q: "How does DAMU approval work?", a: "Agromet advisories are confidence-gated. DAMU Nodal Officers review and approve bulletins before dispatching via SMS & WhatsApp." },
          { q: "What if uncertainty is high?", a: "If 90% conformal interval width > 7mm, advisories issue a cautionary note advising field inspection." },
          { q: "Which crops are supported?", a: "Cotton, Soybean, Paddy, Sugarcane, and seasonal kharif/rabi crops with stage-specific guidance." }
        ];
      case 'reliability':
      default:
        return [
          { q: "What is CSI (Critical Success Index)?", a: "CSI measures skill in predicting heavy rain events (>15mm). A CSI of 0.92 indicates high hit-rate and low false alarm rate." },
          { q: "What is LOSO Skill Gate?", a: "Leave-One-Station-Out skill gate automatically falls back to Block baseline if downscaling loses skill for a location." },
          { q: "Is this data real or demo?", a: "This portal displays calibrated demo telemetry adhering strictly to Ministry of Agriculture WINDS AWS/ARG specifications." }
        ];
    }
  };

  const suggestions = getTabSuggestions();

  // Part 3.2 extension hook for future real LLM/voice integration
  const askAssistant = (query: string): string => {
    const qLower = query.toLowerCase();
    
    const matched = suggestions.find(s => s.q.toLowerCase().includes(qLower) || qLower.includes(s.q.toLowerCase()));
    if (matched) return matched.a;

    if (qLower.includes('mint') || qLower.includes('reconcil')) {
      return "MinT (Minimum Trace) reconciliation ensures hierarchical coherence, meaning downscaled Panchayat forecasts average back to the Block baseline.";
    }
    if (qLower.includes('conformal') || qLower.includes('bound') || qLower.includes('interval')) {
      return "Split-Conformal intervals provide a statistically guaranteed 90% coverage interval for forecast uncertainty.";
    }
    if (qLower.includes('winds') || qLower.includes('telemetry') || qLower.includes('arg')) {
      return "WINDS is the Ministry of Agriculture's Weather Information Network Data System connecting 300,000+ Automatic Rain Gauges (ARGs).";
    }
    if (qLower.includes('pdf') || qLower.includes('report') || qLower.includes('download')) {
      return "You can click the 'Download Report' button on the Dashboard or Model Insights screen to export an official MausamMesh PDF advisory bulletin.";
    }

    return "For technical assistance on downscaling, MinT reconciliation, or DAMU approvals, please refer to the documentation or export the PDF report.";
  };

  const handleSelectSuggestion = (q: string, a: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text: q, timestamp: timeStr };
    const botMsg: ChatMessage = { id: `b-${Date.now() + 1}`, sender: 'bot', text: a, timestamp: timeStr };
    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const handleSendCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const query = inputText.trim();
    setInputText('');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text: query, timestamp: timeStr };
    const responseText = askAssistant(query);
    const botMsg: ChatMessage = { id: `b-${Date.now() + 1}`, sender: 'bot', text: responseText, timestamp: timeStr };
    
    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  return (
    <div className="fixed bottom-16 lg:bottom-6 right-5 z-40 font-sans">
      {/* Expanded Panel */}
      {isOpen ? (
        <div className="bg-white rounded-2xl border border-emerald-200 w-80 sm:w-96 flex flex-col h-[460px] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-800 text-white p-3.5 flex justify-between items-center border-b border-emerald-700">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none text-white flex items-center gap-1.5">
                  <span>MausamMesh Assistant</span>
                </h3>
                <p className="text-[10px] text-emerald-100 leading-tight mt-0.5">{t.assistant_subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-100 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-[#FAF9F5] text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    <Bot className="w-3.5 h-3.5 text-emerald-800" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white font-medium rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[9px] block mt-1 text-right ${msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contextual Quick Suggestions (Part 3.2 Requirement) */}
          <div className="bg-white border-t border-slate-100 p-2.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.quick_questions}</span>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(item.q, item.a)}
                  className="w-full text-left px-2.5 py-1 text-[11px] bg-[#FAF9F5] hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/80 rounded-lg text-slate-800 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{item.q}</span>
                  <HelpCircle className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Form */}
          <form onSubmit={handleSendCustomQuery} className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.ask_placeholder}
              className="flex-1 text-xs border border-slate-300/80 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded-xl transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Trigger Button */
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-3 rounded-full shadow-xl border border-emerald-600 flex items-center gap-2.5 transition-all transform hover:scale-105"
          aria-label="Open Weather Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            {t.assistant_title}
          </span>
        </button>
      )}
    </div>
  );
};
