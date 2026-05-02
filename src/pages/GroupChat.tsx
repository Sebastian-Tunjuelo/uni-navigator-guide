import { useEffect, useRef, useState } from "react";
import { Send, Users, Loader2, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentProfile } from "@/lib/session";
import { profiles } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  created_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export default function GroupChat() {
  const me = getCurrentProfile() ?? profiles[0];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Load existing messages + subscribe to realtime
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      setLoading(true);
      setError(null);

      // 1. Fetch last 100 messages ordered by creation time
      const { data, error: fetchError } = await supabase
        .from("group_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);

      if (fetchError) {
        setError("No se pudieron cargar los mensajes. Verifica tu conexión.");
        setLoading(false);
        return;
      }

      setMessages(data ?? []);
      setLoading(false);

      // 2. Subscribe to new inserts via Realtime
      channel = supabase
        .channel("group_messages_realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "group_messages" },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              // Avoid duplicates (optimistic insert already added it)
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        )
        .subscribe();
    }

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    // Optimistic insert so the sender sees the message immediately
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      sender_id: me.id,
      sender_name: me.name,
      sender_avatar: me.initials,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    const { data, error: insertError } = await supabase
      .from("group_messages")
      .insert({
        sender_id: me.id,
        sender_name: me.name,
        sender_avatar: me.initials,
        content: text,
      })
      .select()
      .single();

    if (insertError) {
      // Roll back optimistic message and restore input
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInput(text);
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } else if (data) {
      // Replace optimistic message with the real one from the DB
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? (data as Message) : m))
      );
    }

    setSending(false);
  };

  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col">
      <PageHeader
        back
        title="Compañeros 2025"
        subtitle={`${profiles.length} miembros · En vivo`}
        action={
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Users className="h-4 w-4" />
          </div>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
          <button
            className="ml-auto underline"
            onClick={() => setError(null)}
          >
            Cerrar
          </button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/40 px-3 py-4">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-xs">Cargando mensajes…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Users className="h-7 w-7" />
            </div>
            <p className="mt-3 text-sm font-semibold">Aún no hay mensajes</p>
            <p className="mt-1 max-w-[260px] text-xs text-muted-foreground">
              Sé el primero en saludar al grupo. Los mensajes aparecen en tiempo real para todos.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {messages.map((m, i) => {
              const mine = m.sender_id === me.id;
              const showName =
                !mine && (i === 0 || messages[i - 1].sender_id !== m.sender_id);
              const isOptimistic = m.id.startsWith("optimistic-");
              return (
                <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-soft transition-opacity",
                      mine
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-card text-card-foreground",
                      isOptimistic && "opacity-60"
                    )}
                  >
                    {showName && (
                      <p className="mb-0.5 text-[11px] font-semibold text-primary">
                        {m.sender_name}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-right text-[10px]",
                        mine ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {isOptimistic ? "Enviando…" : formatTime(m.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-border bg-background px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-opacity disabled:opacity-40"
          aria-label="Enviar"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
