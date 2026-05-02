import { ReactNode } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { getCurrentProfile } from "@/features/profile/session";

export function MobileShell({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const profile = getCurrentProfile();

  if (!profile && location.pathname !== "/login") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen w-full bg-muted">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-background shadow-card">
        <main className="flex-1 pb-24">
          {children ?? <Outlet />}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
