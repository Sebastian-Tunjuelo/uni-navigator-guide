import { useNavigate } from "react-router-dom";
import { LogOut, RefreshCw, Bell, Moon, ShieldCheck, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentProfile, clearCurrentProfile } from "@/lib/session";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function Perfil() {
  const profile = getCurrentProfile()!;
  const navigate = useNavigate();

  const logout = () => {
    clearCurrentProfile();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <PageHeader title="Mi perfil" />
      <div className="space-y-5 px-4 py-5">
        {/* Header de perfil */}
        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-elevated",
            profile.avatarColor
          )}>
            {profile.initials}
          </div>
          <h2 className="mt-3 text-lg font-bold">{profile.name}</h2>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
          <div className="mt-2 flex gap-2">
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {profile.program}
            </span>
            <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-semibold text-success">
              Semestre {profile.semester}
            </span>
          </div>
        </div>

        {/* Datos */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <Row label="Código" value={profile.code} />
          <Row label="Vigencia carnet" value={profile.validUntil} />
          <Row label="Correo" value={profile.email} last />
        </section>

        {/* Ajustes */}
        <section>
          <p className="label-eyebrow mb-2 px-1">Ajustes</p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <ToggleRow icon={Bell} label="Notificaciones" defaultChecked />
            <ToggleRow icon={Moon} label="Tema oscuro" />
            <ToggleRow icon={ShieldCheck} label="Privacidad reforzada" defaultChecked last />
          </div>
        </section>

        {/* Acciones */}
        <section>
          <p className="label-eyebrow mb-2 px-1">Cuenta</p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                <RefreshCw className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium">Cambiar de usuario</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="h-px bg-border" />
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-destructive transition-colors hover:bg-muted"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>
        </section>

        <p className="pb-4 pt-2 text-center text-[11px] text-muted-foreground">
          UniGuía v1.0 · App demo
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate text-sm font-medium">{value}</span>
      </div>
      {!last && <div className="h-px bg-border" />}
    </>
  );
}

function ToggleRow({ icon: Icon, label, defaultChecked, last }: { icon: any; label: string; defaultChecked?: boolean; last?: boolean }) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <span className="flex-1 text-sm font-medium">{label}</span>
        <Switch defaultChecked={defaultChecked} />
      </div>
      {!last && <div className="h-px bg-border" />}
    </>
  );
}
