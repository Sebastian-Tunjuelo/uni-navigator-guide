import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ChevronRight, Sparkles } from "lucide-react";
import { setCurrentProfile } from "@/features/profile/session";
import { useProfiles } from "@/features/profile/hooks/useProfiles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Login() {
  const navigate = useNavigate();
  const { data: profiles = [] } = useProfiles();
  const [selected, setSelected] = useState<string>("");
  const selectedProfileId = selected || profiles[0]?.id || "";

  const handleEnter = () => {
    if (!selectedProfileId) return;
    setCurrentProfile(selectedProfileId);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-muted">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-background px-6 pb-8 pt-12 shadow-card">
        {/* Branding */}
        <div className="mb-10 flex flex-col items-center text-center animate-fade-in">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-elevated">
            <GraduationCap className="h-8 w-8 text-primary-foreground" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">UniGuía</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tu campus, más fácil</p>
        </div>

        {/* Demo notice */}
        <div className="mb-5 flex items-start gap-2 rounded-2xl border border-primary/10 bg-primary-soft px-4 py-3 text-xs text-primary">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p className="font-medium">
            Modo demo: elige un perfil de estudiante para explorar la app.
          </p>
        </div>

        {/* Profile picker */}
        <div className="space-y-2">
          <p className="label-eyebrow px-1">Selecciona tu perfil</p>
          <div className="space-y-2">
            {profiles.map((p) => {
              const active = selectedProfileId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                    active
                      ? "border-primary bg-primary-soft shadow-soft"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className={cn("flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white", p.avatarColor)}>
                    {p.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.program} · Sem. {p.semester}</p>
                  </div>
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                    active ? "border-primary bg-primary" : "border-border"
                  )}>
                    {active && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Password (decorativo) */}
        <div className="mt-5">
          <label className="label-eyebrow mb-1.5 block px-1">Contraseña</label>
          <input
            type="password"
            defaultValue="••••••••"
            readOnly
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="mt-auto pt-8">
          <Button
            size="lg"
            onClick={handleEnter}
            className="h-12 w-full rounded-2xl text-base font-semibold shadow-elevated"
          >
            Entrar
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
          <button
            onClick={() => {
              if (!profiles[0]) return;
              setCurrentProfile(profiles[0].id);
              navigate("/", { replace: true });
            }}
            className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Continuar como invitado
          </button>
        </div>
      </div>
    </div>
  );
}
