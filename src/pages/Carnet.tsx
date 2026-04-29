import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Maximize2, X, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentProfile } from "@/lib/session";
import { cn } from "@/lib/utils";

export default function Carnet() {
  const profile = getCurrentProfile()!;
  const [zoom, setZoom] = useState(false);
  const qrValue = JSON.stringify({
    id: profile.id,
    code: profile.code,
    name: profile.name,
    program: profile.program,
  });

  return (
    <div>
      <PageHeader title="Carnet digital" subtitle="Identificación estudiantil" />
      <div className="px-4 py-6">
        {/* Carné */}
        <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-card p-6 text-primary-foreground shadow-elevated animate-fade-in">
          {/* Decorative blobs */}
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Universidad UniGuía</p>
              <span className="flex items-center gap-1 rounded-full bg-success/90 px-2 py-0.5 text-[10px] font-semibold text-success-foreground">
                <ShieldCheck className="h-3 w-3" /> Vigente
              </span>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className={cn(
                "flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg ring-4 ring-white/20",
                profile.avatarColor
              )}>
                {profile.initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-tight">{profile.name}</h2>
                <p className="mt-0.5 text-xs opacity-90">{profile.program}</p>
                <p className="mt-0.5 text-xs opacity-75">Semestre {profile.semester}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="opacity-75">Código</p>
                <p className="mt-0.5 font-bold tabular-nums">{profile.code}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="opacity-75">Vigencia</p>
                <p className="mt-0.5 font-bold">{profile.validUntil}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white p-4">
              <QRCodeSVG value={qrValue} size={88} level="M" />
              <div className="flex-1 text-foreground">
                <p className="text-xs font-semibold">Escanear código</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Usa este QR para identificarte en bibliotecas, cafetería y eventos.
                </p>
                <button
                  onClick={() => setZoom(true)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                >
                  <Maximize2 className="h-3 w-3" /> Ampliar
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 px-2 text-center text-xs text-muted-foreground">
          Mantén tu carnet siempre disponible. Útil para acceso a aulas, biblioteca y descuentos en cafetería.
        </p>
      </div>

      {/* Zoom modal */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-6 backdrop-blur-sm animate-fade-in"
          onClick={() => setZoom(false)}
        >
          <div className="relative rounded-3xl bg-background p-6 shadow-elevated">
            <button
              onClick={() => setZoom(false)}
              className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-card"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <QRCodeSVG value={qrValue} size={260} level="H" />
            <p className="mt-3 text-center text-xs font-semibold">{profile.name}</p>
            <p className="text-center text-xs text-muted-foreground">{profile.code}</p>
          </div>
        </div>
      )}
    </div>
  );
}
