'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, ArrowRight } from 'lucide-react';
import { Language, SUPPORTED_LANGUAGES, t, askAssistant, VoiceQueryResult } from '@/lib/i18n';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: Language;
  onNavigateTab: (tabId: string) => void;
  onDownloadReport: () => void;
  onLanguageChange: (lang: Language) => void;
  liveForecast?: any;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  activeLanguage,
  onNavigateTab,
  onDownloadReport,
  onLanguageChange,
  liveForecast
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [response, setResponse] = useState<VoiceQueryResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === activeLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
      setTranscript('');
      setInterimTranscript('');
      setResponse(null);
      setErrorMessage(null);
    } else {
      startListening();
    }
  }, [isOpen, activeLanguage]);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langInfo.speechLocale;

    // Pick matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(langInfo.speechLocale.slice(0, 2)));
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    stopSpeaking();
    setErrorMessage(null);
    setTranscript('');
    setInterimTranscript('');
    setResponse(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(t('voice.unsupported', activeLanguage));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = langInfo.speechLocale;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          handleProcessVoiceQuery(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage(t('voice.permission_denied', activeLanguage));
        } else if (event.error !== 'no-speech') {
          setErrorMessage(t('voice.unsupported', activeLanguage));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setErrorMessage(t('voice.unsupported', activeLanguage));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleProcessVoiceQuery = (queryText: string) => {
    stopListening();
    const result = askAssistant(queryText, activeLanguage, {
      panchayat_name: liveForecast?.panchayat_name || 'Wagholi',
      rain_mm: liveForecast?.five_day_forecast?.[0]?.panchayat_downscaled_rain_mm ?? 24.5,
      temp: liveForecast?.current_temp_c ?? 28.5
    });

    setResponse(result);
    speakText(result.text);

    // Auto-execute navigation actions
    if (result.action) {
      setTimeout(() => {
        if (result.action === 'nav_map') onNavigateTab('map');
        else if (result.action === 'nav_forecast') onNavigateTab('analysis');
        else if (result.action === 'nav_advisory') onNavigateTab('advisory');
        else if (result.action === 'nav_settings') onNavigateTab('settings');
        else if (result.action === 'download_report') onDownloadReport();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={t('voice.mic_button_label', activeLanguage)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#0B1F33] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden space-y-4 p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0E7C86]/20 text-[#0E7C86] dark:text-[#2DB3C0] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#0B1F33] dark:text-white leading-none">
                {t('system.title', activeLanguage)} Voice Assistant
              </h2>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {langInfo.nativeName} ({langInfo.speechLocale})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Animated Mic Orb */}
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all transform cursor-pointer
              ${isListening 
                ? 'bg-red-500 text-white scale-110 animate-pulse ring-8 ring-red-500/20' 
                : 'bg-[#0E7C86] hover:bg-[#0A5F67] text-white hover:scale-105'
              }
            `}
            aria-label={isListening ? t('voice.cancel', activeLanguage) : t('voice.mic_button_label', activeLanguage)}
          >
            {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
          </button>

          <span className="text-xs font-bold text-[#0B1F33] dark:text-slate-200">
            {isListening ? t('voice.listening', activeLanguage) : 'Tap microphone to speak'}
          </span>

          {/* Animated Waveform Bars */}
          {isListening && (
            <div className="flex items-center gap-1 h-6">
              <span className="w-1 bg-[#0E7C86] animate-pulse h-3 rounded-full" />
              <span className="w-1 bg-[#0E7C86] animate-pulse h-6 rounded-full delay-75" />
              <span className="w-1 bg-[#0E7C86] animate-pulse h-4 rounded-full delay-150" />
              <span className="w-1 bg-[#0E7C86] animate-pulse h-5 rounded-full delay-100" />
              <span className="w-1 bg-[#0E7C86] animate-pulse h-2 rounded-full" />
            </div>
          )}
        </div>

        {/* Transcript / Result Box */}
        <div className="bg-[#F6F3EC] dark:bg-[#061321] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2 min-h-[100px]">
          {errorMessage ? (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              ⚠️ {errorMessage}
            </p>
          ) : isListening ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              {interimTranscript || t('voice.listening', activeLanguage)}
            </p>
          ) : response ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#0B1F33] dark:text-white leading-relaxed">
                {response.text}
              </p>
              
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={isSpeaking ? stopSpeaking : () => speakText(response.text)}
                  className="font-bold text-[#0E7C86] dark:text-[#2DB3C0] flex items-center gap-1"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? t('voice.stop_reading', activeLanguage) : t('voice.read_aloud', activeLanguage)}</span>
                </button>

                <span className="text-[10px] text-slate-400 font-mono">
                  Intent: {response.intent}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-bold text-[#0B1F33] dark:text-slate-300 block">Suggested questions:</span>
              <p className="text-[11px]">• "What's the weather forecast tomorrow?"</p>
              <p className="text-[11px]">• "Which panchayats need attention first?"</p>
              <p className="text-[11px]">• "What should farmers do?"</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Web Speech API • Deterministic Layer</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#0E7C86] dark:text-[#2DB3C0] hover:underline"
          >
            {t('actions.close', activeLanguage)}
          </button>
        </div>

      </div>
    </div>
  );
};
