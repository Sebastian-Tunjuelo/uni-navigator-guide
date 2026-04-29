import { Link } from "react-router-dom";
import { Users, Bot, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

const chats = [
  {
    to: "/chats/grupo",
    title: "Compañeros 2025",
    subtitle: "Chat grupal en tiempo real",
    preview: "¡Bienvenidos al grupo! Pregunten lo que necesiten.",
    icon: Users,
    color: "bg-gradient-to-br from-primary to-indigo-500",
    badge: "En vivo",
  },
  {
    to: "/chats/bot",
    title: "Asistente UniBot",
    subtitle: "Preguntas frecuentes",
    preview: "Hola 👋 Pregúntame sobre la universidad.",
    icon: Bot,
    color: "bg-gradient-to-br from-success to-emerald-500",
    badge: "Bot",
  },
];

export default function Chats() {
  return (
    <div>
      <PageHeader title="Chats" subtitle="Conecta con la comunidad" />
      <div className="space-y-2 px-4 py-5">
        {chats.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft transition-colors hover:border-primary/30"
          >
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-primary-foreground shadow-soft ${c.color}`}>
              <c.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{c.title}</p>
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {c.badge}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.preview}</p>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
