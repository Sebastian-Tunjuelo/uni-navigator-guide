import { useEffect, useRef, useState } from "react";
import { Send, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useGroupMessages } from "@/features/chat/hooks/useGroupMessages";
import { useCurrentProfile } from "@/features/profile/hooks/useCurrentProfile";
import { useProfiles } from "@/features/profile/hooks/useProfiles";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export default function GroupChat() {
  const { data: me } = useCurrentProfile();
  const { data: profiles = [] } = useProfiles();
  const {
    messages,
    fetchOlderMessages,
    hasOlderMessages,
    isFetchingOlderMessages,
    sendMessage,
    isSending,
  } = useGroupMessages();
  const [input, setInput] = useState("");
  const [shouldStickToBottom, setShouldStickToBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef(0);

  // Autoscroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (shouldStickToBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      return;
    }

    const diff = container.scrollHeight - previousScrollHeight.current;
    container.scrollTop = diff;
    setShouldStickToBottom(true);
  }, [messages, shouldStickToBottom]);

  const loadOlderMessages = async () => {
    const container = scrollRef.current;
    if (!container || !hasOlderMessages || isFetchingOlderMessages) return;
    previousScrollHeight.current = container.scrollHeight;
    setShouldStickToBottom(false);
    await fetchOlderMessages();
  };

  const send = async () => {
    const text = input.trim();
    if (!me || !text || isSending) return;
    setInput("");
    try {
      await sendMessage({
        senderId: me.id,
        senderName: me.name,
        senderAvatar: me.initials,
        content: text,
      });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo enviar el mensaje");
      setInput(text);
    }
  };

  if (!me) return null;

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
          <>
            {hasOlderMessages && (
              <div className="mb-3 flex justify-center">
                <button
                  type="button"
                  onClick={loadOlderMessages}
                  disabled={isFetchingOlderMessages}
                  className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-primary shadow-soft disabled:opacity-50"
                >
                  {isFetchingOlderMessages ? "Cargando..." : "Cargar anteriores"}
                </button>
              </div>
            )}
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
          </>
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
          disabled={!input.trim() || isSending}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-opacity disabled:opacity-40"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
