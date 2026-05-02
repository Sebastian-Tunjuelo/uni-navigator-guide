import { useEffect, useRef, useState } from "react";
import { Send, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentProfile } from "@/lib/session";
import { profiles } from "@/data/mock";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  created_at: string;
}

// Mensajes iniciales de demo para simular una conversación activa
const SEED_MESSAGES: Message[] = profiles.flatMap((p, pi) =>
  [
    { text: "¡Hola a todos! ¿Alguien sabe dónde queda el laboratorio de cómputo?", offset: 60 },
    { text: "Está en el edificio B, segundo piso. ¡Bienvenidos!", offset: 55 },
    { text: "Gracias 😊 ¿A qué hora abre?", offset: 50 },
    { text: "Desde las 7am hasta las 9pm de lunes a viernes.", offset: 45 },
  ].slice(pi, pi + 1).map((m, i) => ({
    id: `seed-${pi}-${i}`,
    sender_id: p.id,
    sender_name: p.name,
    sender_avatar: p.initials,
    content: m.text,
    created_at: new Date(Date.now() - m.offset * 60_000).toISOString(),
  }))
);

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export default function GroupChat() {
  const me = getCurrentProfile()!;
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender_id: me.id,
        sender_name: me.name,
        sender_avatar: me.initials,
        content: text,
        created_at: new Date().toISOString(),
      },
    ]);
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/40 px-3 py-4">
        {messages.length === 0 ? (
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
              const showName = !mine && (i === 0 || messages[i - 1].sender_id !== m.sender_id);
              return (
                <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-soft",
                    mine
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-card text-card-foreground"
                  )}>
                    {showName && (
                      <p className="mb-0.5 text-[11px] font-semibold text-primary">
                        {m.sender_name}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p className={cn(
                      "mt-1 text-right text-[10px]",
                      mine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {formatTime(m.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 border-t border-border bg-background px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-opacity disabled:opacity-40"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
