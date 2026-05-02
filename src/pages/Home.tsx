import { Link, useNavigate } from "react-router-dom";
import { Bell, MapPin, ChevronRight, Clock, Calendar } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSubjects } from "@/features/academics/hooks/useSubjects";
import { useTodayClasses } from "@/features/academics/hooks/useTodayClasses";
import type { ClassEntry } from "@/features/academics/schemas";
import { useNews } from "@/features/news/hooks/useNews";
import { useCurrentProfile } from "@/features/profile/hooks/useCurrentProfile";
import { cn } from "@/lib/utils";

const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function getNextClass(classes: ClassEntry[]) {
  if (classes.length === 0) return null;
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = classes.find(c => {
    const [h, m] = c.start.split(":").map(Number);
    return h * 60 + m >= minutes;
  });
  return upcoming || classes[0];
}

export default function Home() {
  const { data: profile } = useCurrentProfile();
  const { data: todayClasses = [] } = useTodayClasses();
  const { data: subjects = [] } = useSubjects();
  const { data: news = [] } = useNews();
  const navigate = useNavigate();
  const next = getNextClass(todayClasses);
  const today = new Date();
  const dateLabel = `${dayNames[today.getDay()]} ${today.getDate()} de ${today.toLocaleString("es", { month: "long" })}`;

  if (!profile) return null;

  return (
    <div>
      <PageHeader
        title={`Hola, ${profile.name.split(" ")[0]} 👋`}
        subtitle={dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
        action={
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground hover:bg-secondary" aria-label="Notificaciones">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </button>
        }
      />

      <div className="space-y-6 px-4 py-5">
        {/* Próxima clase */}
        {next && (
          <section className="animate-fade-in">
            <p className="label-eyebrow mb-2 px-1">Tu próxima clase</p>
            <div className="overflow-hidden rounded-3xl bg-gradient-card p-5 text-primary-foreground shadow-elevated">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium opacity-80">{next.start} – {next.end}</p>
                  <h2 className="mt-1 text-xl font-bold leading-tight">{next.subject}</h2>
                  <p className="mt-1 text-sm opacity-90">{next.room} · {next.block === "B" ? "Bloque B" : next.block === "C" ? "Bloque C" : next.block === "A" ? "Bloque A" : "Bloque D"}</p>
                </div>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <button
                onClick={() => navigate(`/mapa?to=${next.block}`)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 py-2.5 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                <MapPin className="h-4 w-4" />
                Cómo llegar
              </button>
            </div>
          </section>
        )}

        {/* Horario de hoy */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="label-eyebrow">Horario de hoy</p>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {todayClasses.length} clases
            </span>
          </div>
          <ul className="space-y-2">
            {todayClasses.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
                <div className="flex w-14 flex-shrink-0 flex-col items-center">
                  <span className="text-sm font-bold text-foreground">{c.start}</span>
                  <span className="text-[10px] text-muted-foreground">{c.end}</span>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.room} · Bloque {c.block}</p>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", c.color)}>
                  Bloque {c.block}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Noticias */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="label-eyebrow">Noticias y anuncios</p>
            <button className="text-xs font-semibold text-primary">Ver todas</button>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hidden">
            {news.map((n) => (
              <article key={n.id} className="flex w-[260px] flex-shrink-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-lg">
                    {n.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">{n.category}</p>
                    <p className="text-[10px] text-muted-foreground">{n.date}</p>
                  </div>
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{n.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.excerpt}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Calificaciones */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="label-eyebrow">Mis calificaciones</p>
            <span className="text-xs text-muted-foreground">{subjects.length} asignaturas</span>
          </div>
          <ul className="space-y-2">
            {subjects.map((s) => {
              const passing = s.current >= 3.0;
              const pct = Math.min(100, (s.current / 5) * 100);
              return (
                <li key={s.id}>
                  <Link
                    to={`/asignatura/${s.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft transition-colors hover:border-primary/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{s.name}</p>
                        <span className={cn(
                          "text-base font-bold tabular-nums",
                          passing ? "text-success" : "text-destructive"
                        )}>
                          {s.current.toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.teacher}</p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            passing ? "bg-success" : "bg-destructive"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
