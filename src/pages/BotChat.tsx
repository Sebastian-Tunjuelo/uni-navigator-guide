import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { faqResponses, faqSuggestions } from "@/data/mock";
import { cn } from "@/lib/utils";

interface Msg {
  id: string;
  role: "bot" | "user";
  content: string;
}

function answerFor(q: string): string {
  const lower = q.toLowerCase();
  for (const r of faqResponses) {
    if (r.keywords.some(k => lower.includes(k))) return r.answer;
  }
  return "🤔 No tengo una respuesta exacta para eso, pero puedes preguntar en el chat grupal o escribir a **secretaria@uni.edu**. También puedo ayudarte con: biblioteca, cafetería, certificados, wifi, matrícula, horarios o ubicaciones.";
}

// Render simple de **negrita** en texto
function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

export default function BotChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "init", role: "bot", content: "¡Hola! 👋 Soy **UniBot**, tu asistente. Pregúntame lo que quieras sobre la universidad." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "bot", content: answerFor(text) }]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col">
      <PageHeader
        back
        title="Asistente UniBot"
        subtitle="Respuestas rápidas"
        action={
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-soft text-success">
            <Bot className="h-4 w-4" />
          </div>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/40 px-3 py-4">
        <ul className="space-y-3">
          {messages.map((m) => {
            const mine = m.role === "user";
            return (
              <li key={m.id} className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
                {!mine && (
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug shadow-soft",
                  mine
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-card text-card-foreground"
                )}>
                  <p className="whitespace-pre-wrap break-words">{renderBold(m.content)}</p>
                </div>
              </li>
            );
          })}
          {typing && (
            <li className="flex items-end gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-success-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-md bg-card px-4 py-3 shadow-soft">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "120ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            </li>
          )}
        </ul>

        {showSuggestions && (
          <div className="mt-5 animate-fade-in">
            <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Sugerencias
            </p>
            <div className="flex flex-wrap gap-2">
              {faqSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(input); }}
        className="flex items-center gap-2 border-t border-border bg-background px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta algo a UniBot..."
          className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-opacity disabled:opacity-40"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
