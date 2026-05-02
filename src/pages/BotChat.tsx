import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, Zap, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

const BACKEND_URL = "http://localhost:3001";

const SUGGESTIONS = [
  "¿Dónde queda la biblioteca?",
  "Horarios de cafetería",
  "¿Cómo solicito un certificado?",
  "¿Cómo me conecto al wifi?",
];

interface Source {
  title: string;
  category: string;
}

interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

interface Msg {
  id: string;
  role: "bot" | "user";
  content: string;
  sources?: Source[];
  tokens?: TokenUsage | null;
  model?: string | null;
  error?: boolean;
}

async function queryRAG(message: string): Promise<{ answer: string; sources: Source[]; tokens: TokenUsage | null; model: string | null }> {
  const res = await fetch(`${BACKEND_URL}/api/chat/test-rag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json();
  return { answer: data.answer, sources: data.sources ?? [], tokens: data.tokens ?? null, model: data.model ?? null };
}

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
    {
      id: "init",
      role: "bot",
      content: "¡Hola! 👋 Soy **UniBot**, tu asistente universitario. Pregúntame lo que quieras sobre el campus.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`)
      .then(r => setBackendOnline(r.ok))
      .catch(() => setBackendOnline(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const ask = async (text: string) => {
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const { answer, sources, tokens, model } = await queryRAG(text);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "bot",
        content: answer,
        sources,
        tokens,
        model,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "bot",
        content: "No pude conectarme al servidor. Verifica que el backend esté corriendo.",
        error: true,
      }]);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col">
      <PageHeader
        back
        title="Asistente UniBot"
        subtitle="Powered by RAG"
        action={
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            backendOnline === false
              ? "bg-destructive/10 text-destructive"
              : "bg-success-soft text-success"
          )}>
            {backendOnline === false ? <WifiOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          </div>
        }
      />

      {/* Banner si el backend está offline */}
      {backendOnline === false && (
        <div className="flex items-center gap-2 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
          Backend no disponible — inicia el servidor con <code className="font-mono font-semibold">npm run dev</code> en la carpeta <code className="font-mono font-semibold">backend/</code>
        </div>
      )}

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
                <div className="flex max-w-[78%] flex-col gap-1">
                  <div className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm leading-snug shadow-soft",
                    mine
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : m.error
                        ? "rounded-bl-md border border-destructive/20 bg-destructive/5 text-destructive"
                        : "rounded-bl-md bg-card text-card-foreground"
                  )}>
                    <p className="whitespace-pre-wrap break-words">{renderBold(m.content)}</p>
                  </div>

                  {/* Fuentes RAG */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 px-1">
                      {m.sources.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium text-success"
                        >
                          <Zap className="h-2.5 w-2.5" />
                          {s.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Token usage */}
                  {m.tokens && (
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        <span className="font-semibold">{m.tokens.total}</span> tokens
                        <span className="opacity-50">·</span>
                        <span title="prompt">{m.tokens.prompt}↑</span>
                        <span className="opacity-50">+</span>
                        <span title="completion">{m.tokens.completion}↓</span>
                      </span>
                      {m.model && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground opacity-70">
                          {m.model}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}

          {/* Typing indicator */}
          {loading && (
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

        {/* Sugerencias iniciales */}
        {showSuggestions && (
          <div className="mt-5 animate-fade-in">
            <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Sugerencias
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  disabled={backendOnline === false}
                  className="rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
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
          placeholder={backendOnline === false ? "Backend no disponible..." : "Pregunta algo a UniBot..."}
          disabled={backendOnline === false}
          className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading || backendOnline === false}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-opacity disabled:opacity-40"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
