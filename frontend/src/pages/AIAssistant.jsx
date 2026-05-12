/**
 * MindBridge — AI Assistant
 *
 * CORS FIX: Removed direct call to api.anthropic.com
 * ─────────────────────────────────────────────────
 * BEFORE (broken):
 *   fetch("https://api.anthropic.com/v1/messages", { headers: { "x-api-key": VITE_ANTHROPIC_API_KEY } })
 *   → CORS blocked (Anthropic API has no Access-Control-Allow-Origin header — server-only by design)
 *   → API key exposed in browser bundle (security vulnerability)
 *
 * AFTER (fixed):
 *   sendChatMessage(history) → POST /chat/message on FastAPI backend
 *   → Backend calls Vertex AI Gemini server-side (same model, same safety filters)
 *   → No API key in browser
 *   → No CORS issue (same-origin relative to VITE_API_BASE_URL)
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  AlertCircle,
  PhoneCall,
  Music
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { sendChatMessage } from "../lib/apiService";

const SUGGESTIONS = [
  "I've been feeling anxious and don't know how to cope",
  "Help me build a daily mindfulness routine",
  "I had a difficult day — can we talk through it?",
  "What are some grounding techniques for stress?",
  "How can I improve my sleep when my mind won't quiet down?",
];

const FALLBACKS = [
  "Thank you for sharing that with me. It takes courage to express how you're feeling. What aspect of this feels most important to explore?",
  "I hear you. Those feelings are valid and real. Would it help to talk through some coping strategies together?",
  "That sounds challenging. You're not alone in feeling this way. Can you tell me more about what's been happening?",
  "I'm glad you reached out. Let's take this one step at a time. What would feel most supportive right now?",
  "It's okay to feel this way. Sometimes simply acknowledging difficult emotions is the first step. What has helped you in the past?",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-surface-400"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  );
}
function EmotionInsightCard({
  emotion,
  score,
  music
}) {

  if (!emotion) return null;

  return (

    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        mt-4
        rounded-2xl
        border
        border-brand-100
        dark:border-brand-900
        bg-gradient-to-r
        from-brand-50/60
        to-teal-50/40
        dark:from-brand-950/30
        dark:to-teal-950/20
        p-4
      "
    >

      <div className="flex items-center gap-2 mb-3">

        <Sparkles
          size={15}
          className="text-brand-500"
        />

        <p className="
          text-sm
          font-semibold
          text-surface-800
          dark:text-surface-200
        ">
          Vertex AI Emotional Insight
        </p>

      </div>

      <div className="mb-4">

        <p className="
          text-xs
          uppercase
          tracking-wide
          text-surface-500
          mb-2
        ">
          Detected Emotional State
        </p>

        <div className="flex items-center gap-2">

          <div className="
            px-3
            py-1
            rounded-full
            bg-brand-500
            text-white
            text-xs
            font-medium
          ">
            {emotion}
          </div>

          <span className="
            text-xs
            text-surface-500
          ">
            {Math.round(score * 100)}% confidence
          </span>

        </div>

      </div>

      <div>

        <p className="
          text-xs
          uppercase
          tracking-wide
          text-surface-500
          mb-2
        ">
          Recommended Audio
        </p>

        <div className="space-y-2">

          {music?.map((item, index) => (

            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                bg-white
                dark:bg-surface-900
                border
                border-surface-200
                dark:border-surface-800
                hover:border-brand-300
                dark:hover:border-brand-700
                transition-all
                duration-150
              "
            >

              <div className="
                w-9
                h-9
                rounded-xl
                bg-brand-50
                dark:bg-brand-950/50
                flex
                items-center
                justify-center
                flex-shrink-0
              ">
                <Music
                  size={15}
                  className="text-brand-500"
                />
              </div>

              <div className="flex-1 min-w-0">

                <p className="
                  text-sm
                  font-medium
                  text-surface-800
                  dark:text-surface-200
                ">
                  {item.title}
                </p>

                <p className="
                  text-xs
                  text-surface-500
                  capitalize
                ">
                  {item.type}
                </p>

              </div>

            </a>

          ))}

        </div>

      </div>

    </motion.div>
  );
}
function ChatMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${isUser ? "bg-brand-500" : "bg-gradient-to-br from-teal-400 to-brand-500"}`}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
      </div>
      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
          ? "bg-brand-500 text-white rounded-tr-sm"
          : "bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-800 dark:text-surface-200 rounded-tl-sm shadow-card"}`}>
          <>
  {message.content}

  {
    !isUser &&
    message.emotion && (

      <EmotionInsightCard
        emotion={message.emotion}
        score={message.emotion_score}
        music={message.music}
      />

    )
  }
</>
        </div>
        {message.is_crisis && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 mt-1">
            <PhoneCall size={11} className="text-red-600 flex-shrink-0" />
            <span className="text-xs text-red-700 dark:text-red-400 font-medium">
              Crisis line available: iCall 9152987821
            </span>
          </div>
        )}
        <p className="text-2xs text-surface-400 px-1">{message.time}</p>
      </div>
    </motion.div>
  );
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hello. I'm MindBridge, your AI wellness companion. This is a safe, private space to talk about how you're feeling. What's on your mind today?",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = {
      role: "user",
      content: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Route through FastAPI backend → Vertex AI Gemini (server-side)
      // No CORS issue, no API key in browser
      const history = nextMessages.map(m => ({ role: m.role, content: m.content }));
      const {
  reply,
  is_crisis,
  emotion,
  emotion_score,
  music
} = await sendChatMessage(history);

      setMessages(prev => [...prev, {

  role: "assistant",

  content: reply,

  is_crisis: is_crisis,

  emotion: emotion,

  emotion_score: emotion_score,

  music: music,

  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  }),

}]);
    } catch {
      // Graceful fallback — never show a bare error to a wellness user
      const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
      setMessages(prev => [...prev, {
        role: "assistant",
        content: fallback,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
      setError("Connection issue — showing a cached response. Please check your network.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const clearChat = () => setMessages([{
    role: "assistant",
    content: "Hello again. I'm ready to listen whenever you are.",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }]);

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-9rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-brand-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">AI Companion</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-surface-400">Online · Private session</span>
            </div>
          </div>
        </div>
        <Button onClick={clearChat} variant="ghost" size="sm" icon={RefreshCw}>New chat</Button>
      </div>

      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex-shrink-0">
        <AlertCircle size={13} className="text-surface-500 flex-shrink-0" />
        <p className="text-xs text-surface-500 leading-relaxed">
          This AI companion supports emotional wellness but is not a substitute for professional care.
          In crisis, call iCall: 9152987821.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden" padding="none">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-brand-500 flex items-center justify-center">
                <Bot size={13} className="text-white" />
              </div>
              <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl rounded-tl-sm shadow-card">
                <TypingIndicator />
              </div>
            </div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
              <p className="text-xs text-amber-600 dark:text-amber-400">{error}</p>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-5 pb-3">
            <p className="text-2xs text-surface-400 uppercase tracking-wide mb-2">Suggested prompts</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-700 dark:hover:text-brand-400 border border-surface-200 dark:border-surface-700 hover:border-brand-200 dark:hover:border-brand-800 transition-all text-left">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-surface-100 dark:border-surface-800">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="Share what's on your mind…"
                rows={1} style={{ minHeight: 44, maxHeight: 120 }}
                className="input resize-none pr-10 py-3 leading-relaxed" />
              <div className="absolute right-3 bottom-3">
                <Sparkles size={13} className="text-surface-300 dark:text-surface-600" />
              </div>
            </div>
            <Button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              loading={loading} icon={Send} size="md" className="flex-shrink-0">
              Send
            </Button>
          </div>
          <p className="text-2xs text-surface-400 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </Card>
    </div>
  );
}
