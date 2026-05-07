import { useState, useRef, useEffect } from "react";
import api from "../../configs/api";
import { BotIcon, SendIcon, XIcon, Loader2Icon } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AICoachChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm FitCoach 🤖 — your personal AI fitness coach. I know your food logs, activities, and goals. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.slice(1, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data } = await api.post("/api/ai/chat", {
        message: text,
        history,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment! 😅",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "How am I doing today?",
    "What should I eat for lunch?",
    "Give me workout motivation",
    "Analyze my progress this week",
  ];

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 
        text-white shadow-lg flex items-center justify-center transition-all duration-200
        hover:scale-110 active:scale-95 lg:bottom-6 lg:right-6 ${isOpen ? "hidden" : "flex"}`}
        aria-label="Open AI Coach"
      >
        <BotIcon className="w-6 h-6" />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end lg:items-center lg:justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Window */}
          <div
            className="relative bg-white dark:bg-slate-900 rounded-t-3xl lg:rounded-2xl 
            w-full lg:w-[420px] h-[75vh] lg:h-[600px] flex flex-col shadow-2xl
            animate-slide-up overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500 text-white">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <BotIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">FitCoach AI</p>
                <p className="text-xs text-emerald-100">Powered by Gemini · Knows your data</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <BotIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.role === "user"
                        ? "bg-emerald-500 text-white rounded-br-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm"
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mr-2 flex-shrink-0">
                    <BotIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested questions (only at start) */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        inputRef.current?.focus();
                      }}
                      className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 
                      dark:text-slate-300 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 
                      hover:text-emerald-600 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-2 items-center bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your coach anything..."
                  className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 
                  placeholder-slate-400 outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-full bg-emerald-500 disabled:bg-slate-300 
                  dark:disabled:bg-slate-600 flex items-center justify-center text-white 
                  hover:bg-emerald-600 transition-colors flex-shrink-0"
                >
                  {loading ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    <SendIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AICoachChat;
