import { useParams, Navigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { getGradeSummary } from "@/features/academics/gradeSummary";
import { useSubject } from "@/features/academics/hooks/useSubject";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export default function SubjectDetail() {
  const { id } = useParams();
  const { data: subject, isLoading } = useSubject(id);

  if (isLoading) return null;
  if (!subject) return <Navigate to="/" replace />;

  const { completedWeight, earned, isPassing, pendingWeight } = getGradeSummary(subject);

  return (
    <div>
      <PageHeader title={subject.name} subtitle={subject.teacher} back />
      <div className="space-y-5 px-4 py-5">
        {/* Resumen */}
        <div className="overflow-hidden rounded-3xl bg-gradient-card p-5 text-primary-foreground shadow-elevated">
          <p className="text-xs font-medium opacity-80">Nota acumulada</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-4xl font-bold tabular-nums">{subject.current.toFixed(1)}</span>
            <span className="mb-1 text-sm opacity-80">/ 5.0</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs opacity-90">
            <span className={cn("h-2 w-2 rounded-full", isPassing ? "bg-success" : "bg-warning")} />
            <span>{isPassing ? "Aprobando" : "En riesgo"} · {completedWeight}% evaluado</span>
          </div>
        </div>

        {/* Actividades */}
        <section>
          <p className="label-eyebrow mb-2 px-1">Actividades evaluativas</p>
          <ul className="space-y-2">
            {subject.activities.map((a, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
                <div className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                  a.grade !== null ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"
                )}>
                  {a.grade !== null ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{a.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 font-semibold text-primary">
                      {a.weight}%
                    </span>
                    {a.grade === null && <span>Pendiente</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-lg font-bold tabular-nums",
                    a.grade === null ? "text-muted-foreground" : a.grade >= 3 ? "text-foreground" : "text-destructive"
                  )}>
                    {a.grade === null ? "—" : a.grade.toFixed(1)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-2xl border border-border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Nota acumulada actual:</strong> {earned.toFixed(2)} de {completedWeight} puntos posibles. Faltan por evaluar {pendingWeight}% del curso.
          </p>
        </div>
      </div>
    </div>
  );
}
