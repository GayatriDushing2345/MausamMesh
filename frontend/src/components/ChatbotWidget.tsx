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
        ? "नमस्कार! मैं मौसममेश (MausamMesh) कृषि-मौसम सहायक हूँ। आप डाउनस्केलिंग, DecisionShield, या प्राथमिक सूची के बारे में पूछ सकते हैं।"
        : activeLanguage === 'mr'
        ? "नमस्कार! मी मौसममेश (MausamMesh) हवामान सहाय्यक आहे. तुम्ही डाउनस्केलिंग, DecisionShield, किंवा प्राधान्य यादीबद्दल विचारू शकता."
        : "Hello! I am your MausamMesh Weather Intelligence Assistant. Ask me about downscaled forecasts, DecisionShield, or officer priority rankings!",
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
          { q: "Why is heavy rain expected tomorrow?", a: "Downscaled micro-topography modeling indicates localized moisture convergence over the elevated terrain around this panchayat tomorrow." },
          { q: "What should I do before the rain?", a: "Clear field drainage channels immediately, complete active harvesting before rainfall begins, and postpone pesticide spraying." },
          { q: "How reliable is this forecast?", a: "This forecast has an 88% overall accuracy score and 92% Critical Success Index for predicting rainfall events." }
        ];
      case 'map':
        return [
          { 
            q: "Why is Wagholi ranked first?", 
            a: "Wagholi is ranked #1 because it has an imminent heavy rain forecast (82.4mm upper bound) combined with high Kharif crop vulnerability (Soybean at pod formation) and high farm population density." 
          },
          { 
            q: "How is priority calculated?", 
            a: "Priority (0-100) combines 5 factors: Weather Severity (35%), Crop Vulnerability (25%), Potential Impact (15%), Exposed Area (15%), and Farm Households (10%). Heavy rain (>=64.5mm) triggers a High tier safety floor." 
          },
          { 
            q: "What does verify before dispatch mean?", 
            a: "It indicates forecast uncertainty is wide (conformal interval > 6.0mm). Ground officers should visually verify conditions or check AWS telemetry before dispatching automated advisories." 
          },
          { 
            q: "What does Residual Delta mean?", 
            a: "Residual Delta is the difference (in mm) between Panchayat downscaled rain and Block baseline rain driven by local micro-topography." 
          }
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

    if (qLower.includes('priority') || qLower.includes('calculat') || qLower.includes('rank')) {
      return "Priority scores (0-100) rank panchayats using 5 weighted factors: Weather Severity (35%), Crop Vulnerability (25%), Potential Impact (15%), Exposed Area (15%), and Farm Households (10%). Heavy rain events guarantee a minimum 'High' priority tier.";
    }
    if (qLower.includes('verify before dispatch') || qLower.includes('uncertain')) {
      return "'Verify before dispatch' flags panchayats where rainfall 90% conformal interval width exceeds 6.0mm, warning officers to check telemetry before automating SMS alerts.";
    }
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
    <aside aria-label="Weather Intelligence Assistant" className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 font-sans">
      {/* Expanded Panel */}
      {isOpen ? (
        <div className="bg-white dark:bg-[#0F1E32] rounded-3xl border border-emerald-200 dark:border-white/15 w-[calc(100vw-32px)] sm:w-96 max-w-sm flex flex-col h-[480px] shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="bg-emerald-800 dark:bg-[#0A5F67] text-white p-3.5 flex justify-between items-center border-b border-emerald-700 dark:border-teal-700">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-1.5 rounded-xl">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-none text-white flex items-center gap-1.5">
                  <span>MausamMesh Assistant</span>
                </h3>
                <p className="text-[10px] text-emerald-100 leading-tight mt-0.5">{t.assistant_subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-100 hover:text-white p-1.5 rounded-xl transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-[#FAF9F5] dark:bg-[#091320] text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-teal-900/50 text-emerald-800 dark:text-teal-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    <Bot className="w-3.5 h-3.5 text-emerald-800 dark:text-teal-300" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 dark:bg-teal-600 text-white font-medium rounded-tr-xs'
                      : 'bg-white dark:bg-[#132236] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[9px] block mt-1 text-right ${msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contextual Quick Suggestions (Part 3.2 Requirement) */}
          <div className="bg-white dark:bg-[#0F1E32] border-t border-slate-100 dark:border-white/10 p-2.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400" />
              <span>{t.quick_questions}</span>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(item.q, item.a)}
                  className="w-full text-left px-2.5 py-1 text-[11px] bg-[#FAF9F5] dark:bg-[#132236] hover:bg-emerald-50 dark:hover:bg-[#1A2E44] hover:text-emerald-900 dark:hover:text-teal-200 border border-slate-200/80 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{item.q}</span>
                  <HelpCircle className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-teal-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Form */}
          <form onSubmit={handleSendCustomQuery} className="p-2.5 bg-white dark:bg-[#0F1E32] border-t border-slate-100 dark:border-white/10 flex gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.ask_placeholder}
              className="flex-1 text-xs bg-slate-50 dark:bg-[#132236] border border-slate-300/80 dark:border-white/15 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-teal-500"
            />
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white p-2 rounded-xl transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Trigger Button: Circular FAB on mobile, pill on sm+ */
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-full shadow-2xl border border-emerald-500/80 dark:border-teal-400/40 flex items-center justify-center sm:justify-start gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open Weather Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-pulse" />
          </div>
          <span className="hidden sm:inline text-xs font-extrabold tracking-wide">
            {t.assistant_title}
          </span>
        </button>
      )}
    </aside>
  );
};
