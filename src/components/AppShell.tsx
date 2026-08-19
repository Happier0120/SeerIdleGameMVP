import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { useGameStore } from "../store/gameStore";

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
}

export function AppShell({ children, showNav = false }: AppShellProps) {
  const notifications = useGameStore((state) => state.notifications);
  const dismissNotification = useGameStore((state) => state.dismissNotification);

  return (
    <main className="game-shell">
      <section className="screen-content">{children}</section>
      {notifications.length > 0 && (
        <div className="toast-stack" aria-live="polite">
          {notifications.map((notification, index) => (
            <button key={`${notification}-${index}`} type="button" onClick={() => dismissNotification(index)}>
              {notification}
            </button>
          ))}
        </div>
      )}
      {showNav && <BottomNav />}
    </main>
  );
}
