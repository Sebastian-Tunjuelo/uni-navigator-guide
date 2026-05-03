import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function MobileShell({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-muted">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-background shadow-card">
        <main className="flex-1 pb-24">{children ?? <Outlet />}</main>
        <BottomNav />
      </div>
    </div>
  );
}
