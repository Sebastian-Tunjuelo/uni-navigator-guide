import { NavLink, useLocation } from "react-router-dom";
import { Home, IdCard, Map, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/carnet", label: "Carnet", icon: IdCard },
  { to: "/mapa", label: "Mapa", icon: Map },
  { to: "/chats", label: "Chats", icon: MessageCircle },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-md shadow-elevated"
    >
      <ul className="grid grid-cols-5 gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <NavLink
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-all",
                    active && "bg-primary-soft"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className={cn("text-[10px] font-medium", active && "font-semibold")}>{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
